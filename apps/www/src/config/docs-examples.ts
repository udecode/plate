import type { SidebarNavItem } from '@/types/nav';

import { navToObject } from '@/config/nav-to-object';
import { registryToNav } from '@/config/registry-to-nav';
import { docExamples } from '@/registry/registry-examples';

export const docsExamples: SidebarNavItem[] = [
  {
    description: 'Slate to HTML',
    href: '/docs/examples/slate-to-html',
    label: 'New',
    title: 'Slate to HTML',
  },
  {
    description: 'Export a Plate document to a file.',
    href: '/docs/examples/export',
    label: 'New',
    title: 'Export',
  },
  {
    description: 'Server-side rendering.',
    href: '/docs/examples/server-side',
    title: 'Server-Side',
  },
  {
    description:
      "Show a diff of two different points in a Plate document's history.",
    href: '/docs/examples/version-history',
    title: 'Version History',
  },
  {
    description: 'Nest editors in void nodes.',
    href: '/docs/examples/editable-voids',
    title: 'Editable Voids',
  },
  {
    description: 'Rendering hundreds of blocks.',
    href: '/docs/examples/hundreds-blocks',
    title: 'Hundreds Blocks',
  },
  {
    description: 'Render hundreds of editors.',
    href: '/docs/examples/hundreds-editors',
    title: 'Hundreds Editors',
  },
  {
    description: 'Decorate texts with markdown preview.',
    href: '/docs/examples/preview-markdown',
    title: 'Preview Markdown',
  },
  ...registryToNav(
    docExamples.filter(
      (item) => !['basic-elements-demo', 'basic-marks-demo'].includes(item.name)
    )
  ).map((item) => ({
    ...item,
    title: item.title + (item.title?.includes(' Form') ? '' : ' Demo'),
  })),
];

export const exampleNavMap = navToObject(docsExamples);
