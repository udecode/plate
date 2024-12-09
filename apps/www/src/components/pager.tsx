import type { NavItem, NavItemWithChildren } from '@/types/nav';
import type { Doc } from 'contentlayer/generated';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';

import { docsConfig } from '@/config/docs';
import { Button } from '@/registry/default/plate-ui/button';

interface DocsPagerProps {
  doc: Doc;
}

export function DocsPager({ doc }: DocsPagerProps) {
  const pager = getPagerForDoc(doc);

  if (!pager) {
    return null;
  }

  return (
    <div className="flex flex-row items-center justify-between">
      {pager?.prev?.href && (
        <Button asChild size="lg" variant="ghost">
          <Link href={pager.prev.href}>
            <ChevronLeftIcon />
            {pager.prev.title}
          </Link>
        </Button>
      )}
      {pager?.next?.href && (
        <Button asChild size="lg" variant="ghost" className="ml-auto">
          <Link href={pager.next.href}>
            {pager.next.title}
            <ChevronRightIcon />
          </Link>
        </Button>
      )}
    </div>
  );
}

export function getPagerForDoc(doc: Doc) {
  // const nav = doc.slug.startsWith("/docs/charts")
  //     ? docsConfig.chartsNav
  //     : docsConfig.sidebarNav
  //   const flattenedLinks = [null, ...flatten(nav), null]

  const flattenedLinks = [null, ...flatten(docsConfig.sidebarNav), null];
  const activeIndex = flattenedLinks.findIndex(
    (link) => doc.slug === link?.href
  );
  const prev = activeIndex === 0 ? null : flattenedLinks[activeIndex - 1];
  const next =
    activeIndex === flattenedLinks.length - 1
      ? null
      : flattenedLinks[activeIndex + 1];

  return {
    next,
    prev,
  };
}

export function flatten(links: NavItemWithChildren[]): NavItem[] {
  return links
    .reduce<NavItem[]>((flat, link) => {
      return flat.concat(link.items?.length ? flatten(link.items) : link);
    }, [])
    .filter((link) => !link?.disabled);
}
