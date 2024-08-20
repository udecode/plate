import type { Range } from 'slate';

import { getPluginContext } from '@udecode/plate-common';
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
      ...getPluginContext(editor, FindReplacePlugin),
      entry: [{ text: '' }, [0, 0]],
    })
  ).toEqual(output);
});
