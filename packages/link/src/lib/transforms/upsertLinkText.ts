import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction, Element } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { UpsertLinkOptions } from './upsertLink';

/** Replace the current link text while preserving its first leaf marks. */
export const upsertLinkText = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  { text }: UpsertLinkOptions
) => {
  const link = tx.nodes.above<Element>({
    match: { type: editor.getType(KEYS.link) },
  });

  if (!link) return;

  const [linkNode, linkPath] = link;

  if (!text?.length || text === tx.text.string(linkPath)) return;

  tx.nodes.replaceChildren([{ ...linkNode.children[0], text }], {
    at: linkPath,
  });

  const end = tx.points.end(linkPath);

  if (end) {
    tx.selection.set(end);
  }
};
