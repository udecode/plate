import { getSelectionNodesArrayByType } from 'common/queries';
import { PARAGRAPH } from 'elements/paragraph';
import { createEditor } from 'slate';

it('should be', () => {
  const editor = createEditor();

  expect(getSelectionNodesArrayByType(editor, PARAGRAPH)).toBeDefined();
});
