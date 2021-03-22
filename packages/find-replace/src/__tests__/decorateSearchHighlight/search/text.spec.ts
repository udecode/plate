import { Range } from 'slate';
import { useDecorateSearchHighlight } from '../../../../../slate-plugins/src/index';
import { createEditorPlugins } from '../../../../../slate-plugins/src/utils/createEditorPlugins';

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
  },
];

it('should be', () => {
  expect(
    useDecorateSearchHighlight(input)(createEditorPlugins())([
      { text: 'test' },
      [0, 0],
    ])
  ).toEqual(output);
});
