import type { Range } from 'slate';

import { createPlateEditor } from '@udecode/plate-common';

import {
  MARK_SEARCH_HIGHLIGHT,
  createFindReplacePlugin,
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
