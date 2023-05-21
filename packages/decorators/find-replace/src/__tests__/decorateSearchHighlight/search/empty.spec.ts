import { createPlateEditor } from '@udecode/plate-common';
import { Range } from 'slate';

import {
  createFindReplacePlugin,
  MARK_SEARCH_HIGHLIGHT,
} from '@/decorators/find-replace/src/createFindReplacePlugin';
import { decorateFindReplace } from '@/decorators/find-replace/src/decorateFindReplace';

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
