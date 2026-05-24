import type { SidebarNavItem } from '@/types/nav';

import { promises as fs } from 'node:fs';
import path from 'node:path';

import { docsConfig } from '@/config/docs';

const CONTENT_DIR = path.join(process.cwd(), '../../content/docs');
const META_FILE = path.join(CONTENT_DIR, 'meta.json');
const DOCS_HREF_REGEX = /^\/docs(?:\/|$)/;

type MetaOverlayItem = {
  description?: string;
  keywords?: string[];
  label?: string | string[];
  title?: string;
  titleCn?: string;
};

function addMetaOverlayItem(
  item: SidebarNavItem,
  overlays: Record<string, MetaOverlayItem>
) {
  if (item.href && !item.external && DOCS_HREF_REGEX.test(item.href)) {
    overlays[item.href] = {
      ...(item.description && { description: item.description }),
      ...(item.keywords?.length && { keywords: item.keywords }),
      ...(item.label && { label: item.label }),
      ...(item.title && { title: item.title }),
      ...(item.titleCn && { titleCn: item.titleCn }),
    };
  }

  for (const child of item.items ?? []) {
    addMetaOverlayItem(child, overlays);
  }
}

function escapeMetaLinkLabel(value: string) {
  return value.replaceAll('[', '\\[').replaceAll(']', '\\]');
}

function itemToMetaPages(item: SidebarNavItem, seen: Set<string>): string[] {
  const pages: string[] = [];

  if (
    item.href &&
    !item.disabled &&
    !item.external &&
    DOCS_HREF_REGEX.test(item.href) &&
    !seen.has(item.href)
  ) {
    seen.add(item.href);
    pages.push(
      `[${escapeMetaLinkLabel(item.title ?? item.href)}](${item.href})`
    );
  }

  if (item.items) {
    pages.push(...item.items.flatMap((child) => itemToMetaPages(child, seen)));
  }

  return pages;
}

async function main() {
  const seen = new Set<string>();
  const items: Record<string, MetaOverlayItem> = {};
  const sections: Record<string, string> = {};
  const pages = docsConfig.sidebarNav.flatMap((section) => {
    const title = section.title ?? 'Docs';

    return [
      `---${title}---`,
      ...(section.items ?? []).flatMap((item) => itemToMetaPages(item, seen)),
    ];
  });

  for (const section of docsConfig.sidebarNav) {
    if (section.title && section.titleCn) {
      sections[section.title] = section.titleCn;
    }

    for (const item of section.items ?? []) {
      addMetaOverlayItem(item, items);
    }
  }

  await fs.writeFile(
    META_FILE,
    `${JSON.stringify({ root: true, pages, _plate: { sections, items } }, null, 2)}\n`
  );
}

await main();
