import { getPlugin } from '@udecode/plate-common';
import { createPlateEditor } from '@udecode/plate-common/react';

import { FindReplacePlugin } from '../../../FindReplacePlugin';

it('should be', () => {
  const editor = createPlateEditor({
    plugins: [
      FindReplacePlugin.configure({
        search: 'test',
      }),
    ],
  });

  const plugin = getPlugin(editor, FindReplacePlugin.key);

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
        search: 'Test',
      }),
    ],
  });

  const plugin = getPlugin(editor, FindReplacePlugin.key);

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
