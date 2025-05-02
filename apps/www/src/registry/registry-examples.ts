import type { Registry } from 'shadcn/registry';

export const proExamples: Registry['items'] = [
  {
    categories: ['pro'],
    description: `Combobox menu with free-form prompt input
- Additional trigger methods:
  - Block menu button
  - Slash command menu
- Beautifully crafted UI`,
    name: 'ai-pro',
    type: 'registry:example',
  },
  {
    categories: ['pro'],
    description: `- Sticky TOC sidebar
- Hover-to-expand: Opens automatically when you move your mouse over it
- Interactive navigation: Click on items to smoothly scroll to the corresponding heading
- Visual feedback: Highlights the current section in the sidebar
- Beautifully crafted UI`,
    name: 'toc-pro',
    type: 'registry:example',
  },
  {
    categories: ['pro'],
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
    name: 'upload-pro',
    type: 'registry:example',
  },
  {
    categories: ['pro'],
    description: `- Open the menu via the drag button or the three-dot menu on specific blocks (e.g. images)
- Includes a combobox that filters options as you type
- Supports nested menu options
- Advanced actions such as "Ask AI", colors, and commenting
- Beautifully crafted UI`,
    name: 'block-menu-pro',
    type: 'registry:example',
  },
  {
    categories: ['pro'],
    description: `- Beautifully crafted UI`,
    name: 'block-selection-pro',
    type: 'registry:example',
  },
  {
    categories: ['pro'],
    description: `- Full stack example for Suggestion and Comment
- Floating comments & suggestions UI with better user experience
- Comment rendered with Plate editor
- Discussion list in the sidebar`,
    name: 'comments-pro',
    type: 'registry:example',
  },
  {
    categories: ['pro'],
    description: `- Insert callouts using the slash command
- Ability to change the callout emoji
- Beautifully crafted UI`,
    name: 'callout-pro',
    type: 'registry:example',
  },
  {
    categories: ['pro'],
    description: `- Suggestions powered by AI SDK (OpenAI). Code available in [Potion template](https://pro.platejs.org/docs/templates/potion)
- Rich text suggestions including marks and links
- Hover card with additional information
- Beautifully crafted UI`,
    name: 'copilot-pro',
    type: 'registry:example',
  },
  {
    categories: ['pro'],
    description: `- Mark text as equation from the toolbar
- Insert equation from slash command
- Beautifully crafted UI`,
    name: 'equation-pro',
    type: 'registry:example',
  },
  {
    categories: ['pro'],
    description: `- Extended set of slash menu options like "Ask AI"
- Trigger slash menu by click the + button on the left gutter
- Item groups
- Beautifully crafted UI`,
    name: 'slash-menu-pro',
    type: 'registry:example',
  },
  {
    categories: ['pro'],
    description: `- "+" button on the left gutter to insert blocks
- Click on the drag handle to open the block menu
- Beautifully crafted UI`,
    name: 'dnd-pro',
    type: 'registry:example',
  },
  //   {
  //
  //       description: `- Enhanced emoji picker with search functionality
  // - Categorized emoji selection
  // - Recent emojis section
  // - Keyboard navigation support
  // - Insert emojis via slash commands
  // - Beautifully crafted UI`,
  //     },
  //     name: 'emoji-pro',
  // categories: ['pro'],
  // type: 'registry:example',
  //   },
  {
    categories: ['pro'],
    description: `- Color picker
- Mark as equation
- Beautifully crafted UI`,
    name: 'floating-toolbar-pro',
    type: 'registry:example',
  },
  //   {
  //
  //       description: `- Enhanced link editing experience
  // - Preview card with metadata
  // - Custom link actions
  // - Quick edit and remove options
  // - Keyboard shortcuts support
  // - Beautifully crafted UI`,
  //     },
  //     name: 'link-pro',
  // categories: ['pro'],
  // type: 'registry:example',
  //   },
  {
    categories: ['pro'],
    description: `- Code block:
  - A "Copy" button to easily copy the entire code snippet.
  - A "Block Menu" button to access additional options and actions.
- Beautifully crafted UI`,
    name: 'basic-nodes-pro',
    type: 'registry:example',
  },
  {
    categories: ['pro'],
    description: `- Floating toolbar appears at the top right of media elements
- Alignment dropdown menu
- Caption button
- Expand button
- Download button
- Beautifully crafted UI`,
    name: 'media-toolbar-pro',
    type: 'registry:example',
  },
  //   {
  //
  //       description: `- Enhanced table editing experience
  // - Column and row management
  // - Cell merging and splitting
  // - Custom cell styling options
  // - Resize columns with drag handles
  // - Header row and column support
  // - Beautifully crafted UI`,
  //     },
  //     name: 'table-pro',
  // categories: ['pro'],
  // type: 'registry:example',
  //   },
  //   {
  //
  //       description: `- Enhanced mention functionality
  // - Real-time user search and filtering
  // - Customizable mention triggers (@, #, etc.)
  // - Rich preview cards for mentioned items
  // - Keyboard navigation support
  // - Beautifully crafted UI`,
  //     },
  //     name: 'mention-pro',
  // categories: ['pro'],
  // type: 'registry:example',
  //   },
  //   {
  //
  //       description: `- Enhanced horizontal rule customization
  // - Multiple style presets
  // - Custom spacing controls
  // - Color and thickness options
  // - Quick insertion via slash commands
  // - Beautifully crafted UI`,
  //     },
  //     name: 'horizontal-rule-pro',
  // categories: ['pro'],
  // type: 'registry:example',
  //   },
  //   {
  //
  //       description: `- Enhanced date picker functionality
  // - Multiple date formats support
  // - Calendar interface for date selection
  // - Keyboard navigation and shortcuts
  // - Custom date formatting options
  // - Beautifully crafted UI`,
  //     },
  //     name: 'date-pro',
  // categories: ['pro'],
  // type: 'registry:example',
  //   },
  //   {
  //
  //       description: `- Multi-column layout support
  // - Flexible column width adjustment
  // - Drag and drop between columns
  // - Responsive column behavior
  // - Column merging and splitting
  // - Beautifully crafted UI`,
  //     },
  //     name: 'column-pro',
  // categories: ['pro'],
  // type: 'registry:example',
  //   },
];

export const docExamples: Registry['items'] = [
  {
    description:
      'AI menu with commands, streaming responses in a preview or directly into the editor.',
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
    meta: {
      docs: [
        {
          route: '/docs/ai',
          title: 'AI',
        },
      ],
    },
    name: 'ai-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/basic-nodes-plugins.json',
      'https://platejs.org/r/styles/default/block-selection-plugins.json',
      'https://platejs.org/r/styles/default/indent-list-plugins.json',
      'https://platejs.org/r/styles/default/link-plugin.json',
    ],
    title: 'AI',
    type: 'registry:example',
  },
  {
    description: 'Text alignment controls for blocks.',
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
    meta: {},
    name: 'align-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/align-plugin.json',
    ],
    type: 'registry:example',
  },

  {
    description: 'Apply formatting automatically using shortcodes.',
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
    meta: {},
    name: 'autoformat-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/autoformat-plugin.json',
    ],
    title: 'Autoformat',
    type: 'registry:example',
  },
  {
    description: 'Basic block elements like headings, quotes, and code blocks.',
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
    meta: {
      docs: [
        {
          route: '/docs/basic-elements',
          title: 'Basic Elements',
        },
      ],
    },
    name: 'basic-elements-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/basic-nodes-plugins.json',
    ],
    type: 'registry:example',
  },
  {
    description:
      'Basic text formatting marks like bold, italic, and underline.',
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
    meta: {
      docs: [
        {
          route: '/docs/basic-marks',
          title: 'Basic Marks',
        },
      ],
    },
    name: 'basic-marks-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/basic-nodes-plugins.json',
    ],
    type: 'registry:example',
  },
  {
    description: 'Basic block elements and text marks.',
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
    meta: {
      docs: [
        {
          route: '/docs/basic-elements',
          title: 'Basic Elements',
        },
      ],
      keywords: ['element', 'leaf'],
    },
    name: 'basic-nodes-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/basic-nodes-plugins.json',
    ],
    type: 'registry:example',
  },
  {
    description: 'Block-level context menu with formatting options.',
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
    meta: {
      docs: [
        {
          route: '/docs/block-menu',
          title: 'Block Menu',
        },
      ],
    },
    name: 'block-menu-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/block-menu-plugins.json',
    ],
    type: 'registry:example',
  },
  {
    description: 'Visual block selection with keyboard support.',
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
    meta: {},
    name: 'block-selection-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/block-selection-plugins.json',
    ],
    type: 'registry:example',
  },
  {
    description: 'Column layout.',
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
    meta: {
      docs: [
        {
          route: '/docs/column',
          title: 'Column',
        },
      ],
    },
    name: 'column-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    description: 'Adding and displaying comments within content.',
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
    meta: {
      docs: [
        {
          route: '/docs/comments',
          title: 'Comments',
        },
      ],
    },
    name: 'comments-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/comments-plugin.json',
      'https://platejs.org/r/styles/default/discussion-plugin.json',
    ],
    type: 'registry:example',
  },
  {
    dependencies: ['@udecode/plate-ai', '@udecode/plate-markdown'],
    description: 'Renders AI ghost text suggestions at the cursor position.',
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
    meta: {
      docs: [
        {
          route: '/docs/copilot',
          title: 'Copilot',
        },
      ],
    },
    name: 'copilot-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/copilot-plugins.json',
    ],
    type: 'registry:example',
  },
  {
    description: 'Visual indicator for cursor position within the editor.',
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
    meta: {},
    name: 'cursor-overlay-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/cursor-overlay-plugin.json',
    ],
    title: 'Cursor Overlay',
    type: 'registry:example',
  },
  // {
  //
  //     description: 'Media upload and caption functionality.',
  //   },
  // {type: 'registry:example',path:  //   files: ['examples/demo.tsx'],}
  //   name: 'upload-demo',
  //   registryDependencies: [],
  //   type: 'registry:example',
  // },
  // {
  //
  //     description: 'Real-time collaboration with cursors and selections.',
  //   },
  // {type: 'registry:example',path:  //   files: ['examples/demo.tsx'],}
  //   name: 'collaboration-demo',
  //   registryDependencies: [],
  //   type: 'registry:example',
  // },
  {
    description: 'Inline date elements with calendar selection interface.',
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
    meta: {
      docs: [
        {
          route: '/docs/date',
          title: 'Date',
        },
      ],
    },
    name: 'date-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    description:
      'Implements draggable functionality for editor blocks, including drag handles and drop indicators.',
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
    meta: {
      docs: [
        {
          route: '/docs/dnd',
          title: 'Drag & Drop',
        },
      ],
    },
    name: 'dnd-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/dnd-plugins.json',
    ],
    title: 'Drag & Drop',
    type: 'registry:example',
  },
  {
    description: 'Emoji insertion via toolbar or colon-triggered combobox.',
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
    meta: {
      docs: [
        {
          route: '/docs/emoji',
          title: 'Emoji',
        },
      ],
    },
    name: 'emoji-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    description: 'LaTeX equations with inline and block formats.',
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
    meta: {
      docs: [
        {
          route: '/docs/equation',
          title: 'Equation',
        },
      ],
    },
    name: 'equation-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    description: 'Exit a large block using a shortcut.',
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
    meta: {},
    name: 'exit-break-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/exit-break-plugin.json',
    ],
    title: 'Exit Break',
    type: 'registry:example',
  },
  {
    //
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
  //
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
    description: 'Find and replace functionality in text.',
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
    meta: {},
    name: 'find-replace-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/fixed-toolbar.json',
      'https://platejs.org/r/styles/default/input.json',
      'https://platejs.org/r/styles/default/search-highlight-leaf.json',
    ],
    type: 'registry:example',
  },
  {
    description:
      'Floating toolbar with text formatting and AI assistance options.',
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
    meta: {
      docs: [
        {
          route: '/docs/ai',
          title: 'AI',
        },
      ],
    },
    name: 'floating-toolbar-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    description: 'Color picker for text and background colors.',
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
    meta: {},
    name: 'font-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    //
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
    description: 'Horizontal lines for visually separating content sections.',
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
    meta: {
      docs: [
        {
          route: '/docs/horizontal-rule',
          title: 'Horizontal Rule',
        },
      ],
    },
    name: 'horizontal-rule-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    //
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
    registryDependencies: [
      'https://platejs.org/r/styles/default/indent-list-plugins.json',
    ],
    type: 'registry:example',
  },
  {
    description: 'Turn any block into a list item.',
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
    meta: {
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
    name: 'indent-list-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/indent-list-plugins.json',
    ],
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
    description: 'Line height adjustment controls.',
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
    meta: {},
    name: 'line-height-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/line-height-plugin.json',
    ],
    type: 'registry:example',
  },
  {
    description: 'Hyperlinks with toolbar insertion and URL pasting support.',
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
    meta: {
      docs: [
        {
          route: '/docs/link',
          title: 'Link',
        },
      ],
    },
    name: 'link-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/link-plugin.json',
    ],
    type: 'registry:example',
  },
  {
    description: 'List creation and formatting.',
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
    meta: {},
    name: 'list-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/autoformat-list-plugin.json',
      'https://platejs.org/r/styles/default/list-element.json',
      'https://platejs.org/r/styles/default/todo-list-element.json',
    ],
    type: 'registry:example',
  },
  {
    description: 'Media embedding and management.',
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
    meta: {},
    name: 'media-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/media-plugins.json',
    ],
    type: 'registry:example',
  },
  {
    description: 'Mention functionality for referencing users or entities.',
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
    meta: {
      docs: [
        {
          route: '/docs/mention',
          title: 'Mention',
        },
      ],
    },
    name: 'mention-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/mention-plugin.json',
    ],
    type: 'registry:example',
  },
  // {
  //
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
    registryDependencies: [
      'https://platejs.org/r/styles/default/reset-block-type-plugin.json',
    ],
    type: 'registry:example',
  },
  {
    description: 'Copy paste from CSV to Slate.',
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
    meta: {},
    name: 'csv-demo',
    title: 'Serializing CSV',
    type: 'registry:example',
  },
  {
    description: 'Copy paste from DOCX to Slate.',
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
    meta: {},
    name: 'docx-demo',
    title: 'Serializing Docx',
    type: 'registry:example',
  },
  {
    description: 'Copy paste from HTML to Slate.',
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
    meta: {},
    name: 'html-demo',
    title: 'Serializing HTML',
    type: 'registry:example',
  },
  {
    description: 'Copy paste from Markdown to Slate.',
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
    meta: {},
    name: 'markdown-demo',
    title: 'Serializing Markdown',
    type: 'registry:example',
  },
  {
    description: 'A form with a select editor component for managing labels.',
    files: [
      { path: 'examples/select-editor-demo.tsx', type: 'registry:example' },
    ],
    meta: {
      docs: [
        {
          route: '/docs/multi-select',
        },
      ],
    },
    name: 'select-editor-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/form.json',
      'https://platejs.org/r/styles/default/button.json',
      'https://platejs.org/r/styles/default/select-editor.json',
    ],
    title: 'Select Editor Form',
    type: 'registry:example',
  },
  {
    description: 'Restrict the editor to a single block.',
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
    meta: {},
    name: 'single-line-demo',
    title: 'Single Line',
    type: 'registry:example',
  },
  {
    description:
      'Slash command menu for quick insertion of various content types.',
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
    meta: {
      docs: [
        {
          route: '/docs/slash-command',
          title: 'Slash Command',
        },
      ],
    },
    name: 'slash-command-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    description:
      'Insert line breaks within a block of text without starting a new block.',
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
    meta: {},
    name: 'soft-break-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/soft-break-plugin.json',
    ],
    title: 'Soft Break',
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
    description:
      'Customizable tables with resizable columns and row merging options.',
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
    meta: {
      docs: [
        {
          route: '/docs/table',
          title: 'Table',
        },
      ],
    },
    name: 'table-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/table-plugin.json',
    ],
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
    description: 'Dynamic TOC with in-document element for easy navigation.',
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
    meta: {
      docs: [
        {
          route: '/docs/toc',
          title: 'TOC',
        },
      ],
    },
    name: 'toc-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/toc-plugin.json',
    ],
    title: 'Table of Contents',
    type: 'registry:example',
  },
  {
    description: 'Collapsible content blocks.',
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
    meta: {},
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
    files: [{ path: 'examples/editor-default.tsx', type: 'registry:example' }],
    meta: {},
    name: 'editor-default',
    registryDependencies: [],
    title: 'Default',
    type: 'registry:example',
  },
  {
    files: [{ path: 'examples/editor-disabled.tsx', type: 'registry:example' }],
    meta: {},
    name: 'editor-disabled',
    registryDependencies: [],
    title: 'Disabled',
    type: 'registry:example',
  },
  {
    files: [
      { path: 'examples/editor-full-width.tsx', type: 'registry:example' },
    ],
    meta: {},
    name: 'editor-full-width',
    registryDependencies: [],
    title: 'Full Width',
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
    meta: {},
    name: 'preview-markdown-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: [
      { path: 'examples/markdown-to-slate-demo.tsx', type: 'registry:example' },
    ],
    meta: {},
    name: 'markdown-to-slate-demo',
    registryDependencies: [
      'https://platejs.org/r/styles/default/use-debounce.json',
    ],
    type: 'registry:example',
  },
  // {
  //   external: true,
  // {type: 'registry:example',path:  //   files: ['lib/plate-types.ts'],}
  //   name: 'plate-types',
  //   type: 'registry:lib',
  // },
];
