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
      entry: [{ type: 'p', children: [{ text: 'test' }] }, [0]],
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
      entry: [{ type: 'p', children: [{ text: 'test' }] }, [0]],
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
        { type: 'p', children: [{ text: 'tes' }, { text: 't', bold: true }] },
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
