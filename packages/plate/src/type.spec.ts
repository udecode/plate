import { createBaseEditor, isType } from '@platejs/core';

it('does not throw', () => {
  const editor = createBaseEditor();

  expect(isType(editor, editor.read.children()[0], 'p')).toEqual(true);
});
