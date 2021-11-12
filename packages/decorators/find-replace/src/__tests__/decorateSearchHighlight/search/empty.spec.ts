import { Range } from 'slate';
import { createEditorPlugins } from '../../../../../../plate/src/utils/createEditorPlugins';
import { getFindReplaceDecorate } from '../../../getFindReplaceDecorate';

const input = { search: '' };

const output: Range[] = [];

it('should be', () => {
  expect(
    getFindReplaceDecorate(input)(createEditorPlugins())([{ text: '' }, [0, 0]])
  ).toEqual(output);
});
