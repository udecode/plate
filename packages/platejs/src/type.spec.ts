import { createSlateEditor, isType } from '@udecode/plate-core';

it('should not throw', () => {
  const editor = createSlateEditor();

  expect(
    isType(createSlateEditor({ editor }), editor.children[0], 'p')
  ).toEqual(true);
});
