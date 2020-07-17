import { Range } from 'slate';
import {
  decorateSearchHighlight,
  SearchHighlightDecorateOptions,
} from '../../../../../index';

const input: SearchHighlightDecorateOptions = { search: 'test' };

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
  expect(decorateSearchHighlight(input)([{ text: 'test' }, [0, 0]])).toEqual(
    output
  );
});
