import type { MainNavItem, SidebarNavItem } from '@/types/nav';

import { apiNavItems } from '@/config/docs-api';
import { examplesNavItems } from '@/config/docs-examples';
import { pluginsNavItems } from '@/config/docs-plugins';
import { registryToNav } from '@/config/registry-to-nav';
import { uiComponents, uiNodes, uiPrimitives } from '@/registry/registry-ui';

import { siteConfig } from './site';

export interface DocsConfig {
  componentsNav: SidebarNavItem[];
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
}

export const componentNavGroups: SidebarNavItem[] = [
  {
    items: registryToNav(uiNodes),
    title: 'Node Components',
  },
  {
    items: registryToNav(uiComponents),
    title: 'Components',
  },
  {
    items: registryToNav(uiPrimitives),
    title: 'Primitives',
  },
];

export const overviewNavItems: SidebarNavItem[] = [
  {
    href: '/docs',
    title: 'Introduction',
  },
  {
    href: '/docs/getting-started',
    title: 'Getting Started',
  },
  {
    href: '/docs/plugins',
    title: 'Plugins',
  },
  {
    href: '/docs/examples',
    title: 'Examples',
  },
  {
    href: '/docs/components',
    title: 'Components',
  },
  {
    href: '/docs/api',
    title: 'API Reference',
  },
];

export const guidesNavItems: SidebarNavItem[] = [
  {
    href: '/docs/plugin',
    title: 'Plugin Configuration',
  },
  {
    href: '/docs/plugin-methods',
    title: 'Plugin Methods',
  },
  {
    href: '/docs/plugin-shortcuts',
    title: 'Plugin Shortcuts',
  },
  {
    href: '/docs/plugin-context',
    title: 'Plugin Context',
  },
  {
    href: '/docs/plugin-components',
    title: 'Plugin Components',
  },
  {
    href: '/docs/editor',
    title: 'Editor Configuration',
  },
  {
    href: '/docs/editor-methods',
    title: 'Editor Methods',
  },
  {
    href: '/docs/controlled',
    title: 'Controlled Value',
  },
  {
    href: '/docs/debugging',
    title: 'Debugging',
  },
  {
    href: '/docs/unit-testing',
    title: 'Unit Testing',
  },
  {
    href: '/docs/playwright',
    title: 'Playwright Testing',
  },
];

export const componentGuidesNavItems: SidebarNavItem[] = [
  {
    href: '/docs/components/introduction',
    title: 'Introduction',
  },
  {
    href: '/docs/components/installation',
    title: 'Installation',
  },
  {
    href: '/docs/components/components-json',
    title: 'components.json',
  },
  {
    href: '/docs/components/theming',
    title: 'Theming',
  },
  {
    href: '/docs/components/dark-mode',
    title: 'Dark mode',
  },
  {
    href: '/docs/components/cli',
    title: 'CLI',
  },
  {
    href: '/docs/components/changelog',
    title: 'Changelog',
  },
  {
    href: '/docs/components',
    title: 'Components',
  },
];

export const docsConfig: DocsConfig = {
  componentsNav: [
    {
      items: componentGuidesNavItems,
      title: 'Plate UI',
    },
    ...componentNavGroups,
  ],
  mainNav: [
    {
      href: '/docs',
      title: 'Documentation',
    },
    {
      href: '/docs/components',
      title: 'Components',
    },
    {
      href: '/editors',
      title: 'Editors',
    },
    {
      href: '/#potion',
      title: 'Potion',
    },
    {
      external: true,
      href: 'https://github.com/udecode/plate',
      title: 'GitHub',
    },
    {
      external: true,
      href: 'https://discord.gg/mAZRuBzGM3',
      title: 'Discord',
    },
    {
      href: siteConfig.links.platePro,
      title: 'Plate Plus',
    },
  ],
  sidebarNav: [
    {
      items: overviewNavItems,
      title: 'Overview',
    },
    {
      items: [
        {
          href: '/docs/migration/slate-to-plate',
          title: 'From Slate to Plate',
        },
      ],
      title: 'Migration',
    },
    {
      items: guidesNavItems,
      title: 'Guides',
    },
    {
      items: pluginsNavItems,
      title: 'Plugins',
    },
    {
      items: examplesNavItems,
      title: 'Examples',
    },
    {
      items: apiNavItems,
      title: 'API',
    },
  ],
};
