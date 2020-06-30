import { createEditor } from 'slate';
import { getSelectionNodesByType } from '../../../../common/queries';
import { PARAGRAPH } from '../../../../elements/paragraph';

it('should be', () => {
  const editor = createEditor();

  expect(getSelectionNodesByType(editor, PARAGRAPH)).toBeDefined();
});
