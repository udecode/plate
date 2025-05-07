import type { Registry } from 'shadcn/registry';

export const uiComponents: Registry['items'] = [
  {
    dependencies: [
      '@udecode/plate-ai',
      '@udecode/plate-markdown',
      '@udecode/plate-selection',
      'ai',
      '@faker-js/faker',
    ],
    description: 'A menu for AI-powered content generation and insertion.',
    files: [
      { path: 'ui/ai-menu.tsx', type: 'registry:ui' },
      { path: 'ui/ai-loading-bar.tsx', type: 'registry:ui' },
      { path: 'ui/ai-anchor-element.tsx', type: 'registry:ui' },
      { path: 'ui/ai-menu-items.tsx', type: 'registry:ui' },
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
      'use-chat',
      'shadcn/command',
      'shadcn/popover',
      'editor',
    ],
    title: 'AI Menu',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-ai'],
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
    dependencies: ['@udecode/plate-alignment', '@radix-ui/react-dropdown-menu'],
    description: 'A dropdown menu for text alignment controls.',
    files: [{ path: 'ui/align-dropdown-menu.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/alignment' }],
      examples: ['align-demo'],
    },
    name: 'align-dropdown-menu',
    registryDependencies: ['dropdown-menu', 'toolbar'],
    title: 'Align Dropdown Menu',
    type: 'registry:ui',
  },
  {
    dependencies: [
      '@udecode/plate-ai',
      '@udecode/plate-block-quote',
      '@udecode/plate-heading',
      '@udecode/plate-indent-list',
      '@udecode/plate-selection',
    ],
    description: 'A context menu for block-level operations.',
    files: [{ path: 'ui/block-context-menu.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/block-menu' },
        { route: 'https://pro.platejs.org/docs/components/block-context-menu' },
      ],
      examples: ['block-menu-demo', 'block-menu-pro'],
      label: 'New',
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
    dependencies: ['@udecode/plate-selection'],
    description: 'A visual overlay for selected blocks.',
    files: [{ path: 'ui/block-selection.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/block-selection' },
        { route: 'https://pro.platejs.org/docs/components/block-selection' },
      ],
      examples: ['block-selection-demo', 'block-selection-pro'],
      label: 'New',
    },
    name: 'block-selection',
    registryDependencies: [],
    title: 'Block Selection',
    type: 'registry:ui',
  },
  {
    dependencies: ['use-file-picker'],
    description: 'A toolbar button to import editor content from a file.',
    files: [{ path: 'ui/import-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/import', title: 'Import' }],
      examples: ['basic-nodes-demo'],
      label: 'New',
    },
    name: 'import-toolbar-button',
    registryDependencies: ['dropdown-menu', 'toolbar'],
    title: 'Import Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['html2canvas-pro', 'pdf-lib'],
    description: 'A toolbar button to export editor content as PDF.',
    files: [{ path: 'ui/export-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/export', title: 'Export' }],
      examples: ['basic-nodes-demo'],
      label: 'New',
    },
    name: 'export-toolbar-button',
    registryDependencies: ['toolbar'],
    title: 'Export Toolbar Button',
    type: 'registry:ui',
  },

  {
    dependencies: ['@udecode/plate-caption'],
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
    registryDependencies: ['button'],
    title: 'Caption',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-font', '@radix-ui/react-dropdown-menu'],
    description: 'A color picker with text and background color controls.',
    files: [
      { path: 'ui/color-constants.ts', type: 'registry:ui' },
      {
        path: 'ui/color-dropdown-menu-items.tsx',
        type: 'registry:ui',
      },
      { path: 'ui/color-dropdown-menu.tsx', type: 'registry:ui' },
      { path: 'ui/color-input.tsx', type: 'registry:ui' },
      { path: 'ui/color-picker.tsx', type: 'registry:ui' },
      { path: 'ui/colors-custom.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/font' },
        {
          route: 'https://pro.platejs.org/docs/components/color-dropdown-menu',
        },
      ],
      examples: ['font-demo'],
      //       1. Text color can be modified using the floating toolbar or block menu, providing more flexibility in formatting.
      // 2. An improved color picker interface with custom color options and a color input field for precise color selection.
    },
    name: 'color-dropdown-menu',
    registryDependencies: [
      'dropdown-menu',
      'toolbar',
      'shadcn/separator',
      'button',
      'shadcn/tooltip',
    ],
    title: 'Color Dropdown Menu',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-comments'],
    description: 'A toolbar button for adding inline comments.',
    files: [{ path: 'ui/comment-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/comments' },
        {
          route:
            'https://pro.platejs.org/docs/components/comment-toolbar-button',
        },
      ],
      examples: ['comments-demo', 'floating-toolbar-demo', 'comments-pro'],
    },
    name: 'comment-toolbar-button',
    registryDependencies: ['comments-plugin'],
    title: 'Comment Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-comments', 'date-fns'],
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
      {
        path: 'ui/comment-create-form.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/comments' },
        { route: 'https://pro.platejs.org/docs/components/block-discussion' },
      ],
      examples: ['comments-demo', 'comments-pro'],
    },
    name: 'block-discussion',
    registryDependencies: [
      'suggestion-plugin',
      'button',
      'shadcn/popover',
      'shadcn/avatar',
      'dropdown-menu',
      'editor',
      'ai-leaf',
      'date-element',
      'emoji-input-element',
      'inline-equation-element',
      'link-element',
      'mention-element',
      'mention-input-element',
    ],
    title: 'Block Discussion',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-selection'],
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
    dependencies: [
      '@udecode/plate-dnd',
      '@udecode/plate-selection',
      '@udecode/plate-block-quote',
      '@udecode/plate-excalidraw',
      '@udecode/plate-heading',
      '@udecode/plate-layout',
      '@udecode/plate-table',
      '@udecode/plate-toggle',
      '@udecode/plate-media',
      'react-dnd',
      'react-dnd-html5-backend',
    ],
    description: 'A drag handle for moving editor blocks.',
    files: [{ path: 'ui/draggable.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/dnd', title: 'Drag & Drop' },
        { route: 'https://pro.platejs.org/docs/components/draggable' },
      ],
      examples: ['dnd-demo', 'dnd-pro'],
      usage: [
        `import { DndPlugin } from '@udecode/plate-dnd';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';`,
        `export function MyEditor() {
  const editor = usePlateEditor({
    plugins: [
      // ...otherPlugins,
      NodeIdPlugin,
      DndPlugin.configure({ options: { enableScroller: true } }),
    ],
    components: {
      // ...components
    },
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate editor={editor}>
        <PlateContent />
      </Plate>
    </DndProvider>
  );
}`,
      ],
      // Click the plus button next to the drag button to insert blocks
    },
    name: 'draggable',
    registryDependencies: ['shadcn/tooltip', 'use-mounted'],
    title: 'Draggable',
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
    dependencies: ['fzf@0.5.2', '@udecode/plate-tag', '@udecode/cmdk'],
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
      'tag-element',
    ],
    title: 'Select Editor',
    type: 'registry:ui',
  },
  {
    dependencies: [
      '@udecode/plate-emoji',
      '@emoji-mart/data@1.2.1',
      '@radix-ui/react-popover',
    ],
    description: 'A dropdown menu for emoji selection and insertion.',
    files: [
      { path: 'ui/emoji-dropdown-menu.tsx', type: 'registry:ui' },
      { path: 'ui/emoji-icons.tsx', type: 'registry:ui' },
      { path: 'ui/emoji-picker-content.tsx', type: 'registry:ui' },
      { path: 'ui/emoji-picker-navigation.tsx', type: 'registry:ui' },
      { path: 'ui/emoji-picker-preview.tsx', type: 'registry:ui' },
      {
        path: 'ui/emoji-picker-search-and-clear.tsx',
        type: 'registry:ui',
      },
      { path: 'ui/emoji-picker-search-bar.tsx', type: 'registry:ui' },
      { path: 'ui/emoji-picker.tsx', type: 'registry:ui' },
      { path: 'ui/emoji-toolbar-dropdown.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/emoji' },
        { route: 'https://pro.platejs.org/docs/components/emoji-picker' },
      ],
      examples: ['emoji-demo', 'emoji-pro'],
    },
    name: 'emoji-dropdown-menu',
    registryDependencies: ['toolbar'],
    title: 'Emoji Dropdown Menu',
    type: 'registry:ui',
  },
  {
    dependencies: [
      '@udecode/plate-basic-marks',
      '@udecode/plate-font',
      '@udecode/plate-indent-list',
      '@udecode/plate-media',
      '@udecode/plate-highlight',
    ],
    description: 'A set of commonly used formatting buttons.',
    files: [{ path: 'ui/fixed-toolbar-buttons.tsx', type: 'registry:ui' }],
    meta: {
      examples: ['basic-nodes-demo'],
    },
    name: 'fixed-toolbar-buttons',
    registryDependencies: [
      'toolbar',
      'ai-toolbar-button',
      'align-dropdown-menu',
      'color-dropdown-menu',
      'comment-toolbar-button',
      'emoji-dropdown-menu',
      'font-size-toolbar-button',
      'history-toolbar-button',
      'indent-list-toolbar-button',
      'indent-todo-toolbar-button',
      'indent-toolbar-button',
      'import-toolbar-button',
      'insert-dropdown-menu',
      'line-height-dropdown-menu',
      'link-toolbar-button',
      'mark-toolbar-button',
      'media-toolbar-button',
      'mode-dropdown-menu',
      'more-dropdown-menu',
      'outdent-toolbar-button',
      'table-dropdown-menu',
      'toggle-toolbar-button',
      'turn-into-dropdown-menu',
      'export-toolbar-button',
    ],
    title: 'Fixed Toolbar Buttons',
    type: 'registry:ui',
  },
  {
    dependencies: [
      '@udecode/plate-basic-marks',
      '@udecode/plate-font',
      '@udecode/plate-list',
      '@udecode/plate-media',
    ],
    files: [
      {
        path: 'ui/fixed-toolbar-list-buttons.tsx',
        type: 'registry:ui',
      },
    ],
    // description: 'A set of commonly used formatting buttons.',
    meta: {
      // examples: ['toolbar-demo'],
    },
    name: 'fixed-toolbar-list-buttons',
    registryDependencies: [
      'toolbar',
      'ai-toolbar-button',
      'align-dropdown-menu',
      'color-dropdown-menu',
      'comment-toolbar-button',
      'emoji-dropdown-menu',
      'insert-dropdown-menu',
      'line-height-dropdown-menu',
      'list-indent-toolbar-button',
      'link-toolbar-button',
      'mark-toolbar-button',
      'media-toolbar-button',
      'mode-dropdown-menu',
      'more-dropdown-menu',
      'table-dropdown-menu',
      'toggle-toolbar-button',
      'turn-into-dropdown-menu',
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
    registryDependencies: ['toolbar'],
    title: 'Fixed Toolbar',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-basic-marks'],
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
      'link-toolbar-button',
      'mark-toolbar-button',
      'more-dropdown-menu',
      'turn-into-dropdown-menu',
    ],
    title: 'Floating Toolbar Buttons',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-floating'],
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
    registryDependencies: ['toolbar'],
    title: 'Floating Toolbar',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-ai'],
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
      label: 'New',
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
    dependencies: ['@udecode/plate-indent'],
    files: [{ path: 'ui/indent-fire-marker.tsx', type: 'registry:ui' }],
    name: 'indent-fire-marker',
    title: 'Indent Fire Marker',
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
    dependencies: ['@udecode/plate-indent-list'],
    description: 'A toolbar control for adjusting list indentation.',
    files: [
      {
        path: 'ui/indent-list-toolbar-button.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [{ route: '/docs/indent-list' }],
      examples: ['list-demo'],
    },
    name: 'indent-list-toolbar-button',
    registryDependencies: ['toolbar'],
    title: 'Indent List Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-indent-list'],
    description: 'A checkbox marker for interactive todo lists.',
    files: [
      { path: 'ui/indent-todo-marker.tsx', type: 'registry:ui' },
      {
        path: 'ui/indent-todo-marker-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/indent-list' },
        { route: 'https://pro.platejs.org/docs/components/indent-todo-marker' },
      ],
      examples: ['list-demo'],
    },
    name: 'indent-todo-marker',
    registryDependencies: ['shadcn/checkbox'],
    title: 'Indent Todo Marker',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-indent-list'],
    description: 'A toolbar control for creating todo list items.',
    files: [
      {
        path: 'ui/indent-todo-toolbar-button.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [{ route: '/docs/indent-list' }],
      examples: ['list-demo'],
    },
    name: 'indent-todo-toolbar-button',
    registryDependencies: ['toolbar'],
    title: 'Indent Todo Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-indent'],
    description: 'A toolbar control for block indentation.',
    files: [{ path: 'ui/indent-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/indent' }],
      examples: ['indent-demo'],
    },
    name: 'indent-toolbar-button',
    registryDependencies: ['toolbar'],
    title: 'Indent Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-combobox', '@ariakit/react'],
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
    dependencies: [
      '@radix-ui/react-dropdown-menu',
      '@udecode/plate-block-quote',
      '@udecode/plate-code-block',
      '@udecode/plate-date',
      '@udecode/plate-excalidraw',
      '@udecode/plate-heading',
      '@udecode/plate-horizontal-rule',
      '@udecode/plate-indent-list',
      '@udecode/plate-link',
      '@udecode/plate-media',
      '@udecode/plate-table',
      '@udecode/plate-toggle',
    ],
    description: 'A menu for inserting different types of blocks.',
    files: [{ path: 'ui/insert-dropdown-menu.tsx', type: 'registry:ui' }],
    meta: {
      examples: ['basic-nodes-demo'],
    },
    name: 'insert-dropdown-menu',
    registryDependencies: ['dropdown-menu', 'toolbar', 'transforms'],
    title: 'Insert Dropdown Menu',
    type: 'registry:ui',
  },
  {
    dependencies: [
      '@udecode/plate-line-height',
      '@radix-ui/react-dropdown-menu',
    ],
    description: 'A menu for controlling text line spacing.',
    files: [
      {
        path: 'ui/line-height-dropdown-menu.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [{ route: '/docs/line-height' }],
      examples: ['line-height-demo'],
    },
    name: 'line-height-dropdown-menu',
    registryDependencies: ['toolbar', 'dropdown-menu'],
    title: 'Line Height Dropdown Menu',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-link', '@udecode/plate-floating'],
    description: 'A floating interface for link editing.',
    files: [{ path: 'ui/link-floating-toolbar.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/link' },
        { route: '/docs/api/floating' },
        {
          route:
            'https://pro.platejs.org/docs/components/link-floating-toolbar',
        },
      ],
      examples: ['link-demo', 'link-pro'],
    },
    name: 'link-floating-toolbar',
    registryDependencies: [
      'button',
      'shadcn/input',
      'shadcn/popover',
      'shadcn/separator',
    ],
    title: 'Link Floating Toolbar',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-link'],
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
    dependencies: ['@udecode/plate-list'],
    description: 'A toolbar control for indenting lists.',
    files: [
      {
        path: 'ui/list-indent-toolbar-button.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [{ route: '/docs/list' }],
      examples: ['list-demo'],
    },
    name: 'list-indent-toolbar-button',
    registryDependencies: ['toolbar'],
    title: 'List Indent Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-list'],
    description: 'A toolbar control for list creation and management.',
    files: [{ path: 'ui/list-toolbar-button.tsx', type: 'registry:ui' }],
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
    dependencies: ['@udecode/plate-basic-marks'],
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
    dependencies: ['@udecode/plate-media'],
    description: 'A popover interface for media settings.',
    files: [{ path: 'ui/media-popover.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/media' }],
      examples: ['media-demo', 'media-toolbar-pro'],
    },
    name: 'media-popover',
    registryDependencies: [
      'button',
      'shadcn/input',
      'shadcn/popover',
      'shadcn/separator',
    ],
    title: 'Media Popover',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-media', 'use-file-picker', 'sonner'],
    description: 'Toolbar button for inserting and managing media.',
    files: [{ path: 'ui/media-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/media' }],
      examples: ['media-demo', 'upload-pro'],
    },
    name: 'media-toolbar-button',
    registryDependencies: [
      'toolbar',
      'shadcn/input',
      'dropdown-menu',
      'shadcn/alert-dialog',
    ],
    title: 'Media Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-media', 'sonner'],
    description: 'Show toast notifications for media uploads.',
    files: [{ path: 'ui/media-upload-toast.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/media' }],
      examples: ['media-demo', 'upload-pro'],
    },
    name: 'media-upload-toast',
    registryDependencies: [],
    title: 'Media Upload Toast',
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-dropdown-menu'],
    description: 'A menu for switching between editor modes.',
    files: [{ path: 'ui/mode-dropdown-menu.tsx', type: 'registry:ui' }],
    meta: {
      examples: ['basic-nodes-demo'],
    },
    name: 'mode-dropdown-menu',
    registryDependencies: ['dropdown-menu', 'toolbar'],
    title: 'Mode Dropdown Menu',
    type: 'registry:ui',
  },
  {
    dependencies: [
      '@radix-ui/react-dropdown-menu',
      '@udecode/plate-basic-marks',
      '@udecode/plate-kbd',
    ],
    description: 'A menu for additional text formatting options.',
    files: [{ path: 'ui/more-dropdown-menu.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: 'https://pro.platejs.org/docs/components/more-dropdown-menu' },
      ],
      examples: ['basic-marks-demo', 'basic-nodes-pro'],
    },
    name: 'more-dropdown-menu',
    registryDependencies: ['dropdown-menu', 'toolbar'],
    title: 'More Dropdown Menu',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-indent'],
    description: 'A toolbar button for decreasing block indentation.',
    files: [{ path: 'ui/outdent-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/indent' }],
      examples: ['indent-demo'],
    },
    name: 'outdent-toolbar-button',
    registryDependencies: ['toolbar'],
    title: 'Outdent Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-heading'],
    description: 'A text placeholder for empty editor blocks.',
    files: [{ path: 'ui/placeholder.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/basic-elements' },
        { route: 'https://pro.platejs.org/docs/components/placeholder' },
      ],
      examples: ['basic-elements-demo', 'placeholder-pro'],
    },
    name: 'placeholder',
    registryDependencies: [],
    title: 'Placeholder',
    type: 'registry:ui',
  },
  {
    dependencies: ['react-resizable-panels'],
    description: 'A resizable wrapper with resize handles.',
    files: [{ path: 'ui/resizable.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/api/resizable' },
        { route: 'https://pro.platejs.org/docs/components/resizable' },
      ],
      examples: ['media-demo', 'media-toolbar-pro'],
    },
    name: 'resizable',
    registryDependencies: [],
    title: 'Resizable',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-table', '@radix-ui/react-dropdown-menu'],
    description: 'A menu for table manipulation and formatting.',
    files: [
      { path: 'ui/table-dropdown-menu.tsx', type: 'registry:ui' },
      { path: 'ui/table-icons.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/table' }],
      examples: ['table-demo'],
    },
    name: 'table-dropdown-menu',
    registryDependencies: ['dropdown-menu', 'toolbar'],
    title: 'Table Dropdown Menu',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-toggle'],
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
    dependencies: [
      '@radix-ui/react-dropdown-menu',
      '@udecode/plate-block-quote',
      '@udecode/plate-code-block',
      '@udecode/plate-heading',
      '@udecode/plate-indent-list',
      '@udecode/plate-toggle',
    ],
    description: 'A menu for converting between different block types.',
    files: [{ path: 'ui/turn-into-dropdown-menu.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        {
          route:
            'https://pro.platejs.org/docs/components/turn-into-dropdown-menu',
        },
      ],
      examples: ['basic-nodes-demo', 'basic-nodes-pro'],
    },
    name: 'turn-into-dropdown-menu',
    registryDependencies: ['dropdown-menu', 'toolbar', 'transforms'],
    title: 'Turn Into Dropdown Menu',
    type: 'registry:ui',
  },
  {
    dependencies: ['@slate-yjs/react'],
    description:
      'A cursor overlay to display multiplayer cursors in the yjs plugin.',
    files: [{ path: 'ui/remote-cursor-overlay.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/collaboration' }],
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
    registryDependencies: ['shadcn/tooltip', 'shadcn/separator'],
    title: 'Toolbar',
    type: 'registry:ui',
  },
];

export const uiNodes: Registry['items'] = [
  {
    dependencies: [],
    description: 'A text highlighter for AI-generated content.',
    files: [{ path: 'ui/ai-leaf.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/ai', title: 'AI' },
        {
          route: 'https://pro.platejs.org/docs/components/ai-leaf',
          title: 'AI Leaf',
        },
      ],
      examples: ['ai-demo', 'ai-pro'],
      label: 'New',
    },
    name: 'ai-leaf',
    registryDependencies: [],
    title: 'AI Leaf',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A quote component for block quotes.',
    files: [
      { path: 'ui/blockquote-element.tsx', type: 'registry:ui' },
      {
        path: 'ui/blockquote-element-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/basic-elements' },
        { route: 'https://pro.platejs.org/docs/components/blockquote-element' },
      ],
      examples: ['basic-elements-demo', 'basic-nodes-pro'],
    },
    name: 'blockquote-element',
    registryDependencies: [],
    title: 'Blockquote Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-code-block', 'lowlight'],
    description:
      'A code block with syntax highlighting and language selection.',
    files: [
      { path: 'ui/code-block-element.tsx', type: 'registry:ui' },
      {
        path: 'ui/code-block-element-static.tsx',
        type: 'registry:ui',
      },
      { path: 'ui/code-block-combobox.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/basic-elements' },
        { route: 'https://pro.platejs.org/docs/components/code-block-element' },
      ],
      examples: ['basic-elements-demo'],
    },
    name: 'code-block-element',
    registryDependencies: ['shadcn/command'],
    title: 'Code Block Element',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'An inline component for code snippets.',
    files: [
      { path: 'ui/code-leaf.tsx', type: 'registry:ui' },
      { path: 'ui/code-leaf-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/basic-marks' },
        { route: 'https://pro.platejs.org/docs/components/code-leaf' },
      ],
      examples: ['basic-marks-demo'],
    },
    name: 'code-leaf',
    registryDependencies: [],
    title: 'Code Leaf',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A line component for code blocks.',
    files: [
      { path: 'ui/code-line-element.tsx', type: 'registry:ui' },
      { path: 'ui/code-line-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/basic-elements' },
        { route: 'https://pro.platejs.org/docs/components/code-line-element' },
      ],
      examples: ['basic-elements-demo', 'basic-nodes-pro'],
    },
    name: 'code-line-element',
    registryDependencies: [],
    title: 'Code Line Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-code-block'],
    description: 'A syntax highlighting component for code blocks.',
    files: [
      { path: 'ui/code-syntax-leaf.tsx', type: 'registry:ui' },
      { path: 'ui/code-syntax-leaf-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/basic-elements' },
        { route: 'https://pro.platejs.org/docs/components/code-syntax-leaf' },
      ],
      examples: ['basic-elements-demo', 'basic-nodes-pro'],
    },
    name: 'code-syntax-leaf',
    registryDependencies: [],
    title: 'Code Syntax Leaf',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-layout', '@udecode/plate-resizable'],
    description: 'A resizable column component for layout.',
    files: [
      { path: 'ui/column-element.tsx', type: 'registry:ui' },
      { path: 'ui/column-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/column' },
        { route: 'https://pro.platejs.org/docs/components/column-element' },
      ],
      examples: ['column-demo'],
    },
    name: 'column-element',
    registryDependencies: ['resizable'],
    title: 'Column Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-layout'],
    description: 'A resizable column component for layout.',
    files: [
      { path: 'ui/column-group-element.tsx', type: 'registry:ui' },
      {
        path: 'ui/column-group-element-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/column' },
        {
          route: 'https://pro.platejs.org/docs/components/column-group-element',
        },
      ],
      examples: ['column-demo'],
    },
    name: 'column-group-element',
    registryDependencies: ['resizable'],
    title: 'Column Group Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-comments'],
    description:
      'A text component for displaying comments with visual indicators.',
    files: [
      { path: 'ui/comment-leaf.tsx', type: 'registry:ui' },
      { path: 'ui/comment-leaf-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/comments' },
        { route: 'https://pro.platejs.org/docs/components/comment-leaf' },
      ],
      examples: ['comments-demo', 'comments-pro'],
    },
    name: 'comment-leaf',
    registryDependencies: [],
    title: 'Comment Leaf',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-suggestion'],
    description: 'A text component for suggestion.',
    files: [
      { path: 'ui/suggestion-leaf.tsx', type: 'registry:ui' },
      { path: 'ui/suggestion-leaf-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/suggestion' }],
      examples: ['comments-demo', 'comments-pro'],
    },
    name: 'suggestion-leaf',
    registryDependencies: ['suggestion-plugin'],
    title: 'Suggestion Leaf',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-suggestion'],
    description: 'A line break component for suggestion.',
    files: [{ path: 'ui/suggestion-line-break.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/suggestion' }],
      examples: ['comments-demo', 'comments-pro'],
    },
    name: 'suggestion-line-break',
    registryDependencies: ['suggestion-plugin'],
    title: 'Suggestion Line Break',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-date'],
    description: 'A date field component with calendar picker.',
    files: [
      { path: 'ui/date-element.tsx', type: 'registry:ui' },
      { path: 'ui/date-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/date' },
        { route: 'https://pro.platejs.org/docs/components/date-element' },
      ],
      examples: ['date-demo'],
      label: 'New',
    },
    name: 'date-element',
    registryDependencies: ['shadcn/calendar'],
    title: 'Date Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-math', 'react-textarea-autosize'],
    description:
      'Displays a LaTeX equation element with an editable popover for inputting and rendering mathematical expressions.',
    files: [
      { path: 'ui/equation-element.tsx', type: 'registry:ui' },
      { path: 'ui/equation-element-static.tsx', type: 'registry:ui' },
      { path: 'ui/equation-popover.tsx', type: 'registry:ui' },
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
    name: 'equation-element',
    registryDependencies: ['shadcn/popover'],
    title: 'Equation Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-math'],
    description:
      'An inline LaTeX equation element with an editable popover for inputting and rendering mathematical expressions.',
    files: [
      { path: 'ui/inline-equation-element.tsx', type: 'registry:ui' },
      {
        path: 'ui/inline-equation-element-static.tsx',
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
      examples: ['equation-demo'],
    },
    name: 'inline-equation-element',
    registryDependencies: ['shadcn/popover'],
    title: 'Inline Equation Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-math'],
    description: 'A toolbar button for inserting and editing inline equations.',
    files: [
      {
        path: 'ui/inline-equation-toolbar-button.tsx',
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
    name: 'inline-equation-toolbar-button',
    registryDependencies: ['toolbar'],
    title: 'Inline Equation Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-emoji', '@emoji-mart/data@1.2.1'],
    description: 'An input component for emoji search and insertion.',
    files: [{ path: 'ui/emoji-input-element.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/emoji' },
        {
          route: 'https://pro.platejs.org/docs/components/emoji-input-element',
        },
      ],
      examples: ['emoji-demo'],
    },
    name: 'emoji-input-element',
    registryDependencies: ['inline-combobox', 'use-debounce'],
    title: 'Emoji Input Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-excalidraw'],
    description: 'A drawing component powered by Excalidraw.',
    files: [{ path: 'ui/excalidraw-element.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/excalidraw' }],
      // FIXME
      // examples: ['excalidraw-demo'],
    },
    name: 'excalidraw-element',
    registryDependencies: [],
    title: 'Excalidraw Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-font'],
    description: 'A toolbar control for adjusting font size.',
    files: [{ path: 'ui/font-size-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/font' }],
      examples: ['list-demo'],
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
      { path: 'ui/heading-element.tsx', type: 'registry:ui' },
      { path: 'ui/heading-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/basic-elements' },
        { route: 'https://pro.platejs.org/docs/components/heading-element' },
      ],
      examples: ['basic-elements-demo', 'basic-nodes-pro'],
    },
    name: 'heading-element',
    registryDependencies: [],
    title: 'Heading Element',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A text highlighter with customizable colors.',
    files: [
      { path: 'ui/highlight-leaf.tsx', type: 'registry:ui' },
      { path: 'ui/highlight-leaf-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/highlight' }],
      examples: ['highlight-demo'],
    },
    name: 'highlight-leaf',
    registryDependencies: [],
    title: 'Highlight Leaf',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A horizontal rule component with focus states.',
    files: [
      { path: 'ui/hr-element.tsx', type: 'registry:ui' },
      { path: 'ui/hr-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/horizontal-rule' },
        { route: 'https://pro.platejs.org/docs/components/hr-element' },
      ],
      examples: ['horizontal-rule-demo'],
    },
    name: 'hr-element',
    registryDependencies: [],
    title: 'Horizontal Rule Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-media', '@udecode/plate-resizable'],
    description:
      'Image element with lazy loading, resizing capabilities, and optional caption.',
    files: [
      { path: 'ui/image-element.tsx', type: 'registry:ui' },
      { path: 'ui/image-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        { route: '/docs/api/resizable' },
        { route: 'https://pro.platejs.org/docs/components/image-element' },
      ],
      examples: ['media-demo', 'media-toolbar-pro'],
    },
    name: 'image-element',
    registryDependencies: ['media-popover', 'caption', 'resizable'],
    title: 'Image Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-media'],
    description: 'A modal component for previewing and manipulating images.',
    files: [{ path: 'ui/image-preview.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/media' },
        { route: 'https://pro.platejs.org/docs/components/image-preview' },
      ],
      examples: ['media-demo', 'media-toolbar-pro'],
    },
    name: 'image-preview',
    registryDependencies: [],
    title: 'Image Preview',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-kbd'],
    description: 'A component for styling keyboard shortcuts.',
    files: [
      { path: 'ui/kbd-leaf.tsx', type: 'registry:ui' },
      { path: 'ui/kbd-leaf-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/kbd', title: 'Keyboard Input' }],
      examples: ['kbd-demo'],
    },
    name: 'kbd-leaf',
    registryDependencies: [],
    title: 'Keyboard Input Leaf',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-link'],
    description: 'A component for rendering hyperlinks with hover states.',
    files: [
      { path: 'ui/link-element.tsx', type: 'registry:ui' },
      { path: 'ui/link-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/link' },
        { route: 'https://pro.platejs.org/docs/components/link-element' },
      ],
      examples: ['link-demo'],
    },
    name: 'link-element',
    registryDependencies: [],
    title: 'Link Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-list'],
    description: 'A list element for ordered and unordered items.',
    files: [{ path: 'ui/list-element.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/list' }],
      examples: ['list-demo'],
    },
    name: 'list-element',
    registryDependencies: [],
    title: 'List Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-media', '@udecode/plate-resizable'],
    description: 'An audio player component with caption support.',
    files: [
      { path: 'ui/media-audio-element.tsx', type: 'registry:ui' },
      {
        path: 'ui/media-audio-element-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        {
          route: 'https://pro.platejs.org/docs/components/media-audio-element',
        },
      ],
      examples: ['media-demo', 'upload-pro'],
    },
    name: 'media-audio-element',
    registryDependencies: ['caption'],
    title: 'Media Audio Element',
    type: 'registry:ui',
  },
  {
    dependencies: [
      '@udecode/plate-media',
      '@udecode/plate-resizable',
      'react-tweet',
      'react-lite-youtube-embed',
    ],
    description:
      'A component for embedded media content with resizing and caption support.',
    files: [{ path: 'ui/media-embed-element.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/media' },
        { route: '/docs/api/resizable' },
        {
          route: 'https://pro.platejs.org/docs/components/media-embed-element',
        },
      ],
      examples: ['media-demo', 'upload-pro'],
    },
    name: 'media-embed-element',
    registryDependencies: ['media-popover', 'caption', 'resizable'],
    title: 'Media Embed Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-media', '@udecode/plate-resizable'],
    description:
      'A file attachment component with download capability and caption.',
    files: [
      { path: 'ui/media-file-element.tsx', type: 'registry:ui' },
      {
        path: 'ui/media-file-element-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        { route: 'https://pro.platejs.org/docs/components/media-file-element' },
      ],
      examples: ['media-demo', 'upload-pro'],
    },
    name: 'media-file-element',
    registryDependencies: ['caption'],
    title: 'Media File Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-media', 'use-file-picker'],
    description: 'A placeholder for media upload progress indication.',
    files: [
      {
        path: 'ui/media-placeholder-element.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        {
          route:
            'https://pro.platejs.org/docs/components/media-placeholder-element',
        },
      ],
      examples: ['media-demo', 'upload-pro'],
    },
    name: 'media-placeholder-element',
    registryDependencies: ['uploadthing'],
    title: 'Media Placeholder Element',
    type: 'registry:ui',
  },
  {
    dependencies: [
      '@udecode/plate-media',
      '@udecode/plate-resizable',
      'react-player',
      'react-lite-youtube-embed',
    ],
    description:
      'A video player component with YouTube and file upload support.',
    files: [
      { path: 'ui/media-video-element.tsx', type: 'registry:ui' },
      {
        path: 'ui/media-video-element-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        { route: '/docs/api/resizable' },
        {
          route: 'https://pro.platejs.org/docs/components/media-video-element',
        },
      ],
      examples: ['media-demo', 'upload-pro'],
    },
    name: 'media-video-element',
    registryDependencies: ['media-popover', 'caption', 'resizable'],
    title: 'Media Video Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-mention'],
    description: 'A mention element with customizable prefix and label.',
    files: [
      { path: 'ui/mention-element.tsx', type: 'registry:ui' },
      { path: 'ui/mention-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/mention' },
        { route: 'https://pro.platejs.org/docs/components/mention-element' },
      ],
      examples: ['mention-demo'],
    },
    name: 'mention-element',
    registryDependencies: ['use-mounted'],
    title: 'Mention Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-mention'],
    description: 'An input component for user mentions with autocomplete.',
    files: [{ path: 'ui/mention-input-element.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/mention' },
        {
          route:
            'https://pro.platejs.org/docs/components/mention-input-element',
        },
      ],
      examples: ['mention-demo'],
    },
    name: 'mention-input-element',
    registryDependencies: ['inline-combobox'],
    title: 'Mention Input Element',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A paragraph block with background color support.',
    files: [
      { path: 'ui/paragraph-element.tsx', type: 'registry:ui' },
      { path: 'ui/paragraph-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/basic-elements' },
        { route: 'https://pro.platejs.org/docs/components/paragraph-element' },
      ],
      examples: ['basic-elements-demo', 'basic-nodes-pro'],
    },
    name: 'paragraph-element',
    registryDependencies: [],
    title: 'Paragraph Element',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A component that highlights search results in text.',
    files: [{ path: 'ui/search-highlight-leaf.tsx', type: 'registry:ui' }],
    meta: {
      // examples: ['find-replace-demo'],
      docs: [{ route: '/docs/highlight' }],
    },
    name: 'search-highlight-leaf',
    registryDependencies: [],
    title: 'Search Highlight Leaf',
    type: 'registry:ui',
  },
  {
    dependencies: [
      '@udecode/plate-ai',
      '@udecode/plate-block-quote',
      '@udecode/plate-code-block',
      '@udecode/plate-date',
      '@udecode/plate-heading',
      '@udecode/plate-indent-list',
      '@udecode/plate-table',
      '@udecode/plate-toggle',
    ],
    description: 'A command input component for inserting various elements.',
    files: [{ path: 'ui/slash-input-element.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/slash-command', title: 'Slash' },
        {
          route: 'https://pro.platejs.org/docs/components/slash-input-element',
        },
      ],
      examples: ['slash-command-demo', 'slash-menu-pro'],
      label: 'New',
    },
    name: 'slash-input-element',
    registryDependencies: ['inline-combobox', 'transforms'],
    title: 'Slash Input Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-table'],
    description: 'A table cell with resizable borders and selection.',
    files: [
      { path: 'ui/table-cell-element.tsx', type: 'registry:ui' },
      {
        path: 'ui/table-cell-element-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/table' },
        { route: 'https://pro.platejs.org/docs/components/table-cell-element' },
      ],
      examples: ['table-demo'],
    },
    name: 'table-cell-element',
    registryDependencies: ['resizable'],
    title: 'Table Cell Element',
    type: 'registry:ui',
  },
  {
    dependencies: [
      '@udecode/plate-table',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
    ],
    description:
      'A table component with floating toolbar and border customization.',
    files: [
      { path: 'ui/table-element.tsx', type: 'registry:ui' },
      { path: 'ui/table-icons.tsx', type: 'registry:ui' },
      { path: 'ui/table-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/table' },
        { route: 'https://pro.platejs.org/docs/components/table-element' },
      ],
      examples: ['table-demo'],
    },
    name: 'table-element',
    registryDependencies: ['dropdown-menu'],
    title: 'Table Element',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A table row component with optional border hiding.',
    files: [
      { path: 'ui/table-row-element.tsx', type: 'registry:ui' },
      { path: 'ui/table-row-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/table' },
        { route: 'https://pro.platejs.org/docs/components/table-row-element' },
      ],
      examples: ['table-demo'],
    },
    name: 'table-row-element',
    registryDependencies: [],
    title: 'Table Row Element',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A tag element component with selection states and styling.',
    files: [{ path: 'ui/tag-element.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/multi-select' },
        // route: 'https://pro.platejs.org/docs/components/tag-element' },
      ],
      examples: [`select-editor-demo`],
    },
    name: 'tag-element',
    registryDependencies: [],
    title: 'Tag Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-heading'],
    description:
      'A table of contents component with links to document headings.',
    files: [
      { path: 'ui/toc-element.tsx', type: 'registry:ui' },
      { path: 'ui/toc-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/basic-elements' },
        { route: 'https://pro.platejs.org/docs/components/toc-element' },
      ],
      examples: ['toc-demo', 'toc-pro'],
      label: 'New',
      // - Responsive design that adapts to different screen sizes
      // - Dynamic highlighting of the corresponding thumbnail on the right side based on the current section
      // - Hover thumbnail to see the preview of the section with smooth animation
      // - Elegant transition effects when navigating between sections
      // - Animated highlighting of the current section in the sidebar
    },
    name: 'toc-element',
    registryDependencies: [],
    title: 'TOC Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-list'],
    description: 'A checkbox list element with interactive todo items.',
    files: [{ path: 'ui/todo-list-element.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/list' }],
      examples: ['list-demo'],
    },
    name: 'todo-list-element',
    registryDependencies: ['shadcn/checkbox'],
    title: 'Todo List Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-toggle'],
    description: 'A collapsible component for toggling content visibility.',
    files: [
      { path: 'ui/toggle-element.tsx', type: 'registry:ui' },
      { path: 'ui/toggle-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/toggle' }],
      examples: ['toggle-demo'],
    },
    name: 'toggle-element',
    registryDependencies: ['button'],
    title: 'Toggle Element',
    type: 'registry:ui',
  },
];

export const uiPrimitives: Registry['items'] = [
  {
    dependencies: ['@radix-ui/react-slot'],
    description: 'Displays a button or a component that looks like a button.',
    files: [{ path: 'ui/button.tsx', type: 'registry:ui' }],
    meta: {
      links: {
        doc: 'https://ui.shadcn.com/docs/components/button',
      },
    },
    name: 'button',
    registryDependencies: [],
    title: 'Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-dropdown-menu'],
    description:
      'Displays a menu to the user — such as a set of actions or functions — triggered by a button.',
    files: [{ path: 'ui/dropdown-menu.tsx', type: 'registry:ui' }],
    meta: {
      links: {
        doc: 'https://ui.shadcn.com/docs/components/dropdown-menu',
      },
    },
    name: 'dropdown-menu',
    registryDependencies: [],
    title: 'Dropdown Menu',
    type: 'registry:ui',
  },
];

export const ui: Registry['items'] = [
  ...uiComponents,
  ...uiNodes,
  ...uiPrimitives,
];
