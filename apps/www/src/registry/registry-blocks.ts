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
        path: 'blocks/editor-ai/components/editor/rich-text-editor.tsx',
        type: 'registry:component',
      },
      {
        path: 'blocks/editor-ai/components/editor/rich-text-editor-value.ts',
        type: 'registry:component',
      },
    ],
    name: 'editor-ai',
    registryDependencies: [
      'tooltip',
      '@plate/editor',
      '@plate/comment',
      '@plate/discussion',
      '@plate/suggestion',
      '@plate/use-mobile',
      '@plate/settings-dialog',
      '@plate/editor-plugins',
      '@plate/ai',
      '@plate/dnd',
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
    dependencies: [],
    description: 'A basic editor',
    files: [
      {
        path: 'blocks/editor-basic/page.tsx',
        target: 'app/editor/page.tsx',
        type: 'registry:page',
      },
      {
        path: 'blocks/editor-basic/components/editor/rich-text-editor.tsx',
        type: 'registry:component',
      },
    ],
    name: 'editor-basic',
    registryDependencies: ['@plate/editor', '@plate/basic-nodes'],
    type: 'registry:block',
  },
  {
    categories: ['Serializers'],
    dependencies: ['platejs', '@platejs/test', 'next-themes'],
    files: [
      {
        path: 'blocks/html-export/page.tsx',
        target: 'app/html/page.tsx',
        type: 'registry:page',
      },
      {
        path: 'components/editor/html-export.tsx',
        type: 'registry:component',
      },
      {
        path: 'components/editor/html-export-schema-kit.ts',
        type: 'registry:component',
      },
      {
        path: 'components/editor/html-export-kit.ts',
        type: 'registry:component',
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
        path: 'examples/values/suggestion-value.tsx',
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
    name: 'html-export',
    registryDependencies: [
      '@plate/editor-static',
      '@plate/editor',
      '@plate/fixed-toolbar',
      '@plate/floating-toolbar',
      'button',
      '@plate/editor-plugins',
      '@plate/editor-plugins-static',
      '@plate/use-object-url',
      '@plate/ai',
      '@plate/dnd',
    ],
    type: 'registry:block',
  },
];
