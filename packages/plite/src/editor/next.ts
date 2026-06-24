import {
  after as editorAfter,
  getChildren as editorGetChildren,
  getSnapshot as editorGetSnapshot,
  last as editorLast,
  parent as editorParent,
} from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import { LocationApi, type Span } from '../interfaces/location';
import { NodeApi } from '../interfaces/node';
import { nodes } from './nodes';

export const next: EditorStaticApi['next'] = (editor, options = {}) => {
  const { mode = 'lowest', voids = false } = options;
  let { match, at = editorGetSnapshot(editor).selection } = options;

  if (!at) {
    return;
  }

  if (LocationApi.isPath(at) && at.length === 0) {
    return;
  }

  const pointAfterLocation = editorAfter(editor, at, { voids });

  if (!pointAfterLocation) return;

  const [, to] = editorLast(editor, []);

  const span: Span = [pointAfterLocation.path, to];

  if (match == null) {
    if (LocationApi.isPath(at)) {
      const [parent] = editorParent(editor, at);
      const children = NodeApi.isEditor(parent)
        ? editorGetChildren(editor)
        : parent.children;
      match = (n) => !NodeApi.isEditor(n) && children.includes(n);
    } else {
      match = () => true;
    }
  }

  const [next] = nodes(editor, { at: span, match, mode, voids });
  return next;
};
