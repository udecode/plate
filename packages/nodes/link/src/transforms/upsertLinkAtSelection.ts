import {
  collapseSelection,
  getLeafNode,
  insertNodes,
  isCollapsed,
  PlateEditor,
  select,
  Value,
} from '@udecode/plate-core';
import { TLinkElement } from '../types';
import { createLinkNode } from '../utils/createLinkNode';
import { unwrapLink } from './unwrapLink';
import { wrapLink } from './wrapLink';

/**
 * Unwrap link at a location (default: selection).
 * Then, the focus of the location is set to selection focus.
 * Then, wrap the link at the location.
 */
export const upsertLinkAtSelection = <V extends Value>(
  editor: PlateEditor<V>,
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

  if (!wrap && isCollapsed(editor.selection)) {
    return insertNodes<TLinkElement>(
      editor,
      createLinkNode(editor, {
        url,
        text: url,
      })
    );
  }

  // if our cursor is inside an existing link, but don't have the text selected, select it now
  if (wrap && isCollapsed(editor.selection)) {
    const linkLeaf = getLeafNode(editor, editor.selection);
    const [, inlinePath] = linkLeaf;
    select(editor, inlinePath);
  }

  unwrapLink(editor, { at: editor.selection });

  wrapLink(editor, { at: editor.selection, url });

  collapseSelection(editor, { edge: 'end' });
};
