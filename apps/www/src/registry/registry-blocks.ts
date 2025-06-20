import type { Registry } from 'shadcn/registry';

export const registryBlocks: Registry['items'] = [
  {
    categories: ['Editors'],
    dependencies: ['sonner'],
    description: 'An AI editor',
    files: [
      {
        path: 'blocks/editor-ai/page.tsx',
        target: 'app/editor/page.tsx',
        type: 'registry:page',
      },
      {
        path: 'blocks/editor-ai/components/editor/plate-editor.tsx',
        type: 'registry:component',
      },
      {
        path: 'blocks/editor-ai/components/editor/editor-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'editor-ai',
    registryDependencies: [
      'copilot-kit',
      'media-uploadthing-api',
      'plate-types',
      'settings-dialog',

      // editor-kit
      'editor-base-kit',
      'ai-kit',
      'align-kit',
      'autoformat-kit',
      'basic-nodes-kit',
      'block-menu-kit',
      'block-placeholder-kit',
      'callout-kit',
      'code-block-kit',
      'column-kit',
      'comment-kit',
      'cursor-overlay-kit',
      'date-kit',
      'discussion-kit',
      'dnd-kit',
      'docx-kit',
      'emoji-kit',
      'exit-break-kit',
      'fixed-toolbar-kit',
      'floating-toolbar-kit',
      'font-kit',
      'line-height-kit',
      'link-kit',
      'list-kit',
      'markdown-kit',
      'math-kit',
      'media-kit',
      'mention-kit',
      'slash-kit',
      'suggestion-kit',
      'table-kit',
      'toc-kit',
      'toggle-kit',
    ],
    type: 'registry:block',
  },
  {
    categories: ['Editors'],
    dependencies: [],
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
    dependencies: ['@platejs/basic-nodes', '@platejs/basic-nodes'],
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
    ],
    name: 'editor-basic',
    registryDependencies: ['editor', 'basic-nodes-kit', 'basic-marks-kit'],
    type: 'registry:block',
  },
  {
    categories: ['Serializers'],
    dependencies: ['next-themes'],
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
      {
        path: 'examples/values/align-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'examples/values/basic-blocks-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'examples/values/basic-marks-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'examples/values/column-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'examples/values/discussion-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'examples/values/date-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'examples/values/equation-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'examples/values/font-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'examples/values/indent-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'examples/values/line-height-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'examples/values/link-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'examples/values/list-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'examples/values/media-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'examples/values/mention-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'examples/values/table-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'examples/values/toc-value.tsx',
        type: 'registry:example',
      },
    ],
    meta: {
      rsc: true,
    },
    name: 'slate-to-html',
    registryDependencies: ['editor-base-kit', 'shadcn/button'],
    type: 'registry:block',
  },
];
