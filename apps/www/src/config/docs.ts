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
        {
          title: 'Multiple Editors',
          href: '/docs/multiple-editors',
          items: [],
        },
        {
          title: 'Typescript',
          href: '/docs/typescript',
          items: [],
        },
        {
          title: 'Cloud',
          href: '/docs/cloud',
          items: [],
        },
      ],
    },
    {
      title: 'Components',
      items: [
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
          title: 'Toolbar',
          href: '/docs/components/toolbar',
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
        // {
        //   title: 'Cloud',
        //   href: '/docs/cloud',
        //   items: [],
        // },
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
          title: 'Exit break',
          href: '/docs/exit-break',
          items: [],
        },
        {
          title: 'Find',
          href: '/docs/find-replace',
          items: [],
        },
        {
          title: 'Font',
          href: '/docs/font',
          items: [],
        },
        {
          title: 'Forced layout',
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
          title: 'Indent list',
          href: '/docs/indent-list',
          items: [],
        },
        {
          title: 'Kbd',
          href: '/docs/kbd',
          items: [],
        },
        {
          title: 'Line height',
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
          title: 'Serializing csv',
          href: '/docs/serializing-csv',
          items: [],
        },
        {
          title: 'Serializing docx',
          href: '/docs/serializing-docx',
          items: [],
        },
        {
          title: 'Serializing html',
          href: '/docs/serializing-html',
          items: [],
        },
        {
          title: 'serializing md',
          href: '/docs/serializing-md',
          items: [],
        },
        {
          title: 'Single line',
          href: '/docs/single-line',
          items: [],
        },
        {
          title: 'Soft break',
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
