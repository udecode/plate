import {
  AutoformatRule
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  getParent,
  isElement,
  isType,
  SPEditor,
  toggleList,
  unwrapList,
} from '@udecode/plate';

export const preFormat: AutoformatRule['preFormat'] = (editor) => unwrapList(editor as SPEditor);

export const format: AutoformatRule['format'] = (editor, customFormatting) => {
  if (editor.selection) {
    const parentEntry = getParent(editor, editor.selection);
    if (!parentEntry) return;
    const [node] = parentEntry;
    if (
      isElement(node)
      && !isType((editor as any) as SPEditor, node, ELEMENT_CODE_BLOCK)
      && !isType((editor as any) as SPEditor, node, ELEMENT_CODE_LINE)
    ) {
      customFormatting();
    }
  }
};

export const formatList = (editor, elementType) => {
  format((editor as any) as SPEditor, () => toggleList((editor as any) as SPEditor, {
    type: elementType,
  }));
};

export const formatText = (editor, text) => {
  format((editor as any) as SPEditor, () => editor.insertText(text));
};
