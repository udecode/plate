import { createEditor } from 'slate';
import { ELEMENT_PARAGRAPH } from '../../../../elements/paragraph/index';
import { getNodes } from '../../../queries/getNodes';

it('should be', () => {
  const editor = createEditor();

  expect(
    getNodes(editor, { match: { type: ELEMENT_PARAGRAPH } })
  ).toBeDefined();
});
