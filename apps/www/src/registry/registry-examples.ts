import type { Registry } from 'shadcx/registry';

export const proExamples: Registry['items'] = [
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
- Use slash commands for quick insertion
- Displays clickable placeholders for various media types (image, video, audio, file)
- Opens a popover with two tabs when the placeholder is clicked:
  - Upload tab: Allows uploading local files directly
  - Embed tab: Enables pasting embed links for media content
- Image-specific features:
  - **Better loading rendering and image replacement**
  - Alignment options
  - Expand/collapse view
  - Download button
- Video-specific features:
  - Lazy load
  - Alignment options
  - Caption support
  - View original source
- Beautifully crafted UI
`,
    },
    name: 'upload-pro',
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
      description: `- Full stack example for Suggestion and Comment
- Floating comments & suggestions UI with better user experience
- Comment rendered with Plate editor
- Discussion list in the sidebar`,
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

export const docExamples: Registry['items'] = [
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'components/editor/plugins/ai-plugins.tsx',
        type: 'registry:example',
      },
      { path: 'examples/values/ai-value.tsx', type: 'registry:example' },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      { path: 'examples/values/align-value.tsx', type: 'registry:example' },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/autoformat-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/basic-elements-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/basic-marks-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/basic-nodes-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'examples/values/basic-elements-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'examples/values/basic-marks-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/block-menu-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/block-selection-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      { path: 'examples/values/column-value.tsx', type: 'registry:example' },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/comments-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/copilot-demo.tsx', type: 'registry:example' },
      { path: 'examples/values/copilot-value.tsx', type: 'registry:example' },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/cursor-overlay-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
    ],
    name: 'cursor-overlay-demo',
    registryDependencies: ['cursor-overlay-plugin'],
    type: 'registry:example',
  },
  // {
  //   doc: {
  //     description: 'Media upload and caption functionality.',
  //   },
  // {type: 'registry:example',path:  //   files: ['examples/demo.tsx'],}
  //   name: 'upload-demo',
  //   registryDependencies: [],
  //   type: 'registry:example',
  // },
  // {
  //   doc: {
  //     description: 'Real-time collaboration with cursors and selections.',
  //   },
  // {type: 'registry:example',path:  //   files: ['examples/demo.tsx'],}
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      { path: 'examples/values/date-value.tsx', type: 'registry:example' },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      { path: 'examples/values/dnd-value.tsx', type: 'registry:example' },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      { path: 'examples/values/emoji-value.tsx', type: 'registry:example' },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
    ],
    name: 'emoji-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'LaTeX equations with inline and block formats.',
      docs: [
        {
          route: '/docs/equation',
          title: 'Equation',
        },
      ],
    },
    files: [
      { path: 'examples/demo.tsx', type: 'registry:example' },
      { path: 'examples/values/emoji-value.tsx', type: 'registry:example' },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
    ],
    name: 'equation-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Exit a large block using a shortcut.',
      title: 'Exit Break',
    },
    files: [
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/exit-break-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/excalidraw-demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/excalidraw-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
  // {type: 'registry:example',path:  //     'examples/demo.tsx',}
  // {type: 'registry:example',path:  //     'components/editor/plugins/equation-plugins.tsx',}
  // {type: 'registry:example',path:  //     'examples/values/equation-value.tsx',}
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
      { path: 'examples/find-replace-demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/find-replace-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/floating-toolbar-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      { path: 'examples/values/font-value.tsx', type: 'registry:example' },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/highlight-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/horizontal-rule-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      { path: 'examples/values/indent-value.tsx', type: 'registry:example' },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/indent-list-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
    ],
    name: 'indent-list-demo',
    registryDependencies: ['indent-list-plugins'],
    type: 'registry:example',
  },
  {
    files: [
      { path: 'examples/demo.tsx', type: 'registry:example' },
      { path: 'examples/values/kbd-value.tsx', type: 'registry:example' },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/line-height-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      { path: 'examples/values/link-value.tsx', type: 'registry:example' },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/list-demo.tsx', type: 'registry:example' },
      { path: 'examples/values/list-value.tsx', type: 'registry:example' },
      {
        path: 'components/editor/plugins/fixed-toolbar-list-plugin.tsx',
        type: 'registry:example',
      },
      {
        path: 'plate-ui/fixed-toolbar-list-buttons.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor-list.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      { path: 'examples/values/media-value.tsx', type: 'registry:example' },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      { path: 'examples/values/mention-value.tsx', type: 'registry:example' },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
  // {type: 'registry:example',path:  //     'examples/demo.tsx',}
  // {type: 'registry:example',path:  //     'components/editor/use-create-editor.ts',}
  // {type: 'registry:example',path:  //     'components/editor/plugins/editor-plugins.tsx',}
  //   ],
  //   name: 'placeholder-demo',
  //   registryDependencies: [],
  //   type: 'registry:example',
  // },
  {
    files: [
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/basic-elements-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/deserialize-csv-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/deserialize-docx-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/deserialize-html-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/deserialize-md-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
    ],
    name: 'markdown-demo',
    type: 'registry:example',
  },
  {
    doc: {
      description: 'A form with a select editor component for managing labels.',
      docs: [
        {
          route: '/docs/multi-select',
        },
      ],
      title: 'Select Editor Form',
    },
    files: [
      { path: 'examples/select-editor-demo.tsx', type: 'registry:example' },
    ],
    name: 'select-editor-demo',
    registryDependencies: ['form', 'button', 'select-editor'],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Restrict the editor to a single block.',
      title: 'Single Line',
    },
    files: [
      { path: 'examples/single-line-demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/single-line-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/slash-command-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/soft-break-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
    ],
    name: 'soft-break-demo',
    registryDependencies: ['soft-break-plugin'],
    type: 'registry:example',
  },
  {
    files: [
      { path: 'examples/tabbable-demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/tabbable-value.tsx',
        type: 'registry:example',
      },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      { path: 'examples/values/table-value.tsx', type: 'registry:example' },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
    ],
    name: 'table-demo',
    registryDependencies: ['table-plugin'],
    type: 'registry:example',
  },
  {
    files: [
      { path: 'examples/table-nomerge-demo.tsx', type: 'registry:example' },
      { path: 'examples/values/table-value.tsx', type: 'registry:example' },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      { path: 'examples/values/toc-value.tsx', type: 'registry:example' },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
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
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
    ],
    name: 'toggle-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
];

export const examples: Registry['items'] = [
  ...docExamples,

  {
    files: [
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
    ],
    name: 'demo',
    type: 'registry:example',
  },
  // Others
  {
    files: [{ path: 'examples/pro-iframe-demo.tsx', type: 'registry:example' }],
    name: 'pro-iframe-demo',
    type: 'registry:example',
  },
  {
    files: [
      { path: 'examples/potion-iframe-demo.tsx', type: 'registry:example' },
    ],
    name: 'potion-iframe-demo',
    type: 'registry:example',
  },
  // Editor
  {
    doc: {
      title: 'Default',
    },
    files: [{ path: 'examples/editor-default.tsx', type: 'registry:example' }],
    name: 'editor-default',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      title: 'Disabled',
    },
    files: [{ path: 'examples/editor-disabled.tsx', type: 'registry:example' }],
    name: 'editor-disabled',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      title: 'Full Width',
    },
    files: [
      { path: 'examples/editor-full-width.tsx', type: 'registry:example' },
    ],
    name: 'editor-full-width',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: [
      {
        path: 'examples/basic-editor-default-demo.tsx',
        type: 'registry:example',
      },
    ],
    name: 'basic-editor-default-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: [{ path: 'examples/controlled-demo.tsx', type: 'registry:example' }],
    name: 'controlled-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: [
      {
        path: 'examples/basic-editor-styling-demo.tsx',
        type: 'registry:example',
      },
    ],
    name: 'basic-editor-styling-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: [
      {
        path: 'examples/basic-editor-handler-demo.tsx',
        type: 'registry:example',
      },
    ],
    name: 'basic-editor-handler-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: [
      {
        path: 'examples/basic-editor-value-demo.tsx',
        type: 'registry:example',
      },
    ],
    name: 'basic-editor-value-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: [
      {
        path: 'examples/basic-plugins-components-demo.tsx',
        type: 'registry:example',
      },
    ],
    name: 'basic-plugins-components-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: [
      {
        path: 'examples/basic-plugins-default-demo.tsx',
        type: 'registry:example',
      },
    ],
    name: 'basic-plugins-default-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: [
      { path: 'examples/editable-voids-demo.tsx', type: 'registry:example' },
    ],
    name: 'editable-voids-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: [
      { path: 'examples/hundreds-blocks-demo.tsx', type: 'registry:example' },
    ],
    name: 'hundreds-blocks-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: [
      { path: 'examples/hundreds-editors-demo.tsx', type: 'registry:example' },
    ],
    name: 'hundreds-editors-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: [{ path: 'examples/mode-toggle.tsx', type: 'registry:example' }],
    name: 'mode-toggle',
    type: 'registry:example',
  },
  {
    files: [
      { path: 'examples/multiple-editors-demo.tsx', type: 'registry:example' },
    ],
    name: 'multiple-editors-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: [
      { path: 'examples/version-history-demo.tsx', type: 'registry:example' },
    ],
    name: 'version-history-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: [
      { path: 'examples/demo.tsx', type: 'registry:example' },
      {
        path: 'components/editor/use-create-editor.ts',
        type: 'registry:example',
      },
      {
        path: 'components/editor/plugins/editor-plugins.tsx',
        type: 'registry:example',
      },
    ],
    name: 'playground-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: [
      { path: 'examples/preview-markdown-demo.tsx', type: 'registry:example' },
    ],
    name: 'preview-markdown-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: [
      { path: 'examples/markdown-to-slate-demo.tsx', type: 'registry:example' },
    ],
    name: 'markdown-to-slate-demo',
    registryDependencies: ['use-debounce'],
    type: 'registry:example',
  },
  // {
  //   external: true,
  // {type: 'registry:example',path:  //   files: ['lib/plate-types.ts'],}
  //   name: 'plate-types',
  //   type: 'registry:lib',
  // },
];
