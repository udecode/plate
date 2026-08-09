import { createBaseEditor, defineBasePlugin } from '@platejs/core';
import { createPluginContext } from '@platejs/core/internal';
import { type Descendant, schema } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

import { FindReplacePlugin } from './FindReplacePlugin';

const InlinePlugin = defineBasePlugin(PLUGINS.link, {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
  },
});

const decorate = ({
  children,
  search,
}: {
  children: Descendant[];
  search: string;
}) => {
  const editor = createBaseEditor({
    plugins: [FindReplacePlugin, InlinePlugin],
  });
  const plugin = editor.plugin(FindReplacePlugin);

  editor.plugin(FindReplacePlugin).store.set({ search });

  return plugin.decorate?.({
    ...createPluginContext(editor, FindReplacePlugin),
    entry: [{ children, type: 'paragraph' }, [0]],
  });
};

describe('FindReplacePlugin', () => {
  it('registers search highlights as a boolean text property', () => {
    const editor = createBaseEditor({
      plugins: [FindReplacePlugin],
    });

    expect(
      editor.read.schema.property({
        key: editor.plugin(FindReplacePlugin).schema.key,
        placement: 'text',
      })?.value.kind
    ).toBe('boolean');
  });

  it('returns no ranges when the search term is empty', () => {
    expect(decorate({ children: [{ text: '' }], search: '' })).toEqual([]);
  });

  it('matches text case-insensitively in a single text node', () => {
    const expected = [
      {
        searchHighlight: true,
        anchor: {
          offset: 0,
          path: [0, 0],
        },
        focus: {
          offset: 4,
          path: [0, 0],
        },
        search: 'Test',
      },
    ];

    expect(decorate({ children: [{ text: 'test' }], search: 'Test' })).toEqual(
      expected
    );
  });

  it('splits one match across adjacent text nodes', () => {
    const expected = [
      {
        searchHighlight: true,
        anchor: {
          offset: 0,
          path: [0, 0],
        },
        focus: {
          offset: 3,
          path: [0, 0],
        },
        search: 'tes',
      },
      {
        searchHighlight: true,
        anchor: {
          offset: 0,
          path: [0, 1],
        },
        focus: {
          offset: 1,
          path: [0, 1],
        },
        search: 't',
      },
    ];

    expect(
      decorate({
        children: [{ text: 'tes' }, { bold: true, text: 't' }],
        search: 'test',
      })
    ).toEqual(expected);
  });

  it('matches across text and inline element descendants', () => {
    const expected = [
      {
        searchHighlight: true,
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 6, path: [0, 0] },
        search: 'hello ',
      },
      {
        searchHighlight: true,
        anchor: { offset: 0, path: [0, 1, 0] },
        focus: { offset: 5, path: [0, 1, 0] },
        search: 'world',
      },
      {
        searchHighlight: true,
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 6, path: [0, 2] },
        search: ' again',
      },
    ];

    expect(
      decorate({
        children: [
          { text: 'hello ' },
          { children: [{ text: 'world' }], type: 'link' },
          { text: ' again' },
        ],
        search: 'hello world again',
      })
    ).toEqual(expected);
  });

  it('does not join text across nested block boundaries', () => {
    expect(
      decorate({
        children: [
          { children: [{ text: 'end' }], type: 'paragraph' },
          { children: [{ text: 'start' }], type: 'paragraph' },
        ],
        search: 'endstart',
      })
    ).toEqual([]);
  });

  it('returns ranges for multiple matches across text nodes', () => {
    const expected = [
      {
        searchHighlight: true,
        anchor: {
          offset: 0,
          path: [0, 0],
        },
        focus: {
          offset: 3,
          path: [0, 0],
        },
        search: 'tes',
      },
      {
        searchHighlight: true,
        anchor: {
          offset: 0,
          path: [0, 1],
        },
        focus: {
          offset: 1,
          path: [0, 1],
        },
        search: 't',
      },
      {
        searchHighlight: true,
        anchor: {
          offset: 7,
          path: [0, 1],
        },
        focus: {
          offset: 11,
          path: [0, 1],
        },
        search: 'test',
      },
      {
        searchHighlight: true,
        anchor: {
          offset: 17,
          path: [0, 1],
        },
        focus: {
          offset: 18,
          path: [0, 1],
        },
        search: 't',
      },
      {
        searchHighlight: true,
        anchor: {
          offset: 0,
          path: [0, 2],
        },
        focus: {
          offset: 3,
          path: [0, 2],
        },
        search: 'est',
      },
    ];

    expect(
      decorate({
        children: [
          { text: 'tes' },
          { bold: true, text: 'ts and tests and t' },
          { text: 'ests' },
        ],
        search: 'test',
      })
    ).toEqual(expected);
  });

  it('is wired into FindReplacePlugin.decorate', () => {
    const editor = createBaseEditor({
      plugins: [FindReplacePlugin],
    });

    const plugin = editor.plugin(FindReplacePlugin);

    expect(plugin.name).toBe('searchHighlight');

    editor.plugin(FindReplacePlugin).store.set({ search: 'test' });

    const expected = [
      {
        searchHighlight: true,
        anchor: {
          offset: 0,
          path: [0, 0],
        },
        focus: {
          offset: 4,
          path: [0, 0],
        },
        search: 'test',
      },
    ];

    expect(
      plugin.decorate?.({
        ...createPluginContext(editor, FindReplacePlugin),
        entry: [{ children: [{ text: 'test' }], type: 'paragraph' }, [0]],
      })
    ).toEqual(expected);
  });
});
