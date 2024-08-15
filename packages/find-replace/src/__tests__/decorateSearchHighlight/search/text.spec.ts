import { createPlateEditor } from '@udecode/plate-common/react';

import { FindReplacePlugin } from '../../../FindReplacePlugin';

it('should be', () => {
  const editor = createPlateEditor({
    plugins: [
      FindReplacePlugin.configure({
        options: {
          search: 'test',
        },
      }),
    ],
  });

  const plugin = editor.getPlugin(FindReplacePlugin);

  expect(
    plugin.decorate?.({ editor, entry: [{ text: 'test' }, [0, 0]], plugin })
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

it('should be', () => {
  const editor = createPlateEditor({
    plugins: [
      FindReplacePlugin.configure({
        options: {
          search: 'Test',
        },
      }),
    ],
  });

  const plugin = editor.getPlugin(FindReplacePlugin);

  expect(
    plugin.decorate?.({ editor, entry: [{ text: 'test' }, [0, 0]], plugin })
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
