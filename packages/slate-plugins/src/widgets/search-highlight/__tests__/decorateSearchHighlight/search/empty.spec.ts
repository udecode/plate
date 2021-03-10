import { Range } from 'slate';
import {
  SearchHighlightDecorateOptions,
  useDecorateSearchHighlight,
} from '../../../../../index';

const input: SearchHighlightDecorateOptions = { search: '' };

const output: Range[] = [];

it('should be', () => {
  expect(useDecorateSearchHighlight(input)([{ text: '' }, [0, 0]])).toEqual(
    output
  );
});
