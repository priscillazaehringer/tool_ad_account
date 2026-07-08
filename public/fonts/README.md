# Licensed brand fonts

Drop the `.woff2` files for the licensed brand fonts here, then uncomment the
`@font-face` blocks at the bottom of `src/app/globals.css`.

Expected filenames (rename your files to match, or edit the `@font-face` `src`
URLs to match your files):

- `boston-angel.woff2` — Boston Angel (display / headings)
- `proxima-nova-regular.woff2` — Proxima Nova 400
- `proxima-nova-semibold.woff2` — Proxima Nova 600
- `milkshake.woff2` — Milkshake Script (handwritten accents)

Prefer Adobe Fonts? Skip this folder entirely — add the Adobe Fonts kit `<link>`
in `src/app/layout.tsx` instead (see the comment there). Do not commit licensed
font files to a public repo unless your license permits it.
