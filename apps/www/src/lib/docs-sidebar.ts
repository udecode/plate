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
  rootHrefs: string[];
  sections: SidebarNavItem[];
  nested?: { title: string };
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
  if (!sidebar) return { rootHrefs: ['/docs'], sections: [] };

  const root = findNestedRoot(sidebar, pathname);

  return {
    nested: root && { title: root.title },
    rootHrefs: [sidebar.main.href, ...sidebar.nested.map(({ href }) => href)],
    sections: sidebar.main.sections,
  };
}

export function isMainDocsHref(sidebar: DocsSidebar | undefined, href: string) {
  return sidebar !== undefined && !findNestedRoot(sidebar, href);
}
