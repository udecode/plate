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
    name: 'basic-elements-pro',
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
    name: 'context-menu-pro',
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
];

export const examples: Registry = [
  {
    dependencies: ['@udecode/plate-ai', '@udecode/plate-markdown'],
    doc: {
      description:
        'AI menu with commands, streaming responses in a preview or directly into the editor.',
      title: 'AI',
    },
    files: [
      'example/playground-demo.tsx',
      // 'example/ai-plugins.tsx',
      // 'example/ai-value.tsx',
    ],
    name: 'ai-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description:
        'Basic block elements like headings, quotes, and code blocks.',
    },
    files: [
      'example/playground-demo.tsx',
      // 'example/basic-elements-plugins.tsx',
      // 'example/basic-elements-value.tsx',
    ],
    name: 'basic-elements-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description:
        'Basic text formatting marks like bold, italic, and underline.',
    },
    files: [
      'example/playground-demo.tsx',
      // 'example/basic-marks-plugins.tsx',
      // 'example/basic-marks-value.tsx',
    ],
    name: 'basic-marks-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Basic block elements and text marks.',
      keywords: ['element', 'leaf'],
    },
    files: [
      'example/playground-demo.tsx',
      // 'example/basic-nodes-plugins.tsx',
      // 'example/basic-nodes-value.tsx',
    ],
    name: 'basic-nodes-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Text alignment controls for blocks.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'alignment-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Block-level context menu with formatting options.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'context-menu-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Visual block selection with keyboard support.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'selection-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Media upload and caption functionality.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'upload-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Color picker for text and background colors.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'color-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Collaborative commenting system.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'comments-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Real-time collaboration with cursors and selections.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'collaboration-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Drag and drop functionality for blocks.',
      title: 'Drag & Drop',
    },
    files: ['example/playground-demo.tsx'],
    name: 'dnd-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Emoji picker with search and categories.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'emoji-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Fixed toolbar with formatting controls.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'toolbar-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Floating toolbar for selected text.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'floating-toolbar-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
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
      description: 'Text highlighting with customizable colors.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'highlight-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Horizontal rule insertion and styling.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'horizontal-rule-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Block indentation controls.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'indent-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Keyboard shortcut styling.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'kbd-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Line height adjustment controls.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'line-height-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Link insertion and editing.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'link-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'List creation and formatting.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'list-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Media embedding and management.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'media-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'User mention functionality with autocomplete.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'mention-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Editor mode switching.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'mode-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Placeholder text in empty blocks.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'placeholder-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Element resizing functionality.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'resizable-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Slash commands for block insertion.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'slash-menu-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Table creation and manipulation.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'table-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Table of contents generation.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'toc-demo',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      description: 'Collapsible content blocks.',
    },
    files: ['example/playground-demo.tsx'],
    name: 'toggle-demo',
    registryDependencies: [],
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
      title: 'Ghost',
    },
    files: ['example/editor-ghost.tsx'],
    name: 'editor-ghost',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      title: 'With Label',
    },
    files: ['example/editor-label.tsx'],
    name: 'editor-label',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      title: 'With Text',
    },
    files: ['example/editor-text.tsx'],
    name: 'editor-text',
    registryDependencies: [],
    type: 'registry:example',
  },
  {
    doc: {
      title: 'With Button',
    },
    files: ['example/editor-button.tsx'],
    name: 'editor-button',
    registryDependencies: [],
    type: 'registry:example',
  },
  // {
  //   files: ['example/editor-form.tsx'],
  //   name: 'editor-form',
  //   registryDependencies: [],
  //   type: 'registry:example',
  // },
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
    files: ['example/playground-demo.tsx'],
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
    external: true,
    files: ['lib/plate-types.ts'],
    name: 'plate-types',
    type: 'registry:lib',
  },
];
