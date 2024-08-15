import type { Range } from 'slate';

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
      editor,
      entry: [{ text: '' }, [0, 0]],
      plugin: editor.plugins[FindReplacePlugin.key],
    })
  ).toEqual(output);
});
