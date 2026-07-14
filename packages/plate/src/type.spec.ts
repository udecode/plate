import { type BaseEditor, createBaseEditor, isType } from './index';

const getParagraphType = (editor: BaseEditor) => editor.getType('p');

it('does not throw', () => {
  const editor = createBaseEditor();

  expect(getParagraphType(editor)).toEqual('p');
  expect(isType(editor, editor.read.children()[0], 'p')).toEqual(true);
});
