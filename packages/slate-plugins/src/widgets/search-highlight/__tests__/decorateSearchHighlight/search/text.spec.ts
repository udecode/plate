import { Range } from 'slate';
import {
  SearchHighlightDecorateOptions,
  useDecorateSearchHighlight,
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
  expect(useDecorateSearchHighlight(input)([{ text: 'test' }, [0, 0]])).toEqual(
    output
  );
});
