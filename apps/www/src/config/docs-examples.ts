import type { SidebarNavItem } from '@/types/nav';

import { registryToNav } from '@/config/registry-to-nav';
import { docExamples } from '@/registry/registry-examples';

export const examplesNavItems: SidebarNavItem[] = [
  {
    description: 'Upload files into your editor.',
    href: '/docs/examples/upload',
    label: 'New',
    title: 'Upload',
  },
  {
    description:
      "Show a diff of two different points in a Plate document's history.",
    href: '/docs/examples/version-history',
    label: 'New',
    title: 'Version History',
  },
  {
    description: 'Nest editors in void nodes.',
    href: '/docs/examples/editable-voids',
    title: 'Editable Voids',
  },
  {
    description: 'Rendering in iframes.',
    href: '/docs/examples/iframe',
    title: 'IFrame',
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
  {
    description: 'Server-side rendering.',
    href: '/docs/examples/server',
    title: 'Server-Side',
  },
  ...registryToNav(
    docExamples.filter(
      (item) => !['basic-elements-demo', 'basic-marks-demo'].includes(item.name)
    )
  ),
];
