import { expect, it } from 'bun:test';

import { graphvizRenderer } from './code-block-diagram-graphviz';

it('draws a valid graph while an invalid one fails beside it, once viz.js has loaded', async () => {
  const { signal } = new AbortController();

  await graphvizRenderer.render('digraph { warm }', { signal });

  const [invalid, valid] = await Promise.allSettled([
    graphvizRenderer.render('digraph { a -> }', { signal }),
    graphvizRenderer.render('digraph { a -> b }', { signal }),
  ]);

  expect(invalid.status).toBe('rejected');
  expect(valid).toMatchObject({
    status: 'fulfilled',
    value: expect.stringContaining('<svg'),
  });
});
