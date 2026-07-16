# Ægentes — aegentes.com

The studio site: a shopcraft-themed portfolio and pitch for a studio that builds
websites and AI receptionists for small businesses. Built with [Astro](https://astro.build) — fully static,
no client framework, ~15 kB of JavaScript total (the split-flap sign, scroll reveals,
menu, clock).

## Run it

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # production build → dist/
npm run preview    # serve the production build locally
```

## Adding a project to the portfolio (2 minutes)

Every portfolio piece is **one markdown file** in `src/content/work/`.
Drop a file in, rebuild, done — it appears on the Work page (and the homepage if
`featured: true`), gets its own case-study page at `/work/<filename>/`, generated
cover art, a job ticket, and a palette board.

Create `src/content/work/my-client.md`:

```markdown
---
client: "Marrow & Bone"            # name painted on the fascia
trade: "Butcher shop"              # what they do
place: "Austin, TX"                # where they trade
year: 2026
services: ["Web design & build", "Online ordering"]
summary: "One sentence that sells the story — used on cards and meta tags."
palette:                           # drives the generated cover art + look board
  bg: "#8c2f22"                    # ground
  fg: "#f2e8d8"                    # lettering
  accent: "#d99a2b"                # trim
motif: "rays"                      # sunburst | stripes | arch | checker | rays | monogram
fonts: ["Fraunces", "Karla"]       # faces used on the client's site (for the look board)
stack: ["Astro", "Square Online"]  # what it runs on
result: "Weekend pre-orders sold out in week one"   # the one number worth saying
url: "https://example.com"         # optional — adds a "visit the live site" link
featured: true                     # pin to the homepage (top 3 by `order` show there)
order: 6                           # lower = earlier on the Work page
---

## The brief

What the client needed, in plain English…

## The look

Where the design came from…

## The build

What you actually made…

## The result

What changed for the business…
```

Notes:

- **Cover art is generated** from `palette` + `motif` + the client's initial — every
  project gets a poster without needing a screenshot. When you have a real screenshot,
  add `cover: "/work/my-client.png"` (put the image in `public/work/`) and it replaces
  the generated art everywhere.
- The `motif` families: `sunburst` (rising sun), `stripes` (awning + sign),
  `arch` (greenhouse/window), `checker` (tiled floor + ledger rules), `rays`
  (corner fan + badge), `monogram` (ring seal — the default).
- Body headings (`## The brief` etc.) are free-form — use whatever sections tell
  the story.

> **The five current projects are sample entries** (marked `sample: true` in their
> frontmatter) written to show the format and make the design real. Replace them with
> actual client work as it lands — just delete a file to remove a project.

## Changing everyday things

| What | Where |
| --- | --- |
| Email address | Search `alan@aegentes.com` — it appears in `Nav.astro`, `Footer.astro`, `index.astro`, `contact.astro`, `Base.astro` (schema) |
| Phone number | Search `6506684007` / `(650) 668-4007` — `Nav.astro`, `Footer.astro`, `contact.astro`, `Base.astro` (schema), `public/llms.txt` |
| Trades on the split-flap sign | `trades` array in `src/pages/index.astro` (keep words ≤ 9 letters) |
| Receipt line items | `items` in `src/components/Receipt.astro` |
| Process steps | `steps` in `src/pages/index.astro` |
| House rules | `rules` in `src/pages/studio.astro` |
| FAQs | `faqs` in `src/pages/contact.astro` |
| Availability status ("Open — booking…") | `Footer.astro`, `Nav.astro` menu, `index.astro` hero |
| Colours & type scale | CSS variables at the top of `src/styles/global.css` |
| Social/OG image | `node scripts/og.mjs` regenerates `public/og.png` |

## Services

Two offerings sit alongside each other across the site:

- **Websites** — the original offering. Detailed by the **receipt** (`Receipt.astro`),
  the four-step **process** (`index.astro`), and the **portfolio** (`src/content/work/`).
- **AI receptionist** — launched July 2026. Presented in the homepage **"What we do"**
  section (`.do-grid` in `index.astro`), the studio page name story, the contact page
  phone block + FAQ, and `public/llms.txt`. The phone number `(650) 668-4007` is
  answered by Ægentes's own AI receptionist.

To add AI-receptionist case studies, drop them into the same `src/content/work/`
collection as usual (a `kind` field can be added to `src/content.config.ts` for
filtering later).

## Deploying to aegentes.com

Any static host works. The build outputs plain HTML/CSS/JS to `dist/`.

- **Netlify / Vercel / Cloudflare Pages**: connect the repo, build command
  `npm run build`, output directory `dist/`. Then point the `aegentes.com` DNS at the
  host (each provider shows the exact records) .
- `astro.config.mjs` already sets `site: 'https://aegentes.com'`, so the sitemap and
  canonical URLs are correct out of the box. `public/robots.txt` points at the sitemap.

## How it's put together

```
src/
  content/work/          ← the portfolio (one .md per project)
  content.config.ts      ← portfolio schema (zod-validated frontmatter)
  layouts/Base.astro     ← head/meta/fonts, nav + footer shell
  components/
    FlapBoard.astro      ← the split-flap sign (hero + 404)
    Cover.astro          ← generated cover art (six motif families, seeded)
    WorkCard.astro       ← fascia + window + sill shopfront card
    Receipt.astro        ← the itemised receipt
    Nav.astro Footer.astro
  pages/                 ← index, work/, work/[slug], studio, contact, 404
  scripts/main.ts        ← flap mechanism, reveals, nav, menu, clock
  styles/global.css      ← the whole design system (tokens at the top)
scripts/og.mjs           ← regenerates public/og.png
```

Type: Besley (display — a Clarendon revival, the classic trade-sign slab),
Work Sans (body), Spline Sans Mono (tickets & labels). Palette: pine, plaster,
brass, signal red. All self-hosted via Fontsource — no external requests at runtime.
