import type { Registry } from './schema';

import { siteConfig } from '../config/site';

export const uiComponents: Registry = [
  {
    dependencies: [
      '@udecode/plate-ai',
      '@udecode/plate-markdown',
      '@udecode/plate-selection',
      'ai',
    ],
    doc: {
      description: 'A menu for AI-powered content generation and insertion.',
      examples: ['ai-demo', 'ai-pro'],
      label: 'New',
      title: 'AI Menu',
    },
    files: [
      'plate-ui/ai-menu.tsx',
      'plate-ui/ai-menu-items.tsx',
      'plate-ui/ai-chat-editor.tsx',
    ],
    name: 'ai-menu',
    registryDependencies: ['command', 'popover', 'editor'],
    type: 'registry:ui',
  },
  {
    dependencies: [],
    doc: {
      description: 'A toolbar button for accessing AI features.',
      examples: ['ai-demo', 'floating-toolbar-demo'],
      label: 'New',
      title: 'AI Toolbar Button',
    },
    files: ['plate-ui/ai-toolbar-button.tsx'],
    name: 'ai-toolbar-button',
    registryDependencies: ['toolbar'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-alignment'],
    doc: {
      description: 'A dropdown menu for text alignment controls.',
      examples: ['alignment-demo'],
    },
    files: ['plate-ui/align-dropdown-menu.tsx'],
    name: 'align-dropdown-menu',
    registryDependencies: ['dropdown-menu', 'toolbar'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-context-menu'],
    doc: {
      description: 'A context menu for block-level operations.',
      examples: ['context-menu-demo'],
      label: 'New',
      //       1. More advanced menu items.
      // 2. Supports search functionality and carefully designed shortcuts.
      // 3. More refined styles and animations.
      // 4. You can open this menu in various ways, such as through the drag button.
    },
    files: ['plate-ui/block-context-menu.tsx'],
    name: 'block-context-menu',
    registryDependencies: ['calendar', 'plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-selection'],
    doc: {
      description: 'A visual overlay for selected blocks.',
      examples: ['selection-demo'],
      label: 'New',
    },
    files: ['plate-ui/block-selection.tsx'],
    name: 'block-selection',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-caption'],
    doc: {
      description: 'A text field for adding captions to media elements.',
      examples: ['upload-demo'],
    },
    files: ['plate-ui/caption.tsx'],
    name: 'caption',
    registryDependencies: ['button'],
    type: 'registry:ui',
  },
  {
    dependencies: [],
    doc: {
      description: 'A color picker with text and background color controls.',
      examples: ['color-demo'],
      //       1. Text color can be modified using the floating toolbar or block menu, providing more flexibility in formatting.
      // 2. An improved color picker interface with custom color options and a color input field for precise color selection.
    },
    files: [
      'plate-ui/color-constants.ts',
      'plate-ui/color-dropdown-menu-items.tsx',
      'plate-ui/color-dropdown-menu.tsx',
      'plate-ui/color-input.tsx',
      'plate-ui/color-picker.tsx',
      'plate-ui/colors-custom.tsx',
    ],
    name: 'color-dropdown-menu',
    registryDependencies: [
      'dropdown-menu',
      'toolbar',
      'separator',
      'button',
      'tooltip',
    ],
    type: 'registry:ui',
  },
  {
    dependencies: [],
    doc: {
      description: 'A toolbar button for adding inline comments.',
      examples: ['comments-demo', 'floating-toolbar-demo'],
    },
    files: ['plate-ui/comment-toolbar-button.tsx'],
    name: 'comment-toolbar-button',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-comments'],
    doc: {
      description: 'A popover interface for managing comments and replies.',
      examples: ['comments-demo'],
    },
    files: [
      'plate-ui/comment-avatar.tsx',
      'plate-ui/comment-create-form.tsx',
      'plate-ui/comment-item.tsx',
      'plate-ui/comment-more-dropdown.tsx',
      'plate-ui/comment-reply-items.tsx',
      'plate-ui/comment-resolve-button.tsx',
      'plate-ui/comment-value.tsx',
      'plate-ui/comments-popover.tsx',
    ],
    name: 'comments-popover',
    registryDependencies: ['popover', 'avatar'],
    type: 'registry:ui',
  },
  {
    dependencies: [],
    doc: {
      description: 'A visual overlay for collaborative cursors and selections.',
      examples: ['collaboration-demo'],
    },
    files: ['plate-ui/cursor-overlay.tsx'],
    name: 'cursor-overlay',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: [
      '@udecode/plate-dnd',
      '@udecode/plate-selection',
      'react-dnd',
      'react-dnd-html5-backend',
    ],
    doc: {
      description: 'A drag handle for moving editor blocks.',
      examples: ['dnd-demo'],
      usage: [
        `import { DndPlugin } from '@udecode/plate-dnd';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { withDraggables } from './withDraggables';`,
        `export function MyEditor() {
  const editor = usePlateEditor({
    plugins: [
      // ...otherPlugins,
      NodeIdPlugin,
      DndPlugin.configure({ options: { enableScroller: true } }),
    ],
    override: {
      components: withDraggables({
        // ...components
      }),
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
    files: ['plate-ui/draggable.tsx', 'plate-ui/with-draggables.tsx'],
    name: 'draggable',
    registryDependencies: ['tooltip', 'use-mounted'],
    type: 'registry:ui',
  },
  {
    dependencies: [],
    doc: {
      description: 'A container for the editor content and styling.',
      examples: [
        'editor-default',
        'editor-disabled',
        'editor-ghost',
        'editor-label',
        'editor-text',
        'editor-button',
      ],
    },
    files: ['plate-ui/editor.tsx'],
    name: 'editor',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-popover'],
    doc: {
      description: 'A dropdown menu for emoji selection and insertion.',
      examples: ['emoji-demo'],
    },
    files: [
      'plate-ui/emoji-dropdown-menu.tsx',
      'plate-ui/emoji-icons.tsx',
      'plate-ui/emoji-picker-content.tsx',
      'plate-ui/emoji-picker-navigation.tsx',
      'plate-ui/emoji-picker-preview.tsx',
      'plate-ui/emoji-picker-search-and-clear.tsx',
      'plate-ui/emoji-picker-search-bar.tsx',
      'plate-ui/emoji-picker.tsx',
      'plate-ui/emoji-toolbar-dropdown.tsx',
    ],
    name: 'emoji-dropdown-menu',
    registryDependencies: ['toolbar'],
    type: 'registry:ui',
  },
  {
    dependencies: [],
    doc: {
      description: 'A set of commonly used formatting buttons.',
      examples: ['toolbar-demo'],
    },
    files: ['plate-ui/fixed-toolbar-buttons.tsx'],
    name: 'fixed-toolbar-buttons',
    registryDependencies: [
      'toolbar',
      'insert-dropdown-menu',
      'mark-toolbar-button',
      'mode-dropdown-menu',
      'turn-into-dropdown-menu',
    ],
    type: 'registry:ui',
  },
  {
    dependencies: [],
    doc: {
      description: 'A fixed toolbar that stays at the top of the editor.',
      examples: ['toolbar-demo'],
    },
    files: ['plate-ui/fixed-toolbar.tsx'],
    name: 'fixed-toolbar',
    registryDependencies: ['toolbar'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-basic-marks'],
    doc: {
      description: 'A set of formatting buttons for the floating toolbar.',
      examples: ['floating-toolbar-demo'],
    },
    files: ['plate-ui/floating-toolbar-buttons.tsx'],
    name: 'floating-toolbar-buttons',
    registryDependencies: [
      'mark-toolbar-button',
      'more-dropdown-menu',
      'turn-into-dropdown-menu',
    ],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-floating'],
    doc: {
      description: 'A contextual toolbar that appears over selected text.',
      examples: ['floating-toolbar-demo'],
    },
    files: ['plate-ui/floating-toolbar.tsx'],
    name: 'floating-toolbar',
    registryDependencies: ['toolbar'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-ai'],
    doc: {
      description:
        'A text suggestion system that displays AI-generated content after the cursor.',
      examples: [
        // 'ai-demo'
      ],
      label: 'New',
      //       1. Hover card: a new style of hover card that is more user-friendly. You can **hover** over the ghost text to see the hover card.
      // 2. Marks: support for marks like bold, italic, underline, etc.This means you can see bold text and **links** in the ghost text
      // 3. Backend: complete backend setup.
    },
    files: ['plate-ui/ghost-text.tsx'],
    name: 'ghost-text',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-indent-list'],
    doc: {
      description: 'A toolbar control for adjusting list indentation.',
      examples: ['list-demo'],
    },
    files: ['plate-ui/indent-list-toolbar-button.tsx'],
    name: 'indent-list-toolbar-button',
    registryDependencies: ['toolbar'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-indent-list'],
    doc: {
      description: 'A checkbox marker for interactive todo lists.',
      examples: ['list-demo'],
    },
    files: ['plate-ui/indent-todo-marker.tsx'],
    name: 'indent-todo-marker',
    registryDependencies: ['checkbox'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-indent-list'],
    doc: {
      description: 'A toolbar control for creating todo list items.',
      examples: ['list-demo'],
    },
    files: ['plate-ui/indent-todo-toolbar-button.tsx'],
    name: 'indent-todo-toolbar-button',
    registryDependencies: ['toolbar'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-indent'],
    doc: {
      description: 'A toolbar control for block indentation.',
      examples: ['indent-demo'],
    },
    files: ['plate-ui/indent-toolbar-button.tsx'],
    name: 'indent-toolbar-button',
    registryDependencies: ['toolbar'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@ariakit/react', '@udecode/plate-combobox'],
    doc: {
      description: 'A combobox for inline suggestions.',
      examples: ['combobox-demo'],
    },
    files: ['plate-ui/inline-combobox.tsx'],
    name: 'inline-combobox',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-block-quote', '@udecode/plate-heading'],
    doc: {
      description: 'A menu for inserting different types of blocks.',
      examples: ['basic-demo'],
    },
    files: ['plate-ui/insert-dropdown-menu.tsx'],
    name: 'insert-dropdown-menu',
    registryDependencies: ['dropdown-menu', 'toolbar'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-line-height'],
    doc: {
      description: 'A menu for controlling text line spacing.',
      examples: ['line-height-demo'],
    },
    files: ['plate-ui/line-height-dropdown-menu.tsx'],
    name: 'line-height-dropdown-menu',
    registryDependencies: ['toolbar', 'dropdown-menu'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-link'],
    doc: {
      description: 'A floating interface for link editing.',
      examples: ['link-demo'],
    },
    files: ['plate-ui/link-floating-toolbar.tsx'],
    name: 'link-floating-toolbar',
    registryDependencies: ['button', 'input', 'popover', 'separator'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-link'],
    doc: {
      description: 'A toolbar control for link management.',
      examples: ['link-demo'],
    },
    files: ['plate-ui/link-toolbar-button.tsx'],
    name: 'link-toolbar-button',
    registryDependencies: ['toolbar'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-list'],
    doc: {
      description: 'A toolbar control for list creation and management.',
      examples: ['list-demo'],
    },
    files: ['plate-ui/list-toolbar-button.tsx'],
    name: 'list-toolbar-button',
    registryDependencies: ['toolbar'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-basic-marks'],
    doc: {
      description: 'A toolbar control for basic text formatting.',
      examples: ['basic-marks-demo'],
    },
    files: ['plate-ui/mark-toolbar-button.tsx'],
    name: 'mark-toolbar-button',
    registryDependencies: ['toolbar'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-media'],
    doc: {
      description: 'A popover interface for media settings.',
      examples: ['media-demo'],
    },
    files: ['plate-ui/media-popover.tsx'],
    name: 'media-popover',
    registryDependencies: ['button', 'input', 'popover', 'separator'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-media'],
    doc: {
      description: 'Toolbar button for inserting and managing media.',
      examples: ['media-demo'],
    },
    files: ['plate-ui/media-toolbar-button.tsx'],
    name: 'media-toolbar-button',
    registryDependencies: ['toolbar'],
    type: 'registry:ui',
  },
  {
    dependencies: [],
    doc: {
      description: 'A menu for switching between editor modes.',
      examples: ['mode-demo'],
    },
    files: ['plate-ui/mode-dropdown-menu.tsx'],
    name: 'mode-dropdown-menu',
    registryDependencies: ['dropdown-menu', 'toolbar'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-basic-marks'],
    doc: {
      description: 'A menu for additional text formatting options.',
      examples: ['basic-marks-demo'],
    },
    files: ['plate-ui/more-dropdown-menu.tsx'],
    name: 'more-dropdown-menu',
    registryDependencies: ['dropdown-menu', 'toolbar'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-indent'],
    doc: {
      description: 'A toolbar button for decreasing block indentation.',
      examples: ['indent-demo'],
    },
    files: ['plate-ui/outdent-toolbar-button.tsx'],
    name: 'outdent-toolbar-button',
    registryDependencies: ['toolbar'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-heading'],
    doc: {
      description: 'A text placeholder for empty editor blocks.',
      examples: ['placeholder-demo'],
    },
    files: ['plate-ui/placeholder.tsx'],
    name: 'placeholder',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: [],
    doc: {
      description: 'A base element with block selection support.',
      examples: ['basic-demo'],
      label: 'New',
    },
    files: ['plate-ui/plate-element.tsx'],
    name: 'plate-element',
    registryDependencies: ['block-selection'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-resizable'],
    doc: {
      description: 'A resizable wrapper with resize handles.',
      examples: ['resizable-demo'],
    },
    files: ['plate-ui/resizable.tsx'],
    name: 'resizable',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-table'],
    doc: {
      description: 'A menu for table manipulation and formatting.',
      examples: ['table-demo'],
    },
    files: ['plate-ui/table-dropdown-menu.tsx'],
    name: 'table-dropdown-menu',
    registryDependencies: ['dropdown-menu', 'toolbar'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-toggle'],
    doc: {
      description: 'A toolbar button for expanding and collapsing blocks.',
      examples: ['toggle-demo'],
    },
    files: ['plate-ui/toggle-toolbar-button.tsx'],
    name: 'toggle-toolbar-button',
    registryDependencies: ['toolbar'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-block-quote', '@udecode/plate-heading'],
    doc: {
      description: 'A menu for converting between different block types.',
      examples: ['basic-demo'],
    },
    files: ['plate-ui/turn-into-dropdown-menu.tsx'],
    name: 'turn-into-dropdown-menu',
    registryDependencies: ['dropdown-menu', 'toolbar'],
    type: 'registry:ui',
  },
];

export const uiNodes: Registry = [
  {
    dependencies: ['@udecode/plate-ai'],
    doc: {
      description: 'A text highlighter for AI-generated content.',
      docs: [
        {
          route: '/docs/ai',
          title: 'AI',
        },
        {
          route: siteConfig.links.plateProComponent('ai-leaf'),
          title: 'AI Leaf',
        },
      ],
      examples: ['ai-demo', 'ai-pro'],
      label: 'New',
      title: 'AI Leaf',
    },
    files: ['plate-ui/ai-leaf.tsx'],
    name: 'ai-leaf',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-block-quote'],
    doc: {
      description: 'A quote component for block quotes.',
      docs: [
        {
          route: '/docs/basic-elements',
        },
        {
          route: siteConfig.links.plateProComponent('blockquote-element'),
        },
      ],
      examples: ['basic-elements-demo', 'basic-elements-pro'],
    },
    files: ['plate-ui/blockquote-element.tsx'],
    name: 'blockquote-element',
    registryDependencies: ['plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-code-block'],
    doc: {
      description:
        'A code block with syntax highlighting and language selection.',
      docs: [
        {
          route: '/docs/basic-elements',
        },
      ],
      examples: ['basic-elements-demo'],
      //       1. A "Copy" button to easily copy the entire code snippet.
      // 2. A "Block Menu" button to access additional options and actions.
    },
    files: [
      'plate-ui/code-block-element.tsx',
      'plate-ui/code-block-element.css',
      'plate-ui/code-block-combobox.tsx',
    ],
    name: 'code-block-element',
    registryDependencies: ['command', 'plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-basic-marks'],
    doc: {
      description: 'An inline component for code snippets.',
      docs: [
        {
          route: '/docs/comments',
        },
      ],
      examples: ['basic-marks-demo'],
    },
    files: ['plate-ui/code-leaf.tsx'],
    name: 'code-leaf',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-code-block'],
    doc: {
      description: 'A line component for code blocks.',
      examples: ['basic-elements-demo'],
    },
    files: ['plate-ui/code-line-element.tsx'],
    name: 'code-line-element',
    registryDependencies: ['plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-code-block'],
    doc: {
      description: 'A syntax highlighting component for code blocks.',
      docs: [
        {
          route: '/docs/comments',
        },
      ],
      examples: ['basic-elements-demo'],
    },
    files: ['plate-ui/code-syntax-leaf.tsx'],
    name: 'code-syntax-leaf',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-layout'],
    doc: {
      description: 'A resizable column component for layout.',
      examples: ['column-demo'],
    },
    files: ['plate-ui/column-element.tsx', 'plate-ui/column-group-element.tsx'],
    name: 'column-element',
    registryDependencies: ['command', 'resizable', 'plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-comments'],
    doc: {
      description:
        'A text component for displaying comments with visual indicators.',
      docs: [
        {
          route: '/docs/comments',
        },
      ],
      examples: ['comments-demo'],
    },
    files: ['plate-ui/comment-leaf.tsx'],
    name: 'comment-leaf',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-date'],
    doc: {
      description: 'A date field component with calendar picker.',
      docs: [
        {
          route: '/docs/date',
        },
      ],
      examples: ['date-demo'],
      label: 'New',
    },
    files: ['plate-ui/date-element.tsx'],
    name: 'date-element',
    registryDependencies: ['calendar', 'plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-emoji'],
    doc: {
      description: 'An input component for emoji search and insertion.',
      docs: [
        {
          route: '/docs/emoji',
        },
      ],
      examples: ['emoji-demo'],
    },
    files: ['plate-ui/emoji-input-element.tsx'],
    name: 'emoji-input-element',
    registryDependencies: ['inline-combobox', 'plate-element', 'use-debounce'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-excalidraw'],
    doc: {
      description: 'A drawing component powered by Excalidraw.',
      examples: ['excalidraw-demo'],
    },
    files: ['plate-ui/excalidraw-element.tsx'],
    name: 'excalidraw-element',
    registryDependencies: ['plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-heading'],
    doc: {
      description: 'A heading with multiple level support.',
      docs: [
        {
          route: '/docs/basic-elements',
        },
      ],
      examples: ['basic-elements-demo'],
    },
    files: ['plate-ui/heading-element.tsx'],
    name: 'heading-element',
    registryDependencies: ['plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-highlight'],
    doc: {
      description: 'A text highlighter with customizable colors.',
      examples: ['highlight-demo'],
    },
    files: ['plate-ui/highlight-leaf.tsx'],
    name: 'highlight-leaf',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-horizontal-rule'],
    doc: {
      description: 'A horizontal rule component with focus states.',
      docs: [
        {
          route: '/docs/horizontal-rule',
        },
      ],
      examples: ['horizontal-rule-demo'],
      title: 'Horizontal Rule Element',
    },
    files: ['plate-ui/hr-element.tsx'],
    name: 'hr-element',
    registryDependencies: ['plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-media'],
    doc: {
      description:
        'Image element with lazy loading, resizing capabilities, and optional caption.',
      docs: [
        {
          route: '/docs/media',
        },
      ],
      examples: ['media-demo'],
      //       1. **Media Toolbar**: A convenient toolbar appears when hovering over an image, providing quick access to editing options.
      // 2. **Full-Stack Backend Integration**: Seamlessly handle image uploads, storage, and retrieval with our robust backend integration.
      // 3. **Image preview**: double click to see the image preview.
      // 4. **Download image**: download the image to your local machine by media toolbar.
    },
    files: ['plate-ui/image-element.tsx'],
    name: 'image-element',
    registryDependencies: [
      'media-popover',
      'caption',
      'resizable',
      'plate-element',
    ],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-kbd'],
    doc: {
      description: 'A component for styling keyboard shortcuts.',
      examples: ['kbd-demo'],
    },
    files: ['plate-ui/kbd-leaf.tsx'],
    name: 'kbd-leaf',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-link'],
    doc: {
      description: 'A component for rendering hyperlinks with hover states.',
      docs: [
        {
          route: '/docs/link',
        },
      ],
      examples: ['link-demo'],
    },
    files: ['plate-ui/link-element.tsx'],
    name: 'link-element',
    registryDependencies: ['plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-list'],
    doc: {
      description: 'A list element for ordered and unordered items.',
      examples: ['list-demo'],
    },
    files: ['plate-ui/list-element.tsx'],
    name: 'list-element',
    registryDependencies: ['plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: [
      '@udecode/plate-media',
      'react-tweet',
      'react-lite-youtube-embed',
    ],
    doc: {
      description:
        'A component for embedded media content with resizing and caption support.',
      docs: [
        {
          route: '/docs/media',
        },
      ],
      examples: ['media-demo'],
    },
    files: ['plate-ui/media-embed-element.tsx'],
    name: 'media-embed-element',
    registryDependencies: [
      'media-popover',
      'caption',
      'resizable',
      'plate-element',
    ],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-mention'],
    doc: {
      description: 'A mention element with customizable prefix and label.',
      docs: [
        {
          route: '/docs/mention',
        },
      ],
      examples: ['mention-demo'],
    },
    files: ['plate-ui/mention-element.tsx'],
    name: 'mention-element',
    registryDependencies: ['plate-element', 'use-mounted'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-mention'],
    doc: {
      description: 'An input component for user mentions with autocomplete.',
      docs: [
        {
          route: '/docs/mention',
        },
      ],
      examples: ['mention-demo'],
    },
    files: ['plate-ui/mention-input-element.tsx'],
    name: 'mention-input-element',
    registryDependencies: ['inline-combobox', 'plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: [],
    doc: {
      description: 'A paragraph block with background color support.',
      docs: [
        {
          route: '/docs/basic-elements',
        },
      ],
      examples: ['basic-elements-demo'],
    },
    files: ['plate-ui/paragraph-element.tsx'],
    name: 'paragraph-element',
    registryDependencies: ['plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-find-replace'],
    doc: {
      description: 'A component that highlights search results in text.',
      // examples: ['find-replace-demo'],
    },
    files: ['plate-ui/search-highlight-leaf.tsx'],
    name: 'search-highlight-leaf',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-heading', '@udecode/plate-indent-list'],
    doc: {
      description: 'A command input component for inserting various elements.',
      examples: ['slash-menu-demo'],
      label: 'New',
      //       - Refined UI design for better usability and aesthetics
      // - Extended set of slash menu options
      // - Integration of premium plugins like Math Upload for specialized editing needs
      // - No need to worry about the focus issue mentioned above.
      // - Support grouping and Carefully selected keyword.
      // - Trigger slash menu by click the puls button on the left of the paragraph.
    },
    files: ['plate-ui/slash-input-element.tsx'],
    name: 'slash-input-element',
    registryDependencies: ['inline-combobox', 'plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-table'],
    doc: {
      description: 'A table cell with resizable borders and selection.',
      docs: [
        {
          route: '/docs/table',
        },
      ],
      examples: ['table-demo'],
    },
    files: ['plate-ui/table-cell-element.tsx'],
    name: 'table-cell-element',
    registryDependencies: ['resizable', 'plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-table'],
    doc: {
      description:
        'A table component with floating toolbar and border customization.',
      docs: [
        {
          route: '/docs/table',
        },
      ],
      examples: ['table-demo'],
    },
    files: ['plate-ui/table-element.tsx'],
    name: 'table-element',
    registryDependencies: ['dropdown-menu', 'plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-table'],
    doc: {
      description: 'A table row component with optional border hiding.',
      docs: [
        {
          route: '/docs/table',
        },
      ],
      examples: ['table-demo'],
    },
    files: ['plate-ui/table-row-element.tsx'],
    name: 'table-row-element',
    registryDependencies: ['plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-heading'],
    doc: {
      description:
        'A table of contents component with links to document headings.',
      examples: ['toc-demo'],
      label: 'New',
      //       - Responsive design that adapts to different screen sizes
      // - Dynamic highlighting of the corresponding thumbnail on the right side based on the current section
      // - Hover thumbnail to see the preview of the section with smooth animation
      // - Elegant transition effects when navigating between sections
      // - Animated highlighting of the current section in the sidebar
      title: 'TOC Element',
    },
    files: ['plate-ui/toc-element.tsx'],
    name: 'toc-element',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-toggle'],
    doc: {
      description: 'A collapsible component for toggling content visibility.',
      examples: ['toggle-demo'],
    },
    files: ['plate-ui/toggle-element.tsx'],
    name: 'toggle-element',
    registryDependencies: ['plate-element'],
    type: 'registry:ui',
  },
];

export const uiPrimitives: Registry = [
  {
    dependencies: ['@radix-ui/react-avatar'],
    doc: {
      description:
        'An image element with a fallback for representing the user.',
    },
    files: ['plate-ui/avatar.tsx'],
    name: 'avatar',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-slot'],
    doc: {
      description: 'Displays a button or a component that looks like a button.',
      links: {
        doc: 'https://ui.shadcn.com/docs/components/button',
      },
    },
    files: ['plate-ui/button.tsx'],
    name: 'button',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['react-day-picker@8.10.1'],
    doc: {
      description:
        'A date field component that allows users to enter and edit date.',
    },
    files: ['plate-ui/calendar.tsx'],
    name: 'calendar',
    registryDependencies: ['button'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-checkbox'],
    doc: {
      description:
        'A control that allows the user to toggle between checked and not checked.',
    },
    files: ['plate-ui/checkbox.tsx'],
    name: 'checkbox',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-dialog', 'cmdk'],
    doc: {
      description: 'Fast, composable, unstyled command menu for React.',
    },
    files: ['plate-ui/command.tsx'],
    name: 'command',
    registryDependencies: ['dialog', 'input'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-dialog'],
    doc: {
      description:
        'A window overlaid on either the primary window or another dialog window, rendering the content underneath inert.',
    },
    files: ['plate-ui/dialog.tsx'],
    name: 'dialog',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-dropdown-menu'],
    doc: {
      description:
        'Displays a menu to the user — such as a set of actions or functions — triggered by a button.',
    },
    files: ['plate-ui/dropdown-menu.tsx'],
    name: 'dropdown-menu',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: [],
    doc: {
      description:
        'Displays a form input field or a component that looks like an input field.',
    },
    files: ['plate-ui/input.tsx'],
    name: 'input',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-popover'],
    doc: {
      description: 'Displays rich content in a portal, triggered by a button.',
    },
    files: ['plate-ui/popover.tsx'],
    name: 'popover',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-separator'],
    doc: {
      description: 'Visually or semantically separates content.',
    },
    files: ['plate-ui/separator.tsx'],
    name: 'separator',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-toolbar'],
    doc: {
      description:
        'A customizable toolbar component with various button styles and group',
    },
    files: ['plate-ui/toolbar.tsx'],
    name: 'toolbar',
    registryDependencies: ['tooltip', 'separator'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-tooltip'],
    doc: {
      description:
        'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.',
    },
    files: ['plate-ui/tooltip.tsx'],
    name: 'tooltip',
    registryDependencies: [],
    type: 'registry:ui',
  },
];

export const ui: Registry = [...uiNodes, ...uiPrimitives, ...uiComponents];
