import { AutoformatBlockRule } from '@udecode/plate-autoformat';
import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
} from '@udecode/plate-code-block';
import { getParentNode, isElement, isType } from '@udecode/plate-common';
import { toggleList, unwrapList } from '@udecode/plate-list';

import { MyEditor, MyValue } from '@/types/plate-types';

export const preFormat: AutoformatBlockRule<MyValue, MyEditor>['preFormat'] = (
  editor
) => unwrapList(editor);

export const format = (editor: MyEditor, customFormatting: any) => {
  if (editor.selection) {
    const parentEntry = getParentNode(editor, editor.selection);
    if (!parentEntry) return;
    const [node] = parentEntry;
    if (
      isElement(node) &&
      !isType(editor, node, ELEMENT_CODE_BLOCK) &&
      !isType(editor, node, ELEMENT_CODE_LINE)
    ) {
      customFormatting();
    }
  }
};

export const formatList = (editor: MyEditor, elementType: string) => {
  format(editor, () =>
    toggleList(editor, {
      type: elementType,
    })
  );
};

export const formatText = (editor: MyEditor, text: string) => {
  format(editor, () => editor.insertText(text));
};
