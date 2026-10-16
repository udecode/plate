import { describe, expect, it } from 'bun:test';

import type { SidebarNavItem } from '@/types/nav';

import { getDocsSidebar, getPagerForDoc } from './docs-page-tree';
import { selectDocsSidebar } from './docs-sidebar';

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

function collectItems(items: SidebarNavItem[] | undefined): SidebarNavItem[] {
  return (items ?? []).flatMap((item) => [item, ...collectItems(item.items)]);
}

describe('getDocsSidebar', () => {
  it('does not emit duplicate sibling hrefs', () => {
    const sidebar = getDocsSidebar();
    const duplicates: string[] = [];

    for (const root of [sidebar.main, ...sidebar.nested]) {
      for (const section of root.sections) {
        collectSiblingDuplicateHrefs(
          section.items,
          `${root.title}/${section.title ?? 'section'}`,
          duplicates
        );
      }
    }

    expect(duplicates).toEqual([]);
  });

  it.each(['en', 'cn'])(
    'shows Plite as its own group right after API in %s',
    (locale) => {
      const { main, nested } = getDocsSidebar(locale);
      const titles = main.sections.map((section) => section.title);
      const plite = main.sections.find((section) => section.title === 'Plite');
      const pliteHrefsElsewhere = main.sections
        .filter((section) => section !== plite)
        .flatMap((section) => collectItems(section.items))
        .filter((item) => item.href?.startsWith('/docs/plite'));

      expect(titles.slice(titles.indexOf('API'))).toEqual(['API', 'Plite']);
      expect(plite?.items?.map((item) => item.title)).toEqual(
        nested
          .find((root) => root.href === '/docs/plite')
          ?.sections.map((section) => section.title)
      );
      expect(pliteHrefsElsewhere).toEqual([]);
    }
  );

  it('keeps Plite API pages in the Plite sidebar', () => {
    const plite = getDocsSidebar().nested.find(
      (root) => root.href === '/docs/plite'
    );
    const api = plite?.sections.find((section) => section.title === 'API');
    const hrefs = collectItems(api?.items).map((item) => item.href);

    expect(hrefs).toContain('/docs/plite/api/nodes/editor');
    expect(hrefs).not.toContain('/docs/api/react-hooks');
  });
});

describe.each(['en', 'cn'])('selectDocsSidebar in %s', (locale) => {
  const sidebar = getDocsSidebar(locale);

  it('names the Plite root only under /docs/plite', () => {
    const view = (pathname: string) =>
      selectDocsSidebar(sidebar, pathname).nested;
    const plite = { title: 'Plite' };

    expect(view('/docs/plite/concepts/02-nodes')).toEqual(plite);
    expect(view('/cn/docs/plite')).toEqual(plite);
    expect(view('/cn/docs/plite/concepts/02-nodes')).toEqual(plite);
    expect(view('/docs/plitex')).toBeUndefined();
    expect(view('/docs/api/react-hooks')).toBeUndefined();
  });

  it('titles the first section of every root Overview for every nav', () => {
    const firstSections = [sidebar.main, ...sidebar.nested].map((root) => {
      const [{ title, titleCn }] = root.sections;

      return { title, titleCn };
    });

    expect(firstSections).toEqual([
      { title: 'Overview', titleCn: '概览' },
      { title: 'Overview', titleCn: '概览' },
    ]);
  });
});

describe('getPagerForDoc', () => {
  it('does not page between Plate and Plite', () => {
    const { next } = getPagerForDoc({ slug: '/docs/api/react-hooks' });

    expect(next?.href.startsWith('/docs/plite') ?? false).toBe(false);
    expect(getPagerForDoc({ slug: '/docs/plite' }).previous).toBeNull();
  });
});
