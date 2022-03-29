import { TEditor, TNode } from '@udecode/plate-core';
import { KEY_INDENT } from '@udecode/plate-indent';
import { NodeEntry } from 'slate';
import { KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';

export interface GetSiblingIndentListOptions {
  getPreviousEntry?: (entry: NodeEntry) => NodeEntry | undefined;
  getNextEntry?: (entry: NodeEntry) => NodeEntry | undefined;
  /**
   * Query to validate lookup. If false, check the next sibling.
   */
  query?: (siblingNode: TNode) => boolean | undefined;
  /**
   * Query to break lookup
   */
  eqIndent?: boolean;
  breakQuery?: (siblingNode: TNode) => boolean | undefined;
  breakOnLowerIndent?: boolean;
  breakOnEqIndentNeqListStyleType?: boolean;
}

/**
 * Get the next sibling indent list node.
 * Default query: the sibling node should have the same listStyleType.
 */
export const getSiblingIndentList = (
  editor: TEditor,
  [node, path]: NodeEntry,
  {
    getPreviousEntry,
    getNextEntry,
    query,
    eqIndent = true,
    breakQuery,
    breakOnLowerIndent = true,
    breakOnEqIndentNeqListStyleType = true,
  }: GetSiblingIndentListOptions
): NodeEntry | undefined => {
  if (!getPreviousEntry && !getNextEntry) return;

  const getSiblingEntry = getNextEntry ?? getPreviousEntry!;

  let nextEntry = getSiblingEntry([node, path]);

  while (true) {
    if (!nextEntry) return;

    const [nextNode, nextPath] = nextEntry;

    if (!nextNode[KEY_INDENT]) return;

    if (breakQuery && breakQuery(nextNode as TNode)) return;

    if (breakOnLowerIndent && nextNode[KEY_INDENT] < node[KEY_INDENT]) return;
    if (
      breakOnEqIndentNeqListStyleType &&
      nextNode[KEY_INDENT] === node[KEY_INDENT] &&
      nextNode[KEY_LIST_STYLE_TYPE] !== node[KEY_LIST_STYLE_TYPE]
    )
      return;

    let valid = !query || query(nextNode as TNode);
    if (valid) {
      valid = !eqIndent || nextNode[KEY_INDENT] === node[KEY_INDENT];
      if (valid) return [nextNode, nextPath];
    }

    nextEntry = getSiblingEntry(nextEntry);
  }
};
