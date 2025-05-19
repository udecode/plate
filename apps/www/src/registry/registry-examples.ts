import type { Registry } from 'shadcn/registry';

export const examples: Registry['items'] = [
  {
    dependencies: ['@udecode/plate-ai', '@udecode/plate-markdown'],
    description: 'Renders AI ghost text suggestions at the cursor position.',
    files: [
      { path: 'examples/copilot-demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/copilot-value.tsx',
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
          route: '/docs/copilot',
          title: 'Copilot',
        },
      ],
    },
    name: 'copilot-demo',
    registryDependencies: ['copilot-plugins', 'editor', 'use-create-editor'],
    type: 'registry:example',
  },
  {
    description: 'A form with a select editor component for managing labels.',
    files: [
      {
        path: 'examples/select-editor-demo.tsx',
        type: 'registry:example',
      },
    ],
    meta: {
      docs: [
        {
          route: '/docs/multi-select',
        },
      ],
    },
    name: 'select-editor-demo',
    registryDependencies: ['shadcn/form', 'button', 'select-editor'],
    title: 'Select Editor Form',
    type: 'registry:example',
  },
  {
    files: [
      {
        path: 'examples/controlled-demo.tsx',
        type: 'registry:example',
      },
    ],
    name: 'controlled-demo',
    registryDependencies: ['editor', 'shadcn/button'],
    type: 'registry:example',
  },
  {
    dependencies: [
      '@udecode/plate-basic-elements',
      '@udecode/plate-basic-marks',
    ],
    files: [
      {
        path: 'examples/hundreds-blocks-demo.tsx',
        type: 'registry:example',
      },
      {
        path: 'examples/values/huge-document-value.tsx',
        type: 'registry:example',
      },
    ],
    name: 'hundreds-blocks-demo',
    registryDependencies: ['use-create-editor', 'editor'],
    type: 'registry:example',
  },
  {
    files: [
      {
        path: 'examples/hundreds-editors-demo.tsx',
        type: 'registry:example',
      },
      {
        path: 'examples/values/multi-editors-value.tsx',
        type: 'registry:example',
      },
    ],
    name: 'hundreds-editors-demo',
    registryDependencies: ['use-create-editor', 'editor'],
    type: 'registry:example',
  },
  {
    dependencies: [
      '@udecode/plate-basic-elements',
      '@udecode/plate-basic-marks',
      '@udecode/plate-media',
    ],
    files: [
      {
        path: 'examples/multiple-editors-demo.tsx',
        type: 'registry:example',
      },
    ],
    name: 'multiple-editors-demo',
    registryDependencies: [
      'use-create-editor',
      'editor',
      'fixed-toolbar',
      'turn-into-toolbar-button',
      'delete-plugins',
      'shadcn/separator',
    ],
    type: 'registry:example',
  },
  {
    dependencies: [
      '@udecode/plate-basic-marks',
      '@udecode/plate-break',
      '@udecode/plate-diff',
      'lodash',
    ],
    files: [
      {
        path: 'examples/version-history-demo.tsx',
        type: 'registry:example',
      },
    ],
    name: 'version-history-demo',
    registryDependencies: ['use-create-editor', 'shadcn/button'],
    type: 'registry:example',
  },
  {
    dependencies: [
      '@udecode/plate-basic-elements',
      '@udecode/plate-basic-marks',
      'prismjs',
    ],
    files: [
      {
        path: 'examples/preview-markdown-demo.tsx',
        type: 'registry:example',
      },
      {
        path: 'examples/values/preview-md-value.tsx',
        type: 'registry:example',
      },
    ],
    name: 'preview-markdown-demo',
    registryDependencies: ['use-create-editor', 'editor'],
    type: 'registry:example',
  },
  {
    dependencies: [
      '@udecode/plate-markdown',
      'remark-emoji',
      'remark-gfm',
      'remark-math',
    ],
    files: [
      {
        path: 'examples/markdown-to-slate-demo.tsx',
        type: 'registry:example',
      },
    ],
    name: 'markdown-to-slate-demo',
    registryDependencies: ['use-create-editor', 'use-debounce', 'editor'],
    type: 'registry:example',
  },
  {
    dependencies: ['@udecode/plate-yjs', 'nanoid'],
    description: 'Real-time collaboration with cursors and selections.',
    files: [
      {
        path: 'examples/collaboration-demo.tsx',
        type: 'registry:example',
      },
    ],
    name: 'collaboration-demo',
    registryDependencies: [
      'use-create-editor',
      'use-mounted',
      'remote-cursor-overlay',
      'shadcn/button',
      'shadcn/input',
    ],
    type: 'registry:example',
  },
  {
    dependencies: [
      '@udecode/plate-basic-elements',
      '@udecode/plate-basic-marks',
    ],
    files: [
      {
        path: 'examples/installation-next-04-value-demo.tsx',
        type: 'registry:example',
      },
    ],
    name: 'installation-next-demo',
    registryDependencies: [
      'editor',
      'fixed-toolbar',
      'mark-toolbar-button',
      'heading-node',
      'paragraph-node',
      'blockquote-node',
    ],
    type: 'registry:example',
  },
  {
    dependencies: ['@udecode/plate-tabbable'],
    files: [
      { path: 'examples/tabbable-demo.tsx', type: 'registry:example' },
      {
        path: 'examples/values/tabbable-value.tsx',
        type: 'registry:example',
      },
    ],
    name: 'tabbable-demo',
    registryDependencies: ['editor', 'use-create-editor'],
    type: 'registry:example',
  },
];

export const demoExamples: Registry['items'] = (
  [
    {
      dependencies: ['@udecode/plate-table'],
      files: [
        {
          path: 'examples/table-nomerge-demo.tsx',
          type: 'registry:example',
        },
        {
          path: 'examples/values/table-value.tsx',
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
      name: 'table-nomerge-demo',
      registryDependencies: ['editor', 'use-create-editor'],
      type: 'registry:example',
    },
    {
      //
      //   description: 'A drawing component powered by Excalidraw.',
      //   title: 'Excalidraw',
      // },
      files: [
        {
          path: 'examples/excalidraw-demo.tsx',
          type: 'registry:example',
        },
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
    {
      description: 'Restrict the editor to a single block.',
      files: [
        {
          path: 'examples/single-line-demo.tsx',
          type: 'registry:example',
        },
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
      title: 'Single Line',
      type: 'registry:example',
    },
    {
      files: [
        {
          path: 'examples/editable-voids-demo.tsx',
          type: 'registry:example',
        },
        {
          path: 'examples/values/editable-voids-value.tsx',
          type: 'registry:example',
        },
      ],
      name: 'editable-voids-demo',
      registryDependencies: [
        'use-create-editor',
        'editor',
        'editor-plugins',
        'shadcn/input',
        'shadcn/label',
        'shadcn/radio-group',
      ],
      type: 'registry:example',
    },
    {
      description: 'List creation and formatting.',
      files: [
        { path: 'examples/list-classic-demo.tsx', type: 'registry:example' },
        {
          path: 'examples/values/list-classic-value.tsx',
          type: 'registry:example',
        },
        {
          path: 'components/editor/plugins/fixed-toolbar-classic-plugin.tsx',
          type: 'registry:example',
        },
        {
          path: 'ui/fixed-toolbar-classic-buttons.tsx',
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
      name: 'list-classic-demo',
      registryDependencies: ['autoformat-classic-plugin', 'list-classic-node'],
      type: 'registry:example',
    },
    {
      dependencies: ['@udecode/plate-find-replace'],
      description: 'Find and replace functionality in text.',
      files: [
        {
          path: 'examples/find-replace-demo.tsx',
          type: 'registry:example',
        },
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
      registryDependencies: [
        'fixed-toolbar',
        'shadcn/input',
        'search-highlight-node',
      ],
      type: 'registry:example',
    },
    {
      description:
        'AI menu with commands, streaming responses in a preview or directly into the editor.',
      files: [
        { path: 'examples/demo.tsx', type: 'registry:example' },
        {
          path: 'components/editor/plugins/ai-plugins.tsx',
          type: 'registry:example',
        },
        {
          path: 'examples/values/ai-value.tsx',
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
      name: 'ai-demo',
      registryDependencies: [
        'use-create-editor',
        'editor-plugins',
        'basic-nodes-plugins',
        'block-selection-plugins',
        'list-plugins',
        'link-plugin',
        'ai-node',
      ],
      title: 'AI',
      type: 'registry:example',
    },
    {
      description: 'Text alignment controls for blocks.',
      files: [
        { path: 'examples/demo.tsx', type: 'registry:example' },
        {
          path: 'examples/values/align-value.tsx',
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
      name: 'align-demo',
      registryDependencies: ['align-plugin'],
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
      name: 'autoformat-demo',
      registryDependencies: ['autoformat-plugin'],
      title: 'Autoformat',
      type: 'registry:example',
    },
    {
      description:
        'Basic block elements like headings, quotes, and code blocks.',
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
        'basic-nodes-plugins',
        'blockquote-node',
        'code-block-node',
        'heading-node',
        'paragraph-node',
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
      registryDependencies: ['basic-nodes-plugins', 'code-node'],
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
      registryDependencies: ['basic-nodes-plugins'],
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
      registryDependencies: ['block-menu-plugins'],
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
      name: 'block-selection-demo',
      registryDependencies: ['block-selection-plugins'],
      type: 'registry:example',
    },
    {
      description: 'Column layout.',
      files: [
        { path: 'examples/demo.tsx', type: 'registry:example' },
        {
          path: 'examples/values/column-value.tsx',
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
            route: '/docs/column',
            title: 'Column',
          },
        ],
      },
      name: 'column-demo',
      registryDependencies: ['column-node'],
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
        'comments-plugin',
        'discussion-plugin',
        'comment-node',
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
      name: 'cursor-overlay-demo',
      registryDependencies: ['cursor-overlay-plugin'],
      title: 'Cursor Overlay',
      type: 'registry:example',
    },
    {
      description: 'Inline date elements with calendar selection interface.',
      files: [
        { path: 'examples/demo.tsx', type: 'registry:example' },
        {
          path: 'examples/values/date-value.tsx',
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
            route: '/docs/date',
            title: 'Date',
          },
        ],
      },
      name: 'date-demo',
      registryDependencies: ['date-node'],
      type: 'registry:example',
    },
    {
      description:
        'Implements draggable functionality for editor blocks, including drag handles and drop indicators.',
      files: [
        { path: 'examples/demo.tsx', type: 'registry:example' },
        {
          path: 'examples/values/dnd-value.tsx',
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
            route: '/docs/dnd',
            title: 'Drag & Drop',
          },
        ],
      },
      name: 'dnd-demo',
      registryDependencies: ['dnd-plugins'],
      title: 'Drag & Drop',
      type: 'registry:example',
    },
    {
      description: 'Emoji insertion via toolbar or colon-triggered combobox.',
      files: [
        { path: 'examples/demo.tsx', type: 'registry:example' },
        {
          path: 'examples/values/emoji-value.tsx',
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
            route: '/docs/emoji',
            title: 'Emoji',
          },
        ],
      },
      name: 'emoji-demo',
      registryDependencies: ['emoji-input-node'],
      type: 'registry:example',
    },
    {
      description: 'LaTeX equations with inline and block formats.',
      files: [
        { path: 'examples/demo.tsx', type: 'registry:example' },
        {
          path: 'examples/values/equation-value.tsx',
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
            route: '/docs/equation',
            title: 'Equation',
          },
        ],
      },
      name: 'equation-demo',
      registryDependencies: ['equation-node', 'equation-plugins'],
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
      name: 'exit-break-demo',
      registryDependencies: ['exit-break-plugin'],
      title: 'Exit Break',
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
        {
          path: 'examples/values/font-value.tsx',
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
      name: 'font-demo',
      registryDependencies: [],
      type: 'registry:example',
    },
    {
      description: 'Text highlighting with customizable colors.',
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
      registryDependencies: ['highlight-node'],
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
      registryDependencies: ['hr-node'],
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
        {
          path: 'examples/values/indent-value.tsx',
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
      name: 'indent-demo',
      registryDependencies: ['list-plugins'],
      type: 'registry:example',
    },
    {
      description: 'Turn any block into a list item.',
      files: [
        { path: 'examples/demo.tsx', type: 'registry:example' },
        {
          path: 'examples/values/list-value.tsx',
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
            route: '/docs/list',
            title: 'List',
          },
        ],
      },
      name: 'list-demo',
      registryDependencies: ['list-plugins'],
      type: 'registry:example',
    },
    {
      files: [
        { path: 'examples/demo.tsx', type: 'registry:example' },
        {
          path: 'examples/values/kbd-value.tsx',
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
      name: 'kbd-demo',
      registryDependencies: ['kbd-node'],
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
      name: 'line-height-demo',
      registryDependencies: ['line-height-plugin'],
      type: 'registry:example',
    },
    {
      description: 'Hyperlinks with toolbar insertion and URL pasting support.',
      files: [
        { path: 'examples/demo.tsx', type: 'registry:example' },
        {
          path: 'examples/values/link-value.tsx',
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
            route: '/docs/link',
            title: 'Link',
          },
        ],
      },
      name: 'link-demo',
      registryDependencies: ['link-plugin', 'link-node'],
      type: 'registry:example',
    },
    {
      description: 'Media embedding and management.',
      files: [
        { path: 'examples/demo.tsx', type: 'registry:example' },
        {
          path: 'examples/values/media-value.tsx',
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
      name: 'media-demo',
      registryDependencies: [
        'media-plugins',
        'media-audio-node',
        'media-embed-node',
        'media-file-node',
        'media-image-node',
        'media-placeholder-node',
        'media-video-node',
      ],
      type: 'registry:example',
    },
    {
      description: 'Mention functionality for referencing users or entities.',
      files: [
        { path: 'examples/demo.tsx', type: 'registry:example' },
        {
          path: 'examples/values/mention-value.tsx',
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
            route: '/docs/mention',
            title: 'Mention',
          },
        ],
      },
      name: 'mention-demo',
      registryDependencies: [
        'mention-plugin',
        'mention-node',
        'mention-input-node',
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
      name: 'markdown-demo',
      registryDependencies: ['markdown-plugin'],
      title: 'Serializing Markdown',
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
      registryDependencies: ['slash-input-node'],
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
      name: 'soft-break-demo',
      registryDependencies: ['soft-break-plugin'],
      title: 'Soft Break',
      type: 'registry:example',
    },
    {
      description:
        'Customizable tables with resizable columns and row merging options.',
      files: [
        { path: 'examples/demo.tsx', type: 'registry:example' },
        {
          path: 'examples/values/table-value.tsx',
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
            route: '/docs/table',
            title: 'Table',
          },
        ],
      },
      name: 'table-demo',
      registryDependencies: ['table-plugin', 'table-node'],
      type: 'registry:example',
    },
    {
      description: 'Dynamic TOC with in-document element for easy navigation.',
      files: [
        { path: 'examples/demo.tsx', type: 'registry:example' },
        {
          path: 'examples/values/toc-value.tsx',
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
            route: '/docs/toc',
            title: 'TOC',
          },
        ],
      },
      name: 'toc-demo',
      registryDependencies: ['toc-plugin', 'toc-node'],
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
      name: 'toggle-demo',
      registryDependencies: ['toggle-node'],
      type: 'registry:example',
    },
  ] as Registry['items']
).map((item) => ({
  ...item,
  meta: {
    ...item.meta,
    registry: false,
  },
}));

export const internalExamples: Registry['items'] = (
  [
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
      registryDependencies: ['editor'],
      type: 'registry:example',
    },
    {
      files: [
        { path: 'examples/pro-iframe-demo.tsx', type: 'registry:example' },
      ],
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
    {
      files: [
        {
          path: 'examples/installation-next-01-editor-demo.tsx',
          type: 'registry:example',
        },
      ],
      name: 'installation-next-01-editor-demo',
      registryDependencies: ['editor'],
      type: 'registry:example',
    },
    {
      dependencies: ['@udecode/plate-basic-marks'],
      files: [
        {
          path: 'examples/installation-next-02-marks-demo.tsx',
          type: 'registry:example',
        },
      ],
      name: 'installation-next-02-marks-demo',
      registryDependencies: ['editor', 'fixed-toolbar', 'mark-toolbar-button'],
      type: 'registry:example',
    },
    {
      dependencies: [
        '@udecode/plate-basic-elements',
        '@udecode/plate-basic-marks',
      ],
      files: [
        {
          path: 'examples/installation-next-03-elements-demo.tsx',
          type: 'registry:example',
        },
      ],
      name: 'installation-next-03-elements-demo',
      registryDependencies: [
        'editor',
        'fixed-toolbar',
        'mark-toolbar-button',
        'heading-node',
        'paragraph-node',
        'blockquote-node',
      ],
      type: 'registry:example',
    },
    // Editor (not used?)
    {
      files: [
        {
          path: 'examples/editor-default.tsx',
          type: 'registry:example',
        },
      ],
      name: 'editor-default',
      registryDependencies: ['use-create-editor', 'editor', 'editor-plugins'],
      type: 'registry:example',
    },
    {
      files: [
        {
          path: 'examples/editor-disabled.tsx',
          type: 'registry:example',
        },
      ],
      name: 'editor-disabled',
      registryDependencies: ['editor'],
      type: 'registry:example',
    },
    {
      files: [
        {
          path: 'examples/editor-full-width.tsx',
          type: 'registry:example',
        },
      ],
      name: 'editor-full-width',
      registryDependencies: ['use-create-editor', 'editor', 'editor-plugins'],
      type: 'registry:example',
    },
  ] as Registry['items']
).map((item) => ({
  ...item,
  meta: {
    ...item.meta,
    registry: false,
  },
}));

export const registryExamples: Registry['items'] = (
  [...examples, ...demoExamples, ...internalExamples] as Registry['items']
).map((example) => ({
  ...example,
  dependencies: ['@udecode/cn', ...(example.dependencies || [])],
}));
