import {
  getEditorString,
  getPluginType,
  isRangeAcrossBlocks,
  PlateEditor,
  someNode,
  Value,
} from '@udecode/plate-common';

import {
  floatingLinkActions,
  floatingLinkSelectors,
} from '../components/FloatingLink/floatingLinkStore';
import { ELEMENT_LINK } from '../createLinkPlugin';

/**
 * Trigger floating link.
 *
 * Do not trigger when:
 * - selection is across blocks
 * - selection has more than one leaf node
 * - lowest selection is not text
 * - selection has a link node
 */
export const triggerFloatingLinkInsert = <V extends Value>(
  editor: PlateEditor<V>,
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
    match: { type: getPluginType(editor, ELEMENT_LINK) },
  });
  if (hasLink) return;

  floatingLinkActions.text(getEditorString(editor, editor.selection));
  floatingLinkActions.show('insert', editor.id);

  return true;
};
