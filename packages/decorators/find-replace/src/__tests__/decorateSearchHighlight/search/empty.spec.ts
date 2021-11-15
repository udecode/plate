import { createPlateEditor, mockPlugin } from '@udecode/plate-core';
import { Range } from 'slate';
import { decorateFindReplace } from '../../../decorateFindReplace';

const output: Range[] = [];

it('should be', () => {
  expect(
    decorateFindReplace(
      createPlateEditor(),
      mockPlugin({ options: { search: '' } })
    )([{ text: '' }, [0, 0]])
  ).toEqual(output);
});
