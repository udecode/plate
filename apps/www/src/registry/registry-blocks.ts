import type { Registry } from 'shadcn/schema';

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
      '@plate/copilot-kit',
      '@plate/media-uploadthing-api',
      '@plate/plate-types',
      '@plate/settings-dialog',

      // editor-kit
      '@plate/editor-base-kit',
      '@plate/ai-kit',
      '@plate/align-kit',
      '@plate/autoformat-kit',
      '@plate/basic-nodes-kit',
      '@plate/block-menu-kit',
      '@plate/block-placeholder-kit',
      '@plate/callout-kit',
      '@plate/code-block-kit',
      '@plate/column-kit',
      '@plate/comment-kit',
      '@plate/cursor-overlay-kit',
      '@plate/date-kit',
      '@plate/discussion-kit',
      '@plate/dnd-kit',
      '@plate/docx-kit',
      '@plate/emoji-kit',
      '@plate/exit-break-kit',
      '@plate/fixed-toolbar-kit',
      '@plate/floating-toolbar-kit',
      '@plate/font-kit',
      '@plate/line-height-kit',
      '@plate/link-kit',
      '@plate/list-kit',
      '@plate/markdown-kit',
      '@plate/math-kit',
      '@plate/media-kit',
      '@plate/mention-kit',
      '@plate/slash-kit',
      '@plate/suggestion-kit',
      '@plate/table-kit',
      '@plate/toc-kit',
      '@plate/toggle-kit',
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
    registryDependencies: ['@plate/select-editor-demo'],
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
    registryDependencies: [
      '@plate/editor',
      '@plate/basic-nodes-kit',
      '@plate/basic-marks-kit',
    ],
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
    registryDependencies: ['@plate/editor-base-kit', 'button'],
    type: 'registry:block',
  },
];
