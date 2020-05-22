import {
  decorateSearchHighlight,
  SearchHighlightDecorateOptions,
} from 'search-highlight';
import { Range } from 'slate';

const input: SearchHighlightDecorateOptions = { search: '' };

const output: Range[] = [];

it('should be', () => {
  expect(decorateSearchHighlight(input)([{ text: '' }, [0, 0]])).toEqual(
    output
  );
});
