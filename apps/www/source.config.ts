import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import rehypePrettyCode from "rehype-pretty-code"
import { z } from 'zod';

import { transformers } from '@/lib/highlight-code';

export default defineConfig({
  mdxOptions: {
    rehypePlugins: (plugins) => {
      plugins.shift();
      plugins.push([
        // TODO: fix the type.
        rehypePrettyCode as any,
        {
          theme: {
            dark: 'github-dark',
            light: 'github-light-default',
          },
          transformers,
        },
      ]);

      return plugins;
    },
  },
});

export const blogs = defineDocs({
  dir: './content/blogs',
  docs: {
    schema: z.object({
      author: z.string().optional(),
      badgeLink: z
        .object({
          href: z.string(),
          text: z.string(),
        })
        .optional(),
      date: z.string().or(z.date()),
      description: z.string().optional(),
      title: z.string(),
    }),
  },
});

export const docs = defineDocs({
  dir: './content/docs',
  docs: {
    schema: z.object({
      description: z.string().optional(),
      title: z.string(),
    }),
  },
});
