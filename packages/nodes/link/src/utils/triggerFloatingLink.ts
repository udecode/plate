import {
  getEditorString,
  getNodeEntries,
  getPluginType,
  isRangeAcrossBlocks,
  isText,
  PlateEditor,
  someNode,
  Value,
} from '@udecode/plate-core';
import { floatingLinkActions } from '../components/FloatingLink/floatingLinkStore';
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
export const triggerFloatingLink = <V extends Value>(
  editor: PlateEditor<V>,
  {
    focused,
  }: {
    focused?: boolean;
  } = {}
) => {
  if (!focused) return;

  if (isRangeAcrossBlocks(editor, { at: editor.selection })) return;

  // get lowest nodes in selection
  const _entries = getNodeEntries(editor, {
    mode: 'lowest',
  });
  const entries = [..._entries];
  if (entries.length !== 1) return;

  const [entry] = entries;

  // void node
  if (!isText(entry[0])) return;

  const hasLink = someNode(editor, {
    match: { type: getPluginType(editor, ELEMENT_LINK) },
  });
  if (hasLink) return;

  floatingLinkActions.text(getEditorString(editor, editor.selection));
  floatingLinkActions.show('insert');
};
