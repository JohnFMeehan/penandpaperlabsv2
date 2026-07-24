import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.enum(['Print', 'Paper', 'Electronics', 'Software', 'Process', 'Shop notes']),
    slug: z.string(),
    image: z.string().optional(),
    author: z.string().default('John Meehan'),
  }),
});

export const collections = { journal };
