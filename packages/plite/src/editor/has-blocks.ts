import { isBlock as editorIsBlock } from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';

export const hasBlocks: EditorStaticApi['hasBlocks'] = (editor, element) =>
  element.children.some(
    (n) => NodeApi.isElement(n) && editorIsBlock(editor, n)
  );
