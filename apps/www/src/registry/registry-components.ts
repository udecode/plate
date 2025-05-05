import type { Registry } from 'shadcn/registry';

const plugins: Registry['items'] = [
  // Files
  {
    dependencies: ['@ai-sdk/openai', 'ai'],
    files: [
      {
        path: 'app/api/ai/command/route.ts',
        target: 'app/api/ai/command/route.ts',
        type: 'registry:file',
      },
      {
        path: 'app/api/ai/copilot/route.ts',
        target: 'app/api/ai/copilot/route.ts',
        type: 'registry:file',
      },
    ],
    name: 'api-ai',
    registryDependencies: [],
    type: 'registry:file',
  },
  {
    dependencies: ['uploadthing@7.6.0'],
    files: [
      {
        path: 'app/api/uploadthing/route.ts',
        target: 'app/api/uploadthing/route.ts',
        type: 'registry:file',
      },
    ],
    name: 'api-uploadthing',
    registryDependencies: [],
    type: 'registry:file',
  },
  // Components
  {
    dependencies: [
      '@udecode/plate-callout',
      '@udecode/plate-date',
      '@udecode/plate-docx',
      '@udecode/plate-emoji',
      '@emoji-mart/data@1.2.1',
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
      'http://localhost:3000/r/ai-plugins',
      'http://localhost:3000/r/markdown-plugin',
      'http://localhost:3000/r/basic-nodes-plugins',
      'http://localhost:3000/r/align-plugin',
      'http://localhost:3000/r/autoformat-plugin',
      'http://localhost:3000/r/block-menu-plugins',
      'http://localhost:3000/r/equation-plugins',
      'http://localhost:3000/r/cursor-overlay-plugin',
      'http://localhost:3000/r/comments-plugin',
      'http://localhost:3000/r/delete-plugins',
      'http://localhost:3000/r/dnd-plugins',
      'http://localhost:3000/r/exit-break-plugin',
      'http://localhost:3000/r/indent-list-plugins',
      'http://localhost:3000/r/line-height-plugin',
      'http://localhost:3000/r/link-plugin',
      'http://localhost:3000/r/media-plugins',
      'http://localhost:3000/r/mention-plugin',
      'http://localhost:3000/r/reset-block-type-plugin',
      'http://localhost:3000/r/skip-mark-plugin',
      'http://localhost:3000/r/suggestion-plugin',
      'http://localhost:3000/r/soft-break-plugin',
      'http://localhost:3000/r/table-plugin',
      'http://localhost:3000/r/toc-plugin',
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
      'http://localhost:3000/r/basic-nodes-plugins',
      'http://localhost:3000/r/block-selection-plugins',
      'http://localhost:3000/r/cursor-overlay-plugin',
      'http://localhost:3000/r/indent-list-plugins',
      'http://localhost:3000/r/link-plugin',
      'http://localhost:3000/r/ai-menu',
      'http://localhost:3000/r/blockquote-element',
      'http://localhost:3000/r/code-block-element',
      'http://localhost:3000/r/code-leaf',
      'http://localhost:3000/r/code-line-element',
      'http://localhost:3000/r/code-syntax-leaf',
      'http://localhost:3000/r/cursor-overlay',
      'http://localhost:3000/r/heading-element',
      'http://localhost:3000/r/hr-element',
      'http://localhost:3000/r/link-element',
      'http://localhost:3000/r/paragraph-element',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-math'],
    files: [
      {
        path: 'components/editor/plugins/equation-plugins.ts',
        type: 'registry:component',
      },
    ],
    name: 'equation-plugins',
    registryDependencies: [
      'http://localhost:3000/r/equation-element',
      'http://localhost:3000/r/inline-equation-toolbar-button',
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
      'lowlight',
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
        path: 'components/editor/plugins/block-selection-plugins.tsx',
        type: 'registry:component',
      },
    ],
    name: 'block-selection-plugins',
    registryDependencies: ['http://localhost:3000/r/block-selection'],
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
    registryDependencies: [
      'http://localhost:3000/r/block-context-menu',
      'http://localhost:3000/r/block-selection-plugins',
    ],
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
    registryDependencies: ['http://localhost:3000/r/discussion-plugin'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-basic-marks'],
    files: [
      {
        path: 'components/editor/plugins/skip-mark-plugin.ts',
        type: 'registry:component',
      },
    ],
    name: 'skip-mark-plugin',
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-suggestion'],
    files: [
      {
        path: 'components/editor/plugins/suggestion-plugin.tsx',
        type: 'registry:component',
      },
      {
        path: 'ui/suggestion-line-break.tsx',
        type: 'registry:ui',
      },
      {
        path: 'ui/suggestion-toolbar-button.tsx',
        type: 'registry:ui',
      },
    ],
    name: 'suggestion-plugin',
    registryDependencies: ['http://localhost:3000/r/discussion-plugin'],
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
    registryDependencies: ['http://localhost:3000/r/cursor-overlay'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-markdown', 'remark-gfm', 'remark-math'],
    files: [
      {
        path: 'components/editor/plugins/markdown-plugin.tsx',
        type: 'registry:component',
      },
    ],
    name: 'markdown-plugin',
    registryDependencies: [],
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
    registryDependencies: ['http://localhost:3000/r/ghost-text'],
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
    registryDependencies: ['http://localhost:3000/r/draggable'],
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
    registryDependencies: [
      'http://localhost:3000/r/fixed-toolbar',
      'http://localhost:3000/r/fixed-toolbar-buttons',
    ],
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
    registryDependencies: [
      'http://localhost:3000/r/fixed-toolbar',
      'http://localhost:3000/r/fixed-toolbar-buttons',
    ],
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
    registryDependencies: [
      'http://localhost:3000/r/floating-toolbar',
      'http://localhost:3000/r/floating-toolbar-buttons',
    ],
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
    registryDependencies: [
      'http://localhost:3000/r/indent-fire-marker',
      'http://localhost:3000/r/indent-todo-marker',
    ],
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
    registryDependencies: ['http://localhost:3000/r/link-floating-toolbar'],
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
    registryDependencies: [
      'http://localhost:3000/r/image-preview',
      'http://localhost:3000/r/media-upload-toast',
    ],
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
  {
    dependencies: [],
    files: [
      {
        path: 'components/editor/plugins/discussion-plugin.tsx',
        type: 'registry:component',
      },
    ],
    name: 'discussion-plugin',
    registryDependencies: ['http://localhost:3000/r/block-discussion'],
    type: 'registry:component',
  },
];

export const components: Registry['items'] = [
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
      {
        path: 'components/editor/transforms.ts',
        type: 'registry:component',
      },
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
      {
        path: 'components/editor/plate-types.ts',
        type: 'registry:component',
      },
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
