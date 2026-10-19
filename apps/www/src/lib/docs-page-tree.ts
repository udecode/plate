import type {
  Folder as PageTreeFolder,
  Item as PageTreeItem,
  Node as PageTreeNode,
} from 'fumadocs-core/page-tree';
import type React from 'react';

import {
  type DocsCategory,
  getDocsNavMeta,
  getDocsSectionTitleCn,
  getSidebarCategoryItems,
  getSidebarSectionCategory,
  normalizeDocsHref,
} from '@/lib/docs-nav-metadata';
import type { DocsSidebar, DocsSidebarRoot } from '@/lib/docs-sidebar';
import { source } from '@/lib/source';
import { hrefWithLocale } from '@/lib/withLocale';
import type { SidebarNavItem } from '@/types/nav';

function nodeNameToString(name: React.ReactNode) {
  if (typeof name === 'string') return name;
  if (typeof name === 'number') return String(name);

  return undefined;
}

// Fumadocs prefixes the locale to every page URL in the cn tree but keeps
// meta.json link URLs as written.
function itemHref(item: PageTreeItem) {
  return normalizeDocsHref(item.url);
}

function withDocsOverlay(item: SidebarNavItem): SidebarNavItem {
  if (!item.href) return item;

  const overlay = getDocsNavMeta(item.href);

  return {
    ...item,
    description: item.description ?? overlay?.description,
    experimental: item.experimental ?? overlay?.experimental,
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

function getNestedRoots(nodes: PageTreeNode[]): PageTreeFolder[] {
  return nodes.flatMap((node) => {
    if (node.type !== 'folder') return [];

    const roots = getNestedRoots(node.children);

    return node.root ? [node, ...roots] : roots;
  });
}

function getRootHref(folder: PageTreeFolder) {
  const href = folder.index && itemHref(folder.index);

  if (!href || href === '/docs') {
    throw new Error(
      `Docs root "${nodeNameToString(folder.name) ?? folder.$id}" needs a "pagesIndex" page below /docs in its meta.json.`
    );
  }

  return href;
}

function pageTreeNodeToNavItem(node: PageTreeNode): SidebarNavItem | null {
  if (node.type === 'separator') return null;

  if (node.type === 'folder' && node.root) {
    return {
      description: nodeNameToString(node.description),
      href: getRootHref(node),
      opensRoot: true,
      title: nodeNameToString(node.name),
    };
  }

  if (node.type === 'page') {
    return withDocsOverlay({
      description: nodeNameToString(node.description),
      external: node.external,
      href: itemHref(node),
      title: nodeNameToString(node.name),
    });
  }

  return withDocsOverlay({
    description: nodeNameToString(node.description),
    href: node.index && itemHref(node.index),
    items: node.children
      .map((child) => pageTreeNodeToNavItem(child))
      .filter((item): item is SidebarNavItem => item !== null),
    title: nodeNameToString(node.name),
  });
}

function toSidebarSections(
  nodes: PageTreeNode[],
  getCategoryItems?: typeof getSidebarCategoryItems
) {
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

  for (const node of nodes) {
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
      const overlayItems = getCategoryItems?.(section.title);

      if (!overlayItems?.length) return section;

      return {
        ...section,
        items: [
          ...overlayItems.map(withDocsOverlayDeep),
          ...(section.items?.filter((item) => item.opensRoot) ?? []),
        ],
      };
    })
    .filter((section) => section.items?.length)
    .map((section, index) =>
      index === 0 && section.title === 'Get Started'
        ? { ...section, title: 'Overview', titleCn: '概览' }
        : section
    );
}

function replaceRootLinksWithGroups(
  sections: SidebarNavItem[],
  roots: DocsSidebarRoot[]
) {
  return sections.flatMap((section) => {
    const items = section.items?.filter((item) => !item.opensRoot) ?? [];
    const groups = roots
      .filter((root) =>
        section.items?.some((item) => item.opensRoot && item.href === root.href)
      )
      .map((root) => ({
        href: root.href,
        items: root.sections,
        title: root.title,
      }));

    return items.length ? [{ ...section, items }, ...groups] : groups;
  });
}

export function getDocsSidebar(locale = 'en'): DocsSidebar {
  const tree = source.getPageTree(locale);
  const nested = getNestedRoots(tree.children).map((folder) => ({
    href: getRootHref(folder),
    sections: toSidebarSections(folder.children),
    title: nodeNameToString(folder.name) ?? 'Docs',
  }));

  return {
    main: {
      href: '/docs',
      sections: replaceRootLinksWithGroups(
        toSidebarSections(tree.children, getSidebarCategoryItems),
        nested
      ),
      title: 'Plate',
    },
    nested,
  };
}

export function getDocsRootLinks(category: DocsCategory, locale = 'en') {
  const tree = source.getPageTree(locale);

  return toSidebarSections(tree.children, getSidebarCategoryItems).flatMap(
    (section) =>
      getSidebarSectionCategory(section.title) === category
        ? (section.items?.filter((item) => item.opensRoot) ?? [])
        : []
  );
}

function toPagerItem(item: PageTreeItem | undefined, locale: string) {
  if (!item) return null;

  const href = itemHref(item);
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
  // Fumadocs' findNeighbour flattens nested root folders into the main
  // root's page list, so /docs/api/react-hooks would page into Plite.
  const sequences = [
    ...getNestedRoots(tree.children).map((folder) =>
      flattenRootPages(folder.children)
    ),
    flattenRootPages(tree.children),
    flattenRootPages(tree.fallback?.children ?? []),
  ];

  for (const sequence of sequences) {
    const index = sequence.findIndex((item) => itemHref(item) === href);

    if (index !== -1) {
      return {
        next: toPagerItem(sequence[index + 1], locale),
        previous: toPagerItem(sequence[index - 1], locale),
      };
    }
  }

  return { next: null, previous: null };
}

function flattenRootPages(nodes: PageTreeNode[]): PageTreeItem[] {
  const pages = nodes.flatMap((node): PageTreeItem[] => {
    if (node.type === 'page') return [node];
    if (node.type !== 'folder' || node.root) return [];

    return node.index
      ? [node.index, ...flattenRootPages(node.children)]
      : flattenRootPages(node.children);
  });

  return pages.filter((item) => itemHref(item).startsWith('/docs'));
}
