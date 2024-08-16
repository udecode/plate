import type { Range } from 'slate';

import { getPluginContext } from '@udecode/plate-common';
import { createPlateEditor } from '@udecode/plate-common/react';

import { FindReplacePlugin } from '../../../FindReplacePlugin';
import { decorateFindReplace } from '../../../decorateFindReplace';

const output: Range[] = [];

it('should be', () => {
  const editor = createPlateEditor({
    plugins: [FindReplacePlugin.configure({ options: { search: '' } })],
  });

  expect(
    decorateFindReplace({
      ...getPluginContext(editor, FindReplacePlugin.key),
      entry: [{ text: '' }, [0, 0]],
    })
  ).toEqual(output);
});
