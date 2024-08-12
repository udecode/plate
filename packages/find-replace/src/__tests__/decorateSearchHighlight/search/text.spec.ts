import { getPlugin } from '@udecode/plate-common';
import { createPlateEditor } from '@udecode/plate-common/react';

import {
  FindReplacePlugin,
  MARK_SEARCH_HIGHLIGHT,
} from '../../../FindReplacePlugin';

it('should be', () => {
  const editor = createPlateEditor({
    plugins: [
      FindReplacePlugin.configure({
        search: 'test',
      }),
    ],
  });

  const plugin = getPlugin(editor, MARK_SEARCH_HIGHLIGHT);

  expect(
    plugin.decorate?.({ editor, entry: [{ text: 'test' }, [0, 0]], plugin })
  ).toEqual([
    {
      [MARK_SEARCH_HIGHLIGHT]: true,
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

  const plugin = getPlugin(editor, MARK_SEARCH_HIGHLIGHT);

  expect(
    plugin.decorate?.({ editor, entry: [{ text: 'test' }, [0, 0]], plugin })
  ).toEqual([
    {
      [MARK_SEARCH_HIGHLIGHT]: true,
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
