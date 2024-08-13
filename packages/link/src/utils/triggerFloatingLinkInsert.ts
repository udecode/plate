import {
  type PlateEditor,
  getEditorString,
  getPluginType,
  isRangeAcrossBlocks,
  someNode,
} from '@udecode/plate-common';

import { LinkPlugin } from '../LinkPlugin';
import {
  floatingLinkActions,
  floatingLinkSelectors,
} from '../components/FloatingLink/floatingLinkStore';

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
  if (floatingLinkSelectors.mode()) return;
  if (!focused) return;
  if (isRangeAcrossBlocks(editor, { at: editor.selection })) return;

  const hasLink = someNode(editor, {
    match: { type: getPluginType(editor, LinkPlugin.key) },
  });

  if (hasLink) return;

  floatingLinkActions.text(getEditorString(editor, editor.selection));
  floatingLinkActions.show('insert', editor.id);

  return true;
};
