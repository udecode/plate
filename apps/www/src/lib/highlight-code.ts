import type { z } from 'zod';

import { codeToHtml } from 'shiki';

import type { registryItemFileSchema } from '../registry/schema';

export async function highlightCode(code: string) {
  const html = await codeToHtml(code, {
    lang: 'jsx',
    theme: 'github-dark-default',
    transformers: [
      {
        code(node) {
          node.properties['data-line-numbers'] = '';
        },
      },
    ],
  });

  return html;
}

export async function highlightFiles(
  files?: z.infer<typeof registryItemFileSchema>[]
) {
  if (!files) {
    return null;
  }

  return await Promise.all(
    files.map(async (file) => ({
      ...file,
      highlightedContent: await highlightCode(file.content ?? ''),
    }))
  );
}
