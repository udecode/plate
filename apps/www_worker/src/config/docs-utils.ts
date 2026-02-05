import type { SidebarNavItem } from '@/types/nav';

import {
  componentNavGroups,
  gettingStartedNavItems,
  guidesNavItems,
  installationNavItems,
} from '@/config/docs';
import { docsApi } from '@/config/docs-api';
import { docsExamples } from '@/config/docs-examples';
import { pluginNavMap, pluginsNavItems } from '@/config/docs-plugins';

export const docSections: SidebarNavItem[] = [
  {
    items: [
      { href: '/docs', title: 'Guides', titleCn: '指南', value: 'guide' },
      {
        href: '/docs/plugins',
        title: 'Plugins',
        titleCn: '插件',
        value: 'plugin',
      },
      {
        href: '/docs/components',
        title: 'Components',
        titleCn: '组件',
        value: 'component',
      },
      {
        href: '/docs/examples',
        title: 'Examples',
        titleCn: '示例',
        value: 'example',
      },
      {
        href: '/docs/api',
        title: 'API Reference',
        titleCn: 'API 参考',
        value: 'api',
      },
    ],
  },
];

export const slugToCategory = (slug: string[]) => {
  const name = slug?.[0];
  const path = `/docs/${slug?.join('/') || ''}`;

  if (name === 'examples') return 'example';
  if (name === 'components') return 'component';
  if (name === 'plugins') return 'plugin';
  if (name === 'api') return 'api';
  if (pluginNavMap[path]) return 'plugin';

  return 'guide';
};

export const categoryNavGroups = {
  api: [{ items: docsApi }],
  component: componentNavGroups,
  example: [{ items: docsExamples }],
  guide: [
    { items: gettingStartedNavItems, title: 'Overview', titleCn: '概览' },
    { items: installationNavItems, title: 'Installation', titleCn: '安装' },
    { items: guidesNavItems, title: 'Guides', titleCn: '指南' },
    {
      items: [
        {
          href: '/docs/migration/slate-to-plate',
          title: 'From Slate to Plate',
          titleCn: '从 Slate 到 Plate',
        },
      ],
      title: 'Migration',
      titleCn: '迁移',
    },
  ],
  plugin: [{ items: pluginsNavItems }],
};
