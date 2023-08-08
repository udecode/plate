import { createPlateEditor } from '@udecode/plate-common';
import { Range } from 'slate';

import {
  createFindReplacePlugin,
  MARK_SEARCH_HIGHLIGHT,
} from '../../../createFindReplacePlugin';
import { decorateFindReplace } from '../../../decorateFindReplace';

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
