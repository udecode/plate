import {
  type PlateEditor,
  type Value,
  getEditorString,
  getPluginType,
  isRangeAcrossBlocks,
  someNode,
} from '@udecode/plate-common/server';

import {
  floatingLinkActions,
  floatingLinkSelectors,
} from '../components/FloatingLink/floatingLinkStore';
import { ELEMENT_LINK } from '../createLinkPlugin';

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
