import {
  type SlateEditor,
  getEditorPlugin,
  getEditorString,
  isRangeAcrossBlocks,
  someNode,
} from '@udecode/plate-common';

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
  editor: SlateEditor,
  {
    focused,
  }: {
    focused?: boolean;
  } = {}
) => {
  const { api, getOptions, setOption, type } = getEditorPlugin(
    editor,
    LinkPlugin
  );

  const { mode } = getOptions();

  if (mode) return;
  if (!focused) return;
  if (isRangeAcrossBlocks(editor, { at: editor.selection })) return;

  const hasLink = someNode(editor, {
    match: { type },
  });

  if (hasLink) return;

  setOption('text', getEditorString(editor, editor.selection));
  api.floatingLink.show('insert', editor.id);

  return true;
};
