import type { Registry } from 'shadcn/registry';

export const uiComponents: Registry['items'] = [
  {
    dependencies: [
      '@platejs/ai',
      '@platejs/selection',
      'ai@5.0.28',
      'cmdk',
      '@faker-js/faker',
    ],
    description: 'A menu for AI-powered content generation and insertion.',
    files: [
      { path: 'ui/ai-menu.tsx', type: 'registry:ui' },
      { path: 'ui/ai-chat-editor.tsx', type: 'registry:ui' },
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
      'shadcn/command',
      'shadcn/popover',
      'use-chat',
      'editor-base-kit',
      'ai-node',
    ],
    title: 'AI Menu',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/ai'],
    description: 'A toolbar button for accessing AI features.',
    files: [{ path: 'ui/ai-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/ai', title: 'AI' },
        { route: 'https://pro.platejs.org/docs/components/ai-toolbar-button' },
      ],
      examples: ['ai-demo', 'floating-toolbar-demo', 'ai-pro'],
      label: 'New',
    },
    name: 'ai-toolbar-button',
    registryDependencies: ['toolbar'],
    title: 'AI Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/basic-styles'],
    description: 'A dropdown menu for text alignment controls.',
    files: [{ path: 'ui/align-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/text-align' }],
      examples: ['align-demo'],
    },
    name: 'align-toolbar-button',
    registryDependencies: ['shadcn/dropdown-menu', 'toolbar'],
    title: 'Align Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/ai', '@platejs/selection'],
    description: 'A context menu for block-level operations.',
    files: [{ path: 'ui/block-context-menu.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/block-menu' },
        { route: 'https://pro.platejs.org/docs/components/block-context-menu' },
      ],
      examples: ['block-menu-demo', 'block-menu-pro'],
    },
    name: 'block-context-menu',
    registryDependencies: [
      'shadcn/calendar',
      'shadcn/context-menu',
      'use-is-touch-device',
    ],
    title: 'Block Context Menu',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/selection'],
    description: 'A visual overlay for selected blocks.',
    files: [{ path: 'ui/block-selection.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/block-selection' },
        { route: 'https://pro.platejs.org/docs/components/block-selection' },
      ],
      examples: ['block-selection-demo', 'block-selection-pro'],
    },
    name: 'block-selection',
    registryDependencies: [],
    title: 'Block Selection',
    type: 'registry:ui',
  },
  {
    dependencies: ['use-file-picker@2.1.2'],
    description: 'A toolbar button to import editor content from a file.',
    files: [{ path: 'ui/import-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/import', title: 'Import' }],
      examples: ['basic-nodes-demo'],
      label: 'New',
    },
    name: 'import-toolbar-button',
    registryDependencies: ['shadcn/dropdown-menu', 'toolbar'],
    title: 'Import Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: [
      '@platejs/markdown',
      'html2canvas-pro',
      'pdf-lib',
      'lucide-react',
    ],
    description:
      'A toolbar button for exporting editor content in various formats (HTML, PDF, Image, Markdown).',
    files: [{ path: 'ui/export-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/export', title: 'Export' }],
      examples: ['basic-nodes-demo'],
      label: 'New',
    },
    name: 'export-toolbar-button',
    registryDependencies: [
      'shadcn/dropdown-menu',
      'toolbar',
      'editor-base-kit',
    ],
    title: 'Export Toolbar Button',
    type: 'registry:ui',
  },

  {
    dependencies: ['@udecode/cn', '@platejs/caption'],
    description: 'A text field for adding captions to media elements.',
    files: [{ path: 'ui/caption.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/caption' },
        { route: 'https://pro.platejs.org/docs/components/caption' },
      ],
      examples: [
        'media-demo',
        // 'upload-demo'
      ],
    },
    name: 'caption',
    registryDependencies: ['shadcn/button'],
    title: 'Caption',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/cn', '@platejs/basic-styles', 'lodash'],
    description:
      'A color picker toolbar button with text and background color controls.',
    files: [{ path: 'ui/font-color-toolbar-button.tsx', type: 'registry:ui' }],
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
      'shadcn/dropdown-menu',
      'shadcn/separator',
      'shadcn/button',
      'shadcn/tooltip',
      'toolbar',
    ],
    title: 'Font Color Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/comment'],
    description: 'A toolbar button for adding inline comments.',
    files: [{ path: 'ui/comment-toolbar-button.tsx', type: 'registry:ui' }],
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
    registryDependencies: ['comment-kit'],
    title: 'Comment Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/suggestion'],
    name: 'block-suggestion',
    title: 'Block Suggestion',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/comment', 'date-fns', '@platejs/suggestion'],
    description:
      'A popover interface for managing discussions: comments, replies, suggestions.',
    files: [
      {
        path: 'ui/block-discussion.tsx',
        type: 'registry:ui',
      },
      {
        path: 'ui/block-suggestion.tsx',
        type: 'registry:ui',
      },
      {
        path: 'ui/comment.tsx',
        type: 'registry:ui',
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
      'shadcn/button',
      'shadcn/popover',
      'shadcn/avatar',
      'shadcn/dropdown-menu',
      'editor',
      'ai-node',
      'date-node',
      'emoji-node',
      'link-node',
      'mention-node',
      'highlight-style',
      'suggestion-kit',
      'discussion-kit',
      'basic-marks-kit',
    ],
    title: 'Block Discussion',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/selection'],
    description: 'A visual overlay for cursors and selections.',
    files: [{ path: 'ui/cursor-overlay.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/cursor-overlay' },
        { route: 'https://pro.platejs.org/docs/components/cursor-overlay' },
      ],
      examples: ['ai-demo'],
    },
    name: 'cursor-overlay',
    registryDependencies: [],
    title: 'Cursor Overlay',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/dnd', '@platejs/selection'],
    description: 'A block wrapper with a drag handle for moving editor blocks.',
    files: [{ path: 'ui/block-draggable.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/dnd', title: 'Drag & Drop' },
        { route: 'https://pro.platejs.org/docs/components/block-draggable' },
      ],
      examples: ['dnd-demo', 'dnd-pro'],
      usage: [
        `DndPlugin.configure({
  render: {
    aboveNodes: BlockDraggable,
  },
})`,
      ],
      // Click the plus button next to the drag button to insert blocks
    },
    name: 'block-draggable',
    registryDependencies: ['shadcn/tooltip', 'use-mounted'],
    title: 'Block Draggable',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A container for the editor content and styling.',
    files: [
      { path: 'ui/editor.tsx', type: 'registry:ui' },
      { path: 'ui/editor-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: 'https://pro.platejs.org/docs/components/editor' }],
      examples: ['editor-default', 'editor-disabled', 'editor-full-width'],
    },
    name: 'editor',
    registryDependencies: [],
    title: 'Editor',
    type: 'registry:ui',
  },
  {
    dependencies: ['fzf@0.5.2', '@platejs/tag', '@udecode/cmdk'],
    description: 'An editor to select tags.',
    files: [{ path: 'ui/select-editor.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/multi-select' }],
      examples: ['select-editor-demo'],
      label: 'New',
    },
    name: 'select-editor',
    registryDependencies: [
      'editor',
      'shadcn/command',
      'shadcn/popover',
      'tag-node',
    ],
    title: 'Select Editor',
    type: 'registry:ui',
  },
  {
    dependencies: [
      '@platejs/emoji',
      '@emoji-mart/data@1.2.1',
      '@radix-ui/react-popover',
    ],
    description: 'An emoji picker toolbar button.',
    files: [{ path: 'ui/emoji-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/emoji' },
        { route: 'https://pro.platejs.org/docs/components/emoji-picker' },
      ],
      examples: ['emoji-demo', 'emoji-pro'],
    },
    name: 'emoji-toolbar-button',
    registryDependencies: ['toolbar'],
    title: 'Emoji Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A set of commonly used formatting buttons.',
    files: [{ path: 'ui/fixed-toolbar-buttons.tsx', type: 'registry:ui' }],
    meta: {
      examples: ['basic-nodes-demo'],
    },
    name: 'fixed-toolbar-buttons',
    registryDependencies: [
      'toolbar',
      'ai-toolbar-button',
      'align-toolbar-button',
      'comment-toolbar-button',
      'emoji-toolbar-button',
      'font-color-toolbar-button',
      'font-size-toolbar-button',
      'history-toolbar-button',
      'list-toolbar-button',
      'indent-toolbar-button',
      'import-toolbar-button',
      'insert-toolbar-button',
      'line-height-toolbar-button',
      'link-toolbar-button',
      'mark-toolbar-button',
      'media-toolbar-button',
      'mode-toolbar-button',
      'more-toolbar-button',
      'table-toolbar-button',
      'toggle-toolbar-button',
      'turn-into-toolbar-button',
      'export-toolbar-button',
    ],
    title: 'Fixed Toolbar Buttons',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    files: [
      {
        path: 'ui/fixed-toolbar-classic-buttons.tsx',
        type: 'registry:ui',
      },
    ],
    // description: 'A set of commonly used formatting buttons.',
    meta: {
      // examples: ['toolbar-demo'],
    },
    name: 'fixed-toolbar-classic-buttons',
    registryDependencies: [
      'toolbar',
      'ai-toolbar-button',
      'align-toolbar-button',
      'font-color-toolbar-button',
      'comment-toolbar-button',
      'emoji-toolbar-button',
      'insert-toolbar-classic-button',
      'line-height-toolbar-button',
      'list-classic-toolbar-button',
      'link-toolbar-button',
      'mark-toolbar-button',
      'media-toolbar-button',
      'mode-toolbar-button',
      'more-toolbar-button',
      'table-toolbar-button',
      'toggle-toolbar-button',
      'turn-into-toolbar-classic-button',
    ],
    title: 'Fixed Toolbar List Buttons',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A fixed toolbar that stays at the top of the editor.',
    files: [{ path: 'ui/fixed-toolbar.tsx', type: 'registry:ui' }],
    meta: {
      examples: ['basic-nodes-demo'],
    },
    name: 'fixed-toolbar',
    registryDependencies: ['toolbar', 'tailwind-scrollbar-hide'],
    title: 'Fixed Toolbar',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A set of formatting buttons for the floating toolbar.',
    files: [{ path: 'ui/floating-toolbar-buttons.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/api/floating' },
        {
          route:
            'https://pro.platejs.org/docs/components/floating-toolbar-buttons',
        },
      ],
      examples: ['floating-toolbar-demo', 'floating-toolbar-pro'],
    },
    name: 'floating-toolbar-buttons',
    registryDependencies: [
      'toolbar',
      'ai-toolbar-button',
      'comment-toolbar-button',
      'equation-toolbar-button',
      'link-toolbar-button',
      'mark-toolbar-button',
      'more-toolbar-button',
      'suggestion-toolbar-button',
      'turn-into-toolbar-button',
    ],
    title: 'Floating Toolbar Buttons',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description:
      'A set of commonly used formatting buttons for the floating toolbar with classic list support.',
    files: [
      {
        path: 'ui/floating-toolbar-classic-buttons.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      examples: ['list-classic-demo'],
    },
    name: 'floating-toolbar-classic-buttons',
    registryDependencies: [
      'toolbar',
      'ai-toolbar-button',
      'comment-toolbar-button',
      'equation-toolbar-button',
      'link-toolbar-button',
      'mark-toolbar-button',
      'more-toolbar-button',
      'suggestion-toolbar-button',
      'turn-into-toolbar-classic-button',
    ],
    title: 'Floating Toolbar Classic Buttons',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/cn', '@platejs/floating'],
    description: 'A contextual toolbar that appears over selected text.',
    files: [{ path: 'ui/floating-toolbar.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/api/floating' },
        { route: 'https://pro.platejs.org/docs/components/floating-toolbar' },
      ],
      examples: ['floating-toolbar-demo', 'floating-toolbar-pro'],
    },
    name: 'floating-toolbar',
    registryDependencies: ['toolbar', 'tailwind-scrollbar-hide'],
    title: 'Floating Toolbar',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/ai'],
    description:
      'A text suggestion system that displays AI-generated content after the cursor.',
    files: [{ path: 'ui/ghost-text.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        {
          route: '/docs/copilot',
        },
        { route: 'https://pro.platejs.org/docs/components/ghost-text' },
      ],
      examples: ['copilot-demo', 'copilot-pro'],
      //       1. Hover card: a new style of hover card that is more user-friendly. You can **hover** over the ghost text to see the hover card.
      // 2. Marks: support for marks like bold, italic, underline, etc.This means you can see bold text and **links** in the ghost text
      // 3. Backend: complete backend setup.
    },
    name: 'ghost-text',
    registryDependencies: [],
    title: 'Ghost Text',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'Toolbar buttons for undo and redo operations.',
    files: [{ path: 'ui/history-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        {
          route: 'https://docs.slatejs.org/libraries/slate-history',
          title: 'Slate History',
        },
      ],
      examples: ['basic-nodes-demo'],
    },
    name: 'history-toolbar-button',
    registryDependencies: ['toolbar'],
    title: 'History Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/list'],
    description: 'A toolbar control for adjusting list indentation.',
    files: [
      {
        path: 'ui/list-toolbar-button.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [{ route: '/docs/list' }],
      examples: ['list-demo'],
    },
    name: 'list-toolbar-button',
    registryDependencies: ['toolbar'],
    title: 'List Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/indent'],
    description: 'Toolbar controls for block indentation.',
    files: [{ path: 'ui/indent-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/indent' }],
      examples: ['indent-demo'],
    },
    name: 'indent-toolbar-button',
    registryDependencies: ['toolbar'],
    title: 'Indent Toolbar Buttons',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/combobox', '@ariakit/react'],
    description: 'A combobox for inline suggestions.',
    files: [{ path: 'ui/inline-combobox.tsx', type: 'registry:ui' }],
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
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A menu for inserting different types of blocks.',
    files: [{ path: 'ui/insert-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      examples: ['basic-nodes-demo'],
    },
    name: 'insert-toolbar-button',
    registryDependencies: ['shadcn/dropdown-menu', 'toolbar', 'transforms'],
    title: 'Insert Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description:
      'A menu for inserting different types of blocks with classic list support.',
    files: [
      { path: 'ui/insert-toolbar-classic-button.tsx', type: 'registry:ui' },
    ],
    meta: {
      examples: ['list-classic-demo'],
    },
    name: 'insert-toolbar-classic-button',
    registryDependencies: [
      'shadcn/dropdown-menu',
      'toolbar',
      'transforms-classic',
    ],
    title: 'Insert Toolbar Classic Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/basic-styles'],
    description: 'A menu for controlling text line spacing.',
    files: [
      {
        path: 'ui/line-height-toolbar-button.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [{ route: '/docs/line-height' }],
      examples: ['line-height-demo'],
    },
    name: 'line-height-toolbar-button',
    registryDependencies: ['toolbar', 'shadcn/dropdown-menu'],
    title: 'Line Height Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/link', '@platejs/floating'],
    description: 'A floating interface for link editing.',
    files: [{ path: 'ui/link-toolbar.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/link' },
        { route: '/docs/api/floating' },
        {
          route: 'https://pro.platejs.org/docs/components/link-toolbar',
        },
      ],
      examples: ['link-demo', 'link-pro'],
    },
    name: 'link-toolbar',
    registryDependencies: [
      'shadcn/button',
      'shadcn/input',
      'shadcn/popover',
      'shadcn/separator',
    ],
    title: 'Link Floating Toolbar',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/link'],
    description: 'A toolbar control for link management.',
    files: [{ path: 'ui/link-toolbar-button.tsx', type: 'registry:ui' }],
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
    registryDependencies: ['toolbar'],
    title: 'Link Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/list-classic'],
    description: 'Toolbar controls for list creation and management.',
    files: [
      { path: 'ui/list-classic-toolbar-button.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/list-classic' }],
      examples: ['list-classic-demo'],
    },
    name: 'list-classic-toolbar-button',
    registryDependencies: ['toolbar'],
    title: 'List Toolbar Buttons',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/basic-nodes'],
    description: 'A toolbar control for basic text formatting.',
    files: [{ path: 'ui/mark-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/basic-marks' }],
      examples: ['basic-marks-demo', 'basic-nodes-pro'],
    },
    name: 'mark-toolbar-button',
    registryDependencies: ['toolbar'],
    title: 'Mark Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/media'],
    description: 'A toolbar interface for media settings.',
    files: [{ path: 'ui/media-toolbar.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/media' }],
      examples: ['media-demo', 'media-pro'],
    },
    name: 'media-toolbar',
    registryDependencies: [
      'shadcn/button',
      'shadcn/input',
      'shadcn/popover',
      'shadcn/separator',
    ],
    title: 'Media Toolbar',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/media', 'use-file-picker@2.1.2', 'sonner'],
    description: 'Toolbar button for inserting and managing media.',
    files: [{ path: 'ui/media-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/media' }],
      examples: ['media-demo', 'media-pro'],
    },
    name: 'media-toolbar-button',
    registryDependencies: [
      'toolbar',
      'shadcn/input',
      'shadcn/dropdown-menu',
      'shadcn/alert-dialog',
    ],
    title: 'Media Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/media', 'sonner'],
    description: 'Show toast notifications for media uploads.',
    files: [{ path: 'ui/media-upload-toast.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/media' }],
      examples: ['media-demo', 'media-pro'],
    },
    name: 'media-upload-toast',
    registryDependencies: [],
    title: 'Media Upload Toast',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A menu for switching between editor modes.',
    files: [{ path: 'ui/mode-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      examples: ['basic-nodes-demo'],
    },
    name: 'mode-toolbar-button',
    registryDependencies: ['shadcn/dropdown-menu', 'toolbar'],
    title: 'Mode Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A menu for additional text formatting options.',
    files: [{ path: 'ui/more-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        {
          route: 'https://pro.platejs.org/docs/components/more-toolbar-button',
        },
      ],
      examples: ['basic-marks-demo', 'basic-nodes-pro'],
    },
    name: 'more-toolbar-button',
    registryDependencies: ['shadcn/dropdown-menu', 'toolbar'],
    title: 'More Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/resizable'],
    description: 'A resizable wrapper with resize handles.',
    files: [{ path: 'ui/resize-handle.tsx', type: 'registry:ui' }],
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
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/table'],
    description: 'A menu for table manipulation and formatting.',
    files: [
      { path: 'ui/table-toolbar-button.tsx', type: 'registry:ui' },
      { path: 'ui/table-icons.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/table' }],
      examples: ['table-demo'],
    },
    name: 'table-toolbar-button',
    registryDependencies: ['shadcn/dropdown-menu', 'toolbar'],
    title: 'Table Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/toggle'],
    description: 'A toolbar button for expanding and collapsing blocks.',
    files: [{ path: 'ui/toggle-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/toggle' }],
      examples: ['toggle-demo'],
    },
    name: 'toggle-toolbar-button',
    registryDependencies: ['toolbar'],
    title: 'Toggle Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A menu for converting between different block types.',
    files: [{ path: 'ui/turn-into-toolbar-button.tsx', type: 'registry:ui' }],
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
    registryDependencies: ['shadcn/dropdown-menu', 'toolbar', 'transforms'],
    title: 'Turn Into Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A dropdown to convert block types with classic list support.',
    files: [
      { path: 'ui/turn-into-toolbar-classic-button.tsx', type: 'registry:ui' },
    ],
    meta: {
      examples: ['list-classic-demo'],
    },
    name: 'turn-into-toolbar-classic-button',
    registryDependencies: [
      'shadcn/dropdown-menu',
      'toolbar',
      'transforms-classic',
    ],
    title: 'Turn Into Toolbar Classic Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@slate-yjs/react'],
    description:
      'A cursor overlay to display multiplayer cursors in the yjs plugin.',
    files: [{ path: 'ui/remote-cursor-overlay.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/yjs' }],
      examples: [],
    },
    name: 'remote-cursor-overlay',
    registryDependencies: [],
    title: 'Remote Cursor Overlay',
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-toolbar'],
    description:
      'A customizable toolbar component with various button styles and group',
    files: [{ path: 'ui/toolbar.tsx', type: 'registry:ui' }],
    meta: {
      // Add links here if needed
    },
    name: 'toolbar',
    registryDependencies: [
      'shadcn/tooltip',
      'shadcn/separator',
      'shadcn/dropdown-menu',
    ],
    title: 'Toolbar',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/suggestion'],
    description: 'A toolbar button for toggling suggestion mode in the editor.',
    files: [{ path: 'ui/suggestion-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/suggestion' }],
      examples: ['discussion-demo', 'discussion-pro'],
    },
    name: 'suggestion-toolbar-button',
    registryDependencies: ['toolbar'],
    title: 'Suggestion Toolbar Button',
    type: 'registry:ui',
  },
];

export const uiNodes: Registry['items'] = [
  {
    dependencies: [],
    description: 'A text highlighter for AI-generated content.',
    files: [{ path: 'ui/ai-node.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/ai', title: 'AI' },
        {
          route: 'https://pro.platejs.org/docs/components/ai-node',
          title: 'AI Leaf',
        },
      ],
      examples: ['ai-demo', 'ai-pro'],
      label: 'New',
    },
    name: 'ai-node',
    registryDependencies: [],
    title: 'AI Leaf',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/list'],
    description: 'List components.',
    files: [
      { path: 'ui/block-list.tsx', type: 'registry:ui' },
      {
        path: 'ui/block-list-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [{ route: '/docs/list' }],
      examples: ['list-demo'],
    },
    name: 'block-list',
    registryDependencies: ['shadcn/checkbox'],
    title: 'List',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A quote component for block quotes.',
    files: [
      { path: 'ui/blockquote-node.tsx', type: 'registry:ui' },
      {
        path: 'ui/blockquote-node-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/blockquote' },
        { route: 'https://pro.platejs.org/docs/components/blockquote-node' },
      ],
      examples: ['basic-blocks-demo', 'basic-nodes-pro'],
    },
    name: 'blockquote-node',
    registryDependencies: [],
    title: 'Blockquote Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/callout'],
    description:
      'A callout component for highlighting important information with customizable icons and styles.',
    files: [
      { path: 'ui/callout-node.tsx', type: 'registry:ui' },
      { path: 'ui/callout-node-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/callout' },
        { route: 'https://pro.platejs.org/docs/components/callout-node' },
      ],
      examples: ['callout-demo'],
    },
    name: 'callout-node',
    registryDependencies: ['emoji-toolbar-button'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/code-block', 'lowlight'],
    description:
      'A code block with syntax highlighting and language selection.',
    files: [
      { path: 'ui/code-block-node.tsx', type: 'registry:ui' },
      {
        path: 'ui/code-block-node-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/code-block' },
        { route: 'https://pro.platejs.org/docs/components/code-block-node' },
      ],
      examples: ['code-block-demo'],
    },
    name: 'code-block-node',
    registryDependencies: ['shadcn/command', 'shadcn/popover', 'shadcn/button'],
    title: 'Code Block Nodes',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/code-drawing'],
    description:
      'Create diagrams from code using PlantUML, Graphviz, Flowchart, or Mermaid.',
    files: [
      { path: 'ui/code-drawing-node.tsx', type: 'registry:ui' },
      {
        path: 'ui/code-drawing-node-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/code-drawing' },
        {
          route: 'https://pro.platejs.org/docs/components/code-drawing-node',
        },
      ],
      examples: ['code-drawing-demo'],
    },
    name: 'code-drawing-node',
    registryDependencies: ['shadcn/popover', 'shadcn/button', 'shadcn/select'],
    title: 'Code Drawing Node',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'An inline component for code snippets.',
    files: [
      { path: 'ui/code-node.tsx', type: 'registry:ui' },
      { path: 'ui/code-node-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/code' },
        { route: 'https://pro.platejs.org/docs/components/code-node' },
      ],
      examples: ['basic-marks-demo'],
    },
    name: 'code-node',
    registryDependencies: [],
    title: 'Code Leaf',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/cn', '@platejs/layout'],
    description: 'Resizable column components for layout.',
    files: [
      { path: 'ui/column-node.tsx', type: 'registry:ui' },
      {
        path: 'ui/column-node-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/column' },
        {
          route: 'https://pro.platejs.org/docs/components/column-node',
        },
      ],
      examples: ['column-demo'],
    },
    name: 'column-node',
    registryDependencies: ['resize-handle'],
    title: 'Column Nodes',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/comment'],
    description:
      'A text component for displaying comments with visual indicators.',
    files: [
      { path: 'ui/comment-node.tsx', type: 'registry:ui' },
      { path: 'ui/comment-node-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/comment' },
        { route: 'https://pro.platejs.org/docs/components/comment-node' },
      ],
      examples: ['discussion-demo', 'discussion-pro'],
    },
    name: 'comment-node',
    registryDependencies: ['highlight-style'],
    title: 'Comment Leaf',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/suggestion'],
    description: 'A text component for suggestion.',
    files: [
      { path: 'ui/suggestion-node.tsx', type: 'registry:ui' },
      { path: 'ui/suggestion-node-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/suggestion' }],
      examples: ['discussion-demo', 'discussion-pro'],
    },
    name: 'suggestion-node',
    registryDependencies: ['suggestion-kit'],
    title: 'Suggestion Leaf',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/date'],
    description: 'A date field component with calendar picker.',
    files: [
      { path: 'ui/date-node.tsx', type: 'registry:ui' },
      { path: 'ui/date-node-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/date' },
        { route: 'https://pro.platejs.org/docs/components/date-node' },
      ],
      examples: ['date-demo'],
    },
    name: 'date-node',
    registryDependencies: ['shadcn/calendar'],
    title: 'Date Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/math', 'react-textarea-autosize'],
    description:
      'Displays a LaTeX equation element with an editable popover for inputting and rendering mathematical expressions.',
    files: [
      { path: 'ui/equation-node.tsx', type: 'registry:ui' },
      { path: 'ui/equation-node-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        {
          route: 'http://localhost:3000/docs/equation',
          title: 'Equation',
        },
      ],
      examples: ['equation-demo'],
    },
    name: 'equation-node',
    registryDependencies: ['shadcn/popover'],
    title: 'Equation Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/math'],
    description: 'A toolbar button for inserting and editing equations.',
    files: [
      {
        path: 'ui/equation-toolbar-button.tsx',
        type: 'registry:ui',
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
    registryDependencies: ['toolbar'],
    title: 'Equation Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/emoji', '@emoji-mart/data@1.2.1'],
    description: 'An input component for emoji search and insertion.',
    files: [{ path: 'ui/emoji-node.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/emoji' },
        {
          route: 'https://pro.platejs.org/docs/components/emoji-node',
        },
      ],
      examples: ['emoji-demo'],
    },
    name: 'emoji-node',
    registryDependencies: ['inline-combobox', 'use-debounce'],
    title: 'Emoji Input Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/excalidraw'],
    description: 'A drawing component powered by Excalidraw.',
    files: [{ path: 'ui/excalidraw-node.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/excalidraw' }],
      // FIXME
      // examples: ['excalidraw-demo'],
    },
    name: 'excalidraw-node',
    registryDependencies: [],
    title: 'Excalidraw Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/basic-styles'],
    description: 'A toolbar control for adjusting font size.',
    files: [{ path: 'ui/font-size-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/font' }],
      examples: ['font-demo'],
    },
    name: 'font-size-toolbar-button',
    registryDependencies: ['shadcn/popover', 'toolbar'],
    title: 'Font Size Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A heading with multiple level support.',
    files: [
      { path: 'ui/heading-node.tsx', type: 'registry:ui' },
      { path: 'ui/heading-node-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/heading' },
        { route: 'https://pro.platejs.org/docs/components/heading-node' },
      ],
      examples: ['basic-blocks-demo', 'basic-nodes-pro'],
    },
    name: 'heading-node',
    registryDependencies: [],
    title: 'Heading Element',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A text highlighter with customizable colors.',
    files: [
      { path: 'ui/highlight-node.tsx', type: 'registry:ui' },
      { path: 'ui/highlight-node-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/highlight' }],
      examples: ['basic-marks-demo'],
    },
    name: 'highlight-node',
    registryDependencies: ['highlight-style'],
    title: 'Highlight Leaf',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A horizontal rule component with focus states.',
    files: [
      { path: 'ui/hr-node.tsx', type: 'registry:ui' },
      { path: 'ui/hr-node-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/horizontal-rule' },
        { route: 'https://pro.platejs.org/docs/components/hr-node' },
      ],
      examples: ['basic-blocks-demo'],
    },
    name: 'hr-node',
    registryDependencies: [],
    title: 'Horizontal Rule Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/media', '@platejs/resizable'],
    description:
      'Image element with lazy loading, resizing capabilities, and optional caption.',
    files: [
      { path: 'ui/media-image-node.tsx', type: 'registry:ui' },
      { path: 'ui/media-image-node-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        { route: '/docs/api/resizable' },
        { route: 'https://pro.platejs.org/docs/components/image-node' },
      ],
      examples: ['media-demo', 'media-pro'],
    },
    name: 'media-image-node',
    registryDependencies: ['media-toolbar', 'caption', 'resize-handle'],
    title: 'Image Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/media'],
    description: 'A modal component for previewing and manipulating images.',
    files: [{ path: 'ui/media-preview-dialog.tsx', type: 'registry:ui' }],
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
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A component for styling keyboard shortcuts.',
    files: [
      { path: 'ui/kbd-node.tsx', type: 'registry:ui' },
      { path: 'ui/kbd-node-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/kbd', title: 'Keyboard Input' }],
      examples: ['basic-marks-demo'],
    },
    name: 'kbd-node',
    registryDependencies: [],
    title: 'Keyboard Input Leaf',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/link'],
    description: 'A component for rendering hyperlinks with hover states.',
    files: [
      { path: 'ui/link-node.tsx', type: 'registry:ui' },
      { path: 'ui/link-node-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/link' },
        { route: 'https://pro.platejs.org/docs/components/link-node' },
      ],
      examples: ['link-demo'],
    },
    name: 'link-node',
    registryDependencies: [],
    title: 'Link Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/list-classic'],
    description: 'List (classic) nodes for ordered and unordered items.',
    files: [{ path: 'ui/list-classic-node.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/list-classic' }],
      examples: ['list-classic-demo'],
    },
    name: 'list-classic-node',
    registryDependencies: ['shadcn/checkbox'],
    title: 'List Nodes',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/media', '@platejs/resizable'],
    description: 'An audio player component with caption support.',
    files: [
      { path: 'ui/media-audio-node.tsx', type: 'registry:ui' },
      {
        path: 'ui/media-audio-node-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        {
          route: 'https://pro.platejs.org/docs/components/media-audio-node',
        },
      ],
      examples: ['media-demo', 'media-pro'],
    },
    name: 'media-audio-node',
    registryDependencies: ['caption'],
    title: 'Media Audio Element',
    type: 'registry:ui',
  },
  {
    dependencies: [
      '@platejs/media',
      '@platejs/resizable',
      'react-tweet',
      'react-lite-youtube-embed',
    ],
    description:
      'A component for embedded media content with resizing and caption support.',
    files: [{ path: 'ui/media-embed-node.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/media' },
        { route: '/docs/api/resizable' },
        {
          route: 'https://pro.platejs.org/docs/components/media-embed-node',
        },
      ],
      examples: ['media-demo', 'media-pro'],
    },
    name: 'media-embed-node',
    registryDependencies: ['media-toolbar', 'caption', 'resize-handle'],
    title: 'Media Embed Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/media', '@platejs/resizable'],
    description:
      'A file attachment component with download capability and caption.',
    files: [
      { path: 'ui/media-file-node.tsx', type: 'registry:ui' },
      {
        path: 'ui/media-file-node-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        { route: 'https://pro.platejs.org/docs/components/media-file-node' },
      ],
      examples: ['media-demo', 'media-pro'],
    },
    name: 'media-file-node',
    registryDependencies: ['caption'],
    title: 'Media File Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/media', 'use-file-picker@2.1.2'],
    description: 'A placeholder for media upload progress indication.',
    files: [
      {
        path: 'ui/media-placeholder-node.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        {
          route:
            'https://pro.platejs.org/docs/components/media-placeholder-node',
        },
      ],
      examples: ['media-demo', 'media-pro'],
    },
    name: 'media-placeholder-node',
    registryDependencies: ['uploadthing'],
    title: 'Media Placeholder Element',
    type: 'registry:ui',
  },
  {
    dependencies: [
      '@platejs/media',
      '@platejs/resizable',
      'react-player@3.3.1',
      'react-lite-youtube-embed',
    ],
    description:
      'A video player component with YouTube and file upload support.',
    files: [
      { path: 'ui/media-video-node.tsx', type: 'registry:ui' },
      {
        path: 'ui/media-video-node-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        { route: '/docs/api/resizable' },
        {
          route: 'https://pro.platejs.org/docs/components/media-video-node',
        },
      ],
      examples: ['media-demo', 'media-pro'],
    },
    name: 'media-video-node',
    registryDependencies: ['media-toolbar', 'caption', 'resize-handle'],
    title: 'Media Video Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/mention'],
    description:
      'A mention element with customizable prefix and label, powered by a combobox.',
    files: [
      { path: 'ui/mention-node.tsx', type: 'registry:ui' },
      { path: 'ui/mention-node-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/mention' },
        { route: 'https://pro.platejs.org/docs/components/mention-node' },
      ],
      examples: ['mention-demo'],
    },
    name: 'mention-node',
    registryDependencies: ['use-mounted', 'inline-combobox'],
    title: 'Mention Nodes',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A paragraph block with background color support.',
    files: [
      { path: 'ui/paragraph-node.tsx', type: 'registry:ui' },
      { path: 'ui/paragraph-node-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/basic-blocks' },
        { route: 'https://pro.platejs.org/docs/components/paragraph-node' },
      ],
      examples: ['basic-blocks-demo', 'basic-nodes-pro'],
    },
    name: 'paragraph-node',
    registryDependencies: [],
    title: 'Paragraph Element',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A component that highlights search results in text.',
    files: [{ path: 'ui/search-highlight-node.tsx', type: 'registry:ui' }],
    meta: {
      // examples: ['find-replace-demo'],
      docs: [{ route: '/docs/highlight' }],
    },
    name: 'search-highlight-node',
    registryDependencies: [],
    title: 'Search Highlight Leaf',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/ai'],
    description: 'A command input component for inserting various elements.',
    files: [{ path: 'ui/slash-node.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/slash-command', title: 'Slash' },
        {
          route: 'https://pro.platejs.org/docs/components/slash-node',
        },
      ],
      examples: ['slash-command-demo', 'slash-command-pro'],
    },
    name: 'slash-node',
    registryDependencies: ['inline-combobox', 'transforms'],
    title: 'Slash Input Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/table', '@radix-ui/react-popover'],
    description:
      'A table component with floating toolbar and border customization.',
    files: [
      { path: 'ui/table-node.tsx', type: 'registry:ui' },
      { path: 'ui/table-icons.tsx', type: 'registry:ui' },
      { path: 'ui/table-node-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/table' },
        { route: 'https://pro.platejs.org/docs/components/table-node' },
      ],
      examples: ['table-demo'],
    },
    name: 'table-node',
    registryDependencies: [
      'shadcn/dropdown-menu',
      'shadcn/popover',
      'resize-handle',
      'block-selection',
      'toolbar',
      'tailwind-scrollbar-hide',
      'font-color-toolbar-button',
    ],
    title: 'Table Element',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A tag element component with selection states and styling.',
    files: [{ path: 'ui/tag-node.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/multi-select' },
        // route: 'https://pro.platejs.org/docs/components/tag-node' },
      ],
      examples: ['select-editor-demo'],
    },
    name: 'tag-node',
    registryDependencies: [],
    title: 'Tag Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/toc'],
    description:
      'A table of contents component with links to document headings.',
    files: [
      { path: 'ui/toc-node.tsx', type: 'registry:ui' },
      { path: 'ui/toc-node-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/toc' },
        { route: 'https://pro.platejs.org/docs/components/toc-node' },
      ],
      examples: ['toc-demo', 'toc-pro'],
      // - Responsive design that adapts to different screen sizes
      // - Dynamic highlighting of the corresponding thumbnail on the right side based on the current section
      // - Hover thumbnail to see the preview of the section with smooth animation
      // - Elegant transition effects when navigating between sections
      // - Animated highlighting of the current section in the sidebar
    },
    name: 'toc-node',
    registryDependencies: [],
    title: 'TOC Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@platejs/toggle'],
    description: 'A collapsible component for toggling content visibility.',
    files: [
      { path: 'ui/toggle-node.tsx', type: 'registry:ui' },
      { path: 'ui/toggle-node-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/toggle' }],
      examples: ['toggle-demo'],
    },
    name: 'toggle-node',
    registryDependencies: ['shadcn/button'],
    title: 'Toggle Element',
    type: 'registry:ui',
  },
];

export const registryUI: Registry['items'] = [...uiComponents, ...uiNodes];
