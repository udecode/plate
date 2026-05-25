import { describe, expect, it, mock } from 'bun:test';

mock.module('@/lib/highlight-code', () => ({
  highlightFiles: (files: { content?: string }[]) =>
    files.map((file) => ({
      ...file,
      highlightedContent: file.content ? `<pre>${file.content}</pre>` : '',
    })),
}));

mock.module('@/lib/rehype-utils', () => ({
  getRegistryItem: async () => ({
    files: [
      {
        content: 'export const First = 1;',
        path: 'first.tsx',
        type: 'registry:component',
      },
      {
        content: 'export const Second = 2;',
        path: 'second.tsx',
        type: 'registry:component',
      },
    ],
    name: 'basic-marks-demo',
    type: 'registry:component',
  }),
}));

mock.module('@/registry/registry', () => ({
  registry: { items: [{ name: 'basic-marks-demo' }] },
}));

const { GET, generateStaticParams } = await import('./route');

describe('/api/registry/[name]', () => {
  it('returns highlighted content for non-initial files', async () => {
    const response = await GET(new Request('http://localhost'), {
      params: Promise.resolve({ name: 'basic-marks-demo' }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.files).toHaveLength(2);
    expect(data.files[1].content).toBe('export const Second = 2;');
    expect(data.files[1].highlightedContent).toContain('Second');
  });

  it('generates static params from registry items', () => {
    expect(generateStaticParams()).toEqual([{ name: 'basic-marks-demo' }]);
  });
});
