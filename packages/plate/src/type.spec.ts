import { createBasePlateEditor, isType } from '@platejs/core';

it('does not throw', () => {
  const editor = createBasePlateEditor();

  expect(isType(editor, editor.children[0], 'p')).toEqual(true);
});
