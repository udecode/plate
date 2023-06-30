import {
  MARK_SEARCH_HIGHLIGHT,
  createFindReplacePlugin,
} from '@/packages/find-replace/src/createFindReplacePlugin';
import { decorateFindReplace } from '@/packages/find-replace/src/decorateFindReplace';
import { createPlateEditor } from '@udecode/plate-common';
import { Range } from 'slate';

const output: Range[] = [];

it('should be', () => {
  const editor = createPlateEditor({
    plugins: [createFindReplacePlugin({ options: { search: '' } })],
  });

  expect(
    decorateFindReplace(
      editor,
      editor.pluginsByKey[MARK_SEARCH_HIGHLIGHT]
    )([{ text: '' }, [0, 0]])
  ).toEqual(output);
});
