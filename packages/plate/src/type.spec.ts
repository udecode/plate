import { type BaseEditor, createBaseEditor } from './index';

const getParagraphType = (editor: BaseEditor) => editor.getType('p');

it('does not throw', () => {
  const editor = createBaseEditor();

  expect(getParagraphType(editor)).toEqual('p');
});
