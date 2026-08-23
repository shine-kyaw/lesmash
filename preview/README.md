# Preview bundle

`lesmash-preview.html` is the whole site — all 21 routes, both locales — folded
into one self-contained file. Open it in any browser, or host it anywhere, and
the real navigation works: header, footer, sticky action bar and the language
toggle. Outbound Foodpanda and Google Maps links are left untouched, so they
behave exactly as they will in production.

It exists so the site can be reviewed and shared before it is hosted.

## Regenerating

The file is generated. After changing content or code:

```bash
npm run build          # produces dist/
npm run preview:bundle # rebuilds this file from dist/
```

Both steps are needed — the bundler reads `dist/`, not `src/`.

## What it is not

A deploy. Routes are hash-based (`#/menu`, not `/menu`), so this file tells you
nothing about real load time, caching or search behaviour, and it is not what
should ever be served to customers. The deployable output is `dist/`.

It is also larger than any real page (~526KB), because it carries every route
plus the Myanmar font inlined as a data URI — the preview host serves no
`/fonts/` path. A real page is around 135KB.
