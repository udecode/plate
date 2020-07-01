import { createEditor } from 'slate';
import { PARAGRAPH } from '../../../../elements/paragraph/index';
import { getSelectionNodesByType } from '../../../queries/index';

it('should be', () => {
  const editor = createEditor();

  expect(getSelectionNodesByType(editor, PARAGRAPH)).toBeDefined();
});
