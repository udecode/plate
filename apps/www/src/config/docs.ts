import type { MainNavItem, SidebarNavItem } from '@/types/nav';

import { docsApi } from '@/config/docs-api';
import { docsExamples } from '@/config/docs-examples';
import { pluginNavMap, pluginsNavItems } from '@/config/docs-plugins';
import { navToObject } from '@/config/nav-to-object';
import { registryToNav } from '@/config/registry-to-nav';
import { uiComponents, uiNodes } from '@/registry/registry-ui';

import { siteConfig } from './site';

export type DocsConfig = {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
};

export const componentNavGroups: SidebarNavItem[] = [
  {
    href: '/docs/components/changelog',
    title: 'Changelog',
    titleCn: '更新日志',
  },
  {
    href: '/docs/components',
    items: registryToNav(uiComponents),
    title: 'Components',
    titleCn: '组件',
  },
  {
    href: '/docs/components#node-components',
    items: registryToNav(uiNodes),
    title: 'Node Components',
    titleCn: '节点组件',
  },
];

export const componentNavMap = navToObject(componentNavGroups);

export const gettingStartedNavItems: SidebarNavItem[] = [
  {
    href: '/docs',
    title: 'Introduction',
    titleCn: '介绍',
  },
  {
    href: '/docs/installation',
    title: 'Installation',
    titleCn: '安装',
  },
];

export const installationNavItems: SidebarNavItem[] = [
  {
    href: '/docs/installation/plate-ui',
    items: [
      {
        href: '/docs/installation/next',
        title: 'Next.js',
        titleCn: 'Next.js',
      },
      {
        href: '/docs/installation/react',
        title: 'React',
        titleCn: 'React',
      },
    ],
    title: 'Plate UI',
    titleCn: 'Plate UI',
  },
  {
    href: '/docs/installation/manual',
    title: 'Manual',
    titleCn: '手动安装',
  },
  {
    href: '/docs/installation/rsc',
    title: 'RSC',
    titleCn: 'RSC',
  },
  {
    href: '/docs/installation/node',
    title: 'Node.js',
    titleCn: 'Node.js',
  },
  {
    href: '/docs/installation/docs',
    label: 'New',
    title: 'Local Docs',
    titleCn: '本地文档',
  },
  {
    href: '/docs/installation/mcp',
    label: 'New',
    title: 'MCP',
    titleCn: 'MCP',
  },
];

export const guidesNavItems: SidebarNavItem[] = [
  {
    href: '/docs/feature-kits',
    label: 'New',
    title: 'Feature Kits',
    titleCn: '功能套件',
  },

  {
    href: '/docs/plugin',
    items: [
      {
        href: '/docs/plugin-methods',
        title: 'Plugin Methods',
        titleCn: '插件方法',
      },
      {
        href: '/docs/plugin-shortcuts',
        label: 'Updated',
        title: 'Plugin Shortcuts',
        titleCn: '插件快捷键',
      },
      {
        href: '/docs/plugin-context',
        title: 'Plugin Context',
        titleCn: '插件上下文',
      },
      {
        href: '/docs/plugin-components',
        title: 'Plugin Components',
        titleCn: '插件组件',
      },
      {
        href: '/docs/plugin-rules',
        label: 'New',
        title: 'Plugin Rules',
        titleCn: '插件规则',
      },
    ],
    title: 'Plugin',
    titleCn: '插件',
  },
  {
    href: '/docs/editor',
    items: [
      {
        href: '/docs/editor-methods',
        title: 'Editor Methods',
        titleCn: '编辑器方法',
      },
      {
        href: '/docs/controlled',
        title: 'Controlled Value',
        titleCn: '受控值',
      },
    ],
    title: 'Editor',
    titleCn: '编辑器',
  },
  {
    href: '/docs/static',
    label: 'Updated',
    title: 'Static Rendering',
    titleCn: '静态渲染',
  },
  {
    description: 'HTML ↔ Plate',
    href: '/docs/html',
    label: 'Updated',
    title: 'HTML',
    titleCn: 'HTML',
  },
  {
    description: 'Markdown ↔ Plate',
    href: '/docs/markdown',
    label: 'Updated',
    title: 'Markdown',
    titleCn: 'Markdown',
  },
  {
    href: '/docs/form',
    title: 'Form',
    titleCn: '表单',
  },
  {
    href: '/docs/typescript',
    title: 'TypeScript',
    titleCn: 'TypeScript',
  },
  {
    href: '/docs/debugging',
    title: 'Debugging',
    titleCn: '调试',
  },
  {
    href: '/docs/unit-testing',
    title: 'Unit Testing',
    titleCn: '单元测试',
  },
  {
    href: '/docs/playwright',
    title: 'Playwright Testing',
    titleCn: 'Playwright 测试',
  },
  {
    href: '/docs/troubleshooting',
    keywords: ['depset'],
    title: 'Troubleshooting',
    titleCn: '故障排除',
  },
];

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      href: '/',
      title: 'Home',
      titleCn: '首页',
    },
    {
      href: '/docs',
      title: 'Docs',
      titleCn: '文档',
    },
    {
      href: '/editors',
      title: 'Editors',
      titleCn: '编辑器',
    },
    {
      href: '/#potion',
      title: 'Potion',
      titleCn: 'Potion',
    },
    {
      external: true,
      href: 'https://discord.gg/mAZRuBzGM3',
      title: 'Discord',
      titleCn: 'Discord',
    },
    {
      href: siteConfig.links.platePro,
      title: 'Plate Plus',
      titleCn: 'Plate Plus',
    },
  ],
  sidebarNav: [
    {
      items: gettingStartedNavItems,
      title: 'Get Started',
      titleCn: '开始',
    },
    {
      items: installationNavItems,
      title: 'Installation',
      titleCn: '安装',
    },
    {
      items: guidesNavItems,
      title: 'Guides',
      titleCn: '指南',
    },
    {
      items: [
        {
          href: '/docs/plugins',
          title: 'Overview',
          titleCn: '概览',
        },
        ...pluginsNavItems,
      ],
      title: 'Plugins',
      titleCn: '插件',
    },
    {
      items: componentNavGroups,
      title: 'Components',
      titleCn: '组件',
    },
    {
      items: [
        {
          href: '/docs/examples',
          title: 'Overview',
          titleCn: '概览',
        },
        ...docsExamples,
      ],
      title: 'Examples',
      titleCn: '示例',
    },
    {
      items: [
        {
          href: '/docs/migration',
          title: 'Latest',
          titleCn: '最新',
        },
        {
          href: '/docs/migration/v48',
          title: 'v48',
          titleCn: 'v48',
        },
        {
          href: '/docs/migration/slate-to-plate',
          title: 'From Slate to Plate',
          titleCn: '从 Slate 到 Plate',
        },
      ],
      title: 'Migrations',
      titleCn: '迁移',
    },
    {
      items: [
        {
          href: '/docs/api',
          title: 'Overview',
          titleCn: '概览',
        },
        ...docsApi,
      ],
      title: 'API',
      titleCn: 'API',
    },
  ],
};

export const docsMap = navToObject(docsConfig.sidebarNav);

export const getComponentNavItem = (id: string) =>
  componentNavMap[`/docs/components/${id}`];

export const getPluginNavItem = (id: string) =>
  pluginNavMap[`/docs/${id}`] ?? {};
