import type { NavItem, NavItemWithChildren } from '@/types/nav';
import type { Doc } from 'contentlayer/generated';

import { cn } from '@udecode/cn';
import Link from 'next/link';

import { docsConfig } from '@/config/docs';
import { buttonVariants } from '@/registry/default/plate-ui/button';

import { Icons } from './icons';

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
        <Link
          className={cn(buttonVariants({ variant: 'outline' }))}
          href={pager.prev.href}
        >
          <Icons.chevronLeft className="mr-2 size-4" />
          {pager.prev.title}
        </Link>
      )}
      {pager?.next?.href && (
        <Link
          className={buttonVariants({ variant: 'outline' })}
          href={pager.next.href}
        >
          {pager.next.title}
          <Icons.chevronRight className="ml-2 size-4" />
        </Link>
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
