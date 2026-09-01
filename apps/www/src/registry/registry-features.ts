import type { Registry } from 'shadcn/schema';

export const registryStaticFeatures: Registry['items'] = [
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/align-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'align-static',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/basic-blocks-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'basic-blocks-static',
    registryDependencies: [
      '@plate/blockquote-static',
      '@plate/heading-static',
      '@plate/horizontal-rule-static',
      '@plate/paragraph-static',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/basic-marks-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'basic-marks-static',
    registryDependencies: [
      '@plate/code-static',
      '@plate/highlight-static',
      '@plate/kbd-static',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/callout-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'callout-static',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs', 'lowlight'],
    files: [
      {
        path: 'components/editor/code-block-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'code-block-static',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/code-drawing-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'code-drawing-static',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/column-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'column-static',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/comment-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'comment-static',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/date-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'date-static',
    registryDependencies: ['@plate/suggestion-style'],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/footnote-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'footnote-static',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs', '@excalidraw/excalidraw'],
    files: [
      {
        path: 'components/editor/excalidraw.tsx',
        type: 'registry:component',
      },
    ],
    name: 'excalidraw',
    registryDependencies: [],
    type: 'registry:component',
    description: 'A drawing component powered by Excalidraw.',
    title: 'Excalidraw',
    meta: {
      docs: [{ route: '/docs/excalidraw' }],
      examples: ['excalidraw-demo'],
    },
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/font-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'font-static',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/indent-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'indent-static',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/line-height-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'line-height-static',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/link-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'link-static',
    registryDependencies: ['@plate/suggestion-style'],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/list-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'list-static',
    registryDependencies: ['@plate/block-list-static', '@plate/indent-static'],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/math-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'math-static',
    registryDependencies: ['@plate/suggestion-style'],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/media-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'media-static',
    registryDependencies: [
      '@plate/media-audio-static',
      '@plate/media-embed-static',
      '@plate/media-file-static',
      '@plate/media-image-static',
      '@plate/media-video-static',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/mention-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'mention-static',
    registryDependencies: ['@plate/suggestion-style'],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/suggestion-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'suggestion-static',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/table-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'table-static',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/toc-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'toc-static',
    registryDependencies: ['button'],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/details-static.tsx',
        type: 'registry:component',
      },
    ],
    name: 'details-static',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    files: [
      {
        path: 'components/editor/plugins-static.ts',
        type: 'registry:component',
      },
    ],
    name: 'editor-plugins-static',
    registryDependencies: [
      '@plate/editor-static',
      '@plate/align-static',
      '@plate/basic-blocks-static',
      '@plate/basic-marks-static',
      '@plate/callout-static',
      '@plate/code-block-static',
      '@plate/column-static',
      '@plate/comment-static',
      '@plate/date-static',
      '@plate/font-static',
      '@plate/footnote-static',
      '@plate/line-height-static',
      '@plate/link-static',
      '@plate/list-static',
      '@plate/markdown',
      '@plate/math-static',
      '@plate/media-static',
      '@plate/mention-static',
      '@plate/suggestion-static',
      '@plate/table-static',
      '@plate/toc-static',
      '@plate/details-static',
    ],
    type: 'registry:component',
  },
];

export const registryFeatures: Registry['items'] = [
  ...registryStaticFeatures,
  {
    dependencies: ['platejs', 'lodash'],
    devDependencies: ['@types/lodash'],
    files: [
      {
        path: 'components/editor/ai.tsx',
        type: 'registry:component',
      },
    ],
    name: 'ai',
    registryDependencies: [
      '@plate/ai-menu',
      '@plate/ai-toolbar-button',
      '@plate/ai-api',
      '@plate/use-chat',
    ],
    type: 'registry:component',
    description: 'A text highlighter for AI-generated content.',
    title: 'AI',
    meta: {
      docs: [
        { route: '/docs/ai', title: 'AI' },
        {
          route: 'https://pro.platejs.org/docs/components/ai',
          title: 'AI Leaf',
        },
      ],
      examples: ['ai-demo', 'ai-pro'],
      label: 'New',
    },
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/align.tsx',
        type: 'registry:component',
      },
    ],
    name: 'align',
    registryDependencies: ['@plate/align-toolbar-button'],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/autoformat.tsx',
        type: 'registry:component',
      },
    ],
    name: 'autoformat',
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/basic-blocks.tsx',
        type: 'registry:component',
      },
    ],
    name: 'basic-blocks',
    registryDependencies: [
      '@plate/blockquote',
      '@plate/heading',
      '@plate/horizontal-rule',
      '@plate/paragraph',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/basic-marks.tsx',
        type: 'registry:component',
      },
    ],
    name: 'basic-marks',
    registryDependencies: [
      '@plate/code',
      '@plate/highlight',
      '@plate/kbd',
      '@plate/mark-toolbar-button',
    ],
    type: 'registry:component',
  },
  {
    files: [
      {
        path: 'components/editor/basic-nodes.tsx',
        type: 'registry:component',
      },
    ],
    name: 'basic-nodes',
    registryDependencies: ['@plate/basic-blocks', '@plate/basic-marks'],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/block-menu.tsx',
        type: 'registry:component',
      },
    ],
    name: 'block-menu',
    registryDependencies: ['@plate/editor-context-menu', '@plate/transforms'],
    type: 'registry:component',
    description: 'A context menu for block-level operations.',
    title: 'Block Menu',
    meta: {
      docs: [
        { route: '/docs/block-menu' },
        { route: 'https://pro.platejs.org/docs/components/block-menu' },
      ],
      examples: ['block-menu-demo', 'block-menu-pro'],
    },
  },
  {
    dependencies: [],
    files: [
      {
        path: 'components/editor/block-placeholder.tsx',
        type: 'registry:component',
      },
    ],
    name: 'block-placeholder',
    registryDependencies: [],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/callout.tsx',
        type: 'registry:component',
      },
    ],
    name: 'callout',
    registryDependencies: ['button', '@plate/emoji-picker'],
    type: 'registry:component',
    description:
      'A callout component for highlighting important information with customizable icons and styles.',
    title: 'Callout',
    meta: {
      docs: [
        { route: '/docs/callout' },
        { route: 'https://pro.platejs.org/docs/components/callout' },
      ],
      examples: ['callout-demo'],
    },
  },
  {
    dependencies: ['platejs', 'lowlight'],
    files: [
      {
        path: 'components/editor/code-block.tsx',
        type: 'registry:component',
      },
    ],
    name: 'code-block',
    registryDependencies: ['command', '@plate/floating-popover', 'button'],
    type: 'registry:component',
    description:
      'A code block with syntax highlighting and language selection.',
    title: 'Code Block',
    meta: {
      docs: [
        { route: '/docs/code-block' },
        { route: 'https://pro.platejs.org/docs/components/code-block' },
      ],
      examples: ['code-block-demo'],
    },
  },
  {
    dependencies: ['platejs', 'lodash'],
    files: [
      {
        path: 'components/editor/code-drawing.tsx',
        type: 'registry:component',
      },
    ],
    name: 'code-drawing',
    registryDependencies: [
      'button',
      'select',
      '@plate/floating-popover',
      '@plate/use-mobile',
    ],
    type: 'registry:component',
    description:
      'Create diagrams from code using PlantUML, Graphviz, Flowchart, or Mermaid.',
    title: 'Code Drawing',
    meta: {
      docs: [
        { route: '/docs/code-drawing' },
        {
          route: 'https://pro.platejs.org/docs/components/code-drawing',
        },
      ],
      examples: ['code-drawing-demo'],
    },
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/column.tsx',
        type: 'registry:component',
      },
    ],
    name: 'column',
    registryDependencies: [
      'button',
      'separator',
      'tooltip',
      '@plate/floating-popover',
    ],
    type: 'registry:component',
    description: 'Resizable column components for layout.',
    title: 'Column',
    meta: {
      docs: [
        { route: '/docs/column' },
        {
          route: 'https://pro.platejs.org/docs/components/column',
        },
      ],
      examples: ['column-demo'],
    },
  },
  {
    dependencies: ['platejs', 'date-fns'],
    files: [
      {
        path: 'components/editor/comment.tsx',
        type: 'registry:component',
      },
    ],
    name: 'comment',
    meta: {
      docs: [
        { route: '/docs/comment' },
        { route: 'https://pro.platejs.org/docs/components/comment-node' },
      ],
      examples: ['discussion-demo', 'discussion-pro'],
    },
    registryDependencies: [
      '@plate/comment-toolbar-button',
      '@plate/discussion',
      '@plate/highlight-style',
      '@plate/basic-marks',
      'avatar',
      'button',
      '@plate/editor-dropdown-menu',
      '@plate/editor',
    ],
    title: 'Comment',
    type: 'registry:component',
  },
  {
    dependencies: ['@faker-js/faker', 'platejs'],
    files: [
      {
        path: 'components/editor/copilot.tsx',
        type: 'registry:component',
      },
    ],
    name: 'copilot',
    registryDependencies: [],
    type: 'registry:component',
    description:
      'A text suggestion system that displays AI-generated content after the cursor.',
    title: 'Copilot',
    meta: {
      docs: [
        {
          route: '/docs/copilot',
        },
        { route: 'https://pro.platejs.org/docs/components/copilot' },
      ],
      examples: ['copilot-demo', 'copilot-pro'],
      //       1. Hover card: a new style of hover card that is more user-friendly. You can **hover** over the ghost text to see the hover card.
      // 2. Marks: support for marks like bold, italic, underline, etc.This means you can see bold text and **links** in the ghost text
      // 3. Backend: complete backend setup.
    },
  },
  {
    dependencies: ['platejs', 'lucide-react'],
    files: [
      {
        path: 'components/editor/find.tsx',
        type: 'registry:component',
      },
    ],
    name: 'find',
    registryDependencies: ['input-group', 'tooltip'],
    type: 'registry:component',
    description: 'A document find controller with transient match highlights.',
    title: 'Find',
    meta: {
      docs: [{ route: '/docs/find' }],
      examples: ['find-demo'],
    },
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/date.tsx',
        type: 'registry:component',
      },
    ],
    name: 'date',
    registryDependencies: ['calendar', 'popover', '@plate/suggestion-style'],
    type: 'registry:component',
    description: 'A date field component with calendar picker.',
    title: 'Date',
    meta: {
      docs: [
        { route: '/docs/date' },
        { route: 'https://pro.platejs.org/docs/components/date' },
      ],
      examples: ['date-demo'],
    },
  },
  {
    dependencies: [],
    files: [
      {
        path: 'components/editor/discussion.tsx',
        type: 'registry:component',
      },
    ],
    name: 'discussion',
    registryDependencies: ['@plate/block-discussion', '@plate/comment'],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs', 'react-dnd', 'react-dnd-html5-backend'],
    files: [
      {
        path: 'components/editor/dnd.tsx',
        type: 'registry:component',
      },
    ],
    name: 'dnd',
    registryDependencies: ['button', 'tooltip'],
    type: 'registry:component',
    description: 'A block wrapper with a drag handle for moving editor blocks.',
    title: 'Drag and Drop',
    meta: {
      docs: [
        { route: '/docs/dnd', title: 'Drag & Drop' },
        { route: 'https://pro.platejs.org/docs/components/dnd' },
      ],
      examples: ['dnd-demo', 'dnd-pro'],
      usage: [
        `DndPlugin.configure({
  render: {
    aboveNodes: BlockDraggable,
  },
})`,
      ],
      // Click the plus button next to the drag button to insert blocks
    },
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/docx.tsx',
        type: 'registry:component',
      },
    ],
    name: 'docx',
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/docx-export.tsx',
        type: 'registry:component',
      },
    ],
    name: 'docx-export',
    registryDependencies: [
      '@plate/callout-static',
      '@plate/code-block-static',
      '@plate/column-static',
      '@plate/math-static',
      '@plate/heading-static',
      '@plate/toc-static',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/plugins.ts',
        type: 'registry:component',
      },
    ],
    name: 'editor-plugins',
    registryDependencies: [
      '@plate/editor',
      '@plate/ai',
      '@plate/align',
      '@plate/autoformat',
      '@plate/basic-blocks',
      '@plate/basic-marks',
      '@plate/block-menu',
      '@plate/block-placeholder',
      '@plate/callout',
      '@plate/code-block',
      '@plate/column',
      '@plate/comment',
      '@plate/date',
      '@plate/discussion',
      '@plate/dnd',
      '@plate/emoji',
      '@plate/exit-break',
      '@plate/fixed-toolbar',
      '@plate/floating-toolbar',
      '@plate/font',
      '@plate/footnote',
      '@plate/line-height',
      '@plate/link',
      '@plate/list',
      '@plate/markdown',
      '@plate/math',
      '@plate/media',
      '@plate/mention',
      '@plate/slash',
      '@plate/suggestion',
      '@plate/table',
      '@plate/toc',
      '@plate/details',
    ],
    title: 'Editor Plugins',
    type: 'registry:component',
  },
  {
    dependencies: ['platejs', '@emoji-mart/data@1.2.1'],
    files: [
      {
        path: 'components/editor/emoji.tsx',
        type: 'registry:component',
      },
    ],
    name: 'emoji',
    registryDependencies: ['@plate/inline-combobox', '@plate/use-debounce'],
    type: 'registry:component',
    description: 'An input component for emoji search and insertion.',
    title: 'Emoji',
    meta: {
      docs: [
        { route: '/docs/emoji' },
        {
          route: 'https://pro.platejs.org/docs/components/emoji',
        },
      ],
      examples: ['emoji-demo'],
    },
  },
  {
    dependencies: [],
    files: [
      {
        path: 'components/editor/exit-break.tsx',
        type: 'registry:component',
      },
    ],
    name: 'exit-break',
    type: 'registry:component',
  },
  {
    dependencies: [],
    files: [
      {
        path: 'components/editor/fixed-toolbar.tsx',
        type: 'registry:component',
      },
    ],
    name: 'fixed-toolbar',
    registryDependencies: [
      '@plate/toolbar',
      '@plate/tailwind-scrollbar-hide',
      '@plate/ai-toolbar-button',
      '@plate/align-toolbar-button',
      '@plate/comment-toolbar-button',
      '@plate/emoji-toolbar-button',
      '@plate/font-color-toolbar-button',
      '@plate/font-size-toolbar-button',
      '@plate/history-toolbar-button',
      '@plate/list-toolbar-button',
      '@plate/indent-toolbar-button',
      '@plate/insert-toolbar-button',
      '@plate/line-height-toolbar-button',
      '@plate/link-toolbar-button',
      '@plate/mark-toolbar-button',
      '@plate/media-toolbar-button',
      '@plate/mode-toolbar-button',
      '@plate/more-toolbar-button',
      '@plate/table-toolbar-button',
      '@plate/details-toolbar-button',
      '@plate/turn-into-toolbar-button',
    ],
    meta: {
      examples: ['basic-nodes-demo'],
    },
    title: 'Fixed Toolbar',
    type: 'registry:component',
    description: 'A set of commonly used formatting buttons.',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/floating-toolbar.tsx',
        type: 'registry:component',
      },
    ],
    name: 'floating-toolbar',
    registryDependencies: [
      '@plate/link',
      '@plate/toolbar',
      '@plate/use-on-click-outside',
      '@plate/use-widget-floating',
      '@plate/tailwind-scrollbar-hide',
      '@plate/ai-toolbar-button',
      '@plate/comment-toolbar-button',
      '@plate/equation-toolbar-button',
      '@plate/link-toolbar-button',
      '@plate/mark-toolbar-button',
      '@plate/more-toolbar-button',
      '@plate/suggestion-toolbar-button',
      '@plate/turn-into-toolbar-button',
    ],
    meta: {
      docs: [
        {
          route: 'https://pro.platejs.org/docs/components/floating-toolbar',
        },
      ],
      examples: ['floating-toolbar-demo', 'floating-toolbar-pro'],
    },
    title: 'Floating Toolbar',
    type: 'registry:component',
    description: 'A set of formatting buttons for the floating toolbar.',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/footnote.tsx',
        type: 'registry:component',
      },
    ],
    name: 'footnote',
    registryDependencies: [
      'button',
      'command',
      'hover-card',
      '@plate/floating-popover',
      '@plate/inline-combobox',
    ],
    type: 'registry:component',
    description: 'Inline footnote references, definitions, and input UI.',
    title: 'Footnote',
    meta: {
      docs: [{ route: '/docs/footnote' }],
      examples: ['footnote-demo'],
    },
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/font.tsx',
        type: 'registry:component',
      },
    ],
    name: 'font',
    registryDependencies: [
      '@plate/font-size-toolbar-button',
      '@plate/font-color-toolbar-button',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/indent.tsx',
        type: 'registry:component',
      },
    ],
    name: 'indent',
    registryDependencies: ['@plate/indent-toolbar-button'],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/line-height.tsx',
        type: 'registry:component',
      },
    ],
    name: 'line-height',
    registryDependencies: ['@plate/line-height-toolbar-button'],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/link.tsx',
        type: 'registry:component',
      },
    ],
    name: 'link',
    meta: {
      docs: [
        { route: '/docs/link' },
        { route: 'https://pro.platejs.org/docs/components/link-toolbar' },
      ],
      examples: ['link-demo', 'link-pro'],
    },
    registryDependencies: [
      'button',
      'input',
      'separator',
      '@plate/comment',
      '@plate/link-toolbar-button',
      '@plate/suggestion',
      '@plate/suggestion-style',
      '@plate/use-on-click-outside',
      '@plate/use-widget-floating',
    ],
    title: 'Link',
    type: 'registry:component',
    description: 'A component for rendering hyperlinks with hover states.',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/list.tsx',
        type: 'registry:component',
      },
    ],
    name: 'list',
    registryDependencies: [
      '@plate/block-list',
      '@plate/list-toolbar-button',
      '@plate/indent',
    ],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs', 'remark-emoji', 'remark-gfm', 'remark-math'],
    files: [
      {
        path: 'components/editor/markdown.tsx',
        type: 'registry:component',
      },
    ],
    name: 'markdown',
    type: 'registry:component',
  },
  {
    dependencies: ['platejs', 'katex', 'react-textarea-autosize'],
    files: [
      {
        path: 'components/editor/math.tsx',
        type: 'registry:component',
      },
    ],
    name: 'math',
    registryDependencies: [
      '@plate/equation-toolbar-button',
      'button',
      '@plate/floating-popover',
      '@plate/suggestion-style',
    ],
    type: 'registry:component',
    description:
      'Displays a LaTeX equation element with an editable popover for inputting and rendering mathematical expressions.',
    title: 'Math',
    meta: {
      docs: [
        {
          route: 'http://localhost:3000/docs/equation',
          title: 'Equation',
        },
      ],
      examples: ['equation-demo'],
    },
  },
  {
    dependencies: ['platejs', 'sonner'],
    description:
      'Media kit without API (see media-uploadthing-api for reference)',
    files: [
      {
        path: 'components/editor/media.tsx',
        type: 'registry:component',
      },
    ],
    name: 'media',
    registryDependencies: [
      '@plate/media-audio',
      '@plate/media-embed',
      '@plate/media-file',
      '@plate/media-image',
      '@plate/media-placeholder',
      '@plate/media-preview-dialog',
      '@plate/media-toolbar',
      '@plate/media-video',
      '@plate/media-toolbar-button',
    ],
    type: 'registry:component',
    title: 'Media',
    meta: {
      docs: [{ route: '/docs/media' }],
      examples: ['media-demo', 'media-pro'],
    },
  },
  {
    dependencies: [],
    description: 'media + media-uploadthing-api',
    files: [],
    name: 'media-uploadthing',
    registryDependencies: ['@plate/media', '@plate/media-uploadthing-api'],
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/mention.tsx',
        type: 'registry:component',
      },
    ],
    name: 'mention',
    registryDependencies: [
      '@plate/suggestion-style',
      '@plate/inline-combobox',
      '@plate/use-mounted',
    ],
    type: 'registry:component',
    description:
      'A mention element with customizable prefix and label, powered by a combobox.',
    title: 'Mention',
    meta: {
      docs: [
        { route: '/docs/mention' },
        { route: 'https://pro.platejs.org/docs/components/mention' },
      ],
      examples: ['mention-demo'],
    },
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/slash.tsx',
        type: 'registry:component',
      },
    ],
    name: 'slash',
    registryDependencies: ['@plate/inline-combobox', '@plate/transforms'],
    type: 'registry:component',
    description: 'A command input component for inserting various elements.',
    title: 'Slash Command',
    meta: {
      docs: [
        { route: '/docs/slash-command', title: 'Slash' },
        {
          route: 'https://pro.platejs.org/docs/components/slash',
        },
      ],
      examples: ['slash-command-demo', 'slash-command-pro'],
    },
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/suggestion.tsx',
        type: 'registry:component',
      },
    ],
    name: 'suggestion',
    registryDependencies: [
      '@plate/suggestion-toolbar-button',
      '@plate/discussion',
    ],
    type: 'registry:component',
    description: 'A text component for suggestion.',
    title: 'Suggestion',
    meta: {
      docs: [{ route: '/docs/suggestion' }],
      examples: ['discussion-demo', 'discussion-pro'],
    },
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/tabbable.tsx',
        type: 'registry:component',
      },
    ],
    name: 'tabbable',
    type: 'registry:component',
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/table.tsx',
        type: 'registry:component',
      },
    ],
    name: 'table',
    registryDependencies: [
      'button',
      '@plate/editor-dropdown-menu',
      '@plate/floating-popover',
      '@plate/toolbar',
      '@plate/tailwind-scrollbar-hide',
      '@plate/font-color-toolbar-button',
    ],
    type: 'registry:component',
    description:
      'A table component with floating toolbar and border customization.',
    title: 'Table',
    meta: {
      docs: [
        { route: '/docs/table' },
        { route: 'https://pro.platejs.org/docs/components/table' },
      ],
      examples: ['table-demo'],
    },
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/toc.tsx',
        type: 'registry:component',
      },
    ],
    name: 'toc',
    registryDependencies: ['button'],
    type: 'registry:component',
    description:
      'A table of contents component with links to document headings.',
    title: 'Table of Contents',
    meta: {
      docs: [
        { route: '/docs/toc' },
        { route: 'https://pro.platejs.org/docs/components/toc' },
      ],
      examples: ['toc-demo', 'toc-pro'],
      // - Responsive design that adapts to different screen sizes
      // - Dynamic highlighting of the corresponding thumbnail on the right side based on the current section
      // - Hover thumbnail to see the preview of the section with smooth animation
      // - Elegant transition effects when navigating between sections
      // - Animated highlighting of the current section in the sidebar
    },
  },
  {
    dependencies: ['platejs'],
    files: [
      {
        path: 'components/editor/details.tsx',
        type: 'registry:component',
      },
    ],
    name: 'details',
    registryDependencies: ['@plate/details-toolbar-button', 'button'],
    type: 'registry:component',
    description: 'A semantic disclosure block with an editable summary.',
    title: 'Details',
    meta: {
      docs: [{ route: '/docs/details' }],
      examples: ['details-demo'],
    },
  },
];
