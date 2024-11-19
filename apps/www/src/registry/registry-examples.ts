import type { Registry } from './schema';

export const proExamples: Registry = [
  {
    doc: {
      description: `Combobox menu with free-form prompt input
- Additional trigger methods:
  - Block menu button
  - Slash command menu
- Beautifully crafted UI`,
    },
    name: 'ai-pro',
    type: 'registry:pro',
  },
  {
    doc: {
      description: `- Sticky TOC sidebar
- Hover-to-expand: Opens automatically when you move your mouse over it
- Interactive navigation: Click on items to smoothly scroll to the corresponding heading
- Visual feedback: Highlights the current section in the sidebar
- Beautifully crafted UI`,
    },
    name: 'toc-pro',
    type: 'registry:pro',
  },
  {
    doc: {
      description: `- Integration with [UploadThing](https://uploadthing.com/)
- Support for various media types: images, videos, audio, and files
- Use slash commands for quick insertion
- Image-specific features:
  - **Better loading animation and image replacement**
  - Resize using vertical edge bars
  - Alignment options
  - Caption support
  - Expand/collapse view
  - Easy download
- Video-specific features:
  - Lazy load
  - Resize using vertical edge bars
  - Alignment options
  - Caption support
  - View original source
- Audio and file upload support
- Ability to embed media via URL
`,
      // {/* - Multiple upload methods:
      //   - Drag & drop files from your computer
      //   - Paste images directly from clipboard */}
      // {/* - Block menu for easy modification of uploaded content */}
    },
    name: 'upload-pro',
    type: 'registry:pro',
  },
  {
    doc: {
      description: `- Displays clickable placeholders for various media types (image, video, audio, file)
- Opens a popover with two tabs when the placeholder is clicked:
  - Upload tab: Allows uploading local files directly
  - Embed tab: Enables pasting embed links for media content
- Automatically converts the placeholder to the appropriate media element (image, video, audio, file) once the upload or embed is submitted
- Validates URLs and file types for each media category
- Beautifully crafted UI`,
    },
    // TODO in pro
    name: 'media-placeholder-pro',
    type: 'registry:pro',
  },
  {
    doc: {
      description: `- Open the menu via the drag button or the three-dot menu on specific blocks (e.g. images)
- Includes a combobox that filters options as you type
- Supports nested menu options
- Advanced actions such as "Ask AI", colors, and commenting
- Beautifully crafted UI`,
    },
    name: 'block-menu-pro',
    type: 'registry:pro',
  },
  {
    doc: {
      description: `- Beautifully crafted UI`,
    },
    name: 'block-selection-pro',
    type: 'registry:pro',
  },
  {
    doc: {
      description: `- Full stack example for Discussion and Comment
- Comment rendered with Plate editor
- Discussion list in the sidebar
- Beautifully crafted UI`,
    },
    name: 'comments-pro',
    type: 'registry:pro',
  },
  {
    doc: {
      description: `- Insert callouts using the slash command
- Ability to change the callout emoji
- Beautifully crafted UI`,
    },
    name: 'callout-pro',
    type: 'registry:pro',
  },
  {
    doc: {
      description: `- Suggestions powered by AI SDK (OpenAI). Code available in [Potion template](https://pro.platejs.org/docs/templates/potion)
- Rich text suggestions including marks and links
- Hover card with additional information
- Beautifully crafted UI`,
    },
    name: 'copilot-pro',
    type: 'registry:pro',
  },
  {
    doc: {
      description: `- Mark text as equation from the toolbar
- Insert equation from slash command
- Beautifully crafted UI`,
    },
    name: 'equation-pro',
    type: 'registry:pro',
  },
  {
    doc: {
      description: `- Extended set of slash menu options like "Ask AI"
- Trigger slash menu by click the + button on the left gutter
- Item groups
- Beautifully crafted UI`,
    },
    name: 'slash-menu-pro',
    type: 'registry:pro',
  },
  {
    doc: {
      description: `- "+" button on the left gutter to insert blocks
- Click on the drag handle to open the block menu
- Beautifully crafted UI`,
    },
    name: 'dnd-pro',
    type: 'registry:pro',
  },
  //   {
  //     doc: {
  //       description: `- Enhanced emoji picker with search functionality
  // - Categorized emoji selection
  // - Recent emojis section
  // - Keyboard navigation support
  // - Insert emojis via slash commands
  // - Beautifully crafted UI`,
  //     },
  //     name: 'emoji-pro',
  //     type: 'registry:pro',
  //   },
  {
    doc: {
      description: `- Color picker
- Mark as equation
- Beautifully crafted UI`,
    },
    name: 'floating-toolbar-pro',
    type: 'registry:pro',
  },
  //   {
  //     doc: {
  //       description: `- Enhanced link editing experience
  // - Preview card with metadata
  // - Custom link actions
  // - Quick edit and remove options
  // - Keyboard shortcuts support
  // - Beautifully crafted UI`,
  //     },
  //     name: 'link-pro',
  //     type: 'registry:pro',
  //   },
  {
    doc: {
      description: `- Code block:
  - A "Copy" button to easily copy the entire code snippet.
  - A "Block Menu" button to access additional options and actions.
- Beautifully crafted UI`,
    },
    name: 'basic-nodes-pro',
    type: 'registry:pro',
  },
  {
    doc: {
      description: `- Floating toolbar appears at the top right of media elements
- Alignment dropdown menu
- Caption button
- Expand button
- Download button
- Beautifully crafted UI`,
    },
    name: 'media-toolbar-pro',
    type: 'registry:pro',
  },
  //   {
  //     doc: {
  //       description: `- Enhanced table editing experience
  // - Column and row management
  // - Cell merging and splitting
  // - Custom cell styling options
  // - Resize columns with drag handles
  // - Header row and column support
  // - Beautifully crafted UI`,
  //     },
  //     name: 'table-pro',
  //     type: 'registry:pro',
  //   },
  //   {
  //     doc: {
  //       description: `- Enhanced mention functionality
  // - Real-time user search and filtering
  // - Customizable mention triggers (@, #, etc.)
  // - Rich preview cards for mentioned items
  // - Keyboard navigation support
  // - Beautifully crafted UI`,
  //     },
  //     name: 'mention-pro',
  //     type: 'registry:pro',
  //   },
  //   {
  //     doc: {
  //       description: `- Enhanced horizontal rule customization
  // - Multiple style presets
  // - Custom spacing controls
  // - Color and thickness options
  // - Quick insertion via slash commands
  // - Beautifully crafted UI`,
  //     },
  //     name: 'horizontal-rule-pro',
  //     type: 'registry:pro',
  //   },
  //   {
  //     doc: {
  //       description: `- Enhanced date picker functionality
  // - Multiple date formats support
  // - Calendar interface for date selection
  // - Keyboard navigation and shortcuts
  // - Custom date formatting options
  // - Beautifully crafted UI`,
  //     },
  //     name: 'date-pro',
  //     type: 'registry:pro',
  //   },
  //   {
  //     doc: {
  //       description: `- Multi-column layout support
  // - Flexible column width adjustment
  // - Drag and drop between columns
  // - Responsive column behavior
  // - Column merging and splitting
  // - Beautifully crafted UI`,
  //     },
  //     name: 'column-pro',
  //     type: 'registry:pro',
  //   },
];

export const docExamples: Registry = [
  {
    doc: {
      description:
        'AI menu with commands, streaming responses in a preview or directly into the editor.',
      docs: [
        {
          route: '/docs/ai',
          title: 'AI',
        },
      ],
      title: 'AI',
    },
    files: [
      'example/demo.tsx',
      'components/editor/plugins/ai-plugins.tsx',
      'example/values/ai-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'ai-demo',
    registryDependencies: [
      'basic-nodes-plugins',
      'block-selection-plugins',
      'indent-list-plugins',
      'link-plugin',
    ],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Text alignment controls for blocks.',
    },
    files: [
      'example/demo.tsx',
      'example/values/align-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'align-demo',
    registryDependencies: ['align-plugin'],
    type: 'registry:example',
  },

  {
    doc: {
      description: 'Apply formatting automatically using shortcodes.',
      title: 'Autoformat',
    },
    files: [
      'example/demo.tsx',
      'example/values/autoformat-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'autoformat-demo',
    registryDependencies: ['autoformat-plugin'],
    type: 'registry:example',
  },
  {
    doc: {
      description:
        'Basic block elements like headings, quotes, and code blocks.',
      docs: [
        {
          route: '/docs/basic-elements',
          title: 'Basic Elements',
        },
      ],
    },
    files: [
      'example/demo.tsx',
      'example/values/basic-elements-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'basic-elements-demo',
    registryDependencies: ['basic-nodes-plugins'],
    type: 'registry:example',
  },
  {
    doc: {
      description:
        'Basic text formatting marks like bold, italic, and underline.',
      docs: [
        {
          route: '/docs/basic-marks',
          title: 'Basic Marks',
        },
      ],
    },
    files: [
      'example/demo.tsx',
      'example/values/basic-marks-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'basic-marks-demo',
    registryDependencies: ['basic-nodes-plugins'],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Basic block elements and text marks.',
      docs: [
        {
          route: '/docs/basic-elements',
          title: 'Basic Elements',
        },
      ],
      keywords: ['element', 'leaf'],
    },
    files: [
      'example/demo.tsx',
      'example/values/basic-nodes-value.tsx',
      'example/values/basic-elements-value.tsx',
      'example/values/basic-marks-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'basic-nodes-demo',
    registryDependencies: ['basic-nodes-plugins'],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Block-level context menu with formatting options.',
      docs: [
        {
          route: '/docs/block-menu',
          title: 'Block Menu',
        },
      ],
    },
    files: [
      'example/demo.tsx',
      'example/values/block-menu-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'block-menu-demo',
    registryDependencies: ['block-menu-plugins'],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Visual block selection with keyboard support.',
    },
    files: [
      'example/demo.tsx',
      'example/values/block-selection-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'block-selection-demo',
    registryDependencies: ['block-selection-plugins'],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Column layout.',
      docs: [
        {
          route: '/docs/column',
          title: 'Column',
        },
      ],
    },
    files: [
      'example/demo.tsx',
      'example/values/column-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'column-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Adding and displaying comments within content.',
      docs: [
        {
          route: '/docs/comments',
          title: 'Comments',
        },
      ],
    },
    files: [
      'example/demo.tsx',
      'example/values/comments-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'comments-demo',
    registryDependencies: ['comments-plugin'],
    type: 'registry:example',
  },
  {
    dependencies: ['@udecode/plate-ai', '@udecode/plate-markdown'],
    doc: {
      description: 'Renders AI ghost text suggestions at the cursor position.',
      docs: [
        {
          route: '/docs/copilot',
          title: 'Copilot',
        },
      ],
    },
    files: [
      'example/copilot-demo.tsx',
      'example/values/copilot-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'copilot-demo',
    registryDependencies: ['copilot-plugins'],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Visual indicator for cursor position within the editor.',
      title: 'Cursor Overlay',
    },
    files: [
      'example/demo.tsx',
      'example/values/cursor-overlay-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'cursor-overlay-demo',
    registryDependencies: ['cursor-overlay-plugin'],
    type: 'registry:example',
  },
  // {
  //   doc: {
  //     description: 'Media upload and caption functionality.',
  //   },
  //   files: ['example/demo.tsx'],
  //   name: 'upload-demo',
  //   registryDependencies: [],
  //   type: 'registry:example',
  // },
  // {
  //   doc: {
  //     description: 'Real-time collaboration with cursors and selections.',
  //   },
  //   files: ['example/demo.tsx'],
  //   name: 'collaboration-demo',
  //   registryDependencies: [],
  //   type: 'registry:example',
  // },
  {
    doc: {
      description: 'Inline date elements with calendar selection interface.',
      docs: [
        {
          route: '/docs/date',
          title: 'Date',
        },
      ],
    },
    files: [
      'example/demo.tsx',
      'example/values/date-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'date-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description:
        'Implements draggable functionality for editor blocks, including drag handles and drop indicators.',
      docs: [
        {
          route: '/docs/dnd',
          title: 'Drag & Drop',
        },
      ],
      title: 'Drag & Drop',
    },
    files: [
      'example/demo.tsx',
      'example/values/dnd-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'dnd-demo',
    registryDependencies: ['dnd-plugins'],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Emoji insertion via toolbar or colon-triggered combobox.',
      docs: [
        {
          route: '/docs/emoji',
          title: 'Emoji',
        },
      ],
    },
    files: [
      'example/demo.tsx',
      'example/values/emoji-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'emoji-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Exit a large block using a shortcut.',
      title: 'Exit Break',
    },
    files: [
      'example/demo.tsx',
      'example/values/exit-break-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'exit-break-demo',
    registryDependencies: ['exit-break-plugin'],
    type: 'registry:example',
  },
  {
    // doc: {
    //   description: 'A drawing component powered by Excalidraw.',
    //   title: 'Excalidraw',
    // },
    files: [
      'example/excalidraw-demo.tsx',
      'example/values/excalidraw-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'excalidraw-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  // {
  //   doc: {
  //     description: 'LaTeX equations with inline and block formats.',
  //     docs: [
  //       {
  //         route: '/docs/equation',
  //         title: 'Equation',
  //       },
  //     ],
  //   },
  //   files: [
  //     'example/demo.tsx',
  //     'components/editor/plugins/equation-plugins.tsx',
  //     'example/values/equation-value.tsx',
  //   ],
  //   name: 'equation-demo',
  //   registryDependencies: [],
  //   type: 'registry:example',
  // },
  {
    doc: {
      description: 'Find and replace functionality in text.',
    },
    files: [
      'example/find-replace-demo.tsx',
      'example/values/find-replace-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'find-replace-demo',
    registryDependencies: ['fixed-toolbar', 'input', 'search-highlight-leaf'],
    type: 'registry:example',
  },
  {
    doc: {
      description:
        'Floating toolbar with text formatting and AI assistance options.',
      docs: [
        {
          route: '/docs/ai',
          title: 'AI',
        },
      ],
    },
    files: [
      'example/demo.tsx',
      'example/values/floating-toolbar-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'floating-toolbar-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Color picker for text and background colors.',
    },
    files: [
      'example/demo.tsx',
      'example/values/font-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'font-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    // doc: {
    //   description: 'Text highlighting with customizable colors.',
    // },
    files: [
      'example/demo.tsx',
      'example/values/highlight-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'highlight-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Horizontal lines for visually separating content sections.',
      docs: [
        {
          route: '/docs/horizontal-rule',
          title: 'Horizontal Rule',
        },
      ],
    },
    files: [
      'example/demo.tsx',
      'example/values/horizontal-rule-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'horizontal-rule-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    // doc: {
    //   description: 'Customize text indentation.',
    //   docs: [
    //     {
    //       route: '/docs/indent',
    //       title: 'Indent',
    //     },
    //   ],
    // },
    files: [
      'example/demo.tsx',
      'example/values/indent-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'indent-demo',
    registryDependencies: ['indent-list-plugins'],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Turn any block into a list item.',
      docs: [
        {
          route: '/docs/indent',
          title: 'Indent',
        },
        {
          route: '/docs/indent-list',
          title: 'Indent List',
        },
      ],
    },
    files: [
      'example/demo.tsx',
      'example/values/indent-list-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'indent-list-demo',
    registryDependencies: ['indent-list-plugins'],
    type: 'registry:example',
  },
  {
    files: [
      'example/demo.tsx',
      'example/values/kbd-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'kbd-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Line height adjustment controls.',
    },
    files: [
      'example/demo.tsx',
      'example/values/line-height-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'line-height-demo',
    registryDependencies: ['line-height-plugin'],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Hyperlinks with toolbar insertion and URL pasting support.',
      docs: [
        {
          route: '/docs/link',
          title: 'Link',
        },
      ],
    },
    files: [
      'example/demo.tsx',
      'example/values/link-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'link-demo',
    registryDependencies: ['link-plugin'],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'List creation and formatting.',
    },
    files: [
      'example/list-demo.tsx',
      'example/values/list-value.tsx',
      'components/editor/plugins/fixed-toolbar-list-plugin.tsx',
      'plate-ui/fixed-toolbar-list-buttons.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'list-demo',
    registryDependencies: [
      'autoformat-list-plugin',
      'list-element',
      'todo-list-element',
    ],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Media embedding and management.',
    },
    files: [
      'example/demo.tsx',
      'example/values/media-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'media-demo',
    registryDependencies: ['media-plugins'],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Mention functionality for referencing users or entities.',
      docs: [
        {
          route: '/docs/mention',
          title: 'Mention',
        },
      ],
    },
    files: [
      'example/demo.tsx',
      'example/values/mention-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'mention-demo',
    registryDependencies: ['mention-plugin'],
    type: 'registry:example',
  },
  // {
  //   doc: {
  //     description: 'Placeholder text in empty blocks.',
  //   },
  //   files: [
  //     'example/demo.tsx',
  //     'components/editor/use-create-editor.tsx',
  //     'components/editor/plugins/editor-plugins.tsx',
  //   ],
  //   name: 'placeholder-demo',
  //   registryDependencies: [],
  //   type: 'registry:example',
  // },
  {
    files: [
      'example/demo.tsx',
      'example/values/basic-elements-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'reset-node-demo',
    registryDependencies: ['reset-block-type-plugin'],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Copy paste from CSV to Slate.',
      title: 'Serializing CSV',
    },
    files: [
      'example/demo.tsx',
      'example/values/deserialize-csv-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'csv-demo',
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Copy paste from DOCX to Slate.',
      title: 'Serializing Docx',
    },
    files: [
      'example/demo.tsx',
      'example/values/deserialize-docx-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'docx-demo',
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Copy paste from HTML to Slate.',
      title: 'Serializing HTML',
    },
    files: [
      'example/demo.tsx',
      'example/values/deserialize-html-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'html-demo',
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Copy paste from Markdown to Slate.',
      title: 'Serializing Markdown',
    },
    files: [
      'example/demo.tsx',
      'example/values/deserialize-md-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'markdown-demo',
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Restrict the editor to a single block.',
      title: 'Single Line',
    },
    files: [
      'example/single-line-demo.tsx',
      'example/values/single-line-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'single-line-demo',
    type: 'registry:example',
  },
  {
    doc: {
      description:
        'Slash command menu for quick insertion of various content types.',
      docs: [
        {
          route: '/docs/slash-command',
          title: 'Slash Command',
        },
      ],
    },
    files: [
      'example/demo.tsx',
      'example/values/slash-command-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'slash-command-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description:
        'Insert line breaks within a block of text without starting a new block.',
      title: 'Soft Break',
    },
    files: [
      'example/demo.tsx',
      'example/values/soft-break-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'soft-break-demo',
    registryDependencies: ['soft-break-plugin'],
    type: 'registry:example',
  },
  {
    files: [
      'example/tabbable-demo.tsx',
      'example/values/tabbable-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'tabbable-demo',
    type: 'registry:example',
  },
  {
    doc: {
      description:
        'Customizable tables with resizable columns and row merging options.',
      docs: [
        {
          route: '/docs/table',
          title: 'Table',
        },
      ],
    },
    files: [
      'example/demo.tsx',
      'example/values/table-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'table-demo',
    registryDependencies: ['table-plugin'],
    type: 'registry:example',
  },
  {
    files: [
      'example/table-nomerge-demo.tsx',
      'example/values/table-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'table-nomerge-demo',
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Dynamic TOC with in-document element for easy navigation.',
      docs: [
        {
          route: '/docs/toc',
          title: 'TOC',
        },
      ],
      title: 'Table of Contents',
    },
    files: [
      'example/demo.tsx',
      'example/values/toc-value.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'toc-demo',
    registryDependencies: ['toc-plugin'],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Collapsible content blocks.',
    },
    files: [
      'example/demo.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'toggle-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
];

export const examples: Registry = [
  ...docExamples,

  {
    files: [
      'example/demo.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'demo',
    type: 'registry:example',
  },
  // Others
  {
    files: ['example/pro-iframe-demo.tsx'],
    name: 'pro-iframe-demo',
    type: 'registry:example',
  },
  {
    files: ['example/potion-iframe-demo.tsx'],
    name: 'potion-iframe-demo',
    type: 'registry:example',
  },
  // Editor
  {
    doc: {
      title: 'Default',
    },
    files: ['example/editor-default.tsx'],
    name: 'editor-default',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      title: 'Disabled',
    },
    files: ['example/editor-disabled.tsx'],
    name: 'editor-disabled',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      title: 'Full Width',
    },
    files: ['example/editor-full-width.tsx'],
    name: 'editor-full-width',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: ['example/basic-editor-default-demo.tsx'],
    name: 'basic-editor-default-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: ['example/controlled-demo.tsx'],
    name: 'controlled-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: ['example/basic-editor-styling-demo.tsx'],
    name: 'basic-editor-styling-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: ['example/basic-editor-handler-demo.tsx'],
    name: 'basic-editor-handler-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: ['example/basic-editor-value-demo.tsx'],
    name: 'basic-editor-value-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: ['example/basic-plugins-components-demo.tsx'],
    name: 'basic-plugins-components-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: ['example/basic-plugins-default-demo.tsx'],
    name: 'basic-plugins-default-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: ['example/editable-voids-demo.tsx'],
    name: 'editable-voids-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: ['example/hundreds-blocks-demo.tsx'],
    name: 'hundreds-blocks-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: ['example/hundreds-editors-demo.tsx'],
    name: 'hundreds-editors-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: ['example/iframe-demo.tsx'],
    name: 'iframe-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: ['example/mode-toggle.tsx'],
    name: 'mode-toggle',
    type: 'registry:example',
  },
  {
    files: ['example/multiple-editors-demo.tsx'],
    name: 'multiple-editors-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: ['example/version-history-demo.tsx'],
    name: 'version-history-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: [
      'example/demo.tsx',
      'components/editor/use-create-editor.tsx',
      'components/editor/plugins/editor-plugins.tsx',
    ],
    name: 'playground-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: ['example/preview-markdown-demo.tsx'],
    name: 'preview-markdown-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: ['example/markdown-to-slate-demo.tsx'],
    name: 'markdown-to-slate-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  // {
  //   external: true,
  //   files: ['lib/plate-types.ts'],
  //   name: 'plate-types',
  //   type: 'registry:lib',
  // },
];
