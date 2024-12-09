import type { Registry } from '@/registry/schema';

const plugins: Registry = [
  {
    dependencies: [
      '@udecode/plate-callout',
      '@udecode/plate-date',
      '@udecode/plate-docx',
      '@udecode/plate-emoji',
      '@udecode/plate-font',
      '@udecode/plate-highlight',
      '@udecode/plate-horizontal-rule',
      '@udecode/plate-juice',
      '@udecode/plate-kbd',
      '@udecode/plate-layout',
      '@udecode/plate-markdown',
      '@udecode/plate-math',
      '@udecode/plate-slash-command',
      '@udecode/plate-toggle',
      '@udecode/plate-trailing-block',
    ],
    files: [
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:component',
      },
    ],
    name: 'editor-plugins',
    registryDependencies: [
      'ai-plugins',
      'basic-nodes-plugins',
      'align-plugin',
      'autoformat-plugin',
      'block-menu-plugins',
      'cursor-overlay-plugin',
      'comments-plugin',
      'delete-plugins',
      'dnd-plugins',
      'exit-break-plugin',
      'indent-list-plugins',
      'line-height-plugin',
      'link-plugin',
      'media-plugins',
      'mention-plugin',
      'reset-block-type-plugin',
      'soft-break-plugin',
      'table-plugin',
      'toc-plugin',
    ],
    type: 'registry:component',
  },
  {
    dependencies: [
      '@udecode/plate-ai',
      '@udecode/plate-basic-marks',
      '@udecode/plate-block-quote',
      '@udecode/plate-code-block',
      '@udecode/plate-heading',
      '@udecode/plate-horizontal-rule',
      '@udecode/plate-link',
      '@udecode/plate-markdown',
    ],
    files: [
      {
        path: 'components/editor/plugins/ai-plugins.tsx',
        type: 'registry:component',
      },
    ],
    name: 'ai-plugins',
    registryDependencies: [
      'basic-nodes-plugins',
      'block-selection-plugins',
      'cursor-overlay-plugin',
      'indent-list-plugins',
      'link-plugin',
      'ai-menu',
      'blockquote-element',
      'code-block-element',
      'code-leaf',
      'code-line-element',
      'code-syntax-leaf',
      'cursor-overlay',
      'heading-element',
      'hr-element',
      'link-element',
      'paragraph-element',
    ],
    type: 'registry:component',
  },
  {
    dependencies: [
      '@udecode/plate-alignment',
      '@udecode/plate-heading',
      '@udecode/plate-media',
    ],
    files: [
      {
        path: 'components/editor/plugins/align-plugin.ts',
        type: 'registry:component',
      },
    ],
    name: 'align-plugin',
    type: 'registry:component',
  },
  {
    dependencies: [
      '@udecode/plate-autoformat',
      '@udecode/plate-basic-marks',
      '@udecode/plate-block-quote',
      '@udecode/plate-code-block',
      '@udecode/plate-heading',
      '@udecode/plate-highlight',
      '@udecode/plate-horizontal-rule',
      '@udecode/plate-indent-list',
      '@udecode/plate-toggle',
    ],
    files: [
      {
        path: 'components/editor/plugins/autoformat-plugin.ts',
        type: 'registry:component',
      },
    ],
    name: 'autoformat-plugin',
    type: 'registry:component',
  },
  {
    dependencies: [
      '@udecode/plate-autoformat',
      '@udecode/plate-basic-marks',
      '@udecode/plate-block-quote',
      '@udecode/plate-code-block',
      '@udecode/plate-heading',
      '@udecode/plate-highlight',
      '@udecode/plate-horizontal-rule',
      '@udecode/plate-list',
      '@udecode/plate-toggle',
    ],
    files: [
      {
        path: 'components/editor/plugins/autoformat-list-plugin.ts',
        type: 'registry:component',
      },
    ],
    name: 'autoformat-list-plugin',
    type: 'registry:component',
  },
  {
    dependencies: [
      '@udecode/plate-basic-marks',
      '@udecode/plate-block-quote',
      '@udecode/plate-code-block',
      '@udecode/plate-heading',
      'prismjs',
    ],
    files: [
      {
        path: 'components/editor/plugins/basic-nodes-plugins.tsx',
        type: 'registry:component',
      },
    ],
    name: 'basic-nodes-plugins',
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-selection'],
    files: [
      {
        path: 'components/editor/plugins/block-selection-plugins.ts',
        type: 'registry:component',
      },
    ],
    name: 'block-selection-plugins',
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-selection'],
    files: [
      {
        path: 'components/editor/plugins/block-menu-plugins.ts',
        type: 'registry:component',
      },
    ],
    name: 'block-menu-plugins',
    registryDependencies: ['block-context-menu', 'block-selection-plugins'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-comments'],
    files: [
      {
        path: 'components/editor/plugins/comments-plugin.tsx',
        type: 'registry:component',
      },
    ],
    name: 'comments-plugin',
    registryDependencies: ['comments-popover'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-selection'],
    files: [
      {
        path: 'components/editor/plugins/cursor-overlay-plugin.tsx',
        type: 'registry:component',
      },
    ],
    name: 'cursor-overlay-plugin',
    registryDependencies: ['cursor-overlay'],
    type: 'registry:component',
  },
  {
    dependencies: [
      '@udecode/plate-ai',
      '@udecode/plate-markdown',
      '@faker-js/faker',
    ],
    files: [
      {
        path: 'components/editor/plugins/copilot-plugins.tsx',
        type: 'registry:component',
      },
    ],
    name: 'copilot-plugins',
    registryDependencies: ['ghost-text'],
    type: 'registry:component',
  },
  {
    dependencies: [
      '@udecode/plate-select',
      '@udecode/plate-horizontal-rule',
      '@udecode/plate-media',
    ],
    files: [
      {
        path: 'components/editor/plugins/delete-plugins.ts',
        type: 'registry:component',
      },
    ],
    name: 'delete-plugins',
    type: 'registry:component',
  },
  {
    dependencies: [
      '@udecode/plate-dnd',
      '@udecode/plate-media',
      '@udecode/plate-node-id',
    ],
    files: [
      {
        path: 'components/editor/plugins/dnd-plugins.tsx',
        type: 'registry:component',
      },
    ],
    name: 'dnd-plugins',
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-break', '@udecode/plate-heading'],
    files: [
      {
        path: 'components/editor/plugins/exit-break-plugin.ts',
        type: 'registry:component',
      },
    ],
    name: 'exit-break-plugin',
    type: 'registry:component',
  },
  {
    dependencies: [],
    files: [
      {
        path: 'components/editor/plugins/fixed-toolbar-plugin.tsx',
        type: 'registry:component',
      },
    ],
    name: 'fixed-toolbar-plugin',
    registryDependencies: ['fixed-toolbar', 'fixed-toolbar-buttons'],
    type: 'registry:component',
  },
  {
    dependencies: [],
    files: [
      {
        path: 'components/editor/plugins/fixed-toolbar-list-plugin.tsx',
        type: 'registry:component',
      },
    ],
    name: 'fixed-toolbar-list-plugin',
    registryDependencies: ['fixed-toolbar', 'fixed-toolbar-buttons'],
    type: 'registry:component',
  },
  {
    dependencies: [],
    files: [
      {
        path: 'components/editor/plugins/floating-toolbar-plugin.tsx',
        type: 'registry:component',
      },
    ],
    name: 'floating-toolbar-plugin',
    registryDependencies: ['floating-toolbar', 'floating-toolbar-buttons'],
    type: 'registry:component',
  },
  {
    dependencies: [
      '@udecode/plate-block-quote',
      '@udecode/plate-code-block',
      '@udecode/plate-heading',
      '@udecode/plate-indent',
      '@udecode/plate-indent-list',
      '@udecode/plate-toggle',
    ],
    files: [
      {
        path: 'components/editor/plugins/indent-list-plugins.ts',
        type: 'registry:component',
      },
    ],
    name: 'indent-list-plugins',
    registryDependencies: ['indent-fire-marker', 'indent-todo-marker'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-heading', '@udecode/plate-line-height'],
    files: [
      {
        path: 'components/editor/plugins/line-height-plugin.ts',
        type: 'registry:component',
      },
    ],
    name: 'line-height-plugin',
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-link'],
    files: [
      {
        path: 'components/editor/plugins/link-plugin.tsx',
        type: 'registry:component',
      },
    ],
    name: 'link-plugin',
    registryDependencies: ['link-floating-toolbar'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-caption', '@udecode/plate-media'],
    files: [
      {
        path: 'components/editor/plugins/media-plugins.tsx',
        type: 'registry:component',
      },
    ],
    name: 'media-plugins',
    registryDependencies: ['image-preview', 'media-upload-toast'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-mention'],
    files: [
      {
        path: 'components/editor/plugins/mention-plugin.ts',
        type: 'registry:component',
      },
    ],
    name: 'mention-plugin',
    type: 'registry:component',
  },
  {
    dependencies: [
      '@udecode/plate-block-quote',
      '@udecode/plate-callout',
      '@udecode/plate-code-block',
      '@udecode/plate-heading',
      '@udecode/plate-indent-list',
      '@udecode/plate-reset-node',
    ],
    files: [
      {
        path: 'components/editor/plugins/reset-block-type-plugin.ts',
        type: 'registry:component',
      },
    ],
    name: 'reset-block-type-plugin',
    type: 'registry:component',
  },
  {
    dependencies: [
      '@udecode/plate-break',
      '@udecode/plate-block-quote',
      '@udecode/plate-callout',
      '@udecode/plate-code-block',
      '@udecode/plate-table',
    ],
    files: [
      {
        path: 'components/editor/plugins/soft-break-plugin.ts',
        type: 'registry:component',
      },
    ],
    name: 'soft-break-plugin',
    type: 'registry:component',
  },
  {
    dependencies: [
      '@udecode/plate-code-block',
      '@udecode/plate-tabbable',
      '@udecode/plate-table',
    ],
    files: [
      {
        path: 'components/editor/plugins/tabbable-plugin.ts',
        type: 'registry:component',
      },
    ],
    name: 'tabbable-plugin',
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-table'],
    files: [
      {
        path: 'components/editor/plugins/table-plugin.ts',
        type: 'registry:component',
      },
    ],
    name: 'table-plugin',
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-heading'],
    files: [
      {
        path: 'components/editor/plugins/toc-plugin.ts',
        type: 'registry:component',
      },
    ],
    name: 'toc-plugin',
    type: 'registry:component',
  },
];

export const components: Registry = [
  ...plugins,
  {
    dependencies: ['ai', '@faker-js/faker'],
    files: [
      {
        path: 'components/editor/use-chat.ts',
        type: 'registry:component',
      },
    ],
    name: 'use-chat',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: [
      '@udecode/plate-callout',
      '@udecode/plate-code-block',
      '@udecode/plate-date',
      '@udecode/plate-heading',
      '@udecode/plate-indent-list',
      '@udecode/plate-layout',
      '@udecode/plate-link',
      '@udecode/plate-math',
      '@udecode/plate-media',
      '@udecode/plate-table',
    ],
    files: [
      { path: 'components/editor/transforms.ts', type: 'registry:component' },
    ],
    name: 'transforms',
    type: 'registry:component',
  },
  {
    dependencies: [
      '@udecode/plate-block-quote',
      '@udecode/plate-code-block',
      '@udecode/plate-comments',
      '@udecode/plate-excalidraw',
      '@udecode/plate-heading',
      '@udecode/plate-horizontal-rule',
      '@udecode/plate-link',
      '@udecode/plate-media',
      '@udecode/plate-mention',
      '@udecode/plate-table',
      '@udecode/plate-toggle',
    ],
    files: [
      { path: 'components/editor/plate-types.ts', type: 'registry:component' },
    ],
    name: 'plate-types',
    type: 'registry:component',
  },
  {
    dependencies: [
      '@udecode/plate-block-quote',
      '@udecode/plate-code-block',
      '@udecode/plate-comments',
      '@udecode/plate-excalidraw',
      '@udecode/plate-heading',
      '@udecode/plate-horizontal-rule',
      '@udecode/plate-link',
      '@udecode/plate-list',
      '@udecode/plate-media',
      '@udecode/plate-mention',
      '@udecode/plate-table',
      '@udecode/plate-toggle',
    ],
    files: [
      {
        path: 'components/editor/plate-list-types.ts',
        type: 'registry:component',
      },
    ],
    name: 'plate-list-types',
    type: 'registry:component',
  },
];
