import { Editor, Transforms } from 'slate';
import { isCollapsed } from '../../../common/queries/isCollapsed';
import { unwrapNodesByType } from '../../../common/transforms/unwrapNodesByType';
import { LINK } from '../types';
import { wrapLink } from './wrapLink';

/**
 * Unwrap link at a location (default: selection).
 * Then, the focus of the location is set to selection focus.
 * Then, wrap the link at the location.
 */
export const upsertLinkAtSelection = (
  editor: Editor,
  url: string,
  {
    typeLink = LINK,
    wrap,
  }: {
    typeLink?: string;

    /**
     * If true, wrap the link at the location (default: selection) even if the selection is collapsed.
     */
    wrap?: boolean;
  } = {}
) => {
  if (!editor.selection) return;

  if (!wrap && isCollapsed(editor.selection)) {
    return Transforms.insertNodes(editor, {
      type: typeLink,
      url,
      children: [{ text: url }],
    });
  }

  unwrapNodesByType(editor, typeLink, { at: editor.selection });

  wrapLink(editor, url, {
    typeLink,
    at: editor.selection,
  });

  Transforms.collapse(editor, { edge: 'end' });
};
