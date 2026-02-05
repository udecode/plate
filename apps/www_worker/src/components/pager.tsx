import type { NavItem, NavItemWithChildren } from '@/types/nav';
import type { Doc } from 'contentlayer/generated';

import { docsConfig } from '@/config/docs';

export function getPagerForDoc(doc: Doc) {
  const flattenedLinks = [null, ...flatten(docsConfig.sidebarNav), null];
  const activeIndex = flattenedLinks.findIndex(
    (link) => doc.slug === link?.href
  );
  const previous = activeIndex === 0 ? null : flattenedLinks[activeIndex - 1];
  const next =
    activeIndex === flattenedLinks.length - 1
      ? null
      : flattenedLinks[activeIndex + 1];

  return {
    next,
    previous,
  };
}

export function flatten(links: NavItemWithChildren[]): NavItem[] {
  return links
    .reduce<NavItem[]>(
      (flat, link) =>
        flat.concat(link.items?.length ? flatten(link.items) : link),
      []
    )
    .filter((link) => !link?.disabled);
}
