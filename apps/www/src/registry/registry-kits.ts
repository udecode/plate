import type { Registry } from 'shadcn/registry';

export const registryBaseKits: Registry['items'] = [
  {
    dependencies: ['@platejs/basic-styles'],
    files: [
      {
        path: 'components/editor/plugins/align-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'align-base-kit',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: [],
    files: [
      {
        path: 'components/editor/plugins/basic-blocks-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'basic-blocks-base-kit',
    registryDependencies: [
      'blockquote-node',
      'heading-node',
      'hr-node',
      'paragraph-node',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/basic-nodes'],
    files: [
      {
        path: 'components/editor/plugins/basic-marks-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'basic-marks-base-kit',
    registryDependencies: ['code-node', 'highlight-node', 'kbd-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/callout'],
    files: [
      {
        path: 'components/editor/plugins/callout-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'callout-base-kit',
    registryDependencies: ['callout-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/code-block', 'lowlight'],
    files: [
      {
        path: 'components/editor/plugins/code-block-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'code-block-base-kit',
    registryDependencies: ['code-block-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/code-drawing'],
    files: [
      {
        path: 'components/editor/plugins/code-drawing-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'code-drawing-base-kit',
    registryDependencies: ['code-drawing-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/layout'],
    files: [
      {
        path: 'components/editor/plugins/column-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'column-base-kit',
    registryDependencies: ['column-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/comment'],
    files: [
      {
        path: 'components/editor/plugins/comment-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'comment-base-kit',
    registryDependencies: ['comment-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/date'],
    files: [
      {
        path: 'components/editor/plugins/date-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'date-base-kit',
    registryDependencies: ['date-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/excalidraw', '@excalidraw/excalidraw'],
    files: [
      {
        path: 'components/editor/plugins/excalidraw-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'excalidraw-kit',
    registryDependencies: ['excalidraw-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/basic-styles'],
    files: [
      {
        path: 'components/editor/plugins/font-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'font-base-kit',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/indent'],
    files: [
      {
        path: 'components/editor/plugins/indent-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'indent-base-kit',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/basic-styles'],
    files: [
      {
        path: 'components/editor/plugins/line-height-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'line-height-base-kit',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/link'],
    files: [
      {
        path: 'components/editor/plugins/link-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'link-base-kit',
    registryDependencies: ['link-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/list'],
    files: [
      {
        path: 'components/editor/plugins/list-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'list-base-kit',
    registryDependencies: ['block-list', 'indent-base-kit'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/math'],
    files: [
      {
        path: 'components/editor/plugins/math-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'math-base-kit',
    registryDependencies: ['equation-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/media'],
    files: [
      {
        path: 'components/editor/plugins/media-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'media-base-kit',
    registryDependencies: [
      'media-audio-node',
      'media-file-node',
      'media-image-node',
      'media-video-node',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/mention'],
    files: [
      {
        path: 'components/editor/plugins/mention-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'mention-base-kit',
    registryDependencies: ['mention-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/suggestion'],
    files: [
      {
        path: 'components/editor/plugins/suggestion-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'suggestion-base-kit',
    registryDependencies: ['suggestion-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/table'],
    files: [
      {
        path: 'components/editor/plugins/table-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'table-base-kit',
    registryDependencies: ['table-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/toc'],
    files: [
      {
        path: 'components/editor/plugins/toc-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'toc-base-kit',
    registryDependencies: ['toc-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/toggle'],
    files: [
      {
        path: 'components/editor/plugins/toggle-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'toggle-base-kit',
    registryDependencies: ['toggle-node'],
    type: 'registry:component',
  },
  {
    files: [
      {
        path: 'components/editor/editor-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'editor-base-kit',
    registryDependencies: [
      'editor',
      'align-base-kit',
      'basic-blocks-base-kit',
      'basic-marks-base-kit',
      'callout-base-kit',
      'code-block-base-kit',
      'code-drawing-base-kit',
      'column-base-kit',
      'comment-base-kit',
      'date-base-kit',
      'font-base-kit',
      'line-height-base-kit',
      'link-base-kit',
      'list-base-kit',
      'math-base-kit',
      'media-base-kit',
      'mention-base-kit',
      'suggestion-base-kit',
      'table-base-kit',
      'toc-base-kit',
      'toggle-base-kit',
      'markdown-kit',
    ],
    type: 'registry:component',
  },
];

export const registryKits: Registry['items'] = [
  ...registryBaseKits,
  {
    dependencies: ['@platejs/ai'],
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
    dependencies: ['@platejs/basic-styles'],
    files: [
      {
        path: 'components/editor/plugins/align-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'align-kit',
    registryDependencies: ['align-base-kit', 'align-toolbar-button'],
    type: 'registry:component',
  },
  {
    dependencies: [
      '@platejs/autoformat',
      '@platejs/code-block',
      '@platejs/list-classic',
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
      '@platejs/autoformat',
      '@platejs/code-block',
      '@platejs/list',
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
        path: 'components/editor/plugins/basic-blocks-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'basic-blocks-kit',
    registryDependencies: [
      'basic-blocks-base-kit',
      'blockquote-node',
      'heading-node',
      'hr-node',
      'paragraph-node',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/basic-nodes'],
    files: [
      {
        path: 'components/editor/plugins/basic-marks-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'basic-marks-kit',
    registryDependencies: [
      'basic-marks-base-kit',
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
    registryDependencies: ['basic-blocks-kit', 'basic-marks-kit'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/selection'],
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
    dependencies: ['@platejs/selection'],
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
    dependencies: ['@platejs/callout'],
    files: [
      {
        path: 'components/editor/plugins/callout-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'callout-kit',
    registryDependencies: ['callout-base-kit', 'callout-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/code-block', 'lowlight'],
    files: [
      {
        path: 'components/editor/plugins/code-block-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'code-block-kit',
    registryDependencies: ['code-block-base-kit', 'code-block-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/code-drawing'],
    files: [
      {
        path: 'components/editor/plugins/code-drawing-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'code-drawing-kit',
    registryDependencies: ['code-drawing-base-kit', 'code-drawing-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/layout'],
    files: [
      {
        path: 'components/editor/plugins/column-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'column-kit',
    registryDependencies: ['column-base-kit', 'column-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/comment'],
    files: [
      {
        path: 'components/editor/plugins/comment-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'comment-kit',
    registryDependencies: [
      'comment-base-kit',
      'comment-node',
      'comment-toolbar-button',
      'discussion-kit',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/ai', '@platejs/markdown', '@faker-js/faker'],
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
    dependencies: ['@platejs/selection'],
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
    dependencies: ['@platejs/date'],
    files: [
      {
        path: 'components/editor/plugins/date-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'date-kit',
    registryDependencies: ['date-base-kit', 'date-node'],
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
      '@platejs/dnd',
      '@platejs/media',
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
    dependencies: ['@platejs/docx', '@platejs/juice'],
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
    dependencies: ['@platejs/docx-io'],
    files: [
      {
        path: 'components/editor/plugins/docx-export-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'docx-export-kit',
    registryDependencies: [
      'callout-node-static',
      'code-block-node-static',
      'column-node-static',
      'equation-node-static',
      'toc-node-static',
    ],
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
      'editor-base-kit',
      'ai-kit',
      'align-kit',
      'autoformat-kit',
      'basic-nodes-kit',
      'block-menu-kit',
      'block-placeholder-kit',
      'callout-kit',
      'code-block-kit',
      'code-drawing-kit',
      'column-kit',
      'comment-kit',
      'cursor-overlay-kit',
      'date-kit',
      'discussion-kit',
      'dnd-kit',
      'docx-kit',
      'emoji-kit',
      'excalidraw-kit',
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
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/emoji', '@emoji-mart/data@1.2.1'],
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
    dependencies: [],
    files: [
      {
        path: 'components/editor/plugins/floating-toolbar-classic-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'floating-toolbar-classic-kit',
    registryDependencies: [
      'floating-toolbar',
      'floating-toolbar-classic-buttons',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/basic-styles'],
    files: [
      {
        path: 'components/editor/plugins/font-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'font-kit',
    registryDependencies: [
      'font-base-kit',
      'font-size-toolbar-button',
      'font-color-toolbar-button',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/indent'],
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
    dependencies: ['@platejs/basic-styles'],
    files: [
      {
        path: 'components/editor/plugins/line-height-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'line-height-kit',
    registryDependencies: [
      'line-height-base-kit',
      'line-height-toolbar-button',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/link'],
    files: [
      {
        path: 'components/editor/plugins/link-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'link-kit',
    registryDependencies: [
      'link-base-kit',
      'link-node',
      'link-toolbar',
      'link-toolbar-button',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/list-classic'],
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
    dependencies: ['@platejs/list'],
    files: [
      {
        path: 'components/editor/plugins/list-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'list-kit',
    registryDependencies: [
      'list-base-kit',
      'block-list',
      'list-toolbar-button',
      'indent-kit',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/markdown', 'remark-gfm', 'remark-math'],
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
    dependencies: ['@platejs/math'],
    files: [
      {
        path: 'components/editor/plugins/math-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'math-kit',
    registryDependencies: [
      'math-base-kit',
      'equation-toolbar-button',
      'equation-node',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/caption', '@platejs/media'],
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
      'media-base-kit',
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
    dependencies: ['@platejs/mention'],
    files: [
      {
        path: 'components/editor/plugins/mention-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'mention-kit',
    registryDependencies: ['mention-base-kit', 'mention-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/slash-command'],
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
    dependencies: ['@platejs/suggestion'],
    files: [
      {
        path: 'components/editor/plugins/suggestion-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'suggestion-kit',
    registryDependencies: [
      'suggestion-base-kit',
      'suggestion-node',
      'suggestion-toolbar-button',
      'discussion-kit',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/tabbable'],
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
    dependencies: ['@platejs/table'],
    files: [
      {
        path: 'components/editor/plugins/table-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'table-kit',
    registryDependencies: [
      'table-base-kit',
      'table-node',
      'table-toolbar-button',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/toc'],
    files: [
      {
        path: 'components/editor/plugins/toc-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'toc-kit',
    registryDependencies: ['toc-base-kit', 'toc-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/toggle'],
    files: [
      {
        path: 'components/editor/plugins/toggle-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'toggle-kit',
    registryDependencies: [
      'toggle-base-kit',
      'indent-kit',
      'toggle-node',
      'toggle-toolbar-button',
    ],
    type: 'registry:component',
  },
];
