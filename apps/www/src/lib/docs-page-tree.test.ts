import { describe, expect, it } from 'bun:test';

import type { SidebarNavItem } from '@/types/nav';

import { getSidebarNavFromPageTree } from './docs-page-tree';

function collectSiblingDuplicateHrefs(
  items: SidebarNavItem[] | undefined,
  path: string,
  duplicates: string[]
) {
  const seen = new Map<string, string | undefined>();

  for (const item of items ?? []) {
    if (item.href) {
      const firstTitle = seen.get(item.href);

      if (seen.has(item.href)) {
        duplicates.push(
          `${path}: ${item.href} (${firstTitle ?? 'untitled'} / ${
            item.title ?? 'untitled'
          })`
        );
      } else {
        seen.set(item.href, item.title);
      }
    }

    collectSiblingDuplicateHrefs(
      item.items,
      `${path}/${item.title ?? item.href ?? 'group'}`,
      duplicates
    );
  }
}

describe('getSidebarNavFromPageTree', () => {
  it('does not emit duplicate sibling hrefs', () => {
    const duplicates: string[] = [];

    for (const section of getSidebarNavFromPageTree()) {
      collectSiblingDuplicateHrefs(
        section.items,
        section.title ?? 'section',
        duplicates
      );
    }

    expect(duplicates).toEqual([]);
  });
});
