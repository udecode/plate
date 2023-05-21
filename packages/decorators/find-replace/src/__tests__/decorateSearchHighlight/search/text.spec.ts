import { createPlateEditor, getPlugin } from '@udecode/plate-common';

import {
  createFindReplacePlugin,
  MARK_SEARCH_HIGHLIGHT,
} from '@/decorators/find-replace/src/createFindReplacePlugin';

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

  expect(plugin.decorate?.(editor, plugin)([{ text: 'test' }, [0, 0]])).toEqual(
    [
      {
        anchor: {
          offset: 0,
          path: [0, 0],
        },
        focus: {
          offset: 4,
          path: [0, 0],
        },
        search: 'test',
        [MARK_SEARCH_HIGHLIGHT]: true,
      },
    ]
  );
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

  expect(plugin.decorate?.(editor, plugin)([{ text: 'test' }, [0, 0]])).toEqual(
    [
      {
        anchor: {
          offset: 0,
          path: [0, 0],
        },
        focus: {
          offset: 4,
          path: [0, 0],
        },
        search: 'Test',
        [MARK_SEARCH_HIGHLIGHT]: true,
      },
    ]
  );
});
