import type { SidebarNavItem } from '@/types/nav';

import {
  componentGuidesNavItems,
  componentNavGroups,
  guidesNavItems,
  overviewNavItems,
} from '@/config/docs';
import { apiNavItems } from '@/config/docs-api';
import { examplesNavItems } from '@/config/docs-examples';
import { pluginsNavItems } from '@/config/docs-plugins';

export const docSections: SidebarNavItem[] = [
  {
    items: [
      { href: '/docs', title: 'Guides', value: 'guide' },
      { href: '/docs/plugins', title: 'Plugins', value: 'plugin' },
      { href: '/docs/examples', title: 'Examples', value: 'example' },
      { href: '/docs/components', title: 'Components', value: 'component' },
      { href: '/docs/api', title: 'API Reference', value: 'api' },
    ],
  },
];

export const slugToCategory = (slug: string[]) => {
  const name = slug?.[0];
  const path = '/docs/' + (slug?.join('/') || '');

  if (name === 'examples') return 'example';
  if (name === 'components') return 'component';
  if (name === 'plugins') return 'plugin';
  if (name === 'api') return 'api';
  if (pluginsNavItems.some((plugin) => plugin.href === path)) return 'plugin';

  return 'guide';
};

export const categoryNavGroups = {
  api: [{ items: apiNavItems }],
  component: componentNavGroups,
  example: [{ items: examplesNavItems }],
  guide: [
    { items: overviewNavItems, title: 'Overview' },
    {
      items: [
        {
          href: '/docs/migration/slate-to-plate',
          title: 'From Slate to Plate',
        },
      ],
      title: 'Migration',
    },
    { items: guidesNavItems, title: 'Guides' },
    { items: componentGuidesNavItems, title: 'Components' },
  ],
  plugin: [{ items: pluginsNavItems }],
};
