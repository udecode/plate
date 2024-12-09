import { getEditorPlugin } from '@udecode/plate-common';
import { createSlateEditor } from '@udecode/plate-common';

import { FindReplacePlugin } from '../../../FindReplacePlugin';

it('should decorate matching text', () => {
  const editor = createSlateEditor({
    plugins: [FindReplacePlugin],
  });

  const plugin = editor.getPlugin(FindReplacePlugin);

  editor.setOption(FindReplacePlugin, 'search', 'test');

  expect(
    plugin.decorate?.({
      ...getEditorPlugin(editor, plugin),
      entry: [{ children: [{ text: 'test' }], type: 'p' }, [0]],
    })
  ).toEqual([
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
  ]);
});

it('should decorate matching text case-insensitively', () => {
  const editor = createSlateEditor({
    plugins: [FindReplacePlugin],
  });

  const plugin = editor.getPlugin(FindReplacePlugin);

  editor.setOption(FindReplacePlugin, 'search', 'Test');

  expect(
    plugin.decorate?.({
      ...getEditorPlugin(editor, plugin),
      entry: [{ children: [{ text: 'test' }], type: 'p' }, [0]],
    })
  ).toEqual([
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
  ]);
});

it('should decorate matching consecutive text nodes', () => {
  const editor = createSlateEditor({
    plugins: [FindReplacePlugin],
  });

  const plugin = editor.getPlugin(FindReplacePlugin);

  editor.setOption(FindReplacePlugin, 'search', 'test');

  expect(
    plugin.decorate?.({
      ...getEditorPlugin(editor, plugin),
      entry: [
        { children: [{ text: 'tes' }, { bold: true, text: 't' }], type: 'p' },
        [0],
      ],
    })
  ).toEqual([
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
  ]);
});

it('should decorate matching multiple occurrences', () => {
  const editor = createSlateEditor({
    plugins: [FindReplacePlugin],
  });

  const plugin = editor.getPlugin(FindReplacePlugin);

  editor.setOption(FindReplacePlugin, 'search', 'test');

  expect(
    plugin.decorate?.({
      ...getEditorPlugin(editor, plugin),
      entry: [
        {
          children: [
            { text: 'tes' },
            { bold: true, text: 'ts and tests and t' },
            { text: 'ests' },
          ],
          type: 'p',
        },
        [0],
      ],
    })
  ).toEqual([
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
  ]);
});
