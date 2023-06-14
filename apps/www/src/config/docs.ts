import { MainNavItem, SidebarNavItem } from '@/types/nav';

interface DocsConfig {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
  componentsNav: SidebarNavItem[];
}

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: 'Documentation',
      href: '/docs',
    },
    {
      title: 'Components',
      href: '/docs/components',
    },
    {
      title: 'GitHub',
      href: 'https://github.com/udecode/plate',
      external: true,
    },
    {
      title: 'Twitter',
      href: 'https://twitter.com/zbeyens',
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
          title: 'Components',
          href: '/docs/plugin-components',
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
          label: 'Element',
        },
        {
          title: 'Basic Marks',
          href: '/docs/basic-marks',
          items: [],
          label: 'Leaf',
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
          label: 'Element',
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
          label: 'Leaf',
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
          label: 'Element',
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
          label: 'Leaf',
        },
        {
          title: 'Horizontal Rule',
          href: '/docs/horizontal-rule',
          items: [],
          label: 'Element',
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
          label: 'Element',
        },
        {
          title: 'List',
          href: '/docs/list',
          items: [],
          label: 'Element',
        },
        {
          title: 'Media',
          href: '/docs/media',
          items: [],
          label: 'Element',
        },
        {
          title: 'Mention',
          href: '/docs/mention',
          items: [],
          label: 'Element',
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
          label: 'Element',
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
  componentsNav: [
    {
      title: 'Getting Started',
      items: [
        {
          title: 'Introduction',
          href: '/docs/components',
          items: [],
        },
        {
          title: 'Installation',
          href: '/docs/components/installation',
          items: [],
        },
        {
          title: 'Theming',
          href: '/docs/components/theming',
          items: [],
        },
        {
          title: 'CLI',
          href: '/docs/components/cli',
          items: [],
        },
        {
          title: 'Typography',
          href: '/docs/components/typography',
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
          title: 'Blockquote',
          href: '/docs/components/blockquote-element',
          items: [],
          label: 'Element',
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
        {
          title: 'Code Block',
          href: '/docs/components/code-block-element',
          items: [],
          label: 'Element',
        },
        {
          title: 'Code',
          href: '/docs/components/code-leaf',
          items: [],
          label: 'Leaf',
        },
        {
          title: 'Code Line',
          href: '/docs/components/code-line-element',
          items: [],
          label: 'Element',
        },
        {
          title: 'Code Syntax',
          href: '/docs/components/code-syntax-leaf',
          items: [],
          label: 'Leaf',
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
          title: 'Comment',
          href: '/docs/components/comment-leaf',
          items: [],
          label: 'Leaf',
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
          title: 'Excalidraw',
          href: '/docs/components/excalidraw-element',
          items: [],
          label: 'Element',
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
          title: 'Heading',
          href: '/docs/components/heading-element',
          items: [],
          label: 'Element',
        },
        {
          title: 'Highlight',
          href: '/docs/components/highlight-leaf',
          items: [],
          label: 'Leaf',
        },
        {
          title: 'Hr',
          href: '/docs/components/hr-element',
          items: [],
          label: 'Element',
        },
        {
          title: 'Image',
          href: '/docs/components/image-element',
          items: [],
          label: 'Element',
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
          title: 'Kbd',
          href: '/docs/components/kbd-leaf',
          items: [],
          label: 'Leaf',
        },
        {
          title: 'Line Height Dropdown Menu',
          href: '/docs/components/line-height-dropdown-menu',
          items: [],
        },
        {
          title: 'Link',
          href: '/docs/components/link-element',
          items: [],
          label: 'Element',
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
          title: 'List',
          href: '/docs/components/list-element',
          items: [],
          label: 'Element',
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
          title: 'Media Embed',
          href: '/docs/components/media-embed-element',
          items: [],
          label: 'Element',
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
          title: 'Mention',
          href: '/docs/components/mention-element',
          items: [],
          label: 'Element',
        },
        {
          title: 'Mention Input',
          href: '/docs/components/mention-input-element',
          items: [],
          label: 'Element',
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
          title: 'Paragraph',
          href: '/docs/components/paragraph-element',
          items: [],
          label: 'Element',
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
          title: 'Separator',
          href: '/docs/components/separator',
          items: [],
        },
        {
          title: 'Table Cell',
          href: '/docs/components/table-cell-element',
          items: [],
          label: 'Element',
        },

        {
          title: 'Table Dropdown Menu',
          href: '/docs/components/table-dropdown-menu',
          items: [],
        },
        {
          title: 'Table',
          href: '/docs/components/table-element',
          items: [],
          label: 'Element',
        },
        {
          title: 'Table Row',
          href: '/docs/components/table-row-element',
          items: [],
          label: 'Element',
        },
        {
          title: 'Todo List',
          href: '/docs/components/todo-list-element',
          items: [],
          label: 'Element',
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
  ],
};
