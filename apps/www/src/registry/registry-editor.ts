import type { Registry } from 'shadcn/schema';

export const editorComponents: Registry['items'] = [
  {
    dependencies: [],
    description: 'Live editor content and container components.',
    files: [
      { path: 'components/editor/editor.tsx', type: 'registry:component' },
    ],
    meta: {
      docs: [{ route: 'https://pro.platejs.org/docs/components/editor' }],
      examples: ['editor-default', 'editor-disabled', 'editor-full-width'],
    },
    name: 'editor',
    registryDependencies: [],
    title: 'Editor',
    type: 'registry:component',
  },
  {
    dependencies: [],
    description: 'Server-safe static editor component.',
    files: [
      {
        path: 'components/editor/editor-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'editor-static',
    registryDependencies: [],
    title: 'Static Editor',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/ai', '@platejs/selection', 'cmdk'],
    description: 'A menu for AI-powered content generation and insertion.',
    files: [
      { path: 'components/editor/ai-menu.tsx', type: 'registry:component' },
    ],
    meta: {
      docs: [
        { route: '/docs/ai', title: 'AI' },
        {
          route: 'https://pro.platejs.org/docs/components/ai-menu',
          title: 'AI Menu',
        },
      ],
      examples: ['ai-demo', 'ai-pro'],
      label: 'New',
    },
    name: 'ai-menu',
    registryDependencies: [
      'button',
      'command',
      'popover',
      '@plate/editor',
      '@plate/use-chat',
      '@plate/editor-static',
      '@plate/editor-plugins-static',
    ],
    title: 'AI Menu',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/ai'],
    description: 'A toolbar button for accessing AI features.',
    files: [
      {
        path: 'components/editor/ai-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/ai', title: 'AI' },
        { route: 'https://pro.platejs.org/docs/components/ai-toolbar-button' },
      ],
      examples: ['ai-demo', 'floating-toolbar-demo', 'ai-pro'],
      label: 'New',
    },
    name: 'ai-toolbar-button',
    registryDependencies: ['@plate/toolbar'],
    title: 'AI Toolbar Button',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/basic-styles'],
    description: 'A dropdown menu for text alignment controls.',
    files: [
      {
        path: 'components/editor/align-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [{ route: '/docs/text-align' }],
      examples: ['align-demo'],
    },
    name: 'align-toolbar-button',
    registryDependencies: ['dropdown-menu', '@plate/toolbar'],
    title: 'Align Toolbar Button',
    type: 'registry:component',
  },
  {
    dependencies: [
      '@platejs/docx-import',
      '@platejs/markdown',
      'use-file-picker@2.1.2',
    ],
    description: 'A toolbar button to import editor content from a file.',
    files: [
      {
        path: 'components/editor/import-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [{ route: '/docs/import', title: 'Import' }],
      examples: ['basic-nodes-demo'],
      label: 'New',
    },
    name: 'import-toolbar-button',
    registryDependencies: ['dropdown-menu', '@plate/toolbar'],
    title: 'Import Toolbar Button',
    type: 'registry:component',
  },
  {
    dependencies: [
      '@platejs/docx-export',
      '@platejs/markdown',
      'html2canvas-pro',
      'pdf-lib',
      'lucide-react',
    ],
    description:
      'A toolbar button for exporting editor content in various formats (HTML, PDF, Image, Markdown).',
    files: [
      {
        path: 'components/editor/export-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [{ route: '/docs/export', title: 'Export' }],
      examples: ['basic-nodes-demo'],
      label: 'New',
    },
    name: 'export-toolbar-button',
    registryDependencies: [
      '@plate/docx-export',
      'dropdown-menu',
      '@plate/toolbar',
      '@plate/editor-static',
      '@plate/editor',
      '@plate/editor-plugins-static',
    ],
    title: 'Export Toolbar Button',
    type: 'registry:component',
  },

  {
    dependencies: ['@platejs/resizable'],
    description: 'Inline caption UI for media elements.',
    files: [
      { path: 'components/editor/caption.tsx', type: 'registry:component' },
    ],
    meta: {
      docs: [
        { route: '/docs/media', title: 'Media' },
        { route: 'https://pro.platejs.org/docs/components/caption' },
      ],
      examples: [
        'media-demo',
        // 'upload-demo'
      ],
    },
    name: 'caption',
    registryDependencies: ['button'],
    title: 'Caption',
    type: 'registry:component',
  },
  {
    dependencies: [],
    files: [
      {
        path: 'components/editor/caption-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'caption-static',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['@udecode/cn', '@platejs/basic-styles', 'lodash'],
    description:
      'A color picker toolbar button with text and background color controls.',
    files: [
      {
        path: 'components/editor/font-color-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/font' },
        {
          route:
            'https://pro.platejs.org/docs/components/font-color-toolbar-button',
        },
      ],
      examples: ['font-demo'],
    },
    name: 'font-color-toolbar-button',
    registryDependencies: [
      'dropdown-menu',
      'button',
      'tooltip',
      '@plate/toolbar',
    ],
    title: 'Font Color Toolbar Button',
    type: 'registry:component',
  },
  {
    dependencies: [],
    description: 'A toolbar button for adding inline comments.',
    files: [
      {
        path: 'components/editor/comment-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/comment' },
        {
          route:
            'https://pro.platejs.org/docs/components/comment-toolbar-button',
        },
      ],
      examples: ['discussion-demo', 'floating-toolbar-demo', 'discussion-pro'],
    },
    name: 'comment-toolbar-button',
    registryDependencies: ['@plate/comment', '@plate/toolbar'],
    title: 'Comment Toolbar Button',
    type: 'registry:component',
  },
  {
    dependencies: [
      '@platejs/comment',
      '@platejs/core',
      '@platejs/date',
      '@platejs/plite',
      '@platejs/suggestion',
      'date-fns',
    ],
    description:
      'A popover interface for managing discussions: comments, replies, suggestions.',
    files: [
      {
        path: 'components/editor/block-discussion.tsx',
        type: 'registry:component',
      },
      {
        path: 'lib/block-discussion-index.ts',
        type: 'registry:lib',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/comment' },
        { route: 'https://pro.platejs.org/docs/components/block-discussion' },
      ],
      examples: ['discussion-demo', 'discussion-pro'],
    },
    name: 'block-discussion',
    registryDependencies: [
      'button',
      'popover',
      'avatar',
      'dropdown-menu',
      '@plate/editor',
      '@plate/highlight-style',
      '@plate/comment',
      '@plate/discussion',
      '@plate/suggestion',
      '@plate/basic-marks',
    ],
    title: 'Block Discussion',
    type: 'registry:component',
  },
  {
    dependencies: ['fzf@0.5.2', '@platejs/tag', '@udecode/cmdk'],
    description: 'An editor to select tags.',
    files: [
      {
        path: 'components/editor/select-editor.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [{ route: '/docs/multi-select' }],
      examples: ['select-editor-demo'],
      label: 'New',
    },
    name: 'select-editor',
    registryDependencies: ['@plate/editor', 'popover', '@plate/tag'],
    title: 'Select Editor',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/emoji', '@emoji-mart/data@1.2.1'],
    description: 'A searchable emoji picker with frequent emoji storage.',
    files: [
      {
        path: 'components/editor/emoji-picker.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [{ route: '/docs/emoji' }],
      examples: ['emoji-demo', 'emoji-pro'],
    },
    name: 'emoji-picker',
    registryDependencies: ['button', 'popover', 'tooltip', '@plate/emoji'],
    title: 'Emoji Picker',
    type: 'registry:component',
  },
  {
    dependencies: [],
    description: 'An emoji picker toolbar button.',
    files: [
      {
        path: 'components/editor/emoji-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/emoji' },
        { route: 'https://pro.platejs.org/docs/components/emoji-picker' },
      ],
      examples: ['emoji-demo', 'emoji-pro'],
    },
    name: 'emoji-toolbar-button',
    registryDependencies: ['@plate/emoji-picker', '@plate/toolbar'],
    title: 'Emoji Toolbar Button',
    type: 'registry:component',
  },
  {
    dependencies: [],
    files: [
      {
        path: 'components/editor/fixed-toolbar-classic-buttons.tsx',
        type: 'registry:component',
      },
    ],
    // description: 'A set of commonly used formatting buttons.',
    meta: {
      // examples: ['toolbar-demo'],
    },
    name: 'fixed-toolbar-classic-buttons',
    registryDependencies: [
      '@plate/toolbar',
      '@plate/ai-toolbar-button',
      '@plate/align-toolbar-button',
      '@plate/font-color-toolbar-button',
      '@plate/comment-toolbar-button',
      '@plate/emoji-toolbar-button',
      '@plate/history-toolbar-button',
      '@plate/insert-toolbar-classic-button',
      '@plate/line-height-toolbar-button',
      '@plate/list-classic-toolbar-button',
      '@plate/link-toolbar-button',
      '@plate/mark-toolbar-button',
      '@plate/media-toolbar-button',
      '@plate/mode-toolbar-button',
      '@plate/more-toolbar-button',
      '@plate/table-toolbar-button',
      '@plate/toggle-toolbar-button',
      '@plate/turn-into-toolbar-classic-button',
    ],
    title: 'Fixed Toolbar List Buttons',
    type: 'registry:component',
  },
  {
    dependencies: [],
    description:
      'A set of commonly used formatting buttons for the floating toolbar with classic list support.',
    files: [
      {
        path: 'components/editor/floating-toolbar-classic-buttons.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      examples: ['list-classic-demo'],
    },
    name: 'floating-toolbar-classic-buttons',
    registryDependencies: [
      '@plate/toolbar',
      '@plate/ai-toolbar-button',
      '@plate/comment-toolbar-button',
      '@plate/equation-toolbar-button',
      '@plate/link-toolbar-button',
      '@plate/mark-toolbar-button',
      '@plate/more-toolbar-button',
      '@plate/suggestion-toolbar-button',
      '@plate/turn-into-toolbar-classic-button',
    ],
    title: 'Floating Toolbar Classic Buttons',
    type: 'registry:component',
  },
  {
    dependencies: [],
    description: 'Toolbar buttons for undo and redo operations.',
    files: [
      {
        path: 'components/editor/history-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [
        {
          route: '/docs/plite/libraries/plite-history',
          title: 'Plite History',
        },
      ],
      examples: ['basic-nodes-demo'],
    },
    name: 'history-toolbar-button',
    registryDependencies: ['@plate/toolbar'],
    title: 'History Toolbar Button',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/list'],
    description: 'Toolbar controls for bulleted, numbered, and todo lists.',
    files: [
      {
        path: 'components/editor/list-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [{ route: '/docs/list' }],
      examples: ['list-demo'],
    },
    name: 'list-toolbar-button',
    registryDependencies: ['dropdown-menu', '@plate/toolbar'],
    title: 'List Toolbar Button',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/indent'],
    description: 'Toolbar controls for block indentation.',
    files: [
      {
        path: 'components/editor/indent-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [{ route: '/docs/indent' }],
      examples: ['indent-demo'],
    },
    name: 'indent-toolbar-button',
    registryDependencies: ['@plate/toolbar'],
    title: 'Indent Toolbar Buttons',
    type: 'registry:component',
  },
  {
    dependencies: ['@ariakit/react', '@platejs/combobox', '@platejs/plite'],
    description: 'A combobox for inline suggestions.',
    files: [
      {
        path: 'components/editor/inline-combobox.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/combobox' },
        { route: 'https://pro.platejs.org/docs/components/inline-combobox' },
      ],
      examples: ['mention-demo', 'slash-command-demo', 'emoji-demo'],
    },
    name: 'inline-combobox',
    registryDependencies: [],
    title: 'Inline Combobox',
    type: 'registry:component',
  },
  {
    dependencies: [],
    description: 'A menu for inserting different types of blocks.',
    files: [
      {
        path: 'components/editor/insert-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      examples: ['basic-nodes-demo'],
    },
    name: 'insert-toolbar-button',
    registryDependencies: [
      'dropdown-menu',
      '@plate/toolbar',
      '@plate/transforms',
    ],
    title: 'Insert Toolbar Button',
    type: 'registry:component',
  },
  {
    dependencies: [],
    description:
      'A menu for inserting different types of blocks with classic list support.',
    files: [
      {
        path: 'components/editor/insert-toolbar-classic-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      examples: ['list-classic-demo'],
    },
    name: 'insert-toolbar-classic-button',
    registryDependencies: [
      'dropdown-menu',
      '@plate/toolbar',
      '@plate/transforms-classic',
    ],
    title: 'Insert Toolbar Classic Button',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/basic-styles'],
    description: 'A menu for controlling text line spacing.',
    files: [
      {
        path: 'components/editor/line-height-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [{ route: '/docs/line-height' }],
      examples: ['line-height-demo'],
    },
    name: 'line-height-toolbar-button',
    registryDependencies: ['@plate/toolbar', 'dropdown-menu'],
    title: 'Line Height Toolbar Button',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/link'],
    description: 'A toolbar control for link management.',
    files: [
      {
        path: 'components/editor/link-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/link' },
        {
          route: 'https://pro.platejs.org/docs/components/link-toolbar-button',
        },
      ],
      examples: ['link-demo', 'link-pro'],
    },
    name: 'link-toolbar-button',
    registryDependencies: ['@plate/link', '@plate/toolbar'],
    title: 'Link Toolbar Button',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/list-classic'],
    description: 'Toolbar controls for list creation and management.',
    files: [
      {
        path: 'components/editor/list-classic-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [{ route: '/docs/list-classic' }],
      examples: ['list-classic-demo'],
    },
    name: 'list-classic-toolbar-button',
    registryDependencies: ['@plate/toolbar'],
    title: 'List Toolbar Buttons',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/basic-nodes'],
    description: 'A toolbar control for basic text formatting.',
    files: [
      {
        path: 'components/editor/mark-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [{ route: '/docs/basic-marks' }],
      examples: ['basic-marks-demo', 'basic-nodes-pro'],
    },
    name: 'mark-toolbar-button',
    registryDependencies: ['@plate/toolbar'],
    title: 'Mark Toolbar Button',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/media'],
    description: 'A toolbar interface for media settings.',
    files: [
      {
        path: 'components/editor/media-toolbar.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [{ route: '/docs/media' }],
      examples: ['media-demo', 'media-pro'],
    },
    name: 'media-toolbar',
    registryDependencies: [
      'button',
      'popover',
      'separator',
      '@plate/caption',
      '@plate/media-preview-dialog',
    ],
    title: 'Media Toolbar',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/media', 'use-file-picker@2.1.2', 'sonner'],
    description: 'Toolbar button for inserting and managing media.',
    files: [
      {
        path: 'components/editor/media-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [{ route: '/docs/media' }],
      examples: ['media-demo', 'media-pro'],
    },
    name: 'media-toolbar-button',
    registryDependencies: [
      '@plate/toolbar',
      'input',
      'dropdown-menu',
      'alert-dialog',
    ],
    title: 'Media Toolbar Button',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/suggestion'],
    description: 'A menu for switching between editor modes.',
    files: [
      {
        path: 'components/editor/mode-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      examples: ['basic-nodes-demo'],
    },
    name: 'mode-toolbar-button',
    registryDependencies: ['dropdown-menu', '@plate/toolbar'],
    title: 'Mode Toolbar Button',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/basic-nodes'],
    description: 'A menu for additional text formatting options.',
    files: [
      {
        path: 'components/editor/more-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [
        {
          route: 'https://pro.platejs.org/docs/components/more-toolbar-button',
        },
      ],
      examples: ['basic-marks-demo', 'basic-nodes-pro'],
    },
    name: 'more-toolbar-button',
    registryDependencies: ['dropdown-menu', '@plate/toolbar'],
    title: 'More Toolbar Button',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/media', '@platejs/resizable'],
    description: 'A resizable wrapper with resize handles.',
    files: [
      {
        path: 'components/editor/resize-handle.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/api/resizable' },
        { route: 'https://pro.platejs.org/docs/components/resizable' },
      ],
      examples: ['media-demo', 'media-pro'],
    },
    name: 'resize-handle',
    registryDependencies: [],
    title: 'Resize Handle',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/table'],
    description: 'A menu for table manipulation and formatting.',
    files: [
      {
        path: 'components/editor/table-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [{ route: '/docs/table' }],
      examples: ['table-demo'],
    },
    name: 'table-toolbar-button',
    registryDependencies: ['dropdown-menu', '@plate/toolbar'],
    title: 'Table Toolbar Button',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/toggle'],
    description: 'A toolbar button for expanding and collapsing blocks.',
    files: [
      {
        path: 'components/editor/toggle-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [{ route: '/docs/toggle' }],
      examples: ['toggle-demo'],
    },
    name: 'toggle-toolbar-button',
    registryDependencies: ['@plate/toolbar'],
    title: 'Toggle Toolbar Button',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/plite', '@platejs/utils'],
    description: 'A menu for converting between different block types.',
    files: [
      {
        path: 'components/editor/turn-into-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [
        {
          route:
            'https://pro.platejs.org/docs/components/turn-into-toolbar-button',
        },
      ],
      examples: ['basic-nodes-demo', 'basic-nodes-pro'],
    },
    name: 'turn-into-toolbar-button',
    registryDependencies: [
      'dropdown-menu',
      '@plate/toolbar',
      '@plate/transforms',
    ],
    title: 'Turn Into Toolbar Button',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/plite', '@platejs/utils'],
    description: 'A dropdown to convert block types with classic list support.',
    files: [
      {
        path: 'components/editor/turn-into-toolbar-classic-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      examples: ['list-classic-demo'],
    },
    name: 'turn-into-toolbar-classic-button',
    registryDependencies: [
      'dropdown-menu',
      '@plate/toolbar',
      '@plate/transforms-classic',
    ],
    title: 'Turn Into Toolbar Classic Button',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/yjs'],
    description:
      'Remote Yjs selections and carets positioned over the Plate editor.',
    files: [
      {
        path: 'components/editor/remote-cursor-overlay.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [{ route: '/docs/yjs' }],
      examples: ['collaboration-demo'],
    },
    name: 'remote-cursor-overlay',
    registryDependencies: [],
    title: 'Remote Cursor Overlay',
    type: 'registry:component',
  },
  {
    dependencies: ['@radix-ui/react-toolbar', '@radix-ui/react-tooltip'],
    description:
      'A customizable toolbar component with various button styles and group',
    files: [
      { path: 'components/editor/toolbar.tsx', type: 'registry:component' },
    ],
    meta: {
      // Add links here if needed
    },
    name: 'toolbar',
    registryDependencies: [],
    title: 'Toolbar',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/suggestion'],
    description: 'A toolbar button for toggling suggestion mode in the editor.',
    files: [
      {
        path: 'components/editor/suggestion-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [{ route: '/docs/suggestion' }],
      examples: ['discussion-demo', 'discussion-pro'],
    },
    name: 'suggestion-toolbar-button',
    registryDependencies: ['@plate/toolbar'],
    title: 'Suggestion Toolbar Button',
    type: 'registry:component',
  },
];

export const editorNodes: Registry['items'] = [
  {
    dependencies: ['@platejs/list'],
    description: 'List components.',
    files: [
      { path: 'components/editor/block-list.tsx', type: 'registry:component' },
    ],
    meta: {
      docs: [{ route: '/docs/list' }],
      examples: ['list-demo'],
    },
    name: 'block-list',
    registryDependencies: ['checkbox'],
    title: 'List',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/list'],
    files: [
      {
        path: 'components/editor/block-list-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'block-list-static',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/basic-nodes'],
    description: 'A quote component for block quotes.',
    files: [
      {
        path: 'components/editor/blockquote.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/blockquote' },
        { route: 'https://pro.platejs.org/docs/components/blockquote' },
      ],
      examples: ['basic-blocks-demo', 'basic-nodes-pro'],
    },
    name: 'blockquote',
    registryDependencies: [],
    title: 'Blockquote',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/basic-nodes'],
    files: [
      {
        path: 'components/editor/blockquote-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'blockquote-static',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/basic-nodes'],
    description: 'An inline component for code snippets.',
    files: [{ path: 'components/editor/code.tsx', type: 'registry:component' }],
    meta: {
      docs: [
        { route: '/docs/code' },
        { route: 'https://pro.platejs.org/docs/components/code' },
      ],
      examples: ['basic-marks-demo'],
    },
    name: 'code',
    registryDependencies: [],
    title: 'Code',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/basic-nodes'],
    files: [
      { path: 'components/editor/code-static.tsx', type: 'registry:component' },
    ],
    name: 'code-static',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/math'],
    description: 'A toolbar button for inserting and editing equations.',
    files: [
      {
        path: 'components/editor/equation-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [
        {
          route: 'http://localhost:3000/docs/equation',
          title: 'Equation',
        },
      ],
      examples: ['equation-demo', 'floating-toolbar-demo'],
    },
    name: 'equation-toolbar-button',
    registryDependencies: ['@plate/toolbar'],
    title: 'Equation Toolbar Button',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/basic-styles'],
    description: 'A toolbar control for adjusting font size.',
    files: [
      {
        path: 'components/editor/font-size-toolbar-button.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [{ route: '/docs/font' }],
      examples: ['font-demo'],
    },
    name: 'font-size-toolbar-button',
    registryDependencies: ['popover', '@plate/toolbar'],
    title: 'Font Size Toolbar Button',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/basic-nodes'],
    description: 'A heading with multiple level support.',
    files: [
      {
        path: 'components/editor/heading.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/heading' },
        { route: 'https://pro.platejs.org/docs/components/heading' },
      ],
      examples: ['basic-blocks-demo', 'basic-nodes-pro'],
    },
    name: 'heading',
    registryDependencies: ['@plate/highlight-style'],
    title: 'Heading',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/basic-nodes'],
    files: [
      {
        path: 'components/editor/heading-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'heading-static',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/basic-nodes'],
    description: 'A text highlighter with customizable colors.',
    files: [
      {
        path: 'components/editor/highlight.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [{ route: '/docs/highlight' }],
      examples: ['basic-marks-demo'],
    },
    name: 'highlight',
    registryDependencies: ['@plate/highlight-style'],
    title: 'Highlight',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/basic-nodes'],
    files: [
      {
        path: 'components/editor/highlight-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'highlight-static',
    registryDependencies: ['@plate/highlight-style'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/basic-nodes'],
    description: 'A horizontal rule component with focus states.',
    files: [
      {
        path: 'components/editor/horizontal-rule.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/horizontal-rule' },
        { route: 'https://pro.platejs.org/docs/components/horizontal-rule' },
      ],
      examples: ['basic-blocks-demo'],
    },
    name: 'horizontal-rule',
    registryDependencies: [],
    title: 'Horizontal Rule',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/basic-nodes'],
    files: [
      {
        path: 'components/editor/horizontal-rule-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'horizontal-rule-static',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/dnd', '@platejs/media'],
    description:
      'Image element with lazy loading, resizing capabilities, and optional caption.',
    files: [
      {
        path: 'components/editor/media-image.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        { route: '/docs/api/resizable' },
        { route: 'https://pro.platejs.org/docs/components/image-node' },
      ],
      examples: ['media-demo', 'media-pro'],
    },
    name: 'media-image',
    registryDependencies: [
      '@plate/media-toolbar',
      '@plate/media-preview-dialog',
      '@plate/caption',
      '@plate/resize-handle',
    ],
    title: 'Media Image',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/media'],
    files: [
      {
        path: 'components/editor/media-image-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'media-image-static',
    registryDependencies: ['@plate/caption-static'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/media', '@udecode/react-utils'],
    description: 'A modal component for previewing and manipulating images.',
    files: [
      {
        path: 'components/editor/media-preview-dialog.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        { route: 'https://pro.platejs.org/docs/components/image-preview' },
      ],
      examples: ['media-demo', 'media-pro'],
    },
    name: 'media-preview-dialog',
    registryDependencies: [],
    title: 'Media Preview Dialog',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/basic-nodes'],
    description: 'A component for styling keyboard shortcuts.',
    files: [{ path: 'components/editor/kbd.tsx', type: 'registry:component' }],
    meta: {
      docs: [{ route: '/docs/kbd', title: 'Keyboard Input' }],
      examples: ['basic-marks-demo'],
    },
    name: 'kbd',
    registryDependencies: [],
    title: 'Keyboard Input',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/basic-nodes'],
    files: [
      { path: 'components/editor/kbd-static.tsx', type: 'registry:component' },
    ],
    name: 'kbd-static',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/media'],
    description: 'An audio player component with caption support.',
    files: [
      {
        path: 'components/editor/media-audio.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        {
          route: 'https://pro.platejs.org/docs/components/media-audio',
        },
      ],
      examples: ['media-demo', 'media-pro'],
    },
    name: 'media-audio',
    registryDependencies: ['@plate/caption', '@plate/resize-handle'],
    title: 'Media Audio',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/media'],
    files: [
      {
        path: 'components/editor/media-audio-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'media-audio-static',
    registryDependencies: ['@plate/caption-static'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/media', 'react-tweet', 'react-lite-youtube-embed'],
    description:
      'A component for embedded media content with resizing and caption support.',
    files: [
      {
        path: 'components/editor/media-embed.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        { route: '/docs/api/resizable' },
        {
          route: 'https://pro.platejs.org/docs/components/media-embed',
        },
      ],
      examples: ['media-demo', 'media-pro'],
    },
    name: 'media-embed',
    registryDependencies: [
      '@plate/media-toolbar',
      '@plate/caption',
      '@plate/resize-handle',
    ],
    title: 'Media Embed',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/media'],
    files: [
      {
        path: 'components/editor/media-embed-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'media-embed-static',
    registryDependencies: ['@plate/caption-static'],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/media', '@platejs/suggestion'],
    description:
      'A file attachment component with download capability and caption.',
    files: [
      {
        path: 'components/editor/media-file.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        { route: 'https://pro.platejs.org/docs/components/media-file' },
      ],
      examples: ['media-demo', 'media-pro'],
    },
    name: 'media-file',
    registryDependencies: ['@plate/caption', '@plate/resize-handle'],
    title: 'Media File',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/media', '@platejs/suggestion'],
    files: [
      {
        path: 'components/editor/media-file-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'media-file-static',
    registryDependencies: ['@plate/caption-static'],
    type: 'registry:component',
  },
  {
    dependencies: [
      '@platejs/media',
      '@uploadthing/react@7.3.3',
      'sonner',
      'uploadthing@7.7.4',
      'use-file-picker@2.1.2',
      'zod',
    ],
    description: 'A placeholder for media upload progress indication.',
    files: [
      {
        path: 'components/editor/media-placeholder.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        {
          route: 'https://pro.platejs.org/docs/components/media-placeholder',
        },
      ],
      examples: ['media-demo', 'media-pro'],
    },
    name: 'media-placeholder',
    registryDependencies: ['@plate/uploadthing', '@plate/use-object-url'],
    title: 'Media Placeholder',
    type: 'registry:component',
  },
  {
    dependencies: [
      '@platejs/dnd',
      '@platejs/media',
      'react-player@3.3.1',
      'react-lite-youtube-embed',
    ],
    description:
      'A video player component with YouTube and file upload support.',
    files: [
      {
        path: 'components/editor/media-video.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        { route: '/docs/api/resizable' },
        {
          route: 'https://pro.platejs.org/docs/components/media-video',
        },
      ],
      examples: ['media-demo', 'media-pro'],
    },
    name: 'media-video',
    registryDependencies: ['@plate/caption', '@plate/resize-handle'],
    title: 'Media Video',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/media'],
    files: [
      {
        path: 'components/editor/media-video-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'media-video-static',
    registryDependencies: ['@plate/caption-static'],
    type: 'registry:component',
  },
  {
    dependencies: [],
    description: 'A paragraph block with background color support.',
    files: [
      {
        path: 'components/editor/paragraph.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/basic-blocks' },
        { route: 'https://pro.platejs.org/docs/components/paragraph' },
      ],
      examples: ['basic-blocks-demo', 'basic-nodes-pro'],
    },
    name: 'paragraph',
    registryDependencies: [],
    title: 'Paragraph',
    type: 'registry:component',
  },
  {
    dependencies: [],
    files: [
      {
        path: 'components/editor/paragraph-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'paragraph-static',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/find-replace'],
    description: 'A component that highlights search results in text.',
    files: [
      {
        path: 'components/editor/search-highlight.tsx',
        type: 'registry:component',
      },
    ],
    meta: {
      // examples: ['find-replace-demo'],
      docs: [{ route: '/docs/highlight' }],
    },
    name: 'search-highlight',
    registryDependencies: [],
    title: 'Search Highlight',
    type: 'registry:component',
  },
  {
    dependencies: ['@platejs/tag'],
    description: 'A tag element component with selection states and styling.',
    files: [{ path: 'components/editor/tag.tsx', type: 'registry:component' }],
    meta: {
      docs: [
        { route: '/docs/multi-select' },
        // route: 'https://pro.platejs.org/docs/components/tag' },
      ],
      examples: ['select-editor-demo'],
    },
    name: 'tag',
    registryDependencies: [],
    title: 'Tag',
    type: 'registry:component',
  },
];

export const registryEditor: Registry['items'] = [
  ...editorComponents,
  ...editorNodes,
];
