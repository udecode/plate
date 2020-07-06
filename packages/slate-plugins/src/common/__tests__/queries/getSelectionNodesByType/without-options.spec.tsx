import { createEditor } from 'slate';
import { PARAGRAPH } from '../../../../elements/paragraph/index';
import { getNodesByType } from '../../../queries/index';

it('should be', () => {
  const editor = createEditor();

  expect(getNodesByType(editor, PARAGRAPH)).toBeDefined();
});
