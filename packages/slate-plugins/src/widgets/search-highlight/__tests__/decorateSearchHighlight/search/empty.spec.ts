import { Range } from 'slate';
import { createEditorPlugins } from '../../../../../__fixtures__/editor.fixtures';
import { useDecorateSearchHighlight } from '../../../../../index';

const input = { search: '' };

const output: Range[] = [];

it('should be', () => {
  expect(
    useDecorateSearchHighlight(input)(createEditorPlugins())([
      { text: '' },
      [0, 0],
    ])
  ).toEqual(output);
});
