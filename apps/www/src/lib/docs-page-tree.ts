import type { SidebarNavItem } from '@/types/nav';
import type {
  Item as PageTreeItem,
  Node as PageTreeNode,
} from 'fumadocs-core/page-tree';
import type React from 'react';

import { findNeighbour } from 'fumadocs-core/page-tree';

import {
  getDocsNavMeta,
  getDocsSectionTitleCn,
  getSidebarCategoryItems,
  normalizeDocsHref,
} from '@/lib/docs-nav-metadata';
import { hrefWithLocale } from '@/lib/withLocale';
import { source } from '@/lib/source';

function nodeNameToString(name: React.ReactNode) {
  if (typeof name === 'string') return name;
  if (typeof name === 'number') return String(name);

  return;
}

function withDocsOverlay(item: SidebarNavItem): SidebarNavItem {
  if (!item.href) return item;

  const overlay = getDocsNavMeta(item.href);

  return {
    ...item,
    description: item.description ?? overlay?.description,
    keywords: item.keywords ?? overlay?.keywords,
    label: item.label ?? overlay?.label,
    titleCn: item.titleCn ?? overlay?.titleCn,
  };
}

function withDocsOverlayDeep(item: SidebarNavItem): SidebarNavItem {
  const overlaid = withDocsOverlay(item);

  return {
    ...overlaid,
    items: overlaid.items?.map(withDocsOverlayDeep),
  };
}

function pageTreeNodeToNavItem(node: PageTreeNode): SidebarNavItem | null {
  if (node.type === 'separator') return null;

  if (node.type === 'page') {
    return withDocsOverlay({
      description: nodeNameToString(node.description),
      external: node.external,
      href: node.url,
      title: nodeNameToString(node.name),
    });
  }

  return withDocsOverlay({
    description: nodeNameToString(node.description),
    href: node.index?.url,
    items: node.children
      .map((child) => pageTreeNodeToNavItem(child))
      .filter((item): item is SidebarNavItem => item !== null),
    title: nodeNameToString(node.name),
  });
}

export function getSidebarNavFromPageTree(locale = 'en') {
  const tree = source.getPageTree(locale);
  const sections: SidebarNavItem[] = [];
  let currentSection: SidebarNavItem | undefined;

  const ensureSection = (title = 'Docs') => {
    if (currentSection) return currentSection;

    currentSection = {
      items: [],
      title,
      titleCn: getDocsSectionTitleCn(title),
    };
    sections.push(currentSection);

    return currentSection;
  };

  for (const node of tree.children) {
    if (node.type === 'separator') {
      const title = nodeNameToString(node.name) || 'Docs';

      currentSection = {
        items: [],
        title,
        titleCn: getDocsSectionTitleCn(title),
      };
      sections.push(currentSection);
      continue;
    }

    const item = pageTreeNodeToNavItem(node);

    if (item) {
      ensureSection().items?.push(item);
    }
  }

  return sections
    .map((section) => {
      const overlayItems = getSidebarCategoryItems(section.title);

      if (!overlayItems?.length) return section;

      return {
        ...section,
        items: overlayItems.map(withDocsOverlayDeep),
      };
    })
    .filter((section) => section.items?.length);
}

function toPagerItem(item: PageTreeItem | undefined, locale: string) {
  if (!item) return null;

  const href = normalizeDocsHref(item.url);
  const overlay = getDocsNavMeta(href);

  return {
    href: hrefWithLocale(href, locale),
    title: overlay?.title ?? nodeNameToString(item.name),
    titleCn: overlay?.titleCn,
  };
}

export function getPagerForDoc(
  doc: {
    slug?: string;
  },
  locale = 'en'
) {
  // Fumadocs i18n page trees keep docs node URLs unlocalized; links are localized after lookup.
  const href = normalizeDocsHref(doc.slug ?? '');
  const tree = source.getPageTree(locale);
  const neighbours = findNeighbour(tree, href);

  return {
    next: toPagerItem(neighbours.next, locale),
    previous: toPagerItem(neighbours.previous, locale),
  };
}
