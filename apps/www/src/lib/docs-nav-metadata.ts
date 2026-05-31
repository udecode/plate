import type { SidebarNavItem } from '@/types/nav';

import docsMeta from '../../../../content/docs/meta.json';

const CN_DOCS_PREFIX_REGEX = /^\/cn(?=\/docs)/;

export type DocsCategory = 'api' | 'component' | 'example' | 'guide' | 'plugin';

type DocsMetaOverlayItem = {
  description?: string;
  keywords?: string[];
  label?: string | string[];
  title?: string;
  titleCn?: string;
};

type DocsMetaOverlay = {
  categoryGroups?: Partial<Record<DocsCategory, SidebarNavItem[]>>;
  docSections?: SidebarNavItem[];
  items?: Record<string, DocsMetaOverlayItem>;
  sections?: Record<string, string>;
};

const fallbackDocSections: SidebarNavItem[] = [
  {
    items: [
      { href: '/docs', title: 'Guides', titleCn: '指南', value: 'guide' },
      {
        href: '/docs/plugins',
        title: 'Plugins',
        titleCn: '插件',
        value: 'plugin',
      },
      {
        href: '/docs/components',
        title: 'Components',
        titleCn: '组件',
        value: 'component',
      },
      {
        href: '/docs/examples',
        title: 'Examples',
        titleCn: '示例',
        value: 'example',
      },
      {
        href: '/docs/api',
        title: 'API Reference',
        titleCn: 'API 参考',
        value: 'api',
      },
    ],
  },
];

const docsOverlay = (docsMeta as { _plate?: DocsMetaOverlay })._plate ?? {};

export function normalizeDocsHref(href: string) {
  return href.replace(CN_DOCS_PREFIX_REGEX, '');
}

export function getDocsNavMeta(href: string) {
  return docsOverlay.items?.[normalizeDocsHref(href)];
}

export function getDocsSectionTitleCn(title: string) {
  return docsOverlay.sections?.[title];
}

export function getDocSections() {
  return docsOverlay.docSections?.length
    ? docsOverlay.docSections
    : fallbackDocSections;
}

export function getDocsCategoryGroups(category: DocsCategory | string) {
  if (!isDocsCategory(category)) return [];

  return docsOverlay.categoryGroups?.[category] ?? [];
}

const guideSidebarSections: Record<string, string> = {
  'Get Started': 'Overview',
  Guides: 'Guides',
  Installation: 'Installation',
  Migration: 'Migration',
  Migrations: 'Migration',
  Overview: 'Overview',
};

const categorySidebarSections: Record<string, DocsCategory> = {
  API: 'api',
  'API Reference': 'api',
  Components: 'component',
  Examples: 'example',
  Plugins: 'plugin',
};

function unwrapSingleUntitledGroup(items: SidebarNavItem[]) {
  const [group] = items;

  if (
    items.length === 1 &&
    group &&
    !group.href &&
    !group.title &&
    group.items?.length
  ) {
    return group.items;
  }

  return items;
}

export function getSidebarCategoryItems(title: string | undefined) {
  if (!title) return;

  const guideSectionTitle = guideSidebarSections[title];

  if (guideSectionTitle) {
    return docsOverlay.categoryGroups?.guide?.find(
      (group) => group.title === guideSectionTitle
    )?.items;
  }

  const category = categorySidebarSections[title];

  if (!category) return;

  return unwrapSingleUntitledGroup(
    docsOverlay.categoryGroups?.[category] ?? []
  );
}

export function getLocalizedNavTitle(
  item: Pick<SidebarNavItem, 'title' | 'titleCn'>,
  locale: string
) {
  return locale === 'cn' && item.titleCn ? item.titleCn : item.title;
}

function isDocsCategory(value: string): value is DocsCategory {
  return (
    value === 'api' ||
    value === 'component' ||
    value === 'example' ||
    value === 'guide' ||
    value === 'plugin'
  );
}

function navGroupsHaveHref(items: SidebarNavItem[], href: string): boolean {
  for (const item of items) {
    if (item.href && normalizeDocsHref(item.href) === href) return true;
    if (item.items && navGroupsHaveHref(item.items, href)) return true;
  }

  return false;
}

export function slugToCategory(slug?: string[]): DocsCategory {
  const name = slug?.[0];
  const path = normalizeDocsHref(`/docs/${slug?.join('/') || ''}`);

  if (name === 'examples') return 'example';
  if (name === 'components') return 'component';
  if (name === 'plugins') return 'plugin';
  if (name === 'api') return 'api';
  if (navGroupsHaveHref(getDocsCategoryGroups('plugin'), path)) {
    return 'plugin';
  }

  return 'guide';
}
