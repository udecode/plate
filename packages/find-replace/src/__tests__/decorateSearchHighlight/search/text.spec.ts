import { getSearchHighlightDecorate } from '@udecode/plate-find-replace';
import { Range } from 'slate';
import { createEditorPlugins } from '../../../../../plate/src/utils/createEditorPlugins';

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
    getSearchHighlightDecorate(input)(createEditorPlugins())([
      { text: 'test' },
      [0, 0],
    ] as any)
  ).toEqual(output);
});
