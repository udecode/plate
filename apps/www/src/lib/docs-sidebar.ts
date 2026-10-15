import { normalizeDocsHref } from '@/lib/docs-nav-metadata';
import type { SidebarNavItem } from '@/types/nav';

export type DocsSidebarRoot = {
  href: string;
  title: string;
  sections: SidebarNavItem[];
};

export type DocsSidebar = {
  main: DocsSidebarRoot;
  nested: DocsSidebarRoot[];
};

export type DocsSidebarView = {
  href: string;
  sections: SidebarNavItem[];
  nested?: { back: { href: string; title: string }; title: string };
};

const isUnder = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

function findNestedRoot(sidebar: DocsSidebar, pathname: string) {
  const path = normalizeDocsHref(pathname).replace(/(.)\/$/, '$1');
  let root: DocsSidebarRoot | undefined;

  for (const candidate of sidebar.nested) {
    if (
      isUnder(path, candidate.href) &&
      (!root || candidate.href.length > root.href.length)
    ) {
      root = candidate;
    }
  }

  return root;
}

export function selectDocsSidebar(
  sidebar: DocsSidebar | undefined,
  pathname: string
): DocsSidebarView {
  if (!sidebar) return { href: '/docs', sections: [] };

  const root = findNestedRoot(sidebar, pathname);

  if (!root) {
    return { href: sidebar.main.href, sections: sidebar.main.sections };
  }

  return {
    href: root.href,
    nested: {
      back: { href: sidebar.main.href, title: sidebar.main.title },
      title: root.title,
    },
    sections: root.sections,
  };
}

export function isMainDocsHref(sidebar: DocsSidebar | undefined, href: string) {
  return sidebar !== undefined && !findNestedRoot(sidebar, href);
}
