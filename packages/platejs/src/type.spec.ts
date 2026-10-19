import { BaseParagraphPlugin, type Editor, createEditor } from './index';

const getParagraphType = (editor: Editor) =>
  editor.plugin(BaseParagraphPlugin).name;

it('does not throw', () => {
  const editor = createEditor();

  expect(getParagraphType(editor)).toEqual('paragraph');
});
