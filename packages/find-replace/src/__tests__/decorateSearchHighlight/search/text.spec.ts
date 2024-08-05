import { createPlateEditor, getPlugin } from '@udecode/plate-common';

import {
  MARK_SEARCH_HIGHLIGHT,
  createFindReplacePlugin,
} from '../../../FindReplacePlugin';

it('should be', () => {
  const editor = createPlateEditor({
    plugins: [
      createFindReplacePlugin({
        options: {
          search: 'test',
        },
      }),
    ],
  });

  const plugin = getPlugin(editor, MARK_SEARCH_HIGHLIGHT);

  expect(
    plugin.decorate?.({ editor, plugin })([{ text: 'test' }, [0, 0]])
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
      createFindReplacePlugin({
        options: {
          search: 'Test',
        },
      }),
    ],
  });

  const plugin = getPlugin(editor, MARK_SEARCH_HIGHLIGHT);

  expect(
    plugin.decorate?.({ editor, plugin })([{ text: 'test' }, [0, 0]])
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
