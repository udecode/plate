import type { SidebarNavItem } from '@/types/nav';

import pliteMeta from '../../../../content/docs/plite/meta.json';

const CN_DOCS_PREFIX_REGEX = /^\/cn(?=\/docs)/;
const PLITE_DOCS_PREFIX = '/docs/plite';
const META_LINK_REGEX = /^\[([^\]]+)\]\(([^)]+)\)$/;
const META_SEPARATOR_REGEX = /^---(.+)---$/;

export type DocsRootId = 'plate' | 'plite';

function normalizeDocsPath(pathname: string) {
  return pathname.replace(CN_DOCS_PREFIX_REGEX, '');
}

export function getDocsRootFromPathname(pathname: string): DocsRootId {
  return normalizeDocsPath(pathname).startsWith(PLITE_DOCS_PREFIX)
    ? 'plite'
    : 'plate';
}

function isPliteHref(href: string) {
  const normalizedHref = normalizeDocsPath(href);

  return (
    normalizedHref === PLITE_DOCS_PREFIX ||
    normalizedHref.startsWith(`${PLITE_DOCS_PREFIX}/`)
  );
}

function filterPlateNavItem(item: SidebarNavItem): SidebarNavItem | null {
  if (item.href && isPliteHref(item.href)) return null;

  const items = item.items
    ?.map(filterPlateNavItem)
    .filter((child): child is SidebarNavItem => child !== null);

  if (!item.href && item.items?.length && !items?.length) return null;

  return {
    ...item,
    items,
  };
}

function getPlateSidebarNav(sidebarNav: SidebarNavItem[]) {
  return sidebarNav
    .map((section) => filterPlateNavItem(section))
    .filter((section): section is SidebarNavItem => section !== null);
}

function getPliteSidebarNav() {
  const sections: SidebarNavItem[] = [];
  let currentSection: SidebarNavItem | undefined;
  let hasSeenSeparator = false;

  const ensureSection = (title?: string) => {
    if (!currentSection) {
      currentSection = {
        items: [],
        ...(title ? { title } : null),
      };
      sections.push(currentSection);
    }

    return currentSection;
  };

  for (const entry of pliteMeta.pages) {
    const separatorMatch = entry.match(META_SEPARATOR_REGEX);

    if (separatorMatch) {
      hasSeenSeparator = true;
      currentSection = {
        items: [],
        title: separatorMatch[1],
      };
      sections.push(currentSection);
      continue;
    }

    const linkMatch = entry.match(META_LINK_REGEX);

    if (!linkMatch) continue;

    if (!hasSeenSeparator) {
      ensureSection().items?.push({
        href: linkMatch[2],
        title: linkMatch[1],
      });
      continue;
    }

    ensureSection().items?.push({
      href: linkMatch[2],
      title: linkMatch[1],
    });
  }

  return sections.filter((section) => section.items?.length);
}

export function getSidebarNavForDocsRoot(
  sidebarNav: SidebarNavItem[],
  root: DocsRootId
) {
  return root === 'plite'
    ? getPliteSidebarNav()
    : getPlateSidebarNav(sidebarNav);
}
