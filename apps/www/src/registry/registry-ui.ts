import type { Registry } from 'shadcn/registry';

import { siteConfig } from '../config/site';

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
      { path: 'registry/ui/ai-menu.tsx', type: 'registry:ui' },
      { path: 'registry/ui/ai-loading-bar.tsx', type: 'registry:ui' },
      { path: 'registry/ui/ai-anchor-element.tsx', type: 'registry:ui' },
      { path: 'registry/ui/ai-menu-items.tsx', type: 'registry:ui' },
      { path: 'registry/ui/ai-chat-editor.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/ai', title: 'AI' },
        {
          route: siteConfig.links.plateProComponent('ai-menu'),
          title: 'AI Menu',
        },
      ],
      examples: ['ai-demo', 'ai-pro'],
      label: 'New',
    },
    name: 'ai-menu',
    registryDependencies: [
      'https://platejs.org/r/styles/default/use-chat.json',
      'https://platejs.org/r/styles/default/command.json',
      'https://platejs.org/r/styles/default/popover.json',
      'https://platejs.org/r/styles/default/editor.json',
    ],
    title: 'AI Menu',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-ai'],
    description: 'A toolbar button for accessing AI features.',
    files: [{ path: 'registry/ui/ai-toolbar-button.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/ai', title: 'AI' },
        { route: siteConfig.links.plateProComponent('ai-toolbar-button') },
      ],
      examples: ['ai-demo', 'floating-toolbar-demo', 'ai-pro'],
      label: 'New',
    },
    name: 'ai-toolbar-button',
    registryDependencies: ['https://platejs.org/r/styles/default/toolbar.json'],
    title: 'AI Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-alignment', '@radix-ui/react-dropdown-menu'],
    description: 'A dropdown menu for text alignment controls.',
    files: [
      { path: 'registry/ui/align-dropdown-menu.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/alignment' }],
      examples: ['align-demo'],
    },
    name: 'align-dropdown-menu',
    registryDependencies: [
      'https://platejs.org/r/styles/default/dropdown-menu.json',
      'https://platejs.org/r/styles/default/toolbar.json',
    ],
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
    files: [
      { path: 'registry/ui/block-context-menu.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/block-menu' },
        { route: siteConfig.links.plateProComponent('block-context-menu') },
      ],
      examples: ['block-menu-demo', 'block-menu-pro'],
      label: 'New',
    },
    name: 'block-context-menu',
    registryDependencies: [
      'https://platejs.org/r/styles/default/calendar.json',
      'https://platejs.org/r/styles/default/context-menu.json',
      'https://platejs.org/r/styles/default/use-is-touch-device.json',
    ],
    title: 'Block Context Menu',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-selection'],
    description: 'A visual overlay for selected blocks.',
    files: [{ path: 'registry/ui/block-selection.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/block-selection' },
        { route: siteConfig.links.plateProComponent('block-selection') },
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
    files: [
      { path: 'registry/ui/import-toolbar-button.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/import', title: 'Import' }],
      examples: ['basic-nodes-demo'],
      label: 'New',
    },
    name: 'import-toolbar-button',
    registryDependencies: [
      'https://platejs.org/r/styles/default/dropdown-menu.json',
      'https://platejs.org/r/styles/default/toolbar.json',
    ],
    title: 'Import Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['html2canvas-pro', 'pdf-lib'],
    description: 'A toolbar button to export editor content as PDF.',
    files: [
      { path: 'registry/ui/export-toolbar-button.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/export', title: 'Export' }],
      examples: ['basic-nodes-demo'],
      label: 'New',
    },
    name: 'export-toolbar-button',
    registryDependencies: ['https://platejs.org/r/styles/default/toolbar.json'],
    title: 'Export Toolbar Button',
    type: 'registry:ui',
  },

  {
    dependencies: ['@udecode/plate-caption'],
    description: 'A text field for adding captions to media elements.',
    files: [{ path: 'registry/ui/caption.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/caption' },
        { route: siteConfig.links.plateProComponent('caption') },
      ],
      examples: [
        'media-demo',
        // 'upload-demo'
      ],
    },
    name: 'caption',
    registryDependencies: ['https://platejs.org/r/styles/default/button.json'],
    title: 'Caption',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-font', '@radix-ui/react-dropdown-menu'],
    description: 'A color picker with text and background color controls.',
    files: [
      { path: 'registry/ui/color-constants.ts', type: 'registry:ui' },
      {
        path: 'registry/ui/color-dropdown-menu-items.tsx',
        type: 'registry:ui',
      },
      { path: 'registry/ui/color-dropdown-menu.tsx', type: 'registry:ui' },
      { path: 'registry/ui/color-input.tsx', type: 'registry:ui' },
      { path: 'registry/ui/color-picker.tsx', type: 'registry:ui' },
      { path: 'registry/ui/colors-custom.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/font' },
        { route: siteConfig.links.plateProComponent('color-dropdown-menu') },
      ],
      examples: ['font-demo'],
      //       1. Text color can be modified using the floating toolbar or block menu, providing more flexibility in formatting.
      // 2. An improved color picker interface with custom color options and a color input field for precise color selection.
    },
    name: 'color-dropdown-menu',
    registryDependencies: [
      'https://platejs.org/r/styles/default/dropdown-menu.json',
      'https://platejs.org/r/styles/default/toolbar.json',
      'https://platejs.org/r/styles/default/separator.json',
      'https://platejs.org/r/styles/default/button.json',
      'https://platejs.org/r/styles/default/tooltip.json',
    ],
    title: 'Color Dropdown Menu',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-comments'],
    description: 'A toolbar button for adding inline comments.',
    files: [
      { path: 'registry/ui/comment-toolbar-button.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/comments' },
        { route: siteConfig.links.plateProComponent('comment-toolbar-button') },
      ],
      examples: ['comments-demo', 'floating-toolbar-demo', 'comments-pro'],
    },
    name: 'comment-toolbar-button',
    registryDependencies: [
      'https://platejs.org/r/styles/default/comments-plugin.json',
    ],
    title: 'Comment Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-comments', 'date-fns'],
    description:
      'A popover interface for managing discussions: comments, replies, suggestions.',
    files: [
      {
        path: 'registry/ui/block-discussion.tsx',
        type: 'registry:ui',
      },
      {
        path: 'registry/ui/block-suggestion.tsx',
        type: 'registry:ui',
      },
      {
        path: 'registry/ui/comment.tsx',
        type: 'registry:ui',
      },
      {
        path: 'registry/ui/comment-create-form.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/comments' },
        { route: siteConfig.links.plateProComponent('block-discussion') },
      ],
      examples: ['comments-demo', 'comments-pro'],
    },
    name: 'block-discussion',
    registryDependencies: [
      'https://platejs.org/r/styles/default/suggestion-plugin.json',
      'https://platejs.org/r/styles/default/button.json',
      'https://platejs.org/r/styles/default/popover.json',
      'https://platejs.org/r/styles/default/avatar.json',
      'https://platejs.org/r/styles/default/dropdown-menu.json',
      'https://platejs.org/r/styles/default/editor.json',
      'https://platejs.org/r/styles/default/ai-leaf.json',
      'https://platejs.org/r/styles/default/avatar.json',
      'https://platejs.org/r/styles/default/date-element.json',
      'https://platejs.org/r/styles/default/emoji-input-element.json',
      'https://platejs.org/r/styles/default/inline-equation-element.json',
      'https://platejs.org/r/styles/default/link-element.json',
      'https://platejs.org/r/styles/default/mention-element.json',
      'https://platejs.org/r/styles/default/mention-input-element.json',
    ],
    title: 'Block Discussion',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-selection'],
    description: 'A visual overlay for cursors and selections.',
    files: [{ path: 'registry/ui/cursor-overlay.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/cursor-overlay' },
        { route: siteConfig.links.plateProComponent('cursor-overlay') },
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
    files: [{ path: 'registry/ui/draggable.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/dnd', title: 'Drag & Drop' },
        { route: siteConfig.links.plateProComponent('draggable') },
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
    override: {
      components: {
        // ...components
      },
    }
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
    registryDependencies: [
      'https://platejs.org/r/styles/default/tooltip.json',
      'https://platejs.org/r/styles/default/use-mounted.json',
    ],
    title: 'Draggable',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A container for the editor content and styling.',
    files: [
      { path: 'registry/ui/editor.tsx', type: 'registry:ui' },
      { path: 'registry/ui/editor-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: siteConfig.links.plateProComponent('editor') }],
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
    files: [{ path: 'registry/ui/select-editor.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/multi-select' }],
      examples: ['select-editor-demo'],
      label: 'New',
    },
    name: 'select-editor',
    registryDependencies: [
      'https://platejs.org/r/editor',
      'command',
      'popover',
      'https://platejs.org/r/tag-element',
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
      { path: 'registry/ui/emoji-dropdown-menu.tsx', type: 'registry:ui' },
      { path: 'registry/ui/emoji-icons.tsx', type: 'registry:ui' },
      { path: 'registry/ui/emoji-picker-content.tsx', type: 'registry:ui' },
      { path: 'registry/ui/emoji-picker-navigation.tsx', type: 'registry:ui' },
      { path: 'registry/ui/emoji-picker-preview.tsx', type: 'registry:ui' },
      {
        path: 'registry/ui/emoji-picker-search-and-clear.tsx',
        type: 'registry:ui',
      },
      { path: 'registry/ui/emoji-picker-search-bar.tsx', type: 'registry:ui' },
      { path: 'registry/ui/emoji-picker.tsx', type: 'registry:ui' },
      { path: 'registry/ui/emoji-toolbar-dropdown.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/emoji' },
        { route: siteConfig.links.plateProComponent('emoji-picker') },
      ],
      examples: ['emoji-demo', 'emoji-pro'],
    },
    name: 'emoji-dropdown-menu',
    registryDependencies: ['https://platejs.org/r/styles/default/toolbar.json'],
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
    files: [
      { path: 'registry/ui/fixed-toolbar-buttons.tsx', type: 'registry:ui' },
    ],
    meta: {
      examples: ['basic-nodes-demo'],
    },
    name: 'fixed-toolbar-buttons',
    registryDependencies: [
      'toolbar',
      'https://platejs.org/r/ai-toolbar-button',
      'https://platejs.org/r/align-dropdown-menu',
      'https://platejs.org/r/color-dropdown-menu',
      'https://platejs.org/r/comment-toolbar-button',
      'https://platejs.org/r/emoji-dropdown-menu',
      'https://platejs.org/r/font-size-toolbar-button',
      'https://platejs.org/r/history-toolbar-button',
      'https://platejs.org/r/indent-list-toolbar-button',
      'https://platejs.org/r/indent-todo-toolbar-button',
      'https://platejs.org/r/indent-toolbar-button',
      'https://platejs.org/r/import-toolbar-button',
      'https://platejs.org/r/insert-dropdown-menu',
      'https://platejs.org/r/line-height-dropdown-menu',
      'https://platejs.org/r/link-toolbar-button',
      'https://platejs.org/r/mark-toolbar-button',
      'https://platejs.org/r/media-toolbar-button',
      'https://platejs.org/r/mode-dropdown-menu',
      'https://platejs.org/r/more-dropdown-menu',
      'https://platejs.org/r/outdent-toolbar-button',
      'https://platejs.org/r/table-dropdown-menu',
      'https://platejs.org/r/toggle-toolbar-button',
      'https://platejs.org/r/turn-into-dropdown-menu',
      'https://platejs.org/r/export-toolbar-button',
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
        path: 'registry/ui/fixed-toolbar-list-buttons.tsx',
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
      'https://platejs.org/r/ai-toolbar-button',
      'https://platejs.org/r/align-dropdown-menu',
      'https://platejs.org/r/color-dropdown-menu',
      'https://platejs.org/r/comment-toolbar-button',
      'https://platejs.org/r/emoji-dropdown-menu',
      'https://platejs.org/r/insert-dropdown-menu',
      'https://platejs.org/r/line-height-dropdown-menu',
      'https://platejs.org/r/list-indent-toolbar-button',
      'https://platejs.org/r/link-toolbar-button',
      'https://platejs.org/r/mark-toolbar-button',
      'https://platejs.org/r/media-toolbar-button',
      'https://platejs.org/r/mode-dropdown-menu',
      'https://platejs.org/r/more-dropdown-menu',
      'https://platejs.org/r/table-dropdown-menu',
      'https://platejs.org/r/toggle-toolbar-button',
      'https://platejs.org/r/turn-into-dropdown-menu',
    ],
    title: 'Fixed Toolbar List Buttons',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A fixed toolbar that stays at the top of the editor.',
    files: [{ path: 'registry/ui/fixed-toolbar.tsx', type: 'registry:ui' }],
    meta: {
      examples: ['basic-nodes-demo'],
    },
    name: 'fixed-toolbar',
    registryDependencies: ['https://platejs.org/r/styles/default/toolbar.json'],
    title: 'Fixed Toolbar',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-basic-marks'],
    description: 'A set of formatting buttons for the floating toolbar.',
    files: [
      { path: 'registry/ui/floating-toolbar-buttons.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/api/floating' },
        {
          route: siteConfig.links.plateProComponent('floating-toolbar-buttons'),
        },
      ],
      examples: ['floating-toolbar-demo', 'floating-toolbar-pro'],
    },
    name: 'floating-toolbar-buttons',
    registryDependencies: [
      'toolbar',
      'https://platejs.org/r/ai-toolbar-button',
      'https://platejs.org/r/comment-toolbar-button',
      'https://platejs.org/r/link-toolbar-button',
      'https://platejs.org/r/mark-toolbar-button',
      'https://platejs.org/r/more-dropdown-menu',
      'https://platejs.org/r/turn-into-dropdown-menu',
    ],
    title: 'Floating Toolbar Buttons',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-floating'],
    description: 'A contextual toolbar that appears over selected text.',
    files: [{ path: 'registry/ui/floating-toolbar.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/api/floating' },
        { route: siteConfig.links.plateProComponent('floating-toolbar') },
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
    files: [{ path: 'registry/ui/ghost-text.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        {
          route: '/docs/copilot',
        },
        { route: siteConfig.links.plateProComponent('ghost-text') },
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
    files: [
      { path: 'registry/ui/indent-fire-marker.tsx', type: 'registry:ui' },
    ],
    name: 'indent-fire-marker',
    title: 'Indent Fire Marker',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'Toolbar buttons for undo and redo operations.',
    files: [
      { path: 'registry/ui/history-toolbar-button.tsx', type: 'registry:ui' },
    ],
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
    registryDependencies: ['https://platejs.org/r/styles/default/toolbar.json'],
    title: 'History Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-indent-list'],
    description: 'A toolbar control for adjusting list indentation.',
    files: [
      {
        path: 'registry/ui/indent-list-toolbar-button.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [{ route: '/docs/indent-list' }],
      examples: ['list-demo'],
    },
    name: 'indent-list-toolbar-button',
    registryDependencies: ['https://platejs.org/r/styles/default/toolbar.json'],
    title: 'Indent List Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-indent-list'],
    description: 'A checkbox marker for interactive todo lists.',
    files: [
      { path: 'registry/ui/indent-todo-marker.tsx', type: 'registry:ui' },
      {
        path: 'registry/ui/indent-todo-marker-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/indent-list' },
        { route: siteConfig.links.plateProComponent('indent-todo-marker') },
      ],
      examples: ['list-demo'],
    },
    name: 'indent-todo-marker',
    registryDependencies: [
      'https://platejs.org/r/styles/default/checkbox.json',
    ],
    title: 'Indent Todo Marker',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-indent-list'],
    description: 'A toolbar control for creating todo list items.',
    files: [
      {
        path: 'registry/ui/indent-todo-toolbar-button.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [{ route: '/docs/indent-list' }],
      examples: ['list-demo'],
    },
    name: 'indent-todo-toolbar-button',
    registryDependencies: ['https://platejs.org/r/styles/default/toolbar.json'],
    title: 'Indent Todo Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-indent'],
    description: 'A toolbar control for block indentation.',
    files: [
      { path: 'registry/ui/indent-toolbar-button.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/indent' }],
      examples: ['indent-demo'],
    },
    name: 'indent-toolbar-button',
    registryDependencies: ['https://platejs.org/r/styles/default/toolbar.json'],
    title: 'Indent Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-combobox', '@ariakit/react'],
    description: 'A combobox for inline suggestions.',
    files: [{ path: 'registry/ui/inline-combobox.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/combobox' },
        { route: siteConfig.links.plateProComponent('inline-combobox') },
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
    files: [
      { path: 'registry/ui/insert-dropdown-menu.tsx', type: 'registry:ui' },
    ],
    meta: {
      examples: ['basic-nodes-demo'],
    },
    name: 'insert-dropdown-menu',
    registryDependencies: [
      'dropdown-menu',
      'toolbar',
      'https://platejs.org/r/styles/default/transforms.json',
    ],
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
        path: 'registry/ui/line-height-dropdown-menu.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [{ route: '/docs/line-height' }],
      examples: ['line-height-demo'],
    },
    name: 'line-height-dropdown-menu',
    registryDependencies: [
      'https://platejs.org/r/styles/default/toolbar.json',
      'https://platejs.org/r/styles/default/dropdown-menu.json',
    ],
    title: 'Line Height Dropdown Menu',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-link', '@udecode/plate-floating'],
    description: 'A floating interface for link editing.',
    files: [
      { path: 'registry/ui/link-floating-toolbar.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/link' },
        { route: '/docs/api/floating' },
        { route: siteConfig.links.plateProComponent('link-floating-toolbar') },
      ],
      examples: ['link-demo', 'link-pro'],
    },
    name: 'link-floating-toolbar',
    registryDependencies: [
      'https://platejs.org/r/styles/default/button.json',
      'https://platejs.org/r/styles/default/input.json',
      'https://platejs.org/r/styles/default/popover.json',
      'https://platejs.org/r/styles/default/separator.json',
    ],
    title: 'Link Floating Toolbar',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-link'],
    description: 'A toolbar control for link management.',
    files: [
      { path: 'registry/ui/link-toolbar-button.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/link' },
        { route: siteConfig.links.plateProComponent('link-toolbar-button') },
      ],
      examples: ['link-demo', 'link-pro'],
    },
    name: 'link-toolbar-button',
    registryDependencies: ['https://platejs.org/r/styles/default/toolbar.json'],
    title: 'Link Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-list'],
    description: 'A toolbar control for indenting lists.',
    files: [
      {
        path: 'registry/ui/list-indent-toolbar-button.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [{ route: '/docs/list' }],
      examples: ['list-demo'],
    },
    name: 'list-indent-toolbar-button',
    registryDependencies: ['https://platejs.org/r/styles/default/toolbar.json'],
    title: 'List Indent Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-list'],
    description: 'A toolbar control for list creation and management.',
    files: [
      { path: 'registry/ui/list-toolbar-button.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/list' }],
      examples: ['list-demo'],
    },
    name: 'list-toolbar-button',
    registryDependencies: ['https://platejs.org/r/styles/default/toolbar.json'],
    title: 'List Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-basic-marks'],
    description: 'A toolbar control for basic text formatting.',
    files: [
      { path: 'registry/ui/mark-toolbar-button.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/basic-marks' }],
      examples: ['basic-marks-demo', 'basic-nodes-pro'],
    },
    name: 'mark-toolbar-button',
    registryDependencies: ['https://platejs.org/r/styles/default/toolbar.json'],
    title: 'Mark Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-media'],
    description: 'A popover interface for media settings.',
    files: [{ path: 'registry/ui/media-popover.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/media' }],
      examples: ['media-demo', 'media-toolbar-pro'],
    },
    name: 'media-popover',
    registryDependencies: [
      'https://platejs.org/r/styles/default/button.json',
      'https://platejs.org/r/styles/default/input.json',
      'https://platejs.org/r/styles/default/popover.json',
      'https://platejs.org/r/styles/default/separator.json',
    ],
    title: 'Media Popover',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-media', 'use-file-picker', 'sonner'],
    description: 'Toolbar button for inserting and managing media.',
    files: [
      { path: 'registry/ui/media-toolbar-button.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/media' }],
      examples: ['media-demo', 'upload-pro'],
    },
    name: 'media-toolbar-button',
    registryDependencies: [
      'https://platejs.org/r/styles/default/toolbar.json',
      'https://platejs.org/r/styles/default/input.json',
      'https://platejs.org/r/styles/default/dropdown-menu.json',
      'https://platejs.org/r/styles/default/alert-dialog.json',
    ],
    title: 'Media Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-media', 'sonner'],
    description: 'Show toast notifications for media uploads.',
    files: [
      { path: 'registry/ui/media-upload-toast.tsx', type: 'registry:ui' },
    ],
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
    files: [
      { path: 'registry/ui/mode-dropdown-menu.tsx', type: 'registry:ui' },
    ],
    meta: {
      examples: ['basic-nodes-demo'],
    },
    name: 'mode-dropdown-menu',
    registryDependencies: [
      'https://platejs.org/r/styles/default/dropdown-menu.json',
      'https://platejs.org/r/styles/default/toolbar.json',
    ],
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
    files: [
      { path: 'registry/ui/more-dropdown-menu.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: siteConfig.links.plateProComponent('more-dropdown-menu') },
      ],
      examples: ['basic-marks-demo', 'basic-nodes-pro'],
    },
    name: 'more-dropdown-menu',
    registryDependencies: [
      'https://platejs.org/r/styles/default/dropdown-menu.json',
      'https://platejs.org/r/styles/default/toolbar.json',
    ],
    title: 'More Dropdown Menu',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-indent'],
    description: 'A toolbar button for decreasing block indentation.',
    files: [
      { path: 'registry/ui/outdent-toolbar-button.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/indent' }],
      examples: ['indent-demo'],
    },
    name: 'outdent-toolbar-button',
    registryDependencies: ['https://platejs.org/r/styles/default/toolbar.json'],
    title: 'Outdent Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-heading'],
    description: 'A text placeholder for empty editor blocks.',
    files: [{ path: 'registry/ui/placeholder.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/basic-elements' },
        { route: siteConfig.links.plateProComponent('placeholder') },
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
    files: [{ path: 'registry/ui/resizable.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/api/resizable' },
        { route: siteConfig.links.plateProComponent('resizable') },
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
      { path: 'registry/ui/table-dropdown-menu.tsx', type: 'registry:ui' },
      { path: 'registry/ui/table-icons.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/table' }],
      examples: ['table-demo'],
    },
    name: 'table-dropdown-menu',
    registryDependencies: [
      'https://platejs.org/r/styles/default/dropdown-menu.json',
      'https://platejs.org/r/styles/default/toolbar.json',
    ],
    title: 'Table Dropdown Menu',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-toggle'],
    description: 'A toolbar button for expanding and collapsing blocks.',
    files: [
      { path: 'registry/ui/toggle-toolbar-button.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/toggle' }],
      examples: ['toggle-demo'],
    },
    name: 'toggle-toolbar-button',
    registryDependencies: ['https://platejs.org/r/styles/default/toolbar.json'],
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
    files: [
      { path: 'registry/ui/turn-into-dropdown-menu.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        {
          route: siteConfig.links.plateProComponent('turn-into-dropdown-menu'),
        },
      ],
      examples: ['basic-nodes-demo', 'basic-nodes-pro'],
    },
    name: 'turn-into-dropdown-menu',
    registryDependencies: [
      'https://platejs.org/r/styles/default/dropdown-menu.json',
      'https://platejs.org/r/styles/default/toolbar.json',
      'https://platejs.org/r/styles/default/transforms.json',
    ],
    title: 'Turn Into Dropdown Menu',
    type: 'registry:ui',
  },
  {
    dependencies: ['@slate-yjs/react'],
    description:
      'A cursor overlay to display multiplayer cursors in the yjs plugin.',
    files: [
      { path: 'registry/ui/remote-cursor-overlay.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/collaboration' }],
      examples: [],
    },
    name: 'remote-cursor-overlay',
    registryDependencies: [],
    title: 'Remote Cursor Overlay',
    type: 'registry:ui',
  },
];

export const uiNodes: Registry['items'] = [
  {
    dependencies: [],
    description: 'A text highlighter for AI-generated content.',
    files: [{ path: 'registry/ui/ai-leaf.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/ai', title: 'AI' },
        {
          route: siteConfig.links.plateProComponent('ai-leaf'),
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
      { path: 'registry/ui/blockquote-element.tsx', type: 'registry:ui' },
      {
        path: 'registry/ui/blockquote-element-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/basic-elements' },
        { route: siteConfig.links.plateProComponent('blockquote-element') },
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
      { path: 'registry/ui/code-block-element.tsx', type: 'registry:ui' },
      {
        path: 'registry/ui/code-block-element-static.tsx',
        type: 'registry:ui',
      },
      { path: 'registry/ui/code-block-combobox.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/basic-elements' },
        { route: siteConfig.links.plateProComponent('code-block-element') },
      ],
      examples: ['basic-elements-demo'],
    },
    name: 'code-block-element',
    registryDependencies: ['https://platejs.org/r/styles/default/command.json'],
    title: 'Code Block Element',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'An inline component for code snippets.',
    files: [
      { path: 'registry/ui/code-leaf.tsx', type: 'registry:ui' },
      { path: 'registry/ui/code-leaf-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/basic-marks' },
        { route: siteConfig.links.plateProComponent('code-leaf') },
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
      { path: 'registry/ui/code-line-element.tsx', type: 'registry:ui' },
      { path: 'registry/ui/code-line-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/basic-elements' },
        { route: siteConfig.links.plateProComponent('code-line-element') },
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
      { path: 'registry/ui/code-syntax-leaf.tsx', type: 'registry:ui' },
      { path: 'registry/ui/code-syntax-leaf-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/basic-elements' },
        { route: siteConfig.links.plateProComponent('code-syntax-leaf') },
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
      { path: 'registry/ui/column-element.tsx', type: 'registry:ui' },
      { path: 'registry/ui/column-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/column' },
        { route: siteConfig.links.plateProComponent('column-element') },
      ],
      examples: ['column-demo'],
    },
    name: 'column-element',
    registryDependencies: [
      'https://platejs.org/r/styles/default/resizable.json',
    ],
    title: 'Column Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-layout'],
    description: 'A resizable column component for layout.',
    files: [
      { path: 'registry/ui/column-group-element.tsx', type: 'registry:ui' },
      {
        path: 'registry/ui/column-group-element-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/column' },
        { route: siteConfig.links.plateProComponent('column-group-element') },
      ],
      examples: ['column-demo'],
    },
    name: 'column-group-element',
    registryDependencies: [
      'https://platejs.org/r/styles/default/command.json',
      'https://platejs.org/r/styles/default/resizable.json',
    ],
    title: 'Column Group Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-comments'],
    description:
      'A text component for displaying comments with visual indicators.',
    files: [
      { path: 'registry/ui/comment-leaf.tsx', type: 'registry:ui' },
      { path: 'registry/ui/comment-leaf-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/comments' },
        { route: siteConfig.links.plateProComponent('comment-leaf') },
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
      { path: 'registry/ui/suggestion-leaf.tsx', type: 'registry:ui' },
      { path: 'registry/ui/suggestion-leaf-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/suggestion' }],
      examples: ['comments-demo', 'comments-pro'],
    },
    name: 'suggestion-leaf',
    registryDependencies: [
      'https://platejs.org/r/styles/default/suggestion-plugin.json',
    ],
    title: 'Suggestion Leaf',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-suggestion'],
    description: 'A line break component for suggestion.',
    files: [
      { path: 'registry/ui/suggestion-line-break.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/suggestion' }],
      examples: ['comments-demo', 'comments-pro'],
    },
    name: 'suggestion-line-break',
    registryDependencies: [
      'https://platejs.org/r/styles/default/suggestion-plugin.json',
    ],
    title: 'Suggestion Line Break',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-date'],
    description: 'A date field component with calendar picker.',
    files: [
      { path: 'registry/ui/date-element.tsx', type: 'registry:ui' },
      { path: 'registry/ui/date-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/date' },
        { route: siteConfig.links.plateProComponent('date-element') },
      ],
      examples: ['date-demo'],
      label: 'New',
    },
    name: 'date-element',
    registryDependencies: [
      'https://platejs.org/r/styles/default/calendar.json',
    ],
    title: 'Date Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-math', 'react-textarea-autosize'],
    description:
      'Displays a LaTeX equation element with an editable popover for inputting and rendering mathematical expressions.',
    files: [
      { path: 'registry/ui/equation-element.tsx', type: 'registry:ui' },
      { path: 'registry/ui/equation-element-static.tsx', type: 'registry:ui' },
      { path: 'registry/ui/equation-popover.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        {
          route: 'https://platejs.org/docs/equation',
          title: 'Equation',
        },
      ],
      examples: ['equation-demo'],
    },
    name: 'equation-element',
    registryDependencies: ['https://platejs.org/r/styles/default/popover.json'],
    title: 'Equation Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-math'],
    description:
      'An inline LaTeX equation element with an editable popover for inputting and rendering mathematical expressions.',
    files: [
      { path: 'registry/ui/inline-equation-element.tsx', type: 'registry:ui' },
      {
        path: 'registry/ui/inline-equation-element-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        {
          route: 'https://platejs.org/docs/equation',
          title: 'Equation',
        },
      ],
      examples: ['equation-demo'],
    },
    name: 'inline-equation-element',
    registryDependencies: ['https://platejs.org/r/styles/default/popover.json'],
    title: 'Inline Equation Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-math'],
    description: 'A toolbar button for inserting and editing inline equations.',
    files: [
      {
        path: 'registry/ui/inline-equation-toolbar-button.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        {
          route: 'https://platejs.org/docs/equation',
          title: 'Equation',
        },
      ],
      examples: ['equation-demo', 'floating-toolbar-demo'],
    },
    name: 'inline-equation-toolbar-button',
    registryDependencies: ['https://platejs.org/r/styles/default/toolbar.json'],
    title: 'Inline Equation Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-emoji', '@emoji-mart/data@1.2.1'],
    description: 'An input component for emoji search and insertion.',
    files: [
      { path: 'registry/ui/emoji-input-element.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/emoji' },
        { route: siteConfig.links.plateProComponent('emoji-input-element') },
      ],
      examples: ['emoji-demo'],
    },
    name: 'emoji-input-element',
    registryDependencies: [
      'https://platejs.org/r/styles/default/inline-combobox.json',
      'https://platejs.org/r/styles/default/use-debounce.json',
    ],
    title: 'Emoji Input Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-excalidraw'],
    description: 'A drawing component powered by Excalidraw.',
    files: [
      { path: 'registry/ui/excalidraw-element.tsx', type: 'registry:ui' },
    ],
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
    files: [
      { path: 'registry/ui/font-size-toolbar-button.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/font' }],
      examples: ['list-demo'],
    },
    name: 'font-size-toolbar-button',
    registryDependencies: [
      'https://platejs.org/r/styles/default/popover.json',
      'https://platejs.org/r/styles/default/toolbar.json',
    ],
    title: 'Font Size Toolbar Button',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A heading with multiple level support.',
    files: [
      { path: 'registry/ui/heading-element.tsx', type: 'registry:ui' },
      { path: 'registry/ui/heading-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/basic-elements' },
        { route: siteConfig.links.plateProComponent('heading-element') },
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
      { path: 'registry/ui/highlight-leaf.tsx', type: 'registry:ui' },
      { path: 'registry/ui/highlight-leaf-static.tsx', type: 'registry:ui' },
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
      { path: 'registry/ui/hr-element.tsx', type: 'registry:ui' },
      { path: 'registry/ui/hr-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/horizontal-rule' },
        { route: siteConfig.links.plateProComponent('hr-element') },
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
      { path: 'registry/ui/image-element.tsx', type: 'registry:ui' },
      { path: 'registry/ui/image-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        { route: '/docs/api/resizable' },
        { route: siteConfig.links.plateProComponent('image-element') },
      ],
      examples: ['media-demo', 'media-toolbar-pro'],
    },
    name: 'image-element',
    registryDependencies: [
      'https://platejs.org/r/styles/default/media-popover.json',
      'https://platejs.org/r/styles/default/caption.json',
      'https://platejs.org/r/styles/default/resizable.json',
    ],
    title: 'Image Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-media'],
    description: 'A modal component for previewing and manipulating images.',
    files: [{ path: 'registry/ui/image-preview.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/media' },
        { route: siteConfig.links.plateProComponent('image-preview') },
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
      { path: 'registry/ui/kbd-leaf.tsx', type: 'registry:ui' },
      { path: 'registry/ui/kbd-leaf-static.tsx', type: 'registry:ui' },
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
      { path: 'registry/ui/link-element.tsx', type: 'registry:ui' },
      { path: 'registry/ui/link-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/link' },
        { route: siteConfig.links.plateProComponent('link-element') },
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
    files: [{ path: 'registry/ui/list-element.tsx', type: 'registry:ui' }],
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
      { path: 'registry/ui/media-audio-element.tsx', type: 'registry:ui' },
      {
        path: 'registry/ui/media-audio-element-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        { route: siteConfig.links.plateProComponent('media-audio-element') },
      ],
      examples: ['media-demo', 'upload-pro'],
    },
    name: 'media-audio-element',
    registryDependencies: ['https://platejs.org/r/styles/default/caption.json'],
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
    files: [
      { path: 'registry/ui/media-embed-element.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        { route: '/docs/api/resizable' },
        { route: siteConfig.links.plateProComponent('media-embed-element') },
      ],
      examples: ['media-demo', 'upload-pro'],
    },
    name: 'media-embed-element',
    registryDependencies: [
      'https://platejs.org/r/styles/default/media-popover.json',
      'https://platejs.org/r/styles/default/caption.json',
      'https://platejs.org/r/styles/default/resizable.json',
    ],
    title: 'Media Embed Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-media', '@udecode/plate-resizable'],
    description:
      'A file attachment component with download capability and caption.',
    files: [
      { path: 'registry/ui/media-file-element.tsx', type: 'registry:ui' },
      {
        path: 'registry/ui/media-file-element-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        { route: siteConfig.links.plateProComponent('media-file-element') },
      ],
      examples: ['media-demo', 'upload-pro'],
    },
    name: 'media-file-element',
    registryDependencies: ['https://platejs.org/r/styles/default/caption.json'],
    title: 'Media File Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-media', 'use-file-picker'],
    description: 'A placeholder for media upload progress indication.',
    files: [
      {
        path: 'registry/ui/media-placeholder-element.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        {
          route: siteConfig.links.plateProComponent(
            'media-placeholder-element'
          ),
        },
      ],
      examples: ['media-demo', 'upload-pro'],
    },
    name: 'media-placeholder-element',
    registryDependencies: [
      'https://platejs.org/r/styles/default/spinner.json',
      'https://platejs.org/r/styles/default/uploadthing.json',
    ],
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
      { path: 'registry/ui/media-video-element.tsx', type: 'registry:ui' },
      {
        path: 'registry/ui/media-video-element-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/media' },
        { route: '/docs/api/resizable' },
        { route: siteConfig.links.plateProComponent('media-video-element') },
      ],
      examples: ['media-demo', 'upload-pro'],
    },
    name: 'media-video-element',
    registryDependencies: [
      'https://platejs.org/r/styles/default/media-popover.json',
      'https://platejs.org/r/styles/default/caption.json',
      'https://platejs.org/r/styles/default/resizable.json',
    ],
    title: 'Media Video Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-mention'],
    description: 'A mention element with customizable prefix and label.',
    files: [
      { path: 'registry/ui/mention-element.tsx', type: 'registry:ui' },
      { path: 'registry/ui/mention-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/mention' },
        { route: siteConfig.links.plateProComponent('mention-element') },
      ],
      examples: ['mention-demo'],
    },
    name: 'mention-element',
    registryDependencies: [
      'https://platejs.org/r/styles/default/use-mounted.json',
    ],
    title: 'Mention Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-mention'],
    description: 'An input component for user mentions with autocomplete.',
    files: [
      { path: 'registry/ui/mention-input-element.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/mention' },
        { route: siteConfig.links.plateProComponent('mention-input-element') },
      ],
      examples: ['mention-demo'],
    },
    name: 'mention-input-element',
    registryDependencies: [
      'https://platejs.org/r/styles/default/inline-combobox.json',
    ],
    title: 'Mention Input Element',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A paragraph block with background color support.',
    files: [
      { path: 'registry/ui/paragraph-element.tsx', type: 'registry:ui' },
      { path: 'registry/ui/paragraph-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/basic-elements' },
        { route: siteConfig.links.plateProComponent('paragraph-element') },
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
    files: [
      { path: 'registry/ui/search-highlight-leaf.tsx', type: 'registry:ui' },
    ],
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
    files: [
      { path: 'registry/ui/slash-input-element.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/slash-command', title: 'Slash' },
        { route: siteConfig.links.plateProComponent('slash-input-element') },
      ],
      examples: ['slash-command-demo', 'slash-menu-pro'],
      label: 'New',
    },
    name: 'slash-input-element',
    registryDependencies: [
      'https://platejs.org/r/styles/default/inline-combobox.json',
      'https://platejs.org/r/styles/default/transforms.json',
    ],
    title: 'Slash Input Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-table'],
    description: 'A table cell with resizable borders and selection.',
    files: [
      { path: 'registry/ui/table-cell-element.tsx', type: 'registry:ui' },
      {
        path: 'registry/ui/table-cell-element-static.tsx',
        type: 'registry:ui',
      },
    ],
    meta: {
      docs: [
        { route: '/docs/table' },
        { route: siteConfig.links.plateProComponent('table-cell-element') },
      ],
      examples: ['table-demo'],
    },
    name: 'table-cell-element',
    registryDependencies: [
      'https://platejs.org/r/styles/default/resizable.json',
    ],
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
      { path: 'registry/ui/table-element.tsx', type: 'registry:ui' },
      { path: 'registry/ui/table-icons.tsx', type: 'registry:ui' },
      { path: 'registry/ui/table-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/table' },
        { route: siteConfig.links.plateProComponent('table-element') },
      ],
      examples: ['table-demo'],
    },
    name: 'table-element',
    registryDependencies: [
      'https://platejs.org/r/styles/default/dropdown-menu.json',
    ],
    title: 'Table Element',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description: 'A table row component with optional border hiding.',
    files: [
      { path: 'registry/ui/table-row-element.tsx', type: 'registry:ui' },
      { path: 'registry/ui/table-row-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/table' },
        { route: siteConfig.links.plateProComponent('table-row-element') },
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
    files: [{ path: 'registry/ui/tag-element.tsx', type: 'registry:ui' }],
    meta: {
      docs: [
        { route: '/docs/multi-select' },
        // { route: siteConfig.links.plateProComponent('tag-element') },
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
      { path: 'registry/ui/toc-element.tsx', type: 'registry:ui' },
      { path: 'registry/ui/toc-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [
        { route: '/docs/basic-elements' },
        { route: siteConfig.links.plateProComponent('toc-element') },
      ],
      examples: ['toc-demo', 'toc-pro'],
      label: 'New',
      //       - Responsive design that adapts to different screen sizes
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
    files: [{ path: 'registry/ui/todo-list-element.tsx', type: 'registry:ui' }],
    meta: {
      docs: [{ route: '/docs/list' }],
      examples: ['list-demo'],
    },
    name: 'todo-list-element',
    registryDependencies: [
      'https://platejs.org/r/styles/default/checkbox.json',
    ],
    title: 'Todo List Element',
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-toggle'],
    description: 'A collapsible component for toggling content visibility.',
    files: [
      { path: 'registry/ui/toggle-element.tsx', type: 'registry:ui' },
      { path: 'registry/ui/toggle-element-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      docs: [{ route: '/docs/toggle' }],
      examples: ['toggle-demo'],
    },
    name: 'toggle-element',
    registryDependencies: ['https://platejs.org/r/styles/default/button.json'],
    title: 'Toggle Element',
    type: 'registry:ui',
  },
];

export const uiPrimitives: Registry['items'] = [
  {
    dependencies: ['@radix-ui/react-alert-dialog'],
    description:
      'A modal dialog that interrupts the user with important content and expects a response.',
    files: [{ path: 'registry/ui/alert-dialog.tsx', type: 'registry:ui' }],
    meta: {
      links: {
        doc: 'https://ui.shadcn.com/docs/components/alert-dialog',
      },
    },
    name: 'alert-dialog',
    registryDependencies: ['https://platejs.org/r/styles/default/button.json'],
    title: 'Alert Dialog',
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-avatar'],
    description: 'An image element with a fallback for representing the user.',
    files: [{ path: 'registry/ui/avatar.tsx', type: 'registry:ui' }],
    meta: {
      links: {
        doc: 'https://ui.shadcn.com/docs/components/avatar',
      },
    },
    name: 'avatar',
    registryDependencies: [],
    title: 'Avatar',
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-slot'],
    description: 'Displays a button or a component that looks like a button.',
    files: [{ path: 'registry/ui/button.tsx', type: 'registry:ui' }],
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
    dependencies: ['react-day-picker@8.10.1'],
    description:
      'A date field component that allows users to enter and edit date.',
    files: [{ path: 'registry/ui/calendar.tsx', type: 'registry:ui' }],
    meta: {
      links: {
        doc: 'https://ui.shadcn.com/docs/components/calendar',
      },
    },
    name: 'calendar',
    registryDependencies: ['https://platejs.org/r/styles/default/button.json'],
    title: 'Calendar',
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-checkbox'],
    description:
      'A control that allows the user to toggle between checked and not checked.',
    files: [
      { path: 'registry/ui/checkbox.tsx', type: 'registry:ui' },
      { path: 'registry/ui/checkbox-static.tsx', type: 'registry:ui' },
    ],
    meta: {
      links: {
        doc: 'https://ui.shadcn.com/docs/components/checkbox',
      },
    },
    name: 'checkbox',
    registryDependencies: [],
    title: 'Checkbox',
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-dialog', '@udecode/cmdk'],
    description: 'Fast, composable, unstyled command menu for React.',
    files: [{ path: 'registry/ui/command.tsx', type: 'registry:ui' }],
    meta: {
      links: {
        doc: 'https://ui.shadcn.com/docs/components/command',
      },
    },
    name: 'command',
    registryDependencies: [
      'dialog',
      'https://platejs.org/r/styles/default/input.json',
    ],
    title: 'Command',
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-context-menu'],
    description:
      'Displays a menu to the user — such as a set of actions or functions — triggered by a button.',
    files: [{ path: 'registry/ui/context-menu.tsx', type: 'registry:ui' }],
    meta: {
      links: {
        doc: 'https://ui.shadcn.com/docs/components/context-menu',
      },
    },
    name: 'context-menu',
    registryDependencies: [],
    title: 'Context Menu',
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-dropdown-menu'],
    description:
      'Displays a menu to the user — such as a set of actions or functions — triggered by a button.',
    files: [{ path: 'registry/ui/dropdown-menu.tsx', type: 'registry:ui' }],
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
  {
    dependencies: [
      'react-hook-form',
      'zod',
      '@hookform/resolvers',
      '@radix-ui/react-label',
      '@radix-ui/react-slot',
    ],
    description: 'Building forms with React Hook Form and Zod.',
    files: [{ path: 'registry/ui/form.tsx', type: 'registry:ui' }],
    meta: {
      links: {
        doc: 'https://ui.shadcn.com/docs/components/form',
      },
    },
    name: 'form',
    registryDependencies: ['https://platejs.org/r/styles/default/label.json'],
    title: 'Form',
    type: 'registry:ui',
  },
  {
    dependencies: [],
    description:
      'Displays a form input field or a component that looks like an input field.',
    files: [{ path: 'registry/ui/input.tsx', type: 'registry:ui' }],
    meta: {
      links: {
        doc: 'https://ui.shadcn.com/docs/components/input',
      },
    },
    name: 'input',
    registryDependencies: [],
    title: 'Input',
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-label'],
    description: 'Renders an accessible label associated with controls.',
    files: [{ path: 'registry/ui/label.tsx', type: 'registry:ui' }],
    meta: {
      links: {
        doc: 'https://ui.shadcn.com/docs/components/label',
      },
    },
    name: 'label',
    registryDependencies: [],
    title: 'Label',
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-popover'],
    description: 'Displays rich content in a portal, triggered by a button.',
    files: [{ path: 'registry/ui/popover.tsx', type: 'registry:ui' }],
    meta: {
      links: {
        doc: 'https://ui.shadcn.com/docs/components/popover',
      },
    },
    name: 'popover',
    registryDependencies: [],
    title: 'Popover',
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-separator'],
    description: 'Visually or semantically separates content.',
    files: [{ path: 'registry/ui/separator.tsx', type: 'registry:ui' }],
    meta: {
      links: {
        doc: 'https://ui.shadcn.com/docs/components/separator',
      },
    },
    name: 'separator',
    registryDependencies: [],
    title: 'Separator',
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-toolbar'],
    description:
      'A customizable toolbar component with various button styles and group',
    files: [{ path: 'registry/ui/toolbar.tsx', type: 'registry:ui' }],
    meta: {
      // Add links here if needed
    },
    name: 'toolbar',
    registryDependencies: [
      'https://platejs.org/r/styles/default/tooltip.json',
      'https://platejs.org/r/styles/default/separator.json',
    ],
    title: 'Toolbar',
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-tooltip'],
    description:
      'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.',
    files: [{ path: 'registry/ui/tooltip.tsx', type: 'registry:ui' }],
    meta: {
      links: {
        doc: 'https://ui.shadcn.com/docs/components/tooltip',
      },
    },
    name: 'tooltip',
    registryDependencies: ['https://platejs.org/r/styles/default/button.json'],
    title: 'Tooltip',
    type: 'registry:ui',
  },
  {
    description: 'A loading spinner component with size variants.',
    files: [{ path: 'registry/ui/spinner.tsx', type: 'registry:ui' }],
    meta: {
      // Add links here if needed
    },
    name: 'spinner',
    registryDependencies: [],
    title: 'Spinner',
    type: 'registry:ui',
  },
];

export const ui: Registry['items'] = [
  ...uiComponents,
  ...uiNodes,
  ...uiPrimitives,
];
