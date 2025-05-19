import type { Registry } from 'shadcn/registry';

const plugins: Registry['items'] = [
  // Files
  {
    dependencies: [
      '@ai-sdk/openai',
      'ai',
      '@ai-sdk/provider',
      '@ai-sdk/provider-utils',
    ],
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
    name: 'ai-api',
    registryDependencies: [],
    type: 'registry:file',
  },
  {
    dependencies: ['uploadthing@7.7.2'],
    files: [
      {
        path: 'app/api/uploadthing/route.ts',
        target: 'app/api/uploadthing/route.ts',
        type: 'registry:file',
      },
    ],
    name: 'media-uploadthing-api',
    registryDependencies: ['uploadthing'],
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
      'ai-plugins',
      'markdown-plugin',
      'basic-nodes-plugins',
      'align-plugin',
      'autoformat-plugin',
      'block-menu-plugins',
      'equation-plugins',
      'cursor-overlay-plugin',
      'comments-plugin',
      'delete-plugins',
      'dnd-plugins',
      'exit-break-plugin',
      'fixed-toolbar-plugin',
      'floating-toolbar-plugin',
      'list-plugins',
      'line-height-plugin',
      'link-plugin',
      'media-plugins',
      'mention-plugin',
      'reset-block-type-plugin',
      'skip-mark-plugin',
      'suggestion-plugin',
      'soft-break-plugin',
      'table-plugin',
      'toc-plugin',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-ai', '@udecode/plate-markdown'],
    files: [
      {
        path: 'components/editor/plugins/ai-plugins.tsx',
        type: 'registry:component',
      },
    ],
    name: 'ai-plugins',
    registryDependencies: [
      'shadcn/button',
      'markdown-plugin',
      'cursor-overlay-plugin',
      'ai-menu',
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
    registryDependencies: ['equation-toolbar-button'],
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
      '@udecode/plate-list',
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
      '@udecode/plate-list-classic',
      '@udecode/plate-toggle',
    ],
    files: [
      {
        path: 'components/editor/plugins/autoformat-classic-plugin.ts',
        type: 'registry:component',
      },
    ],
    name: 'autoformat-classic-plugin',
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
    registryDependencies: ['block-selection'],
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
    registryDependencies: ['discussion-plugin'],
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
    registryDependencies: ['discussion-plugin'],
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
    registryDependencies: ['block-draggable'],
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
        path: 'components/editor/plugins/fixed-toolbar-classic-plugin.tsx',
        type: 'registry:component',
      },
    ],
    name: 'fixed-toolbar-classic-plugin',
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
      '@udecode/plate-list',
      '@udecode/plate-toggle',
    ],
    files: [
      {
        path: 'components/editor/plugins/list-plugins.tsx',
        type: 'registry:component',
      },
    ],
    name: 'list-plugins',
    registryDependencies: ['list-todo'],
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
    registryDependencies: ['link-toolbar'],
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
    registryDependencies: ['media-preview-dialog', 'media-upload-toast'],
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
      '@udecode/plate-list',
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
    registryDependencies: ['block-discussion'],
    type: 'registry:component',
  },
];

export const registryComponents: Registry['items'] = [
  ...plugins,
  {
    dependencies: ['@ai-sdk/react', '@faker-js/faker'],
    files: [
      {
        path: 'components/editor/use-chat.ts',
        type: 'registry:component',
      },
      {
        path: 'components/editor/settings.tsx',
        type: 'registry:component',
      },
    ],
    name: 'use-chat',
    registryDependencies: [
      'shadcn/button',
      'shadcn/dialog',
      'shadcn/input',
      'shadcn/popover',
      'shadcn/command',
    ],
    type: 'registry:component',
  },
  {
    dependencies: [
      '@udecode/plate',
      '@udecode/plate-ai',
      '@udecode/plate-basic-marks',
      '@udecode/plate-block-quote',
      '@udecode/plate-callout',
      '@udecode/plate-code-block',
      '@udecode/plate-comments',
      '@udecode/plate-date',
      '@udecode/plate-emoji',
      '@udecode/plate-heading',
      '@udecode/plate-highlight',
      '@udecode/plate-horizontal-rule',
      '@udecode/plate-kbd',
      '@udecode/plate-layout',
      '@udecode/plate-link',
      '@udecode/plate-math',
      '@udecode/plate-media',
      '@udecode/plate-mention',
      '@udecode/plate-slash-command',
      '@udecode/plate-suggestion',
      '@udecode/plate-table',
      '@udecode/plate-toggle',
      '@udecode/cn',
    ],
    files: [
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:component',
      },
    ],
    name: 'use-create-editor',
    registryDependencies: [
      'ai-node',
      'blockquote-node',
      'block-placeholder',
      'callout-node',
      'code-block-node',
      'code-node',
      'column-node',
      'comment-node',
      'date-node',
      'emoji-input-node',
      'equation-node',
      'heading-node',
      'highlight-node',
      'hr-node',
      'equation-node',
      'kbd-node',
      'link-node',
      'media-audio-node',
      'media-embed-node',
      'media-image-node',
      'media-file-node',
      'media-placeholder-node',
      'media-video-node',
      'mention-node',
      'mention-input-node',
      'paragraph-node',
      'slash-input-node',
      'suggestion-node',
      'table-node',
      'toc-node',
      'toggle-node',
      'editor-plugins',
    ],
    type: 'registry:component',
  },
  {
    dependencies: [
      '@udecode/plate-callout',
      '@udecode/plate-code-block',
      '@udecode/plate-date',
      '@udecode/plate-heading',
      '@udecode/plate-list',
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
      '@udecode/plate-list-classic',
      '@udecode/plate-media',
      '@udecode/plate-mention',
      '@udecode/plate-table',
      '@udecode/plate-toggle',
    ],
    files: [
      {
        path: 'components/editor/plate-classic-types.ts',
        type: 'registry:component',
      },
    ],
    name: 'plate-classic-types',
    type: 'registry:component',
  },
];
