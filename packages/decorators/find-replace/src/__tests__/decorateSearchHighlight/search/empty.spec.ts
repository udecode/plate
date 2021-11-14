import { Range } from 'slate';
import { createPlateEditor } from '../../../../../../plate/src/utils/createPlateEditor';
import { getFindReplaceDecorate } from '../../../getFindReplaceDecorate';

const input = { search: '' };

const output: Range[] = [];

it('should be', () => {
  expect(
    getFindReplaceDecorate(input)(createPlateEditor())([{ text: '' }, [0, 0]])
  ).toEqual(output);
});
