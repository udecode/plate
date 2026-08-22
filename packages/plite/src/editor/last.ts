import { LocationApi, NodeApi, RangeApi } from '../interfaces';
import { path as editorPath } from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import { node } from './node';

const hasLocationPath = (
  editor: Parameters<EditorStaticApi['last']>[0],
  at: Parameters<EditorStaticApi['last']>[1]
) => {
  if (LocationApi.isPath(at)) {
    return NodeApi.has(editor, at);
  }

  if (LocationApi.isPoint(at)) {
    return NodeApi.has(editor, at.path);
  }

  const [start, end] = RangeApi.edges(at);

  return NodeApi.has(editor, start.path) && NodeApi.has(editor, end.path);
};

export const last: EditorStaticApi['last'] = (editor, at, options = {}) => {
  if (!hasLocationPath(editor, at)) {
    return undefined;
  }

  const path = editorPath(editor, at, { edge: 'end' });

  if (typeof options.level === 'number') {
    return node(editor, path.slice(0, options.level + 1));
  }

  return node(editor, path);
};
