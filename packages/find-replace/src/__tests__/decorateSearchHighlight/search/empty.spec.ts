import { Range } from 'slate';
import { createEditorPlugins } from '../../../../../plate/src/utils/createEditorPlugins';
import { getSearchHighlightDecorate } from '../../../getSearchHighlightDecorate';

const input = { search: '' };

const output: Range[] = [];

it('should be', () => {
  expect(
    getSearchHighlightDecorate(input)(createEditorPlugins())([
      { text: '' },
      [0, 0],
    ])
  ).toEqual(output);
});
