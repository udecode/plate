import { describe, expect, it, mock } from 'bun:test';

const getRegistryItemCalls: boolean[] = [];

mock.module('./highlight-code', () => ({
  highlightFiles: (files: Array<{ content?: string }>) =>
    files.map((file) => ({
      ...file,
      highlightedContent: file.content ?? '',
    })),
}));

mock.module('./rehype-utils', () => ({
  createFileTreeForRegistryItemFiles: () => [],
  fixImport: (content: string) => content,
  getAllDependencies: () => [],
  getNodeAttributeByName: (
    node: { attributes?: Array<{ name: string; value: unknown }> },
    name: string
  ) => node.attributes?.find((attribute) => attribute.name === name),
  getRegistryDefinition: () => {},
  getRegistryItem: async (_name: string, prefetch = false) => {
    getRegistryItemCalls.push(prefetch);

    return {
      files: [
        {
          content: 'export const First = 1;',
          path: 'first.tsx',
          type: 'registry:component',
        },
        {
          content: prefetch ? undefined : 'export const Second = 2;',
          path: 'second.tsx',
          type: 'registry:component',
        },
      ],
      name: 'basic-marks-demo',
      type: 'registry:component',
    };
  },
  normalizeRegistryFilePath: (filePath: string) => filePath,
}));

const { rehypeComponent } = await import('./rehype-component');

describe('rehypeComponent', () => {
  it('keeps MDX previews small and leaves full code hydration to the registry route', async () => {
    getRegistryItemCalls.length = 0;
    const tree = {
      children: [
        {
          attributes: [
            {
              name: 'name',
              type: 'mdxJsxAttribute',
              value: 'basic-marks-demo',
            },
          ],
          children: [],
          name: 'ComponentPreview',
          type: 'mdxJsxFlowElement',
        },
      ],
      type: 'root',
    };

    await rehypeComponent()(tree);

    const node = tree.children[0];
    const highlightedFilesValue = node.attributes.find(
      (attribute) => attribute.name === '__highlightedFiles__'
    )?.value;

    if (highlightedFilesValue === undefined) {
      throw new Error('Expected highlighted files metadata');
    }
    const highlightedFiles = JSON.parse(highlightedFilesValue);

    expect(getRegistryItemCalls).toEqual([true]);
    expect(highlightedFiles).toHaveLength(2);
    expect(highlightedFiles[0].content).toBe('export const First = 1;');
    expect(highlightedFiles[1].content).toBeUndefined();
  });
});
