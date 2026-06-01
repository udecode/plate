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
});
