import type { Registry } from "shadcn/schema";

export const examples: Registry["items"] = [
  {
    dependencies: ["@platejs/test-utils"],
    description: "Renders AI ghost text suggestions at the cursor position.",
    files: [
      { path: "examples/copilot-demo.tsx", type: "registry:example" },
      {
        path: "examples/values/copilot-value.tsx",
        type: "registry:example",
      },
    ],
    meta: {
      docs: [
        {
          route: "/docs/copilot",
          title: "Copilot",
        },
      ],
    },
    name: "copilot-demo",
    registryDependencies: [
      "@plate/copilot",
      "@plate/editor",
      "@plate/editor-plugins",
    ],
    type: "registry:example",
  },
  {
    dependencies: ["@hookform/resolvers", "react-hook-form", "zod"],
    description: "A form with a select editor component for managing labels.",
    files: [
      {
        path: "examples/select-editor-demo.tsx",
        type: "registry:example",
      },
    ],
    meta: {
      docs: [
        {
          route: "/docs/multi-select",
        },
      ],
    },
    name: "select-editor-demo",
    registryDependencies: ["button", "@plate/select-editor"],
    title: "Select Editor Form",
    type: "registry:example",
  },
  {
    files: [
      {
        path: "examples/controlled-demo.tsx",
        type: "registry:example",
      },
    ],
    name: "controlled-demo",
    registryDependencies: ["@plate/editor", "button", "@plate/editor-plugins"],
    type: "registry:example",
  },
  {
    dependencies: [
      "@faker-js/faker",
      "@platejs/basic-nodes",
      "platejs",
      "slate",
      "slate-react",
    ],
    files: [
      {
        path: "examples/huge-document-demo.tsx",
        type: "registry:example",
      },
      {
        path: "examples/values/huge-document-value.tsx",
        type: "registry:example",
      },
    ],
    name: "huge-document-demo",
    registryDependencies: ["button"],
    type: "registry:example",
  },
  {
    dependencies: ["@platejs/test-utils"],
    files: [
      {
        path: "examples/hundreds-editors-demo.tsx",
        type: "registry:example",
      },
      {
        path: "examples/values/multi-editors-value.tsx",
        type: "registry:example",
      },
    ],
    name: "hundreds-editors-demo",
    registryDependencies: ["@plate/editor", "@plate/editor-plugins"],
    type: "registry:example",
  },
  {
    dependencies: ["@platejs/test-utils"],
    files: [
      {
        path: "examples/multiple-editors-demo.tsx",
        type: "registry:example",
      },
      {
        path: "examples/values/basic-blocks-value.tsx",
        type: "registry:example",
      },
      {
        path: "examples/values/basic-marks-value.tsx",
        type: "registry:example",
      },
      {
        path: "examples/values/media-value.tsx",
        type: "registry:example",
      },
    ],
    name: "multiple-editors-demo",
    registryDependencies: [
      "separator",
      "@plate/align",
      "@plate/basic-nodes",
      "@plate/media",
      "@plate/editor",
      "@plate/fixed-toolbar",
      "@plate/turn-into-toolbar-button",
      "@plate/editor-plugins",
    ],
    type: "registry:example",
  },
  {
    dependencies: ["@platejs/diff", "@platejs/plite", "lodash"],
    files: [
      {
        path: "examples/version-history-demo.tsx",
        type: "registry:example",
      },
    ],
    name: "version-history-demo",
    registryDependencies: ["button", "@plate/basic-marks"],
    type: "registry:example",
  },
  {
    dependencies: ["@platejs/plite", "@platejs/test-utils", "prismjs"],
    files: [
      {
        path: "examples/preview-markdown-demo.tsx",
        type: "registry:example",
      },
      {
        path: "examples/values/preview-md-value.tsx",
        type: "registry:example",
      },
    ],
    name: "preview-markdown-demo",
    registryDependencies: [
      "@plate/basic-nodes",
      "@plate/editor",
      "@plate/editor-plugins",
    ],
    type: "registry:example",
  },
  {
    dependencies: [
      "remark-emoji",
      "@platejs/markdown",
      "remark-gfm",
      "remark-math",
    ],
    files: [
      {
        path: "examples/markdown-to-plite-demo.tsx",
        type: "registry:example",
      },
    ],
    name: "markdown-to-plite-demo",
    registryDependencies: [
      "@plate/editor",
      "@plate/use-debounce",
      "@plate/editor-plugins",
    ],
    type: "registry:example",
  },
  {
    dependencies: ["@platejs/utils", "@platejs/ai"],
    files: [
      {
        path: "examples/markdown-streaming-demo.tsx",
        type: "registry:example",
      },
    ],
    name: "markdown-streaming-demo",
    registryDependencies: [
      "button",
      "@plate/editor",
      "@plate/editor-static",
      "@plate/markdown-joiner-transform",
      "@plate/editor-plugins",
      "@plate/editor-plugins-static",
    ],
    type: "registry:example",
  },
  {
    dependencies: ["@platejs/yjs", "yjs"],
    description:
      "Two-peer Yjs collaboration with cursors, reconnect, schema guards, and history.",
    files: [
      {
        path: "examples/collaboration-demo.tsx",
        type: "registry:example",
      },
    ],
    name: "collaboration-demo",
    registryDependencies: [
      "@plate/basic-nodes",
      "@plate/editor",
      "@plate/remote-cursor-overlay",
      "alert",
      "badge",
      "button",
      "card",
      "@plate/editor-plugins",
    ],
    type: "registry:example",
  },
  {
    dependencies: ["@platejs/basic-nodes"],
    files: [
      {
        path: "examples/installation-next-04-value-demo.tsx",
        type: "registry:example",
      },
    ],
    name: "installation-next-demo",
    registryDependencies: [
      "@plate/editor",
      "@plate/fixed-toolbar",
      "@plate/toolbar",
      "@plate/mark-toolbar-button",
      "@plate/heading",
      "@plate/blockquote",
      "@plate/editor-plugins",
    ],
    type: "registry:example",
  },
  {
    dependencies: ["@platejs/tabbable", "@platejs/test-utils"],
    files: [
      { path: "examples/tabbable-demo.tsx", type: "registry:example" },
      {
        path: "examples/values/tabbable-value.tsx",
        type: "registry:example",
      },
    ],
    name: "tabbable-demo",
    registryDependencies: ["@plate/editor", "@plate/editor-plugins"],
    type: "registry:example",
  },
];

export const demoExamples: Registry["items"] = (
  [
    {
      dependencies: ["@platejs/table", "@platejs/test-utils"],
      files: [
        {
          path: "examples/table-nomerge-demo.tsx",
          type: "registry:example",
        },
        {
          path: "examples/values/table-value.tsx",
          type: "registry:example",
        },
      ],
      name: "table-nomerge-demo",
      registryDependencies: ["@plate/editor"],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "A drawing component powered by Excalidraw.",
      files: [
        {
          path: "examples/excalidraw-demo.tsx",
          type: "registry:example",
        },
        {
          path: "examples/values/excalidraw-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/excalidraw",
            title: "Excalidraw",
          },
        ],
      },
      name: "excalidraw-demo",
      registryDependencies: ["@plate/excalidraw", "@plate/editor"],
      title: "Excalidraw",
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description:
        "Create diagrams from code using PlantUML, Graphviz, Flowchart, or Mermaid.",
      files: [
        {
          path: "examples/code-drawing-demo.tsx",
          type: "registry:example",
        },
        {
          path: "examples/values/code-drawing-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/code-drawing",
            title: "Code Drawing",
          },
        ],
        label: "New",
      },
      name: "code-drawing-demo",
      registryDependencies: ["@plate/code-drawing", "@plate/editor"],
      title: "Code Drawing",
      type: "registry:example",
    },
    {
      description: "Restrict the editor to a single block.",
      files: [
        {
          path: "examples/single-block-demo.tsx",
          type: "registry:example",
        },
      ],
      name: "single-block-demo",
      registryDependencies: [
        "checkbox",
        "label",
        "@plate/basic-blocks",
        "@plate/editor",
      ],
      title: "Single Block",
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      files: [
        {
          path: "examples/editable-voids-demo.tsx",
          type: "registry:example",
        },
        {
          path: "examples/values/editable-voids-value.tsx",
          type: "registry:example",
        },
      ],
      name: "editable-voids-demo",
      registryDependencies: ["@plate/editor", "input", "label", "radio-group"],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "List creation and formatting.",
      files: [
        { path: "examples/list-classic-demo.tsx", type: "registry:example" },
        {
          path: "examples/values/list-classic-value.tsx",
          type: "registry:example",
        },
      ],
      name: "list-classic-demo",
      registryDependencies: [
        "@plate/editor",
        "@plate/autoformat-classic",
        "@plate/fixed-toolbar-classic",
        "@plate/floating-toolbar-classic",
        "@plate/list-classic",
        "@plate/editor-plugins",
      ],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/find-replace", "@platejs/test-utils"],
      description: "Find and replace functionality in text.",
      files: [
        {
          path: "examples/find-replace-demo.tsx",
          type: "registry:example",
        },
        {
          path: "examples/values/find-replace-value.tsx",
          type: "registry:example",
        },
      ],
      name: "find-replace-demo",
      registryDependencies: [
        "@plate/fixed-toolbar",
        "input",
        "@plate/search-highlight",
        "@plate/editor",
      ],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description:
        "AI menu with commands, streaming responses in a preview or directly into the editor.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/ai-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/ai",
            title: "AI",
          },
        ],
      },
      name: "ai-demo",
      registryDependencies: ["@plate/ai", "@plate/editor"],
      title: "AI",
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "Text alignment controls for blocks.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/align-value.tsx",
          type: "registry:example",
        },
      ],
      name: "align-demo",
      registryDependencies: ["@plate/align", "@plate/editor"],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "Apply formatting automatically using shortcodes.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/autoformat-value.tsx",
          type: "registry:example",
        },
      ],
      name: "autoformat-demo",
      registryDependencies: ["@plate/autoformat", "@plate/editor"],
      title: "Autoformat",
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description:
        "Basic block elements like headings, quotes, and code blocks.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/basic-blocks-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/basic-blocks",
            title: "Basic Elements",
          },
        ],
      },
      name: "basic-blocks-demo",
      registryDependencies: [
        "@plate/basic-blocks",
        "@plate/blockquote",
        "@plate/heading",
        "@plate/paragraph",
        "@plate/editor",
      ],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description:
        "Basic text formatting marks like bold, italic, and underline.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/basic-marks-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/basic-marks",
            title: "Basic Marks",
          },
        ],
      },
      name: "basic-marks-demo",
      registryDependencies: ["@plate/code", "@plate/editor"],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "Basic block elements and text marks.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/basic-nodes-value.tsx",
          type: "registry:example",
        },
        {
          path: "examples/values/basic-blocks-value.tsx",
          type: "registry:example",
        },
        {
          path: "examples/values/basic-marks-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/basic-blocks",
            title: "Basic Elements",
          },
        ],
        keywords: ["element", "leaf"],
      },
      name: "basic-nodes-demo",
      registryDependencies: ["@plate/basic-nodes", "@plate/editor"],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "Block-level context menu with formatting options.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/block-menu-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/block-menu",
            title: "Block Menu",
          },
        ],
      },
      name: "block-menu-demo",
      registryDependencies: ["@plate/block-menu", "@plate/editor"],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "Visual node selection backed by editor selection.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/node-selection-value.tsx",
          type: "registry:example",
        },
      ],
      name: "node-selection-demo",
      registryDependencies: ["@plate/editor"],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "Column layout.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/column-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/column",
            title: "Column",
          },
        ],
      },
      name: "column-demo",
      registryDependencies: ["@plate/column", "@plate/editor"],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "Display code with syntax highlighting.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/code-block-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/code-block",
            title: "Code Block",
          },
        ],
      },
      name: "code-block-demo",
      registryDependencies: ["@plate/code-block", "@plate/editor"],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "Display callouts with different variants and icons.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/callout-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/callout",
            title: "Callout",
          },
        ],
      },
      name: "callout-demo",
      registryDependencies: ["@plate/callout", "@plate/editor"],
      title: "Callout",
      type: "registry:example",
    },
    {
      description: "Adding and displaying comments within content.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/discussion-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/discussion",
            title: "Discussion",
          },
        ],
      },
      name: "discussion-demo",
      registryDependencies: [
        "@plate/comment",
        "@plate/discussion",
        "@plate/editor",
        "@plate/editor-plugins",
      ],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "Visual indicator for cursor position within the editor.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/cursor-overlay-value.tsx",
          type: "registry:example",
        },
      ],
      name: "cursor-overlay-demo",
      registryDependencies: ["@plate/cursor-overlay", "@plate/editor"],
      title: "Cursor Overlay",
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "Inline date elements with calendar selection interface.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/date-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/date",
            title: "Date",
          },
        ],
      },
      name: "date-demo",
      registryDependencies: ["@plate/date", "@plate/editor"],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description:
        "GFM footnote references and definitions as dedicated editor nodes.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/footnote-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/footnote",
            title: "Footnote",
          },
        ],
      },
      name: "footnote-demo",
      registryDependencies: ["@plate/editor", "@plate/highlight-style"],
      title: "Footnote",
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description:
        "Implements draggable functionality for editor blocks, including drag handles and drop indicators.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/dnd-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/dnd",
            title: "Drag & Drop",
          },
        ],
      },
      name: "dnd-demo",
      registryDependencies: ["@plate/dnd", "@plate/editor"],
      title: "Drag & Drop",
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "Emoji insertion via toolbar or colon-triggered combobox.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/emoji-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/emoji",
            title: "Emoji",
          },
        ],
      },
      name: "emoji-demo",
      registryDependencies: ["@plate/emoji", "@plate/editor"],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "LaTeX equations with inline and block formats.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/equation-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/equation",
            title: "Equation",
          },
        ],
      },
      name: "equation-demo",
      registryDependencies: ["@plate/math", "@plate/editor"],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "Exit a large block using a shortcut.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/exit-break-value.tsx",
          type: "registry:example",
        },
      ],
      name: "exit-break-demo",
      registryDependencies: [
        "@plate/exit-break",
        "@plate/editor",
        "@plate/table-demo",
      ],
      title: "Exit Break",
      type: "registry:example",
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
    // {type: 'registry:example',path:  //     'components/editor/math.tsx',}
    // {type: 'registry:example',path:  //     'examples/values/equation-value.tsx',}
    //   ],
    //   name: 'equation-demo',
    //   registryDependencies: [],
    //   type: 'registry:example',
    // },
    {
      dependencies: ["@platejs/test-utils"],
      description:
        "Floating toolbar with text formatting and AI assistance options.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/floating-toolbar-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/ai",
            title: "AI",
          },
        ],
      },
      name: "floating-toolbar-demo",
      registryDependencies: ["@plate/editor"],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "Color picker for text and background colors.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/font-value.tsx",
          type: "registry:example",
        },
      ],
      name: "font-demo",
      registryDependencies: ["@plate/editor"],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
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
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/indent-value.tsx",
          type: "registry:example",
        },
      ],
      name: "indent-demo",
      registryDependencies: ["@plate/list", "@plate/editor"],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "Turn any block into a list item.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/list-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/indent",
            title: "Indent",
          },
          {
            route: "/docs/list",
            title: "List",
          },
        ],
      },
      name: "list-demo",
      registryDependencies: ["@plate/list", "@plate/editor"],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "Line height adjustment controls.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/line-height-value.tsx",
          type: "registry:example",
        },
      ],
      name: "line-height-demo",
      registryDependencies: ["@plate/line-height", "@plate/editor"],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "Hyperlinks with toolbar insertion and URL pasting support.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/link-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/link",
            title: "Link",
          },
        ],
      },
      name: "link-demo",
      registryDependencies: ["@plate/link", "@plate/editor"],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "Media embedding and management.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/media-value.tsx",
          type: "registry:example",
        },
      ],
      name: "media-demo",
      registryDependencies: [
        "@plate/media",
        "@plate/media-audio",
        "@plate/media-embed",
        "@plate/media-file",
        "@plate/media-image",
        "@plate/media-placeholder",
        "@plate/media-video",
        "@plate/editor",
      ],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "Mention functionality for referencing users or entities.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/mention-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/mention",
            title: "Mention",
          },
        ],
      },
      name: "mention-demo",
      registryDependencies: ["@plate/mention", "@plate/editor"],
      type: "registry:example",
    },
    {
      files: [{ path: "examples/demo.tsx", type: "registry:example" }],
      name: "block-placeholder-demo",
      registryDependencies: ["@plate/block-placeholder", "@plate/editor"],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "Copy paste from CSV to Plate.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/deserialize-csv-value.tsx",
          type: "registry:example",
        },
      ],
      name: "csv-demo",
      registryDependencies: ["@plate/editor"],
      title: "Serializing CSV",
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils", "lucide-react"],
      description: "Copy paste from DOCX to Plate.",
      files: [
        { path: "examples/docx-demo.tsx", type: "registry:example" },
        {
          path: "examples/values/deserialize-docx-value.tsx",
          type: "registry:example",
        },
      ],
      name: "docx-demo",
      registryDependencies: [
        "@plate/docx",
        "@plate/editor",
        "@plate/editor-plugins",
        "@plate/export-toolbar-button",
        "@plate/fixed-toolbar",
        "@plate/import-toolbar-button",
        "@plate/toolbar",
      ],
      title: "Serializing Docx",
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "Copy paste from HTML to Plate.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/deserialize-html-value.tsx",
          type: "registry:example",
        },
      ],
      name: "html-demo",
      registryDependencies: ["@plate/editor"],
      title: "Serializing HTML",
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "Copy paste from Markdown to Plate.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/deserialize-md-value.tsx",
          type: "registry:example",
        },
      ],
      name: "markdown-demo",
      registryDependencies: ["@plate/markdown", "@plate/editor"],
      title: "Serializing Markdown",
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description:
        "Slash command menu for quick insertion of various content types.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/slash-command-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/slash-command",
            title: "Slash Command",
          },
        ],
      },
      name: "slash-command-demo",
      registryDependencies: ["@plate/slash", "@plate/editor"],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description:
        "Use plugin rules to customize the common editing behaviors.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/plugin-rules-value.tsx",
          type: "registry:example",
        },
      ],
      name: "plugin-rules-demo",
      registryDependencies: ["@plate/editor"],
      title: "Plugin Rules",
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description:
        "Customizable tables with resizable columns and row merging options.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/table-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/table",
            title: "Table",
          },
        ],
      },
      name: "table-demo",
      registryDependencies: ["@plate/table", "@plate/editor"],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/test-utils"],
      description: "Dynamic TOC with in-document element for easy navigation.",
      files: [
        { path: "examples/demo.tsx", type: "registry:example" },
        {
          path: "examples/values/toc-value.tsx",
          type: "registry:example",
        },
      ],
      meta: {
        docs: [
          {
            route: "/docs/toc",
            title: "TOC",
          },
        ],
      },
      name: "toc-demo",
      registryDependencies: ["@plate/toc", "@plate/editor"],
      title: "Table of Contents",
      type: "registry:example",
    },
    {
      description: "Collapsible content blocks.",
      files: [{ path: "examples/demo.tsx", type: "registry:example" }],
      name: "toggle-demo",
      registryDependencies: ["@plate/toggle", "@plate/editor"],
      type: "registry:example",
    },
  ] as Registry["items"]
).map((item) => ({
  ...item,
  meta: {
    ...item.meta,
    registry: false,
  },
}));

export const internalExamples: Registry["items"] = (
  [
    {
      files: [
        {
          path: "examples/document-migration-demo.tsx",
          type: "registry:example",
        },
      ],
      name: "document-migration-demo",
      registryDependencies: ["@plate/editor", "@plate/editor-plugins"],
      type: "registry:example",
    },
    {
      files: [{ path: "examples/demo.tsx", type: "registry:example" }],
      name: "playground-demo",
      registryDependencies: [
        "@plate/code-drawing",
        "@plate/editor",
        "@plate/excalidraw",
      ],
      type: "registry:example",
    },
    {
      files: [{ path: "examples/demo.tsx", type: "registry:example" }],
      name: "demo",
      registryDependencies: ["@plate/editor"],
      type: "registry:example",
    },
    {
      files: [
        { path: "examples/pro-iframe-demo.tsx", type: "registry:example" },
      ],
      name: "pro-iframe-demo",
      type: "registry:example",
    },
    {
      files: [
        { path: "examples/potion-iframe-demo.tsx", type: "registry:example" },
      ],
      name: "potion-iframe-demo",
      type: "registry:example",
    },
    {
      files: [
        {
          path: "examples/installation-next-01-editor-demo.tsx",
          type: "registry:example",
        },
      ],
      name: "installation-next-01-editor-demo",
      registryDependencies: ["@plate/editor"],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/basic-nodes"],
      files: [
        {
          path: "examples/installation-next-02-marks-demo.tsx",
          type: "registry:example",
        },
      ],
      name: "installation-next-02-marks-demo",
      registryDependencies: [
        "@plate/editor",
        "@plate/fixed-toolbar",
        "@plate/mark-toolbar-button",
      ],
      type: "registry:example",
    },
    {
      dependencies: ["@platejs/basic-nodes"],
      files: [
        {
          path: "examples/installation-next-03-elements-demo.tsx",
          type: "registry:example",
        },
      ],
      name: "installation-next-03-elements-demo",
      registryDependencies: [
        "@plate/editor",
        "@plate/fixed-toolbar",
        "@plate/mark-toolbar-button",
        "@plate/heading",
        "@plate/blockquote",
      ],
      type: "registry:example",
    },
    // Editor (not used?)
    {
      files: [
        {
          path: "examples/editor-default.tsx",
          type: "registry:example",
        },
      ],
      name: "editor-default",
      registryDependencies: ["@plate/editor", "@plate/editor-plugins"],
      type: "registry:example",
    },
    {
      files: [
        {
          path: "examples/editor-disabled.tsx",
          type: "registry:example",
        },
      ],
      name: "editor-disabled",
      registryDependencies: ["@plate/editor"],
      type: "registry:example",
    },
    {
      files: [
        {
          path: "examples/editor-full-width.tsx",
          type: "registry:example",
        },
      ],
      name: "editor-full-width",
      registryDependencies: ["@plate/editor"],
      type: "registry:example",
    },
  ] as Registry["items"]
).map((item) => ({
  ...item,
  meta: {
    ...item.meta,
    registry: false,
  },
}));

export const registryExamples: Registry["items"] = (
  [...examples, ...demoExamples, ...internalExamples] as Registry["items"]
).map((example) => ({
  ...example,
  // dependencies: ['@udecode/cn', ...(example.dependencies || [])],
}));
