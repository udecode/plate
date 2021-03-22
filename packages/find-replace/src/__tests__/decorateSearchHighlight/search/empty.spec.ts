import { Range } from 'slate';
import { useDecorateSearchHighlight } from '../../../../../slate-plugins/src/index';
import { createEditorPlugins } from '../../../../../slate-plugins/src/utils/createEditorPlugins';

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
