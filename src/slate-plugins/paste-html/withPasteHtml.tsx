import { Editor, Transforms } from 'slate';
import { ElementType } from 'slate-plugins/common/constants/formats';
import { deserialize } from './deserialize';

export const withPasteHtml = (editor: Editor) => {
  const { insertData, isInline, isVoid } = editor;

  editor.isInline = element => {
    return element.type === ElementType.LINK ? true : isInline(element);
  };

  editor.isVoid = element => {
    return element.type === ElementType.IMAGE ? true : isVoid(element);
  };

  editor.insertData = (data: DataTransfer) => {
    const html = data.getData('text/html');

    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      const fragment = deserialize(parsed.body);
      Transforms.insertFragment(editor, fragment);
      return;
    }

    insertData(data);
  };

  return editor;
};
