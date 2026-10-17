import type { DiagramRenderer } from '@/registry/components/editor/code-block-diagram';

let abortableQueue: Promise<unknown> = Promise.resolve();
let renderCount = 0;

/**
 * Draws Mermaid with the app's own Mermaid configuration; it never calls
 * `mermaid.initialize`.
 */
export const mermaidRenderer: DiagramRenderer = {
  label: 'Mermaid',
  languages: ['mermaid'],
  render: (source, { signal }) => {
    const render = abortableQueue.then(async () => {
      signal.throwIfAborted();

      const { default: mermaid } = await import('mermaid');

      renderCount += 1;

      const id = `code-block-diagram-mermaid-${renderCount}`;

      try {
        const { svg } = await mermaid.render(id, source);

        return svg;
      } finally {
        // A failed render leaves Mermaid's drawing in the page, under the ids
        // Mermaid derives from `id`.
        document.getElementById(`d${id}`)?.remove();
        document.getElementById(`i${id}`)?.remove();
      }
    });

    abortableQueue = render.catch(() => undefined);

    return render;
  },
};
