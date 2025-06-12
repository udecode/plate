import type { SidebarNavItem } from '@/types/nav';
import type { Registry } from 'shadcn/registry';

import { getRegistryTitle } from '@/lib/registry-utils';

export function registryToNav(registry: Registry['items']): SidebarNavItem[] {
  return registry
    .map((item) =>
      item.meta
        ? {
            description: item.description,
            href: `/docs/${item.type.includes('registry:example') ? 'examples' : 'components'}/${item.name.replace('-demo', '')}`,
            keywords: item.meta.keywords,
            label: item.meta.label,
            title: getRegistryTitle(item).replace(' Demo', ''),
            titleCn: getRegistryTitle(item).replace(' Demo', ''),
          }
        : (null as never)
    )
    .filter(Boolean);
}
