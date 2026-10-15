import { isEditorContent } from '../core/content';
import { LocationApi, NodeApi } from '../interfaces';
import type { EditorStaticApi } from '../interfaces/editor';
import { range as editorRange } from '../interfaces/editor';
import { PathApi } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';
import { nodes } from './nodes';

export const string: EditorStaticApi['string'] = (editor, at, options = {}) => {
  const { content = false, voids = false } = options;
  let text = '';

  if (LocationApi.isPath(at)) {
    for (const [node] of nodes(editor, { at, match: NodeApi.isText, voids })) {
      if (!content || isEditorContent(editor, node)) text += node.text;
    }

    return text;
  }

  const range = editorRange(editor, at);
  const [start, end] = RangeApi.edges(range);

  for (const [node, path] of nodes(editor, {
    at: range,
    match: NodeApi.isText,
    voids,
  })) {
    if (content && !isEditorContent(editor, node)) continue;

    const from = PathApi.equals(path, start.path) ? start.offset : 0;
    const to = PathApi.equals(path, end.path) ? end.offset : node.text.length;

    text += node.text.slice(from, to);
  }

  return text;
};
