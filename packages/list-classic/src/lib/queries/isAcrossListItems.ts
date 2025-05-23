import { type SlateEditor, type TRange, KEYS, RangeApi } from '@udecode/plate';

/** Is selection across blocks with list items */
export const isAcrossListItems = (
  editor: SlateEditor,
  at: TRange | null = editor.selection
) => {
  if (!at || RangeApi.isCollapsed(at)) {
    return false;
  }

  const isAcrossBlocks = editor.api.isAt({ at, blocks: true });

  if (!isAcrossBlocks) return false;

  return editor.api.some({
    at,
    match: { type: editor.getType(KEYS.li) },
  });
};
