import type { Path } from '@udecode/plate';
import type { Editor, TNode } from '@udecode/slate';

export const selectSiblingNodePoint = (
  editor: Editor,
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
