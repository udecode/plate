import { defineDocs } from 'fumadocs-mdx/config';
import { z } from 'zod';

export const docs = defineDocs({
  dir: './content/docs',
});

export const blogs = defineDocs({
  dir: './content/blogs',
  docs: {
    schema: z.object({
      date: z.string().or(z.date()),
      description: z.string().optional(),
      title: z.string(),
    }),
  },
});
