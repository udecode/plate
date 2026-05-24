import type { SidebarNavItem } from '@/types/nav';

import { promises as fs } from 'node:fs';
import path from 'node:path';

import { docsConfig } from '@/config/docs';

const CONTENT_DIR = path.join(process.cwd(), '../../content');
const META_FILE = path.join(CONTENT_DIR, 'meta.json');
const DOCS_HREF_REGEX = /^\/docs(?:\/|$)/;

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
  const pages = docsConfig.sidebarNav.flatMap((section) => [
    `---${section.title}---`,
    ...(section.items ?? []).flatMap((item) => itemToMetaPages(item, seen)),
  ]);

  await fs.writeFile(
    META_FILE,
    `${JSON.stringify({ root: true, pages }, null, 2)}\n`
  );
}

await main();
