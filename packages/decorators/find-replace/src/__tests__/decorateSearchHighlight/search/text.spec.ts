import { createPlateEditor, getPlugin } from '@udecode/plate-core';
import { Range } from 'slate';
import {
  createFindReplacePlugin,
  MARK_SEARCH_HIGHLIGHT,
} from '../../../createFindReplacePlugin';

const output: Range[] = [
  {
    anchor: {
      offset: 0,
      path: [0, 0],
    },
    focus: {
      offset: 4,
      path: [0, 0],
    },
    search_highlight: true,
  } as any,
];

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
    output
  );
});
