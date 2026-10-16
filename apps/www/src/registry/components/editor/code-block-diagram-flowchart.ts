import type { DiagramRenderer } from '@/registry/components/editor/code-block-diagram';

/** Draws flowchart.js diagrams; flowchart.js draws into a mounted element. */
export const flowchartRenderer: DiagramRenderer = {
  label: 'Flowchart',
  languages: ['flowchart'],
  render: async (source, { signal }) => {
    const { default: flowchart } = await import('flowchart.js');

    signal.throwIfAborted();

    const container = document.createElement('div');

    container.style.display = 'none';
    document.body.append(container);

    try {
      flowchart.parse(source).drawSVG(container);

      return container.innerHTML;
    } finally {
      container.remove();
    }
  },
};
