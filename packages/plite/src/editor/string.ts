import { NodeApi } from '../interfaces';
import { range as editorRange } from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import { PathApi } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';
import { nodes } from './nodes';

export const string: EditorStaticApi['string'] = (editor, at, options = {}) => {
  const { voids = false } = options;
  const range = editorRange(editor, at);
  const [start, end] = RangeApi.edges(range);
  let text = '';

  for (const [node, path] of nodes(editor, {
    at: range,
    match: NodeApi.isText,
    voids,
  })) {
    let t = node.text;

    if (PathApi.equals(path, end.path)) {
      t = t.slice(0, end.offset);
    }

    if (PathApi.equals(path, start.path)) {
      t = t.slice(start.offset);
    }

    text += t;
  }

  return text;
};
