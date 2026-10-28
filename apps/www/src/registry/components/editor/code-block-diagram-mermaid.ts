import type { DiagramRenderer } from '@/registry/components/editor/code-block-diagram';

/**
 * Draws Mermaid with Pele. Settings come only from the diagram text, and
 * Mermaid themes do not apply.
 */
export const mermaidRenderer: DiagramRenderer = {
  label: 'Mermaid',
  languages: ['mermaid'],
  render: async (source) => {
    const { renderAsync } = await import('pele/lazy');

    // Pele fills Sankey links with gradients only when idPrefix is set.
    const { svg } = await renderAsync(source, { idPrefix: 'pele' });

    return svg;
  },
};
