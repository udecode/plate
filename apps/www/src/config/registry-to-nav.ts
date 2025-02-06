import type { SidebarNavItem } from '@/types/nav';
import type { Registry } from 'shadcx/registry';

import { getRegistryTitle } from '@/lib/registry-utils';

export function registryToNav(registry: Registry['items']): SidebarNavItem[] {
  return registry
    .map((item) =>
      item.doc
        ? {
            description: item.doc.description,
            href: `/docs/${item.type.includes('registry:example') ? 'examples' : 'components'}/${item.name.replace('-demo', '')}`,
            keywords: item.doc.keywords,
            label: item.doc.label,
            title: getRegistryTitle(item).replace(' Demo', ''),
          }
        : (null as never)
    )
    .filter(Boolean);
}
