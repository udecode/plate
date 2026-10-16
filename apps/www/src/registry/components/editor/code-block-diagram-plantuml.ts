import type { DiagramRenderer } from '@/registry/components/editor/code-block-diagram';

/**
 * Draws PlantUML through the server your app runs. The source text goes to
 * that server and nowhere else.
 */
export const createPlantUmlRenderer = ({
  server,
}: {
  server: string;
}): DiagramRenderer => {
  const base = new URL(server).href.replace(/\/$/, '');

  return {
    label: 'PlantUML',
    languages: ['plantuml', 'puml'],
    render: async (source, { signal }) => {
      const { default: plantumlEncoder } = await import('plantuml-encoder');
      const response = await fetch(
        `${base}/svg/${plantumlEncoder.encode(source)}`,
        { redirect: 'error', signal }
      );

      if (!response.ok) {
        throw new Error(`PlantUML server answered ${response.status}.`);
      }

      return response.text();
    },
  };
};
