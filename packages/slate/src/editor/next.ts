import { Editor, type EditorStaticApi } from '../interfaces/editor';
import { LocationApi, type Span } from '../interfaces/location';
import { NodeApi } from '../interfaces/node';
import { nodes } from './nodes';

export const next: EditorStaticApi['next'] = (editor, options = {}) => {
  const { mode = 'lowest', voids = false } = options;
  let { match, at = Editor.getSnapshot(editor).selection } = options;

  if (!at) {
    return;
  }

  if (LocationApi.isPath(at) && at.length === 0) {
    return;
  }

  const pointAfterLocation = Editor.after(editor, at, { voids });

  if (!pointAfterLocation) return;

  const [, to] = Editor.last(editor, []);

  const span: Span = [pointAfterLocation.path, to];

  if (match == null) {
    if (LocationApi.isPath(at)) {
      const [parent] = Editor.parent(editor, at);
      const children = NodeApi.isEditor(parent)
        ? Editor.getChildren(editor)
        : parent.children;
      match = (n) => !NodeApi.isEditor(n) && children.includes(n);
    } else {
      match = () => true;
    }
  }

  const [next] = nodes(editor, { at: span, match, mode, voids });
  return next;
};
