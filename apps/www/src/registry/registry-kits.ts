import type { Registry } from 'shadcn/registry';

export const registryKits: Registry['items'] = [
  {
    dependencies: ['@udecode/plate-ai'],
    files: [
      {
        path: 'components/editor/plugins/ai-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'ai-kit',
    registryDependencies: [
      'markdown-kit',
      'cursor-overlay-kit',
      'ai-menu',
      'ai-node',
      'ai-toolbar-button',
      'ai-api',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-alignment'],
    files: [
      {
        path: 'components/editor/plugins/align-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'align-kit',
    registryDependencies: ['align-toolbar-button'],
    type: 'registry:component',
  },
  {
    dependencies: [
      '@udecode/plate-autoformat',
      '@udecode/plate-code-block',
      '@udecode/plate-list-classic',
    ],
    files: [
      {
        path: 'components/editor/plugins/autoformat-classic-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'autoformat-classic-kit',
    registryDependencies: ['list-classic-node', 'list-classic-toolbar-button'],
    type: 'registry:component',
  },
  {
    dependencies: [
      '@udecode/plate-autoformat',
      '@udecode/plate-code-block',
      '@udecode/plate-list',
    ],
    files: [
      {
        path: 'components/editor/plugins/autoformat-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'autoformat-kit',
    type: 'registry:component',
  },
  {
    dependencies: [],
    files: [
      {
        path: 'components/editor/plugins/basic-elements-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'basic-elements-kit',
    registryDependencies: [
      'blockquote-node',
      'heading-node',
      'hr-node',
      'paragraph-node',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-basic-nodes'],
    files: [
      {
        path: 'components/editor/plugins/basic-marks-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'basic-marks-kit',
    registryDependencies: [
      'code-node',
      'highlight-node',
      'kbd-node',
      'mark-toolbar-button',
    ],
    type: 'registry:component',
  },
  {
    files: [
      {
        path: 'components/editor/plugins/basic-nodes-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'basic-nodes-kit',
    registryDependencies: ['basic-elements-kit', 'basic-marks-kit'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-selection'],
    files: [
      {
        path: 'components/editor/plugins/block-menu-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'block-menu-kit',
    registryDependencies: ['block-context-menu', 'block-selection-kit'],
    type: 'registry:component',
  },
  {
    dependencies: [],
    files: [
      {
        path: 'components/editor/plugins/block-placeholder-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'block-placeholder-kit',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-selection'],
    files: [
      {
        path: 'components/editor/plugins/block-selection-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'block-selection-kit',
    registryDependencies: ['block-selection'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-callout'],
    files: [
      {
        path: 'components/editor/plugins/callout-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'callout-kit',
    registryDependencies: ['callout-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-code-block', 'lowlight'],
    files: [
      {
        path: 'components/editor/plugins/code-block-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'code-block-kit',
    registryDependencies: ['code-block-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-layout'],
    files: [
      {
        path: 'components/editor/plugins/column-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'column-kit',
    registryDependencies: ['column-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-comments'],
    files: [
      {
        path: 'components/editor/plugins/comment-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'comment-kit',
    registryDependencies: [
      'comment-node',
      'comment-toolbar-button',
      'discussion-kit',
    ],
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
        path: 'components/editor/plugins/copilot-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'copilot-kit',
    registryDependencies: ['ghost-text', 'markdown-kit'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-selection'],
    files: [
      {
        path: 'components/editor/plugins/cursor-overlay-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'cursor-overlay-kit',
    registryDependencies: ['cursor-overlay'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-date'],
    files: [
      {
        path: 'components/editor/plugins/date-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'date-kit',
    registryDependencies: ['date-node'],
    type: 'registry:component',
  },
  {
    dependencies: [],
    files: [
      {
        path: 'components/editor/plugins/delete-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'delete-kit',
    type: 'registry:component',
  },
  {
    dependencies: [],
    files: [
      {
        path: 'components/editor/plugins/discussion-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'discussion-kit',
    registryDependencies: ['block-discussion'],
    type: 'registry:component',
  },
  {
    dependencies: [
      '@udecode/plate-dnd',
      '@udecode/plate-media',
      'react-dnd',
      'react-dnd-html5-backend',
    ],
    files: [
      {
        path: 'components/editor/plugins/dnd-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'dnd-kit',
    registryDependencies: ['block-draggable'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-docx', '@udecode/plate-juice'],
    files: [
      {
        path: 'components/editor/plugins/docx-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'docx-kit',
    type: 'registry:component',
  },
  {
    files: [
      {
        path: 'components/editor/editor-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'editor-kit',
    registryDependencies: [
      'editor',
      'ai-kit',
      'align-kit',
      'autoformat-kit',
      'basic-nodes-kit',
      'block-menu-kit',
      'callout-kit',
      'code-block-kit',
      'column-kit',
      'comment-kit',
      'cursor-overlay-kit',
      'date-kit',
      'dnd-kit',
      'docx-kit',
      'editing-kit',
      'emoji-kit',
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
    type: 'registry:component',
  },
  {
    dependencies: [],
    files: [
      {
        path: 'components/editor/plugins/editing-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'editing-kit',
    registryDependencies: [
      'delete-kit',
      'exit-break-kit',
      'reset-block-type-kit',
      'soft-break-kit',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-emoji', '@emoji-mart/data@1.2.1'],
    files: [
      {
        path: 'components/editor/plugins/emoji-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'emoji-kit',
    registryDependencies: ['emoji-node', 'emoji-toolbar-button'],
    type: 'registry:component',
  },
  {
    dependencies: [],
    files: [
      {
        path: 'components/editor/plugins/exit-break-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'exit-break-kit',
    type: 'registry:component',
  },
  {
    dependencies: [],
    files: [
      {
        path: 'components/editor/plugins/fixed-toolbar-classic-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'fixed-toolbar-classic-kit',
    registryDependencies: ['fixed-toolbar', 'fixed-toolbar-classic-buttons'],
    type: 'registry:component',
  },
  {
    dependencies: [],
    files: [
      {
        path: 'components/editor/plugins/fixed-toolbar-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'fixed-toolbar-kit',
    registryDependencies: ['fixed-toolbar', 'fixed-toolbar-buttons'],
    type: 'registry:component',
  },
  {
    dependencies: [],
    files: [
      {
        path: 'components/editor/plugins/floating-toolbar-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'floating-toolbar-kit',
    registryDependencies: ['floating-toolbar', 'floating-toolbar-buttons'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-font'],
    files: [
      {
        path: 'components/editor/plugins/font-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'font-kit',
    registryDependencies: [
      'font-size-toolbar-button',
      'font-color-toolbar-button',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-indent'],
    files: [
      {
        path: 'components/editor/plugins/indent-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'indent-kit',
    registryDependencies: ['indent-toolbar-button'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-line-height'],
    files: [
      {
        path: 'components/editor/plugins/line-height-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'line-height-kit',
    registryDependencies: ['line-height-toolbar-button'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-link'],
    files: [
      {
        path: 'components/editor/plugins/link-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'link-kit',
    registryDependencies: ['link-node', 'link-toolbar', 'link-toolbar-button'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-list-classic'],
    files: [
      {
        path: 'components/editor/plugins/list-classic-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'list-classic-kit',
    registryDependencies: [
      'list-classic-node',
      'list-classic-toolbar-button',
      'autoformat-classic-kit',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-list'],
    files: [
      {
        path: 'components/editor/plugins/list-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'list-kit',
    registryDependencies: ['list-todo', 'list-toolbar-button', 'indent-kit'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-markdown', 'remark-gfm', 'remark-math'],
    files: [
      {
        path: 'components/editor/plugins/markdown-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'markdown-kit',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-math'],
    files: [
      {
        path: 'components/editor/plugins/math-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'math-kit',
    registryDependencies: ['equation-toolbar-button', 'equation-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-caption', '@udecode/plate-media'],
    description:
      'Media kit without API (see media-uploadthing-api for reference)',
    files: [
      {
        path: 'components/editor/plugins/media-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'media-kit',
    registryDependencies: [
      'media-audio-node',
      'media-embed-node',
      'media-file-node',
      'media-image-node',
      'media-placeholder-node',
      'media-preview-dialog',
      'media-toolbar',
      'media-upload-toast',
      'media-video-node',
      'media-toolbar-button',
    ],
    type: 'registry:component',
  },
  {
    dependencies: [],
    description: 'media-kit + media-uploadthing-api',
    files: [],
    name: 'media-uploadthing-kit',
    registryDependencies: ['media-kit', 'media-uploadthing-api'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-mention'],
    files: [
      {
        path: 'components/editor/plugins/mention-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'mention-kit',
    registryDependencies: ['mention-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-code-block'],
    files: [
      {
        path: 'components/editor/plugins/reset-block-type-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'reset-block-type-kit',
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-slash-command'],
    files: [
      {
        path: 'components/editor/plugins/slash-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'slash-kit',
    registryDependencies: ['slash-node'],
    type: 'registry:component',
  },
  {
    dependencies: [],
    files: [
      {
        path: 'components/editor/plugins/soft-break-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'soft-break-kit',
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-suggestion'],
    files: [
      {
        path: 'components/editor/plugins/suggestion-kit.tsx',
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
    name: 'suggestion-kit',
    registryDependencies: [
      'suggestion-node',
      'suggestion-line-break',
      'suggestion-toolbar-button',
      'discussion-kit',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-tabbable'],
    files: [
      {
        path: 'components/editor/plugins/tabbable-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'tabbable-kit',
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-table'],
    files: [
      {
        path: 'components/editor/plugins/table-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'table-kit',
    registryDependencies: ['table-node', 'table-toolbar-button'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-toc'],
    files: [
      {
        path: 'components/editor/plugins/toc-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'toc-kit',
    registryDependencies: ['toc-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/plate-toggle'],
    files: [
      {
        path: 'components/editor/plugins/toggle-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'toggle-kit',
    registryDependencies: ['toggle-node', 'toggle-toolbar-button'],
    type: 'registry:component',
  },
];
