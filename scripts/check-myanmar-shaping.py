#!/usr/bin/env python3
"""
Verify the shipped Myanmar webfont can shape every Burmese string in the source.

Why this exists: an over-aggressive font subset silently drops the glyphs that
Burmese GSUB rules produce, and the failure shows up as a dotted circle or an
empty box in the middle of a word — on the customer's phone, not in CI. Headless
Chromium in a container has no Myanmar system font, so screenshots cannot be
trusted to catch it either. Shaping through HarfBuzz can.

Only Myanmar-script runs are shaped. Latin letters, digits and spaces inside a
Burmese sentence are handled by the browser's per-run font fallback and are not
expected to exist in a Myanmar-subset font.

Usage: python3 scripts/check-myanmar-shaping.py [font.woff2]
Requires: pip install uharfbuzz fonttools brotli
"""
import os, re, sys
import uharfbuzz as hb
from fontTools.ttLib import TTFont

FONT = sys.argv[1] if len(sys.argv) > 1 else "public/fonts/noto-myanmar-400.woff2"
MYANMAR_RUN = re.compile(r"[က-႟‌‍ꩠ-ꩿꧠ-ꧾ]+")

tt = TTFont(FONT)
tt.flavor = None
tt.save("/tmp/_shapecheck.ttf")
face = hb.Face(hb.Blob.from_file_path("/tmp/_shapecheck.ttf"))
font = hb.Font(face)
order = tt.getGlyphOrder()

runs = set()
for root, _, files in os.walk("src"):
    for fn in files:
        if not fn.endswith((".json", ".ts", ".astro", ".mjs")):
            continue
        text = open(os.path.join(root, fn), encoding="utf-8").read()
        runs.update(MYANMAR_RUN.findall(text))

failures = []
for run in sorted(runs):
    buf = hb.Buffer()
    buf.add_str(run)
    buf.guess_segment_properties()
    hb.shape(font, buf)
    names = [order[i.codepoint] if i.codepoint < len(order) else "?" for i in buf.glyph_infos]
    bad = [n for n in names if n in (".notdef", "uni25CC", "dottedCircle", "?")]
    if bad:
        failures.append((run, bad))

size_kb = os.path.getsize(FONT) / 1024
print(f"Myanmar shaping check — {FONT} ({size_kb:.1f}KB)")
print(f"shaped {len(runs)} Myanmar run(s) from src/")
for run, bad in failures:
    print(f"  FAIL  {run[:50]}  ->  {sorted(set(bad))}")
if failures:
    print(f"\n{len(failures)} run(s) would render a box or dotted circle. "
          f"Widen the subset in scripts/subset-fonts.mjs.")
    sys.exit(1)
print("\nCLEAN — every Burmese run shapes without a missing glyph.")
