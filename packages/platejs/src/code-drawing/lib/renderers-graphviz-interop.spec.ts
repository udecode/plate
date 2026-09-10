import { afterAll, expect, it, mock } from 'bun:test';

const engine = { Module: { run() {} }, render: () => '<svg>graphviz</svg>' };
const renderString = mock(async () => '<svg>graphviz</svg>');
mock.module('viz.js', () => ({
  default: class Viz {
    constructor(options: unknown) {
      expect(options).toEqual(engine);
    }
    renderString = renderString;
  },
}));
mock.module('viz.js/full.render.js', () => ({ default: engine }));
afterAll(() => mock.restore());
it('uses the CommonJS engine from a browser module import', async () => {
  const { renderCodeDrawing } = await import('./renderers');
  await expect(
    renderCodeDrawing('graphviz', 'digraph { a -> b }')
  ).resolves.toStartWith('data:image/svg+xml;base64,');
  expect(renderString).toHaveBeenCalledWith('digraph { a -> b }', {
    engine: 'dot',
    format: 'svg',
  });
});
