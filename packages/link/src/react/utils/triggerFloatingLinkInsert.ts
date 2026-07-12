import type { PlateEditor } from '@platejs/core/react';

import { LinkPlugin } from '../LinkPlugin';

/**
 * Trigger floating link.
 *
 * Do not trigger when:
 *
 * - Selection is across blocks
 * - Selection has more than one leaf node
 * - Lowest selection is not text
 * - Selection has a link node
 */
export const triggerFloatingLinkInsert = (
  editor: PlateEditor,
  {
    focused,
  }: {
    focused?: boolean;
  } = {}
) => {
  const { api, getOptions, setOption, type } = editor.plugin(LinkPlugin);

  const { mode } = getOptions();

  if (mode) return;
  if (!focused) return;
  if (editor.read.selection.isAcrossBlocks()) return;

  const selection = editor.read.selection();

  if (!selection) return;

  const hasLink = editor.read.nodes.some({
    at: selection,
    match: { type },
  });

  if (hasLink) return;

  setOption('text', editor.read.text.string());
  api.floatingLink.show('insert', editor.id);

  return true;
};
