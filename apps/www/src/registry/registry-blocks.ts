import type { Registry } from 'shadcn/registry';

export const registryBlocks: Registry['items'] = [
  {
    categories: ['Editors'],
    dependencies: [
      '@udecode/cn',
      '@udecode/plate-ai',
      '@udecode/plate-basic-marks',
      '@udecode/plate-block-quote',
      '@udecode/plate-code-block',
      '@udecode/plate-comments',
      '@udecode/plate-callout',
      '@udecode/plate-suggestion',
      '@udecode/plate',
      '@udecode/plate-date',
      '@udecode/plate-emoji',
      '@emoji-mart/data@1.2.1',
      '@udecode/plate-excalidraw',
      '@udecode/plate-heading',
      '@udecode/plate-highlight',
      '@udecode/plate-horizontal-rule',
      '@udecode/plate-kbd',
      '@udecode/plate-layout',
      '@udecode/plate-link',
      '@udecode/plate-media',
      '@udecode/plate-mention',
      '@udecode/plate-slash-command',
      '@udecode/plate-table',
      '@udecode/plate-toggle',
      'sonner',
    ],
    description: 'An AI editor',
    files: [
      {
        path: 'blocks/editor-ai/page.tsx',
        target: 'app/editor/page.tsx',
        type: 'registry:page',
      },
      {
        path: 'components/editor/plate-ai-editor.tsx',
        target: 'components/editor/plate-editor.tsx',
        type: 'registry:component',
      },
      {
        path: 'blocks/editor-ai/components/editor/use-create-editor.ts',
        type: 'registry:component',
      },
      {
        path: 'components/editor/settings.tsx',
        type: 'registry:component',
      },
    ],
    name: 'editor-ai',
    registryDependencies: [
      'editor-kit',
      'copilot-kit',
      'media-uploadthing-api',
      'plate-types',
    ],
    type: 'registry:block',
  },
  {
    categories: ['Editors'],
    dependencies: ['@udecode/cn'],
    description: 'A multi-select editor',
    files: [
      {
        path: 'blocks/editor-select/page.tsx',
        target: 'app/editor/page.tsx',
        type: 'registry:page',
      },
    ],
    meta: {
      descriptionSrc: '/docs/multi-select',
    },
    name: 'editor-select',
    registryDependencies: ['select-editor-demo'],
    type: 'registry:block',
  },
  {
    categories: ['Editors'],
    dependencies: [
      '@udecode/cn',
      '@udecode/plate-basic-elements',
      '@udecode/plate-basic-marks',
    ],
    description: 'A basic editor',
    files: [
      {
        path: 'blocks/editor-basic/page.tsx',
        target: 'app/editor/page.tsx',
        type: 'registry:page',
      },
      {
        path: 'blocks/editor-basic/components/editor/plate-editor.tsx',
        type: 'registry:component',
      },
      {
        path: 'blocks/editor-basic/components/editor/use-create-editor.ts',
        type: 'registry:component',
      },
    ],
    name: 'editor-basic',
    registryDependencies: ['editor'],
    type: 'registry:block',
  },
  {
    categories: ['Serializers'],
    dependencies: ['@udecode/cn'],
    files: [
      {
        path: 'blocks/slate-to-html/page.tsx',
        target: 'app/html/page.tsx',
        type: 'registry:page',
      },
      {
        path: 'components/editor/slate-to-html.tsx',
        type: 'registry:component',
      },
      {
        path: 'lib/create-html-document.ts',
        type: 'registry:lib',
      },
    ],
    meta: {
      rsc: true,
    },
    name: 'slate-to-html',
    registryDependencies: [],
    type: 'registry:block',
  },
];
