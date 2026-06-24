import type { NodeEntry } from '@platejs/plite';
import type { BasePlateEditor } from 'platejs';

import { isDefined, KEYS } from 'platejs';

/** Unset listStyle, listStart if KEYS.indent is not defined. */
export const normalizeListNotIndented = (
  editor: BasePlateEditor,
  [node, path]: NodeEntry
) => {
  const nodeProps = node as Record<string, unknown>;

  if (
    !isDefined(nodeProps[KEYS.indent]) &&
    (nodeProps[KEYS.listType] || nodeProps[KEYS.listStart])
  ) {
    editor.update(
      (tx) => {
        tx.nodes.unset([KEYS.listType, KEYS.listStart], {
          at: path,
        });
      },
      { skipNormalize: true }
    );

    return true;
  }
};
