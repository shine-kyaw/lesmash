#!/usr/bin/env node
/**
 * scripts/check-zawgyi.mjs
 *
 * Burmese text on this site must be Myanmar UNICODE, never legacy Zawgyi
 * (PRD LANG-05). Zawgyi and Unicode share the same U+1000 block but encode the
 * same visible text with different codepoints and a different storage order, so
 * Zawgyi text renders as mojibake on any standards-compliant device, is
 * unsearchable, and breaks `lang="my"` handling entirely. It cannot be detected
 * by eye in a code review — hence this check.
 *
 * WHAT IS SCANNED
 *   - every `my` value in src/content/(any collection)/*.json, at any depth
 *   - any OTHER string in those files that contains Myanmar script (catches
 *     Burmese accidentally pasted into an `en` field)
 *   - every Myanmar-script string literal in src/data/copy.ts
 *   - every Myanmar-script string literal in src/lib/site.config.mjs
 *
 * THE HEURISTIC (three independent signals; any one is a failure)
 *
 * 1. REASSIGNED CODEPOINTS
 *    Zawgyi reuses a set of slots that Unicode 5.1 assigned to Mon / Shan /
 *    Karen extension letters, storing glyph variants (stacked consonants,
 *    shifted medials, tall/short vowel forms) in them instead. Burmese-language
 *    Unicode text never needs any of them, so their presence in `my` copy is a
 *    hard Zawgyi signature:
 *        U+1064, U+1069-U+106D, U+1071-U+1074, U+1082, U+1093, U+1096
 *    The wider U+1060-U+1097 range is deliberately NOT flagged outright: those
 *    codepoints are legitimate Unicode for minority languages, and blanket-
 *    flagging them would false-positive on valid text. Any of them that is not
 *    on the hard list is reported as an informational note for a human to eye,
 *    and does not fail the run.
 *
 * 2. VOWEL SIGN E ORDERING  (U+1031)
 *    In Unicode, U+1031 is stored AFTER the consonant it visually precedes
 *    (logical order). In Zawgyi it is stored BEFORE that consonant (visual
 *    order). So every U+1031 must be preceded by a consonant or a medial; a
 *    U+1031 at position 0, or one whose predecessor is not a valid base, is the
 *    classic Zawgyi ordering signature — especially when a consonant follows it.
 *
 * 3. LEADING COMBINING MARK  (U+103A asat / U+1039 virama)
 *    Both are combining marks that must attach to a preceding base. A string
 *    that OPENS with U+103A or U+1039 immediately followed by a consonant in
 *    U+1000-U+1021 is storing the mark ahead of its base, i.e. Zawgyi order.
 *
 * EXIT CODES
 *   1  any match (Zawgyi detected)
 *   0  clean  everything scanned is Myanmar Unicode
 *
 * Usage:  node scripts/check-zawgyi.mjs
 *
 * Zero dependencies  Node built-ins only.
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(ROOT, 'src', 'content');
const EXTRA_SOURCES = [
  path.join(ROOT, 'src', 'data', 'copy.ts'),
  path.join(ROOT, 'src', 'lib', 'site.config.mjs'),
];

/* ---------- output helpers (degrade to plain text when not a TTY) ---------- */
const TTY = Boolean(process.stdout.isTTY);
const paint = (code) => (s) => (TTY ? `\u001b[${code}m${s}\u001b[0m` : String(s));
const bold = paint('1');
const dim = paint('2');
const red = paint('31');
const yellow = paint('33');
const green = paint('32');

const out = (s = '') => process.stdout.write(`${s}\n`);
const rule = (ch = '-') => out(dim(ch.repeat(76)));

/* ---------- codepoint sets ---------- */
const cp = (s, i) => s.codePointAt(i);
const U = (n) => `U+${n.toString(16).toUpperCase().padStart(4, '0')}`;

// Signal 1: slots Zawgyi reassigns. Hard failure.
const ZAWGYI_HARD = new Set([
  0x1064,
  0x1069, 0x106a, 0x106b, 0x106c, 0x106d,
  0x1071, 0x1072, 0x1073, 0x1074,
  0x1082,
  0x1093,
  0x1096,
]);

// Reported for human review only  legitimate Unicode for other languages.
const inExtendedRange = (c) => c >= 0x1060 && c <= 0x1097;

const isMyanmar = (c) => (c >= 0x1000 && c <= 0x109f) || (c >= 0xa9e0 && c <= 0xa9ff) || (c >= 0xaa60 && c <= 0xaa7f);
const hasMyanmar = (s) => {
  for (const ch of s) if (isMyanmar(ch.codePointAt(0))) return true;
  return false;
};

const isConsonant = (c) => c >= 0x1000 && c <= 0x1021;

/**
 * Valid bases for a following U+1031 in Unicode storage order:
 * consonants and independent vowels (U+1000-U+102A), the medials
 * (U+103B-U+103E), great sa / aforementioned (U+103F, U+104E), and the
 * extended consonant letters used by Mon/Shan/Karen.
 */
function isValidVowelEBase(c) {
  if (c >= 0x1000 && c <= 0x102a) return true;
  if (c >= 0x103b && c <= 0x103e) return true;
  if (c === 0x103f || c === 0x104e) return true;
  if (c >= 0x1050 && c <= 0x1055) return true;
  if (c >= 0x105a && c <= 0x105d) return true;
  if (c === 0x1061 || c === 0x1065 || c === 0x1066) return true;
  if (c >= 0x106e && c <= 0x1070) return true;
  if (c >= 0x1075 && c <= 0x1081) return true;
  if (c === 0x108e) return true;
  return false;
}

const snippet = (s) => {
  const flat = s.replace(/\s+/g, ' ').trim();
  return flat.length > 64 ? `${flat.slice(0, 63)}…` : flat;
};

/* ---------- the detector ---------- */
/** Returns { hits: [{rule, codepoint, offset, why}], notes: [...] } */
function inspect(text) {
  const hits = [];
  const notes = [];
  if (typeof text !== 'string' || text === '') return { hits, notes };

  const chars = [...text];
  const codes = chars.map((ch) => ch.codePointAt(0));

  for (let i = 0; i < codes.length; i++) {
    const c = codes[i];

    // --- signal 1 ---
    if (ZAWGYI_HARD.has(c)) {
      hits.push({
        rule: 'reassigned-codepoint',
        codepoint: U(c),
        offset: i,
        why: 'codepoint is a Zawgyi glyph slot, never used by Burmese Unicode',
      });
      continue;
    }
    if (inExtendedRange(c)) {
      notes.push({
        codepoint: U(c),
        offset: i,
        why: 'Myanmar extended letter (valid Unicode for Mon/Shan/Karen) — confirm it is intended',
      });
    }

    // --- signal 2: U+1031 must FOLLOW its consonant ---
    if (c === 0x1031) {
      const prev = i > 0 ? codes[i - 1] : null;
      const next = i + 1 < codes.length ? codes[i + 1] : null;
      if (prev === null) {
        hits.push({
          rule: 'vowel-e-ordering',
          codepoint: U(c),
          offset: i,
          why: 'U+1031 at position 0 — in Unicode it is stored after its consonant, so this is Zawgyi visual order',
        });
      } else if (!isValidVowelEBase(prev)) {
        hits.push({
          rule: 'vowel-e-ordering',
          codepoint: U(c),
          offset: i,
          why:
            `U+1031 preceded by ${U(prev)} (not a consonant or medial)` +
            (next !== null && isConsonant(next)
              ? ` and followed by consonant ${U(next)} — classic Zawgyi ordering`
              : ' — U+1031 must follow its base in Unicode'),
        });
      }
    }

    // --- signal 3: leading combining mark ---
    if (i === 0 && (c === 0x103a || c === 0x1039)) {
      const next = codes.length > 1 ? codes[1] : null;
      hits.push({
        rule: 'leading-combining-mark',
        codepoint: U(c),
        offset: 0,
        why:
          `${c === 0x103a ? 'asat U+103A' : 'virama U+1039'} opens the string` +
          (next !== null && isConsonant(next)
            ? ` immediately before consonant ${U(next)} — Zawgyi stores the mark ahead of its base`
            : ' — a combining mark cannot begin a cluster in Unicode'),
      });
    }
  }
  return { hits, notes };
}

/* ---------- collecting strings to scan ---------- */
const findings = [];
const infos = [];
const scanned = { strings: 0, files: 0 };

function record(file, where, text) {
  scanned.strings++;
  const { hits, notes } = inspect(text);
  for (const h of hits) findings.push({ file, where, text, ...h });
  for (const n of notes) infos.push({ file, where, text, ...n });
}

/** Recursively pull every `my` value, plus any Myanmar-bearing string. */
function walkJson(node, trail, file) {
  if (node === null || node === undefined) return;
  if (typeof node === 'string') {
    const isMyField = trail.endsWith('.my') || trail === 'my';
    if (isMyField || hasMyanmar(node)) record(file, trail || '(root)', node);
    return;
  }
  if (typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach((v, i) => walkJson(v, `${trail}[${i}]`, file));
    return;
  }
  for (const k of Object.keys(node)) walkJson(node[k], trail ? `${trail}.${k}` : k, file);
}

async function scanJsonTree(dir) {
  let items;
  try {
    items = await readdir(dir, { withFileTypes: true });
  } catch {
    return; // missing content dir is fine
  }
  for (const it of items.sort((a, b) => a.name.localeCompare(b.name))) {
    const p = path.join(dir, it.name);
    if (it.isDirectory()) {
      await scanJsonTree(p);
      continue;
    }
    if (!it.isFile() || !it.name.endsWith('.json')) continue;
    const rel = path.relative(ROOT, p);
    scanned.files++;
    let data;
    try {
      data = JSON.parse(await readFile(p, 'utf8'));
    } catch (err) {
      // Malformed JSON is content-report.mjs's problem, not ours; note and move on.
      infos.push({
        file: rel,
        where: '(file)',
        text: '',
        codepoint: '--',
        offset: 0,
        why: `could not parse JSON: ${err.message}`,
      });
      continue;
    }
    walkJson(data, '', rel);
  }
}

/**
 * Pull string literals out of a TS/JS source. We only care about literals that
 * actually contain Myanmar script, so a rough literal matcher is sufficient —
 * we are not trying to be a parser.
 */
const LITERAL_RE = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;

async function scanSource(file) {
  const rel = path.relative(ROOT, file);
  let text;
  try {
    text = await readFile(file, 'utf8');
  } catch {
    return; // optional source
  }
  scanned.files++;
  LITERAL_RE.lastIndex = 0;
  let m;
  while ((m = LITERAL_RE.exec(text)) !== null) {
    const value = m[1] ?? m[2] ?? m[3] ?? '';
    if (!hasMyanmar(value)) continue;
    const line = text.slice(0, m.index).split('\n').length;
    record(rel, `line ${line}`, value);
  }
}

/* ---------- run ---------- */
await scanJsonTree(CONTENT_DIR);
for (const f of EXTRA_SOURCES) await scanSource(f);

out();
out(bold('Zawgyi detection — Burmese must be Myanmar Unicode (PRD LANG-05)'));
out(dim(`scanned ${scanned.files} file(s), ${scanned.strings} string(s) under ${path.relative(ROOT, CONTENT_DIR)}/ + src/data/copy.ts + src/lib/site.config.mjs`));
rule('=');

if (infos.length) {
  out();
  out(bold('Notes (not failures)'));
  for (const n of infos) {
    out(`  ${yellow('note')} ${n.file}  ${n.where}  ${n.codepoint}  ${n.why}`);
    if (n.text) out(`        ${dim(snippet(n.text))}`);
  }
}

if (findings.length === 0) {
  out();
  out(green(scanned.strings === 0 ? 'No Burmese strings found yet — nothing to check.' : 'CLEAN — no Zawgyi signatures found.'));
  out();
  process.exit(0);
}

out();
out(bold(`Zawgyi signatures found: ${findings.length}`));
out();
for (const f of findings) {
  out(`${red('ZAWGYI')} ${bold(f.file)}  ${f.where}`);
  out(`       rule=${f.rule}  codepoint=${f.codepoint}  offset=${f.offset}`);
  out(`       ${f.why}`);
  out(`       text: ${dim(snippet(f.text))}`);
  out();
}

rule('=');
const byRule = findings.reduce((acc, f) => ((acc[f.rule] = (acc[f.rule] || 0) + 1), acc), {});
out(
  red(
    bold(
      `FAILED — ${findings.length} Zawgyi match(es) in ${new Set(findings.map((f) => f.file)).size} file(s): ` +
        Object.entries(byRule).map(([k, v]) => `${k}=${v}`).join(', ')
    )
  )
);
out(dim('Convert the offending text to Myanmar Unicode before it ships (PRD LANG-05).'));
out();
process.exit(1);
