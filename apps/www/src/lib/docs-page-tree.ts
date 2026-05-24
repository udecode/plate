import type { SidebarNavItem } from '@/types/nav';
import type { PageTree } from 'fumadocs-core/server';
import type React from 'react';

import { findNeighbour } from 'fumadocs-core/server';

import { hrefWithLocale } from '@/lib/withLocale';
import { source } from '@/lib/source';
import docsMeta from '../../../../content/docs/meta.json';

const CN_DOCS_PREFIX_REGEX = /^\/cn(?=\/docs)/;

type DocsMetaOverlayItem = {
  description?: string;
  keywords?: string[];
  label?: string | string[];
  title?: string;
  titleCn?: string;
};

type DocsMetaOverlay = {
  items?: Record<string, DocsMetaOverlayItem>;
  sections?: Record<string, string>;
};

const docsOverlay = (docsMeta as { _plate?: DocsMetaOverlay })._plate ?? {};

function nodeNameToString(name: React.ReactNode) {
  if (typeof name === 'string') return name;
  if (typeof name === 'number') return String(name);

  return;
}

function normalizeDocsHref(href: string) {
  return href.replace(CN_DOCS_PREFIX_REGEX, '');
}

export function getDocsNavMeta(href: string) {
  return docsOverlay.items?.[normalizeDocsHref(href)];
}

function withDocsOverlay(item: SidebarNavItem): SidebarNavItem {
  if (!item.href) return item;

  const overlay = getDocsNavMeta(item.href);

  return {
    ...item,
    description: item.description ?? overlay?.description,
    keywords: overlay?.keywords,
    label: overlay?.label,
    titleCn: overlay?.titleCn,
  };
}

function pageTreeNodeToNavItem(node: PageTree.Node): SidebarNavItem | null {
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
      titleCn: docsOverlay.sections?.[title],
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
        titleCn: docsOverlay.sections?.[title],
      };
      sections.push(currentSection);
      continue;
    }

    const item = pageTreeNodeToNavItem(node);

    if (item) {
      ensureSection().items?.push(item);
    }
  }

  return sections.filter((section) => section.items?.length);
}

function toPagerItem(item: PageTree.Item | undefined, locale: string) {
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
  const href = normalizeDocsHref(doc.slug ?? '');
  const tree = source.getPageTree(locale);
  const neighbours = findNeighbour(tree, href);

  return {
    next: toPagerItem(neighbours.next, locale),
    previous: toPagerItem(neighbours.previous, locale),
  };
}
