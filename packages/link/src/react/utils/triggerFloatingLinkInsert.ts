import { type SlateEditor, getEditorPlugin } from '@udecode/plate';

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
  if (editor.api.isAt({ blocks: true })) return;

  const hasLink = editor.api.some({
    match: { type },
  });

  if (hasLink) return;

  setOption('text', editor.api.string(editor.selection));
  api.floatingLink.show('insert', editor.id);

  return true;
};
