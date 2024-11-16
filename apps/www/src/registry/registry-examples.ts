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
  - Resize using vertical edge bars
  - Alignment options
  - Caption support
  - Expand/collapse view
  - Easy download
- Video-specific features:
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
    files: ['example/demo.tsx'],
    name: 'align-demo',
    registryDependencies: [],
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
      'components/editor/plugins/basic-nodes-plugins.tsx',
      'example/values/basic-elements-value.tsx',
    ],
    name: 'basic-elements-demo',
    registryDependencies: [],
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
      'components/editor/plugins/basic-nodes-plugins.tsx',
      'example/values/basic-marks-value.tsx',
    ],
    name: 'basic-marks-demo',
    registryDependencies: [],
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
      'components/editor/plugins/basic-nodes-plugins.tsx',
      'example/values/basic-nodes-value.tsx',
    ],
    name: 'basic-nodes-demo',
    registryDependencies: [],
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
      'components/editor/plugins/block-menu-plugins.ts',
      'example/values/block-menu-value.tsx',
    ],
    name: 'block-menu-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Visual block selection with keyboard support.',
    },
    files: ['example/demo.tsx'],
    name: 'block-selection-demo',
    registryDependencies: [],
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
      'components/editor/plugins/editor-plugins.tsx',
      'example/values/column-value.tsx',
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
      'components/editor/plugins/comments-plugin.tsx',
      'example/values/comments-value.tsx',
    ],
    name: 'comments-demo',
    registryDependencies: [],
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
      'components/editor/plugins/copilot-plugins.tsx',
      'example/values/copilot-value.tsx',
    ],
    name: 'copilot-demo',
    registryDependencies: [],
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
      'components/editor/plugins/editor-plugins.tsx',
      'example/values/date-value.tsx',
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
      'components/editor/plugins/dnd-plugins.tsx',
      'example/values/dnd-value.tsx',
    ],
    name: 'dnd-demo',
    registryDependencies: [],
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
      'components/editor/plugins/editor-plugins.tsx',
      'example/values/emoji-value.tsx',
    ],
    name: 'emoji-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  // {
  //   doc: {
  //     description: 'A drawing component powered by Excalidraw.',
  //     title: 'Excalidraw',
  //   },
  //   files: ['example/excalidraw-demo.tsx'],
  //   name: 'excalidraw-demo',
  //   registryDependencies: [],
  //   type: 'registry:example',
  // },
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
    files: ['example/find-replace-demo.tsx'],
    name: 'find-replace-demo',
    registryDependencies: [],
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
    files: ['example/demo.tsx', 'example/values/floating-toolbar-value.tsx'],
    name: 'floating-toolbar-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Color picker for text and background colors.',
    },
    files: ['example/demo.tsx'],
    name: 'font-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  // {
  //   doc: {
  //     description: 'Text highlighting with customizable colors.',
  //   },
  //   files: ['example/demo.tsx'],
  //   name: 'highlight-demo',
  //   registryDependencies: [],
  //   type: 'registry:example',
  // },
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
      'components/editor/plugins/editor-plugins.tsx',
      'example/values/horizontal-rule-value.tsx',
    ],
    name: 'horizontal-rule-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Block indentation controls.',
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
    files: ['example/demo.tsx'],
    name: 'indent-list-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  // {
  //   doc: {
  //     description: 'Keyboard shortcut styling.',
  //   },
  //   files: ['example/demo.tsx'],
  //   name: 'kbd-demo',
  //   registryDependencies: [],
  //   type: 'registry:example',
  // },
  {
    doc: {
      description: 'Line height adjustment controls.',
    },
    files: ['example/demo.tsx'],
    name: 'line-height-demo',
    registryDependencies: [],
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
      'components/editor/plugins/link-plugin.tsx',
      'example/values/link-value.tsx',
    ],
    name: 'link-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'List creation and formatting.',
    },
    files: ['example/list-demo.tsx'],
    name: 'list-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Media embedding and management.',
    },
    files: ['example/demo.tsx'],
    name: 'media-demo',
    registryDependencies: [],
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
      'components/editor/plugins/mention-plugin.ts',
      'example/values/mention-value.tsx',
    ],
    name: 'mention-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Placeholder text in empty blocks.',
    },
    files: ['example/demo.tsx'],
    name: 'placeholder-demo',
    registryDependencies: [],
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
      'components/editor/plugins/editor-plugins.tsx',
      'example/values/slash-command-value.tsx',
    ],
    name: 'slash-command-demo',
    registryDependencies: [],
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
      'components/editor/plugins/table-plugin.ts',
      'example/values/table-value.tsx',
    ],
    name: 'table-demo',
    registryDependencies: [],
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
      'components/editor/plugins/toc-plugin.ts',
      'example/values/toc-value.tsx',
    ],
    name: 'toc-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Collapsible content blocks.',
    },
    files: ['example/demo.tsx'],
    name: 'toggle-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
];

export const examples: Registry = [
  ...docExamples,

  {
    files: ['example/demo.tsx'],
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
    doc: {
      title: 'AI Chat',
    },
    files: ['example/editor-ai-chat.tsx'],
    name: 'editor-ai-chat',
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
    files: ['example/demo.tsx'],
    name: 'playground-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: ['example/preview-md-demo.tsx'],
    name: 'preview-md-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    files: ['example/markdown-demo.tsx'],
    name: 'markdown-demo',
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
