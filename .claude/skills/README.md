# Project Skills

Skills vendored into this repo so they load automatically for anyone working in it
(Claude Code discovers `.claude/skills/<name>/SKILL.md` at the project root).

## ui-ux-pro-max-skill v2.13.0

Source: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill (MIT)

| Skill | Purpose |
|---|---|
| `ui-ux-pro-max` | Searchable UI/UX intelligence — styles, palettes, font pairings, UX guidelines, icons, GSAP presets, chart types, per-stack rules (Astro included) |
| `ui-styling` | shadcn/ui + Tailwind implementation, canvas-based visual designs |
| `design` | Umbrella design skill — brand identity, logos, CIP, slides, banners, icons, social images |
| `design-system` | Three-layer token architecture and component specs |
| `brand` | Brand voice, visual identity, messaging frameworks |
| `banner-design` | Social / ad / hero / print banners |
| `slides` | HTML presentations with Chart.js |

### Requirements

Python 3.10+ (standard library only — no pip installs). `ui-styling` additionally
expects Node.js 18+ when it drives the `shadcn` CLI.

### Querying the design database

Run from the repository root:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain ux
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "islands hydration" --stack astro
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system -p "Project Name"
```

Valid `--domain` values: `style`, `color`, `chart`, `landing`, `product`, `ux`,
`typography`, `icons`, `gsap`, `react`, `web`, `google-fonts`.

### Local change vs. upstream

`ui-ux-pro-max/SKILL.md` documents its script path as
`${CLAUDE_PLUGIN_ROOT}/...`, which only resolves when the package is installed as
a Claude Code plugin. Those 11 occurrences were changed to
`${CLAUDE_PLUGIN_ROOT:-.}/...` so the path also resolves from the repository root
in this project-skill layout. Re-apply that substitution when upgrading upstream.
