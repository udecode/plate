import { describe, expect, it } from 'bun:test';

import { getTableOfContents } from './toc';

describe('getTableOfContents', () => {
  it('ignores frontmatter when extracting headings', async () => {
    const toc = await getTableOfContents(`---
title: Next.js
description: Install and configure Plate UI for Next.js.
---

## Use shadcn/create

### Build Your Preset
`);

    expect(toc).toEqual([
      {
        depth: 2,
        title: 'Use shadcn/create',
        url: '#use-shadcncreate',
      },
      {
        depth: 3,
        title: 'Build Your Preset',
        url: '#build-your-preset',
      },
    ]);
  });

  it('uses a custom heading id as the url and drops it from the title', async () => {
    const toc = await getTableOfContents(`## 图表 [#diagrams]

### 事件处理器 [#event-handlers]

## 命令
`);

    expect(toc).toEqual([
      { depth: 2, title: '图表', url: '#diagrams' },
      { depth: 3, title: '事件处理器', url: '#event-handlers' },
      { depth: 2, title: '命令', url: '#命令' },
    ]);
  });
});
