import type { Registry } from 'shadcn/schema';

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
      '@plate/blockquote-node',
      '@plate/heading-node',
      '@plate/hr-node',
      '@plate/paragraph-node',
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
    registryDependencies: [
      '@plate/code-node',
      '@plate/highlight-node',
      '@plate/kbd-node',
    ],
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
    registryDependencies: ['@plate/callout-node'],
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
    registryDependencies: ['@plate/code-block-node'],
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
    registryDependencies: ['@plate/code-drawing-node'],
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
    registryDependencies: ['@plate/column-node'],
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
    registryDependencies: ['@plate/comment-node'],
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
    registryDependencies: ['@plate/date-node'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/footnote'],
    files: [
      {
        path: 'components/editor/plugins/footnote-base-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'footnote-base-kit',
    registryDependencies: ['@plate/footnote-node'],
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
    registryDependencies: ['@plate/excalidraw-node'],
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
    registryDependencies: ['@plate/link-node'],
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
    registryDependencies: ['@plate/block-list', '@plate/indent-base-kit'],
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
    registryDependencies: ['@plate/equation-node'],
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
      '@plate/media-audio-node',
      '@plate/media-file-node',
      '@plate/media-image-node',
      '@plate/media-video-node',
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
    registryDependencies: ['@plate/mention-node'],
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
    registryDependencies: ['@plate/suggestion-node'],
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
    registryDependencies: ['@plate/table-node'],
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
    registryDependencies: ['@plate/toc-node'],
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
    registryDependencies: ['@plate/toggle-node'],
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
      '@plate/editor',
      '@plate/align-base-kit',
      '@plate/basic-blocks-base-kit',
      '@plate/basic-marks-base-kit',
      '@plate/callout-base-kit',
      '@plate/code-block-base-kit',
      '@plate/code-drawing-base-kit',
      '@plate/column-base-kit',
      '@plate/comment-base-kit',
      '@plate/date-base-kit',
      '@plate/footnote-base-kit',
      '@plate/font-base-kit',
      '@plate/line-height-base-kit',
      '@plate/link-base-kit',
      '@plate/list-base-kit',
      '@plate/math-base-kit',
      '@plate/media-base-kit',
      '@plate/mention-base-kit',
      '@plate/suggestion-base-kit',
      '@plate/table-base-kit',
      '@plate/toc-base-kit',
      '@plate/toggle-base-kit',
      '@plate/markdown-kit',
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
      '@plate/markdown-kit',
      '@plate/cursor-overlay-kit',
      '@plate/ai-menu',
      '@plate/ai-node',
      '@plate/ai-toolbar-button',
      '@plate/ai-api',
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
    registryDependencies: [
      '@plate/align-base-kit',
      '@plate/align-toolbar-button',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/code-block', '@platejs/list-classic'],
    files: [
      {
        path: 'components/editor/plugins/autoformat-classic-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'autoformat-classic-kit',
    registryDependencies: [
      '@plate/list-classic-node',
      '@plate/list-classic-toolbar-button',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/code-block', '@platejs/list'],
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
      '@plate/basic-blocks-base-kit',
      '@plate/blockquote-node',
      '@plate/heading-node',
      '@plate/hr-node',
      '@plate/paragraph-node',
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
      '@plate/basic-marks-base-kit',
      '@plate/code-node',
      '@plate/highlight-node',
      '@plate/kbd-node',
      '@plate/mark-toolbar-button',
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
    registryDependencies: ['@plate/basic-blocks-kit', '@plate/basic-marks-kit'],
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
    registryDependencies: [
      '@plate/block-context-menu',
      '@plate/block-selection-kit',
    ],
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
    registryDependencies: ['@plate/block-selection'],
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
    registryDependencies: ['@plate/callout-base-kit', '@plate/callout-node'],
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
    registryDependencies: [
      '@plate/code-block-base-kit',
      '@plate/code-block-node',
    ],
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
    registryDependencies: [
      '@plate/code-drawing-base-kit',
      '@plate/code-drawing-node',
    ],
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
    registryDependencies: ['@plate/column-base-kit', '@plate/column-node'],
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
      '@plate/comment-base-kit',
      '@plate/comment-node',
      '@plate/comment-toolbar-button',
      '@plate/discussion-kit',
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
    registryDependencies: ['@plate/ghost-text', '@plate/markdown-kit'],
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
    registryDependencies: ['@plate/cursor-overlay'],
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
    registryDependencies: ['@plate/date-base-kit', '@plate/date-node'],
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
    registryDependencies: ['@plate/block-discussion'],
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
    registryDependencies: ['@plate/block-draggable'],
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
      '@plate/callout-node',
      '@plate/code-block-node',
      '@plate/column-node',
      '@plate/equation-node',
      '@plate/toc-node',
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
      '@plate/editor-base-kit',
      '@plate/ai-kit',
      '@plate/align-kit',
      '@plate/autoformat-kit',
      '@plate/basic-nodes-kit',
      '@plate/block-menu-kit',
      '@plate/block-placeholder-kit',
      '@plate/callout-kit',
      '@plate/code-block-kit',
      '@plate/code-drawing-kit',
      '@plate/column-kit',
      '@plate/comment-kit',
      '@plate/cursor-overlay-kit',
      '@plate/date-kit',
      '@plate/discussion-kit',
      '@plate/dnd-kit',
      '@plate/docx-kit',
      '@plate/emoji-kit',
      '@plate/excalidraw-kit',
      '@plate/exit-break-kit',
      '@plate/fixed-toolbar-kit',
      '@plate/floating-toolbar-kit',
      '@plate/footnote-kit',
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
    registryDependencies: ['@plate/emoji-node', '@plate/emoji-toolbar-button'],
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
    registryDependencies: [
      '@plate/fixed-toolbar',
      '@plate/fixed-toolbar-classic-buttons',
    ],
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
    registryDependencies: [
      '@plate/fixed-toolbar',
      '@plate/fixed-toolbar-buttons',
    ],
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
    registryDependencies: [
      '@plate/floating-toolbar',
      '@plate/floating-toolbar-buttons',
    ],
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
      '@plate/floating-toolbar',
      '@plate/floating-toolbar-classic-buttons',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/footnote'],
    files: [
      {
        path: 'components/editor/plugins/footnote-kit.tsx',
        type: 'registry:component',
      },
    ],
    name: 'footnote-kit',
    registryDependencies: ['@plate/footnote-node'],
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
      '@plate/font-base-kit',
      '@plate/font-size-toolbar-button',
      '@plate/font-color-toolbar-button',
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
    registryDependencies: ['@plate/indent-toolbar-button'],
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
      '@plate/line-height-base-kit',
      '@plate/line-height-toolbar-button',
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
      '@plate/link-base-kit',
      '@plate/link-node',
      '@plate/link-toolbar',
      '@plate/link-toolbar-button',
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
      '@plate/list-classic-node',
      '@plate/list-classic-toolbar-button',
      '@plate/autoformat-classic-kit',
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
      '@plate/list-base-kit',
      '@plate/block-list',
      '@plate/list-toolbar-button',
      '@plate/indent-kit',
    ],
    type: 'registry:component',
  },
  {
    dependencies: [
      '@platejs/footnote',
      '@platejs/markdown',
      'remark-emoji',
      'remark-gfm',
      'remark-math',
    ],
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
      '@plate/math-base-kit',
      '@plate/equation-toolbar-button',
      '@plate/equation-node',
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
      '@plate/media-base-kit',
      '@plate/media-audio-node',
      '@plate/media-embed-node',
      '@plate/media-file-node',
      '@plate/media-image-node',
      '@plate/media-placeholder-node',
      '@plate/media-preview-dialog',
      '@plate/media-toolbar',
      '@plate/media-upload-toast',
      '@plate/media-video-node',
      '@plate/media-toolbar-button',
    ],
    type: 'registry:component',
  },
  {
    dependencies: [],
    description: 'media-kit + media-uploadthing-api',
    files: [],
    name: 'media-uploadthing-kit',
    registryDependencies: ['@plate/media-kit', '@plate/media-uploadthing-api'],
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
    registryDependencies: ['@plate/mention-base-kit', '@plate/mention-node'],
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
    registryDependencies: ['@plate/slash-node'],
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
      '@plate/suggestion-base-kit',
      '@plate/suggestion-node',
      '@plate/suggestion-toolbar-button',
      '@plate/discussion-kit',
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
      '@plate/table-base-kit',
      '@plate/table-node',
      '@plate/table-toolbar-button',
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
    registryDependencies: ['@plate/toc-base-kit', '@plate/toc-node'],
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
      '@plate/toggle-base-kit',
      '@plate/indent-kit',
      '@plate/toggle-node',
      '@plate/toggle-toolbar-button',
    ],
    type: 'registry:component',
  },
];
