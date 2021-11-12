import { getNode, unsetNodes } from '@udecode/plate-common';
import { WithOverride } from '@udecode/plate-core';
import { KEY_INDENT } from '@udecode/plate-indent';
import { Node } from 'slate';
import { getNextIndentList } from './queries/getNextIndentList';
import { getPreviousIndentList } from './queries/getPreviousIndentList';
import { normalizeListStart } from './transforms/normalizeListStart';
import { KEY_LIST_STYLE_TYPE } from './createIndentListPlugin';

export const withIndentList = (): WithOverride => (editor) => {
  const { apply, normalizeNode } = editor;

  editor.normalizeNode = ([node, path]) => {
    if (node[KEY_LIST_STYLE_TYPE] && !node[KEY_INDENT]) {
      unsetNodes(editor, KEY_LIST_STYLE_TYPE, { at: path });
    }

    normalizeListStart(editor, [node, path]);

    return normalizeNode([node, path]);
  };

  editor.apply = (operation) => {
    const { path } = operation as any;

    let nodeBefore: Node | null = null;

    if (operation.type === 'set_node') {
      nodeBefore = getNode(editor, path);
    }

    // FIXME: delete first list
    // let nextNodeEntryBefore: any;
    // if (
    //   operation.type === 'merge_node' &&
    //   operation.properties[KEY_LIST_STYLE_TYPE]
    // ) {
    //   const node = getNode(editor, path);
    //
    //   nextNodeEntryBefore = getNextIndentList(editor, [node as any, path]);
    // }

    apply(operation);

    if (operation.type === 'merge_node') {
      const { properties } = operation;

      if (properties[KEY_LIST_STYLE_TYPE]) {
        const node = getNode(editor, path);

        const prevNodeEntry = getPreviousIndentList(editor, [
          node as any,
          path,
        ]);
        if (!prevNodeEntry) {
          normalizeListStart(editor, [node as any, path]);
          return;
        }

        normalizeListStart(editor, prevNodeEntry);
        // FIXME: delete first list
        // if (nextNodeEntryBefore) {
        //   normalizeListStart(editor,nextNodeEntryBefore);
        // }
      }
    }

    if (operation.type === 'set_node' && nodeBefore) {
      const prevListStyleType = operation.properties[KEY_LIST_STYLE_TYPE];
      const listStyleType = operation.newProperties[KEY_LIST_STYLE_TYPE];

      // Remove list style type
      if (prevListStyleType && !listStyleType) {
        const node = getNode(editor, path);
        if (!node) return;

        const nextNodeEntry = getNextIndentList(editor, [node, path]);
        if (!nextNodeEntry) return;

        normalizeListStart(editor, nextNodeEntry);
      }

      // Update list style type
      if (
        (prevListStyleType || listStyleType) &&
        prevListStyleType !== listStyleType
      ) {
        const node = getNode(editor, path);
        if (!node) return;

        /**
         * Case:
         * - 1-<o>-1 <- toggle ol
         * - <1>-1-2 <- normalize
         * - 1-2-3
         */
        const prevNodeEntry = getPreviousIndentList(editor, [node, path]);
        if (prevNodeEntry) {
          normalizeListStart(editor, prevNodeEntry);
        }

        /**
         * Case:
         * - 1-<2>-3 <- toggle ul
         * - 1-o-<3> <- normalize
         * - 1-o-1
         */
        const nextNodeEntry = getNextIndentList(editor, [nodeBefore, path]);
        if (nextNodeEntry) {
          normalizeListStart(editor, nextNodeEntry);
        }
      }

      const prevIndent = operation.properties[KEY_INDENT];
      const indent = operation.newProperties[KEY_INDENT];

      // Update indent
      if (prevIndent !== indent) {
        const node = getNode(editor, path);
        if (!node) return;

        /**
         * Case:
         * - 1-<o>-1 <- indent
         * - <1>-1o-1 <- normalize node before
         * - 1-1o-2
         */
        let prevNodeEntry = getPreviousIndentList(editor, [nodeBefore, path], {
          sameStyleType: false,
        });
        if (prevNodeEntry) {
          normalizeListStart(editor, prevNodeEntry);
        }

        /**
         * Case:
         * - 11-<1>-11 <- indent
         * - <11>-11-12 <- normalize prev node after
         * - 11-12-13
         */
        prevNodeEntry = getPreviousIndentList(editor, [node, path], {
          sameStyleType: false,
        });
        if (prevNodeEntry) {
          normalizeListStart(editor, prevNodeEntry);
        }

        /**
         * Case:
         * - 11-<12>-13 <- outdent
         * - 11-2-<13> <- normalize next node before
         * - 11-2-11
         */
        let nextNodeEntry = getNextIndentList(editor, [nodeBefore, path], {
          sameStyleType: false,
        });
        if (nextNodeEntry) {
          normalizeListStart(editor, nextNodeEntry);
        }

        /**
         * Case:
         * - 1-<1o>-2 <- outdent
         * - 1-o-<2> <- normalize next node after
         * - 1-o-1
         */
        nextNodeEntry = getNextIndentList(editor, [node, path], {
          sameStyleType: false,
        });
        if (nextNodeEntry) {
          normalizeListStart(editor, nextNodeEntry);
        }
      }
    }
  };

  return editor;
};
