import type { EditorUpdateTransaction } from '@platejs/plite';

import { type BasePlateEditor, ElementApi, PathApi } from 'platejs';
import { KEYS } from 'platejs';

type UnwrapNodesOptions = NonNullable<
  Parameters<EditorUpdateTransaction['nodes']['unwrap']>[0]
>;

/** Unwrap link node. */
export const unwrapLink = (
  editor: BasePlateEditor,
  options?: {
    split?: boolean;
  } & UnwrapNodesOptions
) => {
  return editor.update((tx) => {
    const linkType = editor.getType(KEYS.link);
    const matchLink = (node: unknown) =>
      ElementApi.isElement(node) && node.type === linkType;

    if (options?.split) {
      const linkAboveAnchor = editor.api.above({
        at: editor.selection?.anchor,
        match: matchLink,
      });

      // anchor in link
      if (linkAboveAnchor) {
        tx.nodes.split({
          at: editor.selection?.anchor,
          match: matchLink,
        });
        tx.nodes.unwrap({
          at: editor.selection?.anchor,
          match: matchLink,
        });

        return true;
      }

      const linkAboveFocus = editor.api.above({
        at: editor.selection?.focus,
        match: matchLink,
      });

      // focus in link
      if (linkAboveFocus) {
        const [, linkPath] = linkAboveFocus;

        tx.nodes.split({
          at: editor.selection?.focus,
          match: matchLink,
        });
        tx.nodes.unwrap({
          at: PathApi.next(linkPath),
          match: matchLink,
        });

        return true;
      }
    }

    tx.nodes.unwrap({
      match: matchLink,
      ...options,
    });
  });
};
