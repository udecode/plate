import { type BaseEditor, createBaseEditor } from './index';

const getParagraphType = (editor: BaseEditor) =>
  editor.plugin('paragraph').name;

it('does not throw', () => {
  const editor = createBaseEditor();

  expect(getParagraphType(editor)).toEqual('paragraph');
});
