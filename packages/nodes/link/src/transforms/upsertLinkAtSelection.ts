import {
  collapseSelection,
  getPluginType,
  insertNodes,
  isCollapsed,
  PlateEditor,
  select,
  TElement,
  unwrapNodes,
} from '@udecode/plate-core';
import { Editor, Transforms } from 'slate';
import { Value } from '../../../../core/src/slate/types/TEditor';
import { ELEMENT_LINK } from '../createLinkPlugin';
import { wrapLink } from './wrapLink';

/**
 * Unwrap link at a location (default: selection).
 * Then, the focus of the location is set to selection focus.
 * Then, wrap the link at the location.
 */
export const upsertLinkAtSelection = <V extends Value, T = {}>(
  editor: PlateEditor<V, T>,
  {
    url,
    wrap,
  }: {
    url: string;
    /**
     * If true, wrap the link at the location (default: selection) even if the selection is collapsed.
     */
    wrap?: boolean;
  }
) => {
  if (!editor.selection) return;

  const type = getPluginType(editor, ELEMENT_LINK);

  if (!wrap && isCollapsed(editor.selection)) {
    return insertNodes<TElement>(editor, {
      type,
      url,
      children: [{ text: url }],
    });
  }

  // if our cursor is inside an existing link, but don't have the text selected, select it now
  if (wrap && isCollapsed(editor.selection)) {
    const linkLeaf = Editor.leaf(editor, editor.selection);
    const [, inlinePath] = linkLeaf;
    select(editor, inlinePath);
  }

  unwrapNodes(editor, { at: editor.selection, match: { type } });

  wrapLink(editor, { at: editor.selection, url });

  collapseSelection(editor, { edge: 'end' });
};
