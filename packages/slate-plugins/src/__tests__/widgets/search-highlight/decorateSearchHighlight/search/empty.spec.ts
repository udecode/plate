import { Range } from 'slate';
import {
  decorateSearchHighlight,
  SearchHighlightDecorateOptions,
} from '../../../../..';

const input: SearchHighlightDecorateOptions = { search: '' };

const output: Range[] = [];

it('should be', () => {
  expect(decorateSearchHighlight(input)([{ text: '' }, [0, 0]])).toEqual(
    output
  );
});
