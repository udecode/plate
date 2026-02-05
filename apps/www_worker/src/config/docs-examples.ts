import type { SidebarNavItem } from '@/types/nav';

import { navToObject } from '@/config/nav-to-object';
import { registryToNav } from '@/config/registry-to-nav';
import { demoExamples } from '@/registry/registry-examples';

export const docsExamples: SidebarNavItem[] = [
  {
    description: 'Slate to HTML',
    href: '/docs/examples/slate-to-html',
    label: 'New',
    title: 'Slate to HTML',
    titleCn: 'Slate 转 HTML',
  },
  {
    description: 'Export a Plate document to a file.',
    href: '/docs/examples/export',
    label: 'New',
    title: 'Export',
    titleCn: '导出',
  },
  {
    description: 'Server-side rendering.',
    href: '/docs/examples/server-side',
    title: 'Server-Side',
    titleCn: '服务端',
  },
  {
    description:
      "Show a diff of two different points in a Plate document's history.",
    href: '/docs/examples/version-history',
    title: 'Version History',
    titleCn: '版本历史',
  },
  {
    description: 'Nest editors in void nodes.',
    href: '/docs/examples/editable-voids',
    title: 'Editable Voids',
    titleCn: '可编辑的空节点',
  },
  {
    description: 'Rendering hundreds of blocks.',
    href: '/docs/examples/hundreds-blocks',
    title: 'Hundreds Blocks',
    titleCn: '数百个块',
  },
  {
    description: 'Render hundreds of editors.',
    href: '/docs/examples/hundreds-editors',
    title: 'Hundreds Editors',
    titleCn: '数百个编辑器',
  },
  {
    description: 'Streaming markdown to editor.',
    href: '/docs/examples/markdown-streaming',
    title: 'Markdown Streaming',
    titleCn: 'Markdown 流式',
  },
  {
    description: 'Decorate texts with markdown preview.',
    href: '/docs/examples/preview-markdown',
    title: 'Preview Markdown',
    titleCn: 'Markdown 预览',
  },
  {
    description: 'Collaborative editing.',
    href: '/docs/examples/collaboration',
    label: 'New',
    title: 'Collaboration Demo',
    titleCn: '协作演示',
  },
  ...registryToNav(
    demoExamples.filter(
      (item) => !['basic-blocks-demo', 'basic-marks-demo'].includes(item.name)
    )
  ).map((item) => ({
    ...item,
    title: item.title + (item.title?.includes(' Form') ? '' : ' Demo'),
  })),
];

export const exampleNavMap = navToObject(docsExamples);
