import { getPluginContext } from '@udecode/plate-common';
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
      ...getPluginContext(editor, plugin),
      entry: [{ text: 'test' }, [0, 0]],
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
      ...getPluginContext(editor, plugin),
      entry: [{ text: 'test' }, [0, 0]],
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
