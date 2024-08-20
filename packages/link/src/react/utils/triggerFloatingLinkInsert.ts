import {
  type SlateEditor,
  getEditorString,
  isRangeAcrossBlocks,
  someNode,
} from '@udecode/plate-common';

import { LinkPlugin } from '../../lib';
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
  editor: SlateEditor,
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
    match: { type: editor.getType(LinkPlugin) },
  });

  if (hasLink) return;

  floatingLinkActions.text(getEditorString(editor, editor.selection));
  floatingLinkActions.show('insert', editor.id);

  return true;
};
