import Link from 'next/link';
import { cn } from '@udecode/cn';
import { Doc } from 'contentlayer/generated';

import { NavItem, NavItemWithChildren } from '@/types/nav';
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
          href={pager.prev.href}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <Icons.chevronLeft className="mr-2 size-4" />
          {pager.prev.title}
        </Link>
      )}
      {pager?.next?.href && (
        <Link
          href={pager.next.href}
          className={buttonVariants({ variant: 'outline' })}
        >
          {pager.next.title}
          <Icons.chevronRight className="ml-2 size-4" />
        </Link>
      )}
    </div>
  );
}

export function getPagerForDoc(doc: Doc) {
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
    prev,
    next,
  };
}

export function flatten(links: NavItemWithChildren[]): NavItem[] {
  return links
    .reduce<NavItem[]>((flat, link) => {
      return flat.concat(link.items?.length ? flatten(link.items) : link);
    }, [])
    .filter((link) => !link?.disabled);
}
