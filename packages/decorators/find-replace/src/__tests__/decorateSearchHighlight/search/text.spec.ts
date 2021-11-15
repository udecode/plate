import { getSearchHighlightDecorate } from '@udecode/plate-find-replace';
import { Range } from 'slate';
import { createPlateUIEditor } from '../../../../../../plate/src/utils/createPlateUIEditor';

const input = { search: 'test' };

const output: Range[] = [
  {
    anchor: {
      offset: 0,
      path: [0, 0],
    },
    focus: {
      offset: 4,
      path: [0, 0],
    },
    search_highlight: true,
  } as any,
];

it('should be', () => {
  expect(
    getSearchHighlightDecorate(input)(createPlateUIEditor())([
      { text: 'test' },
      [0, 0],
    ] as any)
  ).toEqual(output);
});
