import { useMemo } from 'react';

import type { SidebarNavItem } from '@/types/nav';

export function useDedupeNavItems(items: SidebarNavItem[]) {
  return useMemo(() => {
    const dedupeItems = (
      items: SidebarNavItem[],
      seen = new Set<string>()
    ): SidebarNavItem[] =>
      items.map((item) => {
        const deduped = { ...item };

        if (deduped.items) {
          deduped.items = deduped.items.filter((subItem: SidebarNavItem) => {
            if (!subItem.title || seen.has(subItem.title)) {
              return false;
            }
            seen.add(subItem.title);
            return true;
          });

          deduped.items = dedupeItems(deduped.items, seen);
        }

        return deduped;
      });

    return dedupeItems(items);
  }, [items]);
}
