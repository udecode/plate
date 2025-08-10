import type { registryItemFileSchema } from 'shadcn/registry';
import type { z } from 'zod';

import { codeToHtml } from 'shiki';

export async function highlightFiles(
  files?: z.infer<typeof registryItemFileSchema>[]
) {
  if (!files || files.length === 0) {
    return null;
  }

  return await Promise.all(
    files.map(async (file) => ({
      ...file,
      highlightedContent: await highlightCode(file.content ?? ''),
    }))
  );
}

import type { ShikiTransformer } from 'shiki';

export const transformers = [
  {
    code(node) {
      if (node.tagName === 'code') {
        const raw = this.source;
        node.properties.__raw__ = raw;

        if (raw.startsWith('npm install')) {
          node.properties.__npm__ = raw;
          node.properties.__yarn__ = raw.replace('npm install', 'yarn add');
          node.properties.__pnpm__ = raw.replace('npm install', 'pnpm add');
          node.properties.__bun__ = raw.replace('npm install', 'bun add');
        }

        if (raw.startsWith('npx create-')) {
          node.properties.__npm__ = raw;
          node.properties.__yarn__ = raw.replace('npx create-', 'yarn create ');
          node.properties.__pnpm__ = raw.replace('npx create-', 'pnpm create ');
          node.properties.__bun__ = raw.replace('npx', 'bunx --bun');
        }

        // npm create.
        if (raw.startsWith('npm create')) {
          node.properties.__npm__ = raw;
          node.properties.__yarn__ = raw.replace('npm create', 'yarn create');
          node.properties.__pnpm__ = raw.replace('npm create', 'pnpm create');
          node.properties.__bun__ = raw.replace('npm create', 'bun create');
        }

        // npx.
        if (raw.startsWith('npx')) {
          node.properties.__npm__ = raw;
          node.properties.__yarn__ = raw.replace('npx', 'yarn');
          node.properties.__pnpm__ = raw.replace('npx', 'pnpm dlx');
          node.properties.__bun__ = raw.replace('npx', 'bunx --bun');
        }

        // npm run.
        if (raw.startsWith('npm run')) {
          node.properties.__npm__ = raw;
          node.properties.__yarn__ = raw.replace('npm run', 'yarn');
          node.properties.__pnpm__ = raw.replace('npm run', 'pnpm');
          node.properties.__bun__ = raw.replace('npm run', 'bun');
        }
      }
    },
  },
] as ShikiTransformer[];

export async function highlightCode(code: string, language = 'tsx') {
  const html = await codeToHtml(code, {
    cssVariablePrefix: '--shiki-',
    defaultColor: false,
    lang: language,
    themes: {
      dark: 'github-dark',
      light: 'github-light-default',
    },
    transformers: [
      ...transformers,
      {
        code(node) {
          node.properties['data-line-numbers'] = '';
        },
        line(node) {
          node.properties['data-line'] = '';
        },
        pre(node) {
          node.properties['data-language'] = language;
          node.properties['data-theme'] = 'default';
        },
        root(node) {
          // Wrap in figure element like rehype-pretty-code
          return {
            children: [
              {
                children: node.children as any,
                tagName: 'figure',
                type: 'element',
              },
            ],
            type: 'root',
          } as any;
        },
      } as ShikiTransformer,
    ],
  });

  return html;
}
