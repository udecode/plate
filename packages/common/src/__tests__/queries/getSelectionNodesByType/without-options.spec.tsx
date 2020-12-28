import { createEditor } from 'slate';
import { ELEMENT_PARAGRAPH } from '../../../constants';
import { getNodesByType } from '../../../queries/index';

it('should be', () => {
  const editor = createEditor();

  expect(getNodesByType(editor, ELEMENT_PARAGRAPH)).toBeDefined();
});
