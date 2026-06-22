import { createSlateEditor, isType } from '@platejs/core';

it('does not throw', () => {
  const editor = createSlateEditor();

  expect(isType(editor, editor.children[0], 'p')).toEqual(true);
});
