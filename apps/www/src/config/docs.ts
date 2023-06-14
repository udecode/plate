import { MainNavItem, SidebarNavItem } from '@/types/nav';

interface DocsConfig {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
}

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: 'Documentation',
      href: '/docs',
    },
    {
      title: 'Components',
      href: '/docs/components/accordion',
    },
    {
      title: 'Examples',
      href: '/examples',
    },
    {
      title: 'GitHub',
      href: 'https://github.com/shadcn/ui',
      external: true,
    },
    {
      title: 'Twitter',
      href: 'https://twitter.com/shadcn',
      external: true,
    },
  ],
  sidebarNav: [
    {
      title: 'Getting Started',
      items: [
        {
          title: 'Introduction',
          href: '/docs',
          items: [],
        },
        {
          title: 'Installation',
          href: '/docs/installation',
          items: [],
        },
        {
          title: 'Playground',
          href: '/',
          items: [],
        },
      ],
    },
    {
      title: 'Guides',
      items: [
        {
          title: 'Plate',
          href: '/docs/plate',
          items: [],
        },
        {
          title: 'Plugins',
          href: '/docs/plugins',
          items: [],
        },
        {
          title: 'Styling',
          href: '/docs/styling',
          items: [],
        },
        // {
        //   title: 'Multiple Editors',
        //   href: '/docs/multiple-editors',
        //   items: [],
        // },
        {
          title: 'Typescript',
          href: '/docs/typescript',
          items: [],
        },
      ],
    },
    {
      title: 'Components',
      items: [
        {
          title: 'Align Dropdown Menu',
          href: '/docs/components/align-dropdown-menu',
          items: [],
        },
        {
          title: 'Avatar',
          href: '/docs/components/avatar',
          items: [],
        },
        {
          title: 'Blockquote Element',
          href: '/docs/components/blockquote-element',
          items: [],
        },
        {
          title: 'Button',
          href: '/docs/components/button',
          items: [],
        },
        {
          title: 'Cloud',
          href: '/docs/components/cloud',
          items: [],
        },
        // {
        //   title: 'Cloud Image Element',
        //   href: '/docs/components/cloud-image-element',
        //   items: [],
        // },
        {
          title: 'Code Block Element',
          href: '/docs/components/code-block-element',
          items: [],
        },
        {
          title: 'Code Leaf',
          href: '/docs/components/code-leaf',
          items: [],
        },
        {
          title: 'Code Line Element',
          href: '/docs/components/code-line-element',
          items: [],
        },
        {
          title: 'Code Syntax Leaf',
          href: '/docs/components/code-syntax-leaf',
          items: [],
        },
        {
          title: 'Color Dropdown Menu',
          href: '/docs/components/color-dropdown-menu',
          items: [],
        },
        {
          title: 'Combobox',
          href: '/docs/components/combobox',
          items: [],
        },
        {
          title: 'Comment Leaf',
          href: '/docs/components/comment-leaf',
          items: [],
        },
        {
          title: 'Comments Popover',
          href: '/docs/components/comments-popover',
          items: [],
        },
        {
          title: 'Comment Toolbar Button',
          href: '/docs/components/comment-toolbar-button',
          items: [],
        },
        {
          title: 'Cursor Overlay',
          href: '/docs/components/cursor-overlay',
          items: [],
        },
        {
          title: 'Draggables',
          href: '/docs/components/draggables',
          items: [],
        },
        {
          title: 'Dropdown Menu',
          href: '/docs/components/dropdown-menu',
          items: [],
        },
        {
          title: 'Emoji Combobox',
          href: '/docs/components/emoji-combobox',
          items: [],
        },
        {
          title: 'Emoji Dropdown Menu',
          href: '/docs/components/emoji-dropdown-menu',
          items: [],
        },
        {
          title: 'Emoji Toolbar Dropdown',
          href: '/docs/components/emoji-toolbar-dropdown',
          items: [],
        },
        {
          title: 'Excalidraw Element',
          href: '/docs/components/excalidraw-element',
          items: [],
        },
        {
          title: 'Fixed Toolbar',
          href: '/docs/components/fixed-toolbar',
          items: [],
        },
        {
          title: 'Fixed Toolbar Buttons',
          href: '/docs/components/fixed-toolbar-buttons',
          items: [],
        },
        {
          title: 'Floating Toolbar',
          href: '/docs/components/floating-toolbar',
          items: [],
        },
        {
          title: 'Floating Toolbar Buttons',
          href: '/docs/components/floating-toolbar-buttons',
          items: [],
        },
        {
          title: 'Heading Element',
          href: '/docs/components/heading-element',
          items: [],
        },
        {
          title: 'Highlight Leaf',
          href: '/docs/components/highlight-leaf',
          items: [],
        },
        {
          title: 'Hr Element',
          href: '/docs/components/hr-element',
          items: [],
        },
        {
          title: 'Image Element',
          href: '/docs/components/image-element',
          items: [],
        },
        {
          title: 'Indent List Toolbar Button',
          href: '/docs/components/indent-list-toolbar-button',
          items: [],
        },
        {
          title: 'Indent Toolbar Button',
          href: '/docs/components/indent-toolbar-button',
          items: [],
        },
        {
          title: 'Input',
          href: '/docs/components/input',
          items: [],
        },
        {
          title: 'Insert Dropdown Menu',
          href: '/docs/components/insert-dropdown-menu',
          items: [],
        },
        {
          title: 'Kbd Leaf',
          href: '/docs/components/kbd-leaf',
          items: [],
        },
        {
          title: 'Line Height Dropdown Menu',
          href: '/docs/components/line-height-dropdown-menu',
          items: [],
        },
        {
          title: 'Link Element',
          href: '/docs/components/link-element',
          items: [],
        },
        {
          title: 'Link Floating Toolbar',
          href: '/docs/components/link-floating-toolbar',
          items: [],
        },
        {
          title: 'Link Toolbar Button',
          href: '/docs/components/link-toolbar-button',
          items: [],
        },
        {
          title: 'List Element',
          href: '/docs/components/list-element',
          items: [],
        },
        {
          title: 'List Toolbar Button',
          href: '/docs/components/list-toolbar-button',
          items: [],
        },
        {
          title: 'Mark Toolbar Button',
          href: '/docs/components/mark-toolbar-button',
          items: [],
        },
        {
          title: 'Media Embed Element',
          href: '/docs/components/media-embed-element',
          items: [],
        },
        {
          title: 'Media Floating Toolbar',
          href: '/docs/components/media-floating-toolbar',
          items: [],
        },
        {
          title: 'Media Toolbar Button',
          href: '/docs/components/media-toolbar-button',
          items: [],
        },
        {
          title: 'Mention Combobox',
          href: '/docs/components/mention-combobox',
          items: [],
        },
        {
          title: 'Mention Element',
          href: '/docs/components/mention-element',
          items: [],
        },
        {
          title: 'Mention Input element',
          href: '/docs/components/mention-input-element',
          items: [],
        },
        {
          title: 'Mode Dropdown Menu',
          href: '/docs/components/mode-dropdown-menu',
          items: [],
        },
        {
          title: 'More Dropdown Menu',
          href: '/docs/components/more-dropdown-menu',
          items: [],
        },
        {
          title: 'Outdent Toolbar Button',
          href: '/docs/components/outdent-toolbar-button',
          items: [],
        },
        {
          title: 'Paragraph Element',
          href: '/docs/components/paragraph-element',
          items: [],
        },
        {
          title: 'Placeholders',
          href: '/docs/components/placeholders',
          items: [],
        },
        {
          title: 'Popover',
          href: '/docs/components/popover',
          items: [],
        },
        {
          title: 'Scroll Area',
          href: '/docs/components/scroll-area',
          items: [],
        },
        {
          title: 'Search Highlight Leaf',
          href: '/docs/components/search-highlight-leaf',
          items: [],
        },
        {
          title: 'Separator',
          href: '/docs/components/separator',
          items: [],
        },
        {
          title: 'Table Cell Element',
          href: '/docs/components/table-cell-element',
          items: [],
        },

        {
          title: 'Table Dropdown Menu',
          href: '/docs/components/table-dropdown-menu',
          items: [],
        },
        {
          title: 'Table Element',
          href: '/docs/components/table-element',
          items: [],
        },
        {
          title: 'Table Row Element',
          href: '/docs/components/table-row-element',
          items: [],
        },
        {
          title: 'Todo List Element',
          href: '/docs/components/todo-list-element',
          items: [],
        },
        {
          title: 'Toggle',
          href: '/docs/components/toggle',
          items: [],
        },
        {
          title: 'Toolbar',
          href: '/docs/components/toolbar',
          items: [],
        },
        {
          title: 'Tooltip',
          href: '/docs/components/tooltip',
          items: [],
        },
        {
          title: 'Turn Into Dropdown Menu',
          href: '/docs/components/turn-into-dropdown-menu',
          items: [],
        },
      ],
    },
    {
      title: 'Plugins',
      items: [
        {
          title: 'Alignment',
          href: '/docs/alignment',
          items: [],
        },
        {
          title: 'Autoformat',
          href: '/docs/autoformat',
          items: [],
        },
        {
          title: 'Basic Elements',
          href: '/docs/basic-elements',
          items: [],
        },
        {
          title: 'Basic Marks',
          href: '/docs/basic-marks',
          items: [],
        },
        {
          title: 'Block Selection',
          href: '/docs/block-selection',
          items: [],
        },
        {
          title: 'Cloud',
          href: '/docs/cloud',
          items: [],
        },
        {
          title: 'Combobox',
          href: '/docs/combobox',
          items: [],
        },
        {
          title: 'Comments',
          href: '/docs/comments',
          items: [],
        },
        {
          title: 'Emoji',
          href: '/docs/emoji',
          items: [],
        },
        {
          title: 'Excalidraw',
          href: '/docs/excalidraw',
          items: [],
        },
        {
          title: 'Exit Break',
          href: '/docs/exit-break',
          items: [],
        },
        // {
        //   title: 'Find',
        //   href: '/docs/find-replace',
        //   items: [],
        // },
        {
          title: 'Font',
          href: '/docs/font',
          items: [],
        },
        {
          title: 'Forced Layout',
          href: '/docs/forced-layout',
          items: [],
        },
        {
          title: 'Highlight',
          href: '/docs/highlight',
          items: [],
        },
        {
          title: 'Horizontal Rule',
          href: '/docs/horizontal-rule',
          items: [],
        },
        {
          title: 'Indent',
          href: '/docs/indent',
          items: [],
        },
        {
          title: 'Indent List',
          href: '/docs/indent-list',
          items: [],
        },
        {
          title: 'Line Height',
          href: '/docs/line-height',
          items: [],
        },
        {
          title: 'Link',
          href: '/docs/link',
          items: [],
        },
        {
          title: 'List',
          href: '/docs/list',
          items: [],
        },
        {
          title: 'Media',
          href: '/docs/media',
          items: [],
        },
        {
          title: 'Mention',
          href: '/docs/mention',
          items: [],
        },
        {
          title: 'Reset Node',
          href: '/docs/reset-node',
          items: [],
        },
        {
          title: 'Serializing CSV',
          href: '/docs/serializing-csv',
          items: [],
        },
        {
          title: 'Serializing DOCX',
          href: '/docs/serializing-docx',
          items: [],
        },
        {
          title: 'Serializing HTML',
          href: '/docs/serializing-html',
          items: [],
        },
        {
          title: 'Serializing MD',
          href: '/docs/serializing-md',
          items: [],
        },
        {
          title: 'Single Line',
          href: '/docs/single-line',
          items: [],
        },
        {
          title: 'Soft Break',
          href: '/docs/soft-break',
          items: [],
        },
        {
          title: 'Tabbable',
          href: '/docs/tabbable',
          items: [],
        },
        {
          title: 'Table',
          href: '/docs/table',
          items: [],
        },
      ],
    },
    {
      title: 'API',
      items: [
        {
          title: 'Plate',
          href: '/docs/plate',
          items: [],
        },
        {
          title: 'PlatePlugin',
          href: '/docs/api/plate-plugin',
          items: [],
        },
        {
          title: 'Store',
          href: '/docs/api/store',
          items: [],
        },
      ],
    },
    // {
    //   title: 'Community',
    //   items: [
    //   ],
    // },
  ],
};
