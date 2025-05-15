import type { MainNavItem, SidebarNavItem } from '@/types/nav';

import { docsApi } from '@/config/docs-api';
import { docsExamples } from '@/config/docs-examples';
import { pluginNavMap, pluginsNavItems } from '@/config/docs-plugins';
import { navToObject } from '@/config/nav-to-object';
import { registryToNav } from '@/config/registry-to-nav';
import { uiComponents, uiNodes } from '@/registry/registry-ui';

import { siteConfig } from './site';

export interface DocsConfig {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
}

export const componentNavGroups: SidebarNavItem[] = [
  {
    href: '/docs/components/changelog',
    title: 'Changelog',
  },
  {
    href: '/docs/components',
    items: registryToNav(uiComponents),
    title: 'Components',
  },
  {
    href: '/docs/components#node-components',
    items: registryToNav(uiNodes),
    title: 'Node Components',
  },
];

export const componentNavMap = navToObject(componentNavGroups);

export const gettingStartedNavItems: SidebarNavItem[] = [
  {
    href: '/docs',
    title: 'Introduction',
  },
  {
    href: '/docs/installation',
    title: 'Installation',
  },
];

export const installationNavItems: SidebarNavItem[] = [
  {
    href: '/docs/installation/plate-ui',
    items: [
      {
        href: '/docs/installation/next',
        title: 'Next.js',
      },
      {
        href: '/docs/installation/react',
        title: 'React',
      },
      {
        href: '/docs/mcp',
        label: 'New',
        title: 'MCP',
      },
    ],
    title: 'Plate UI',
  },
  {
    href: '/docs/installation/manual',
    title: 'Manual',
  },
  {
    href: '/docs/installation/rsc',
    label: 'New',
    title: 'RSC',
  },
  {
    href: '/docs/installation/node',
    label: 'New',
    title: 'Node.js',
  },
];

export const guidesNavItems: SidebarNavItem[] = [
  {
    href: '/docs/plugin',
    items: [
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
    ],
    title: 'Plugin',
  },
  {
    href: '/docs/editor',
    items: [
      {
        href: '/docs/editor-methods',
        title: 'Editor Methods',
      },
      {
        href: '/docs/controlled',
        title: 'Controlled Value',
      },
    ],
    title: 'Editor',
  },
  {
    href: '/docs/static',
    label: 'Updated',
    title: 'Static Rendering',
  },
  {
    description: 'HTML ↔ Plate',
    href: '/docs/html',
    label: 'Updated',
    title: 'HTML',
  },
  {
    description: 'Markdown ↔ Plate',
    href: '/docs/markdown',
    label: 'Updated',
    title: 'Markdown',
  },
  {
    href: '/docs/form',
    title: 'Form',
  },
  {
    href: '/docs/typescript',
    title: 'TypeScript',
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
  {
    href: '/docs/troubleshooting',
    title: 'Troubleshooting',
  },
];

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      href: '/',
      title: 'Home',
    },
    {
      href: '/docs',
      title: 'Docs',
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
      items: gettingStartedNavItems,
      title: 'Get Started',
    },
    {
      items: installationNavItems,
      title: 'Installation',
    },
    {
      items: guidesNavItems,
      title: 'Guides',
    },
    {
      items: [
        {
          href: '/docs/plugins',
          title: 'Overview',
        },
        ...pluginsNavItems,
      ],
      title: 'Plugins',
    },
    {
      items: componentNavGroups,
      title: 'Components',
    },
    {
      items: [
        {
          href: '/docs/examples',
          title: 'Overview',
        },
        ...docsExamples,
      ],
      title: 'Examples',
    },
    {
      items: [
        {
          href: '/docs/migration/slate-to-plate',
          title: 'From Slate to Plate',
        },
      ],
      title: 'Migrations',
    },
    {
      items: [
        {
          href: '/docs/api',
          title: 'Overview',
        },
        ...docsApi,
      ],
      title: 'API',
    },
  ],
};

export const docsMap = navToObject(docsConfig.sidebarNav);

export const getComponentNavItem = (id: string) => {
  return componentNavMap['/docs/components/' + id];
};

export const getPluginNavItem = (id: string) => {
  return pluginNavMap['/docs/' + id];
};
