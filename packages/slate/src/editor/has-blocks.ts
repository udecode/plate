import { Editor, type EditorStaticApi } from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';

export const hasBlocks: EditorStaticApi['hasBlocks'] = (editor, element) =>
  element.children.some(
    (n) => NodeApi.isElement(n) && Editor.isBlock(editor, n)
  );
