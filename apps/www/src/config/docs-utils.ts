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
      { href: '/docs', title: 'Guides', value: 'guide' },
      { href: '/docs/plugins', title: 'Plugins', value: 'plugin' },
      { href: '/docs/components', title: 'Components', value: 'component' },
      { href: '/docs/examples', title: 'Examples', value: 'example' },
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
  if (pluginNavMap[path]) return 'plugin';

  return 'guide';
};

export const categoryNavGroups = {
  api: [{ items: docsApi }],
  component: componentNavGroups,
  example: [{ items: docsExamples }],
  guide: [
    { items: gettingStartedNavItems, title: 'Overview' },
    { items: installationNavItems, title: 'Installation' },
    { items: guidesNavItems, title: 'Guides' },
    {
      items: [
        {
          href: '/docs/migration/slate-to-plate',
          title: 'From Slate to Plate',
        },
      ],
      title: 'Migration',
    },
  ],
  plugin: [{ items: pluginsNavItems }],
};
