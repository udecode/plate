import { createEditor } from 'slate';
import { getSelectionNodesArrayByType } from '../../../../common/queries';
import { PARAGRAPH } from '../../../../elements/paragraph';

it('should be', () => {
  const editor = createEditor();

  expect(getSelectionNodesArrayByType(editor, PARAGRAPH)).toBeDefined();
});
