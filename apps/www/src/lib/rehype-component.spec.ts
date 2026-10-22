import { describe, expect, it, mock } from 'bun:test';
import path from 'node:path';

mock.module('./highlight-code', () => ({
  highlightFiles: (files: Array<{ content?: string }>) =>
    files.map((file) => ({
      ...file,
      highlightedContent: file.content ?? '',
    })),
}));

const { rehypeComponent } = await import('./rehype-component');

describe('rehypeComponent', () => {
  it('keeps MDX previews small and leaves full code hydration to the registry route', async () => {
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
    const cwd = process.cwd();
    process.chdir(path.resolve(import.meta.dirname, '../..'));

    try {
      await rehypeComponent()(tree);
    } finally {
      process.chdir(cwd);
    }

    const node = tree.children[0];
    const highlightedFilesValue = node.attributes.find(
      (attribute) => attribute.name === '__highlightedFiles__'
    )?.value;

    if (highlightedFilesValue === undefined) {
      throw new Error('Expected highlighted files metadata');
    }
    const [first, ...rest]: Array<{ content?: string }> = JSON.parse(
      highlightedFilesValue
    );

    expect(first.content).toContain('export default function Demo');
    expect(rest.length).toBeGreaterThan(0);
    expect(rest.filter((file) => file.content !== undefined)).toEqual([]);
  });
});
