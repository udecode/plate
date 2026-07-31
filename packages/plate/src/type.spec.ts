import { type BaseEditor, createBaseEditor } from './index';

const getParagraphType = (editor: BaseEditor) => editor.plugin('p').type;

it('does not throw', () => {
  const editor = createBaseEditor();

  expect(getParagraphType(editor)).toEqual('p');
});
