import type { Registry } from 'shadcn/registry';

const plugins: Registry['items'] = [
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
      'https://platejs.org/r/styles/default/ai-plugins.json',
      'https://platejs.org/r/styles/default/markdown-plugin.json',
      'https://platejs.org/r/styles/default/basic-nodes-plugins.json',
      'https://platejs.org/r/styles/default/align-plugin.json',
      'https://platejs.org/r/styles/default/autoformat-plugin.json',
      'https://platejs.org/r/styles/default/block-menu-plugins.json',
      'https://platejs.org/r/styles/default/equation-plugins.json',
      'https://platejs.org/r/styles/default/cursor-overlay-plugin.json',
      'https://platejs.org/r/styles/default/comments-plugin.json',
      'https://platejs.org/r/styles/default/delete-plugins.json',
      'https://platejs.org/r/styles/default/dnd-plugins.json',
      'https://platejs.org/r/styles/default/exit-break-plugin.json',
      'https://platejs.org/r/styles/default/indent-list-plugins.json',
      'https://platejs.org/r/styles/default/line-height-plugin.json',
      'https://platejs.org/r/styles/default/link-plugin.json',
      'https://platejs.org/r/styles/default/media-plugins.json',
      'https://platejs.org/r/styles/default/mention-plugin.json',
      'https://platejs.org/r/styles/default/reset-block-type-plugin.json',
      'https://platejs.org/r/styles/default/skip-mark-plugin.json',
      'https://platejs.org/r/styles/default/suggestion-plugin.json',
      'https://platejs.org/r/styles/default/soft-break-plugin.json',
      'https://platejs.org/r/styles/default/table-plugin.json',
      'https://platejs.org/r/styles/default/toc-plugin.json',
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
      'https://platejs.org/r/styles/default/basic-nodes-plugins.json',
      'https://platejs.org/r/styles/default/block-selection-plugins.json',
      'https://platejs.org/r/styles/default/cursor-overlay-plugin.json',
      'https://platejs.org/r/styles/default/indent-list-plugins.json',
      'https://platejs.org/r/styles/default/link-plugin.json',
      'https://platejs.org/r/styles/default/ai-menu.json',
      'https://platejs.org/r/styles/default/blockquote-element.json',
      'https://platejs.org/r/styles/default/code-block-element.json',
      'https://platejs.org/r/styles/default/code-leaf.json',
      'https://platejs.org/r/styles/default/code-line-element.json',
      'https://platejs.org/r/styles/default/code-syntax-leaf.json',
      'https://platejs.org/r/styles/default/cursor-overlay.json',
      'https://platejs.org/r/styles/default/heading-element.json',
      'https://platejs.org/r/styles/default/hr-element.json',
      'https://platejs.org/r/styles/default/link-element.json',
      'https://platejs.org/r/styles/default/paragraph-element.json',
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
      'https://platejs.org/r/styles/default/equation-element.json',
      'https://platejs.org/r/styles/default/inline-equation-toolbar-button.json',
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
    registryDependencies: [
      'https://platejs.org/r/styles/default/block-selection.json',
    ],
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
      'https://platejs.org/r/styles/default/block-context-menu.json',
      'https://platejs.org/r/styles/default/block-selection-plugins.json',
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
    registryDependencies: [
      'https://platejs.org/r/styles/default/discussion-plugin.json',
    ],
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
        path: 'plate-ui/suggestion-line-break.tsx',
        type: 'registry:ui',
      },
      {
        path: 'plate-ui/suggestion-toolbar-button.tsx',
        type: 'registry:ui',
      },
    ],
    name: 'suggestion-plugin',
    registryDependencies: [
      'https://platejs.org/r/styles/default/discussion-plugin.json',
    ],
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
    registryDependencies: [
      'https://platejs.org/r/styles/default/cursor-overlay.json',
    ],
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
    registryDependencies: [
      'https://platejs.org/r/styles/default/ghost-text.json',
    ],
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
    registryDependencies: [
      'https://platejs.org/r/styles/default/draggable.json',
    ],
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
      'https://platejs.org/r/styles/default/fixed-toolbar.json',
      'https://platejs.org/r/styles/default/fixed-toolbar-buttons.json',
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
      'https://platejs.org/r/styles/default/fixed-toolbar.json',
      'https://platejs.org/r/styles/default/fixed-toolbar-buttons.json',
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
      'https://platejs.org/r/styles/default/floating-toolbar.json',
      'https://platejs.org/r/styles/default/floating-toolbar-buttons.json',
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
      'https://platejs.org/r/styles/default/indent-fire-marker.json',
      'https://platejs.org/r/styles/default/indent-todo-marker.json',
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
    registryDependencies: [
      'https://platejs.org/r/styles/default/link-floating-toolbar.json',
    ],
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
      'https://platejs.org/r/styles/default/image-preview.json',
      'https://platejs.org/r/styles/default/media-upload-toast.json',
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
    registryDependencies: [
      'https://platejs.org/r/styles/default/block-discussion.json',
    ],
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
