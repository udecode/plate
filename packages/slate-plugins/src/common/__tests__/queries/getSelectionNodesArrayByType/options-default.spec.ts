import { createEditor } from 'slate';
import { PARAGRAPH } from '../../../../elements/paragraph/index';
import { getSelectionNodesArrayByType } from '../../../queries/index';

it('should be', () => {
  const editor = createEditor();

  expect(getSelectionNodesArrayByType(editor, PARAGRAPH)).toBeDefined();
});
