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
          href: '/playground',
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
      title: 'Plugins',
      items: [
        {
          title: 'Accordion',
          href: '/docs/components/accordion',
          items: [],
        },
        {
          title: 'Collaboration',
          href: '/docs/components/accordion',
          items: [
            {
              title: 'Comments',
              href: '/docs/forms/react-hook-form',
              label: 'New',
              items: [],
            },
            {
              title: 'Suggestions',
              href: '#',
              items: [],
              label: 'Soon',
              disabled: true,
            },
          ],
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
