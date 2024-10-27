import type { Registry } from './schema';

export const uiComponents: Registry = [
  {
    dependencies: [
      '@udecode/plate-ai',
      '@udecode/plate-markdown',
      '@udecode/plate-selection',
    ],
    doc: {
      description: 'AI-powered menu for generating and inserting content.',
      examples: ['ai-demo'],
      title: 'AI Menu',
    },
    files: [
      'plate-ui/ai-chat-editor.tsx',
      'plate-ui/ai-menu-items.tsx',
      'plate-ui/ai-menu.tsx',
    ],
    name: 'ai-menu',
    registryDependencies: ['button', 'menu', 'textarea', 'editor'],
    type: 'registry:ui',
  },
  {
    dependencies: [],
    doc: {
      description: 'AI menu opener from the toolbar.',
      examples: ['ai-demo', 'floating-toolbar-demo'],
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
      description: 'Dropdown menu for text alignment options.',
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
      description: 'Context menu for block actions.',
      examples: ['context-menu-demo'],
    },
    files: ['plate-ui/block-context-menu.tsx'],
    name: 'block-context-menu',
    registryDependencies: ['calendar', 'plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-selection'],
    doc: {
      description: 'Visual feedback for selected blocks.',
      examples: ['selection-demo'],
    },
    files: ['plate-ui/block-selection.tsx'],
    name: 'block-selection',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-caption'],
    doc: {
      description: 'Caption component for media elements.',
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
      description:
        'Color picker and dropdown menu for text and background colors.',
      examples: ['color-demo'],
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
      description:
        'Adds a toolbar button for inserting comments in the editor.',
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
      description:
        'Displays a popover with comments and a form for adding new comments.',
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
      description:
        'Renders cursors and selection overlays for collaborative editing.',
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
      description: 'Implements draggable functionality for editor blocks.',
      examples: ['dnd-demo'],
    },
    files: ['plate-ui/draggable.tsx', 'plate-ui/with-draggables.tsx'],
    name: 'draggable',
    registryDependencies: ['tooltip', 'use-mounted'],
    type: 'registry:ui',
  },
  {
    dependencies: [],
    doc: {
      description: 'Core editor container and content components.',
      examples: ['basic-demo'],
    },
    files: ['plate-ui/editor.tsx'],
    name: 'editor',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-popover'],
    doc: {
      description: 'Emoji picker with search, categories, and preview.',
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
      description: 'Collection of commonly used toolbar buttons.',
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
      description: 'Fixed position toolbar for the editor.',
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
      description: 'Buttons for the floating toolbar.',
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
      description: 'Floating toolbar that appears above selected text.',
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
        'Displays AI-generated text suggestions as ghost text at the cursor position.',
      examples: ['ai-demo'],
    },
    files: ['plate-ui/ghost-text.tsx'],
    name: 'ghost-text',
    registryDependencies: [''],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-indent-list'],
    doc: {
      description: 'Toolbar button for indenting list items.',
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
      description: 'Checkbox marker for todo list items.',
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
      description: 'Toolbar button for creating todo list items.',
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
      description: 'Toolbar button for indenting blocks.',
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
      description: 'Combobox for inline autocompletion and suggestions.',
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
      description: 'Dropdown menu for inserting various block types.',
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
      description: 'Dropdown menu for adjusting line height.',
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
      description: 'Floating toolbar for editing links.',
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
      description: 'Toolbar button for inserting and editing links.',
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
      description: 'Toolbar button for creating and managing lists.',
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
      description: 'Toolbar button for basic text formatting marks.',
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
      description: 'Popover for editing media properties.',
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
      description: 'Toolbar button for inserting and managing media elements.',
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
      description: 'Dropdown menu for switching between editor modes.',
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
      description: 'Additional formatting options in a dropdown menu.',
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
      description: 'Toolbar button for outdenting blocks.',
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
      description: 'Placeholder text for empty editor blocks.',
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
      description: 'Base element with block selection.',
      examples: ['basic-demo'],
    },
    files: ['plate-ui/plate-element.tsx'],
    name: 'plate-element',
    registryDependencies: ['block-selection'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-resizable'],
    doc: {
      description: 'Makes blocks resizable with drag handles.',
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
      description: 'Dropdown menu for table operations.',
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
      description: 'Toolbar button for toggling collapsible blocks.',
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
      description: 'Dropdown menu for converting between block types.',
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
      description: 'AI-generated text highlighter.',
      examples: ['ai-demo'],
      title: 'AI Leaf',
    },
    files: ['plate-ui/ai-leaf.tsx'],
    name: 'ai-leaf',
    registryDependencies: [''],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-block-quote'],
    doc: {
      description: 'Block quote element.',
      examples: ['basic-nodes-demo'],
      links: {
        api: 'https://platejs.org/docs/basic-elements',
      },
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
        'Code block with syntax highlighting, language selection, and copy functionality.',
      examples: ['basic-nodes-demo'],
      links: {
        api: 'https://platejs.org/docs/basic-elements',
      },
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
      description: 'Inline code snippets.',
      examples: ['basic-nodes-demo'],
      links: {
        api: 'https://platejs.org/docs/comments',
      },
    },
    files: ['plate-ui/code-leaf.tsx'],
    name: 'code-leaf',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-code-block'],
    doc: {
      description: 'Individual lines within a code block.',
      examples: ['basic-nodes-demo'],
    },
    files: ['plate-ui/code-line-element.tsx'],
    name: 'code-line-element',
    registryDependencies: ['plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-code-block'],
    doc: {
      description: 'Syntax highlighting for code blocks.',
      examples: ['basic-nodes-demo'],
      links: {
        api: 'https://platejs.org/docs/comments',
      },
    },
    files: ['plate-ui/code-syntax-leaf.tsx'],
    name: 'code-syntax-leaf',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-layout'],
    doc: {
      description: 'Column element with resizing in edit mode.',
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
        'Commented text with visual indicators and hover interactions.',
      examples: ['comments-demo'],
      links: {
        api: 'https://platejs.org/docs/comments',
      },
    },
    files: ['plate-ui/comment-leaf.tsx'],
    name: 'comment-leaf',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-date'],
    doc: {
      description:
        'Date element with calendar picker for selecting and displaying dates.',
      examples: ['date-demo'],
      links: {
        api: 'https://platejs.org/docs/date',
      },
    },
    files: ['plate-ui/date-element.tsx'],
    name: 'date-element',
    registryDependencies: ['calendar', 'plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-emoji'],
    doc: {
      description:
        'Emoji input element with search functionality and emoji insertion.',
      examples: ['emoji-demo'],
      links: {
        api: 'https://platejs.org/docs/emoji',
      },
    },
    files: ['plate-ui/emoji-input-element.tsx'],
    name: 'emoji-input-element',
    registryDependencies: ['inline-combobox', 'plate-element', 'use-debounce'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-excalidraw'],
    doc: {
      description: 'Excalidraw drawing element.',
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
      description: 'Heading elements.',
      examples: ['basic-nodes-demo'],
      links: {
        api: 'https://platejs.org/docs/basic-elements',
      },
    },
    files: ['plate-ui/heading-element.tsx'],
    name: 'heading-element',
    registryDependencies: ['plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-highlight'],
    doc: {
      description: 'Text highlighting with customizable colors.',
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
      description: 'Horizontal rule element with focus states.',
      examples: ['horizontal-rule-demo'],
      links: {
        api: 'https://platejs.org/docs/horizontal-rule',
      },
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
      examples: ['upload-demo', 'media-toolbar-demo'],
      links: {
        api: 'https://platejs.org/docs/media',
      },
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
      description: 'Keyboard shortcut styling.',
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
      description: 'Hyperlink element.',
      examples: ['link-demo'],
      links: {
        api: 'https://platejs.org/docs/link',
      },
    },
    files: ['plate-ui/link-element.tsx'],
    name: 'link-element',
    registryDependencies: ['plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-list'],
    doc: {
      description: 'List element for ordered and unordered lists.',
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
        'Displays embedded media content such as videos or tweets with resizing capabilities and captions.',
      examples: ['upload-demo', 'media-toolbar-demo'],
      links: {
        api: 'https://platejs.org/docs/media',
      },
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
      description: 'Mention element with customizable prefix and label.',
      examples: ['mention-demo'],
      links: {
        api: 'https://platejs.org/docs/mention',
      },
    },
    files: ['plate-ui/mention-element.tsx'],
    name: 'mention-element',
    registryDependencies: ['plate-element', 'use-mounted'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-mention'],
    doc: {
      description: 'Input element for mentioning users with autocomplete.',
      examples: ['mention-demo'],
      links: {
        api: 'https://platejs.org/docs/mention',
      },
    },
    files: ['plate-ui/mention-input-element.tsx'],
    name: 'mention-input-element',
    registryDependencies: ['inline-combobox', 'plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: [],
    doc: {
      description: 'Paragraph element with background color.',
      examples: ['basic-nodes-demo'],
      links: {
        api: 'https://platejs.org/docs/basic-elements',
      },
    },
    files: ['plate-ui/paragraph-element.tsx'],
    name: 'paragraph-element',
    registryDependencies: ['plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-find-replace'],
    doc: {
      description: 'Highlights search results in text.',
      examples: ['find-replace-demo'],
    },
    files: ['plate-ui/search-highlight-leaf.tsx'],
    name: 'search-highlight-leaf',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-heading', '@udecode/plate-indent-list'],
    doc: {
      description: 'Slash command input for inserting various elements.',
      examples: ['slash-menu-demo'],
    },
    files: ['plate-ui/slash-input-element.tsx'],
    name: 'slash-input-element',
    registryDependencies: ['inline-combobox', 'plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-table'],
    doc: {
      description:
        'Table cell with resizable borders and selection capabilities.',
      examples: ['table-demo'],
      links: {
        api: 'https://platejs.org/docs/table',
      },
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
        'Table element with floating toolbar and border customization options.',
      examples: ['table-demo'],
      links: {
        api: 'https://platejs.org/docs/table',
      },
    },
    files: ['plate-ui/table-element.tsx'],
    name: 'table-element',
    registryDependencies: ['dropdown-menu', 'plate-element'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-table'],
    doc: {
      description: 'Table row element with optional border hiding.',
      examples: ['table-demo'],
      links: {
        api: 'https://platejs.org/docs/table',
      },
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
        'Table of contents element with clickable links to headings in the document.',
      examples: ['toc-demo'],
      title: 'TOC Element',
    },
    files: ['plate-ui/toc-element.tsx'],
    name: 'toc-element',
    registryDependencies: [''],
    type: 'registry:ui',
  },
  {
    dependencies: ['@udecode/plate-toggle'],
    doc: {
      description: 'Collapsible toggle element.',
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
      description: 'Avatar component with image support and fallback options.',
    },
    files: ['plate-ui/avatar.tsx'],
    name: 'avatar',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-slot'],
    doc: {
      description: 'Button component.',
    },
    files: ['plate-ui/button.tsx'],
    name: 'button',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['react-day-picker@8.10.1'],
    doc: {
      description: 'Calendar component for date selection.',
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
        'Checkbox component with support for checked, unchecked, and indeterminate states.',
    },
    files: ['plate-ui/checkbox.tsx'],
    name: 'checkbox',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-dialog', 'cmdk'],
    doc: {
      description:
        'Command palette interface for searching and executing actions.',
    },
    files: ['plate-ui/command.tsx'],
    name: 'command',
    registryDependencies: ['dialog', 'input'],
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-dialog'],
    doc: {
      description: 'Dialog component with modal and drawer variants.',
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
        'Dropdown menu component for items, checkboxes, radio buttons, and nested submenus.',
    },
    files: ['plate-ui/dropdown-menu.tsx'],
    name: 'dropdown-menu',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: [],
    doc: {
      description: 'Input component.',
    },
    files: ['plate-ui/input.tsx'],
    name: 'input',
    registryDependencies: [],
    type: 'registry:ui',
  },
  {
    dependencies: ['@radix-ui/react-popover'],
    doc: {
      description: 'Rich content in a portal, triggered by a button.',
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
