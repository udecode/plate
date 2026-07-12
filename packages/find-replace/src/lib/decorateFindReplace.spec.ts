import {
  createBaseEditor,
  createBasePlugin,
  getEditorPlugin,
} from '@platejs/core';
import type { Descendant } from '@platejs/plite';

import { FindReplacePlugin } from './FindReplacePlugin';
import { decorateFindReplace } from './decorateFindReplace';

const InlinePlugin = createBasePlugin({
  key: 'a',
  node: { isElement: true, isInline: true },
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
  const plugin = editor.getPlugin(FindReplacePlugin);

  editor.plugin(FindReplacePlugin).setOption('search', search);

  return decorateFindReplace({
    ...getEditorPlugin(editor, plugin),
    entry: [{ children, type: 'p' }, [0]],
  });
};

describe('decorateFindReplace', () => {
  it('returns no ranges when the search term is empty', () => {
    expect(decorate({ children: [{ text: '' }], search: '' })).toEqual([]);
  });

  it('matches text case-insensitively in a single text node', () => {
    const expected = [
      {
        [FindReplacePlugin.key]: true,
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
        [FindReplacePlugin.key]: true,
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
        [FindReplacePlugin.key]: true,
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
        [FindReplacePlugin.key]: true,
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 6, path: [0, 0] },
        search: 'hello ',
      },
      {
        [FindReplacePlugin.key]: true,
        anchor: { offset: 0, path: [0, 1, 0] },
        focus: { offset: 5, path: [0, 1, 0] },
        search: 'world',
      },
      {
        [FindReplacePlugin.key]: true,
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 6, path: [0, 2] },
        search: ' again',
      },
    ];

    expect(
      decorate({
        children: [
          { text: 'hello ' },
          { children: [{ text: 'world' }], type: 'a' },
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
          { children: [{ text: 'end' }], type: 'p' },
          { children: [{ text: 'start' }], type: 'p' },
        ],
        search: 'endstart',
      })
    ).toEqual([]);
  });

  it('returns ranges for multiple matches across text nodes', () => {
    const expected = [
      {
        [FindReplacePlugin.key]: true,
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
        [FindReplacePlugin.key]: true,
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
        [FindReplacePlugin.key]: true,
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
        [FindReplacePlugin.key]: true,
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
        [FindReplacePlugin.key]: true,
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

    const plugin = editor.getPlugin(FindReplacePlugin);

    editor.plugin(FindReplacePlugin).setOption('search', 'test');

    const expected = [
      {
        [FindReplacePlugin.key]: true,
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
        ...getEditorPlugin(editor, plugin),
        entry: [{ children: [{ text: 'test' }], type: 'p' }, [0]],
      })
    ).toEqual(expected);
  });
});
