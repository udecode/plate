import {
  isEnd as editorIsEnd,
  isStart as editorIsStart,
} from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';

export const isEdge: EditorStaticApi['isEdge'] = (editor, point, at) =>
  editorIsStart(editor, point, at) || editorIsEnd(editor, point, at);
