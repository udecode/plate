import type { Range } from 'slate';

import { createPlateEditor } from '@udecode/plate-common/react';

import {
  FindReplacePlugin,
  MARK_SEARCH_HIGHLIGHT,
} from '../../../FindReplacePlugin';
import { decorateFindReplace } from '../../../decorateFindReplace';

const output: Range[] = [];

it('should be', () => {
  const editor = createPlateEditor({
    plugins: [FindReplacePlugin.configure({ search: '' })],
  });

  expect(
    decorateFindReplace({
      editor,
      entry: [{ text: '' }, [0, 0]],
      plugin: editor.plugins[MARK_SEARCH_HIGHLIGHT],
    })
  ).toEqual(output);
});
