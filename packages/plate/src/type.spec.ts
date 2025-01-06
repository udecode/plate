import { createSlateEditor } from '@udecode/plate-core';
import { isType } from '@udecode/plate-utils';

it('should not throw', () => {
  const editor = createSlateEditor();

  expect(
    isType(createSlateEditor({ editor }), editor.children[0], 'p')
  ).toEqual(true);
});
