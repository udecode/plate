import { Range } from 'slate';
import { createPlateUIEditor } from '../../../../../../plate/src/utils/createPlateUIEditor';
import { getFindReplaceDecorate } from '../../../getFindReplaceDecorate';

const input = { search: '' };

const output: Range[] = [];

it('should be', () => {
  expect(
    getFindReplaceDecorate(input)(createPlateUIEditor())([{ text: '' }, [0, 0]])
  ).toEqual(output);
});
