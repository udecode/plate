import { getSelectionNodesByType } from 'common/queries';
import { PARAGRAPH } from 'elements/paragraph';
import { createEditor } from 'slate';

it('should be', () => {
  const editor = createEditor();

  expect(getSelectionNodesByType(editor, PARAGRAPH)).toBeDefined();
});
