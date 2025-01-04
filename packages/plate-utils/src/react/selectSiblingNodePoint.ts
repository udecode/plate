import type { TEditor, TNode } from '@udecode/slate';
import type { Path } from 'slate';

export const selectSiblingNodePoint = (
  editor: TEditor,
  {
    at,
    focus = true,
    node,
    reverse,
  }: {
    at?: Path;
    focus?: boolean;
    node?: TNode;
    reverse?: boolean;
  } = {}
) => {
  if (node) {
    at = editor.api.findPath(node);
  }
  if (!at) return;

  const point = reverse
    ? editor.api.end(at, { previous: true })
    : editor.api.start(at, { next: true });

  if (!point) return;

  editor.tf.setSelection({
    anchor: point,
    focus: point,
  });

  if (focus) {
    editor.tf.focus();
  }
};
