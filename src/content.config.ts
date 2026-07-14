import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * The portfolio. One markdown file in src/content/work/ per project —
 * see README.md ("Adding a project") for the 2-minute guide.
 */
const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    client: z.string(),                 // name painted on the fascia
    trade: z.string(),                  // "Bakery", "Plumbing & heating", …
    place: z.string(),                  // "Portland, OR" — where they trade
    year: z.number(),
    services: z.array(z.string()),      // what Ægentes did
    summary: z.string(),                // one sentence for cards & meta tags
    // colours drive the generated cover art & the case-study look board
    palette: z.object({
      bg: z.string(),                   // ground
      fg: z.string(),                   // lettering
      accent: z.string(),               // trim
    }),
    motif: z
      .enum(['sunburst', 'stripes', 'arch', 'checker', 'rays', 'monogram'])
      .default('monogram'),
    cover: z.string().optional(),       // optional real screenshot — replaces generated art
    fonts: z.array(z.string()).default([]),   // faces used on the client site
    stack: z.array(z.string()).default([]),   // what it runs on
    result: z.string().optional(),      // the one number/outcome worth saying
    url: z.string().optional(),         // live site, if public
    featured: z.boolean().default(false), // pinned to the homepage
    order: z.number().default(99),      // lower = earlier
    sample: z.boolean().default(false), // marks placeholder entries — see README
  }),
});

export const collections = { work };
