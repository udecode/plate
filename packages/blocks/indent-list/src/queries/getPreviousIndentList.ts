import { getNode, getPreviousPath } from '@udecode/plate-common';
import { SPEditor } from '@udecode/plate-core';
import { KEY_INDENT } from '@udecode/plate-indent';
import { NodeEntry } from 'slate';
import { KEY_LIST_STYLE_TYPE } from '../defaults';

export const getPreviousIndentList = (
  editor: SPEditor,
  [node, path]: NodeEntry,
  {
    sameStyleType = true,
  }: { sameIndent?: boolean; sameStyleType?: boolean } = {}
): NodeEntry | undefined => {
  const indent = node[KEY_INDENT];
  const listStyleType = node[KEY_LIST_STYLE_TYPE];

  let prevPath = getPreviousPath(path);

  while (true) {
    if (!prevPath) return;

    const prevNode = getNode(editor, prevPath);

    if (!prevNode || !prevNode[KEY_INDENT] || prevNode[KEY_INDENT] < indent) {
      return;
    }

    if (prevNode[KEY_INDENT] === indent) {
      if (sameStyleType && prevNode[KEY_LIST_STYLE_TYPE] !== listStyleType) {
        return;
      }

      return [prevNode, prevPath];
    }

    prevPath = getPreviousPath(prevPath);
  }
};
