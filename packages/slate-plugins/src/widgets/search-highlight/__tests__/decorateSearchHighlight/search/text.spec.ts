import { Range } from 'slate';
import { createEditorPlugins } from '../../../../../__fixtures__/editor.fixtures';
import { useDecorateSearchHighlight } from '../../../../../index';

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
