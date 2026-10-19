import type { DiagramRenderer } from '@/registry/components/editor/code-block-diagram';

export const graphvizRenderer: DiagramRenderer = {
  label: 'Graphviz',
  languages: ['graphviz', 'dot'],
  render: async (source, { signal }) => {
    const [{ default: Viz }, workerModule] = await Promise.all([
      import('viz.js'),
      import('viz.js/full.render.js'),
    ]);

    signal.throwIfAborted();

    // A viz.js instance that failed once cannot draw again.
    const viz = new Viz(
      'default' in workerModule ? workerModule.default : workerModule
    );

    return viz.renderString(source, { engine: 'dot', format: 'svg' });
  },
};
