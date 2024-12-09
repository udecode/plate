import type { Range } from 'slate';

import { getEditorPlugin } from '@udecode/plate-common';
import { createSlateEditor } from '@udecode/plate-common';

import { FindReplacePlugin } from '../../../FindReplacePlugin';
import { decorateFindReplace } from '../../../decorateFindReplace';

const output: Range[] = [];

it('should be', () => {
  const editor = createSlateEditor({
    plugins: [FindReplacePlugin.configure({ options: { search: '' } })],
  });

  expect(
    decorateFindReplace({
      ...getEditorPlugin(editor, FindReplacePlugin),
      entry: [{ children: [{ text: '' }], type: 'p' }, [0]],
    })
  ).toEqual(output);
});
