import type { registryItemFileSchema } from 'shadcn/schema';
import type { z } from 'zod';

import { codeToHtml } from 'shiki';

function getLanguageFromFilePath(path?: string) {
  const extension = path?.split('.').pop();

  switch (extension) {
    case 'css':
    case 'json':
    case 'ts':
    case 'tsx':
      return extension;
    case 'js':
    case 'jsx':
      return extension;
    default:
      return 'tsx';
  }
}

export async function highlightCode(code: string, language = 'tsx') {
  const html = await codeToHtml(code, {
    lang: language,
    themes: {
      dark: 'github-dark',
      light: 'github-light',
    },
    transformers: [
      {
        pre(node) {
          node.properties.class =
            'no-scrollbar min-w-0 overflow-x-auto overflow-y-auto overscroll-x-contain overscroll-y-auto px-4 py-3.5 outline-none has-[[data-highlighted-line]]:px-0 has-[[data-line-numbers]]:px-0 has-[[data-slot=tabs]]:p-0 !bg-transparent';
        },
        code(node) {
          node.properties['data-line-numbers'] = '';
        },
        line(node) {
          node.properties['data-line'] = '';
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
      highlightedContent: await highlightCode(
        file.content ?? '',
        getLanguageFromFilePath(file.path)
      ),
    }))
  );
}
