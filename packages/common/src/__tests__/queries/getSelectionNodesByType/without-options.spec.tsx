import { createEditor } from 'slate';
import { ELEMENT_PARAGRAPH } from '../../../../../slate-plugins/src/elements/paragraph/defaults';
import { getNodesByType } from '../../../queries/index';

it('should be', () => {
  const editor = createEditor();

  expect(getNodesByType(editor, ELEMENT_PARAGRAPH)).toBeDefined();
});
