import { comboboxStore } from '@udecode/plate-combobox';
import {
  ELEMENT_DEFAULT,
  getNode,
  getPreviousPath,
  setNodes,
  unsetNodes,
} from '@udecode/plate-common';
import {
  getPlatePluginType,
  SPEditor,
  TElement,
  WithOverride,
} from '@udecode/plate-core';
import { KEY_INDENT } from '@udecode/plate-indent';
import { defaults } from 'lodash';
import { Node, NodeEntry, Path, Transforms } from 'slate';
import { KEY_LIST_START, KEY_LIST_STYLE_TYPE } from './defaults';
import { IndentListPluginOptions } from './types';

const getPreviousIndentList = (
  editor: SPEditor,
  [node, path]: NodeEntry,
  {
    sameIndent = true,
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

const getNextIndentList = (
  editor: SPEditor,
  [node, path]: NodeEntry,
  {
    sameIndent = true,
    sameStyleType = true,
  }: { sameIndent?: boolean; sameStyleType?: boolean } = {}
): NodeEntry | undefined => {
  const indent = node[KEY_INDENT];
  const listStyleType = node[KEY_LIST_STYLE_TYPE];

  let nextPath = Path.next(path);

  while (true) {
    const nextNode = getNode(editor, nextPath);

    // todo indent smaller
    if (!nextNode || !nextNode[KEY_INDENT] || nextNode[KEY_INDENT] < indent) {
      return;
    }

    if (nextNode[KEY_INDENT] === indent) {
      if (sameStyleType && nextNode[KEY_LIST_STYLE_TYPE] !== listStyleType) {
        return;
      }

      return [nextNode, nextPath];
    }

    nextPath = Path.next(nextPath);
  }
};

export const withIndentList = (
  options?: IndentListPluginOptions
): WithOverride<SPEditor> => (editor) => {
  const { apply, normalizeNode } = editor;

  // TODO: extend plate-core to register options
  editor.options[KEY_LIST_STYLE_TYPE] = defaults(
    options,
    {} as IndentListPluginOptions
  );

  const normalizeListStart = (nodeEntry: NodeEntry) => {
    const [node, path] = nodeEntry;
    const listStyleType = node[KEY_LIST_STYLE_TYPE];

    if (listStyleType) {
      const prevNodeEntry = getPreviousIndentList(editor, nodeEntry);
      if (!prevNodeEntry && node[KEY_LIST_START] > 1) {
        setNodes(editor, { [KEY_LIST_START]: 1 }, { at: path });
      }

      const nextNodeEntry = getNextIndentList(editor, nodeEntry);
      if (!nextNodeEntry) return;

      const [nextNode, nextPath] = nextNodeEntry;

      const listStart = node[KEY_LIST_START] ?? 1;
      const nextListStart = nextNode[KEY_LIST_START] ?? 1;

      if (nextListStart !== listStart + 1) {
        setNodes(editor, { [KEY_LIST_START]: listStart + 1 }, { at: nextPath });
        normalizeListStart([nextNode, nextPath]);
      }
    }
  };

  editor.normalizeNode = ([node, path]) => {
    if (node[KEY_LIST_STYLE_TYPE] && !node[KEY_INDENT]) {
      unsetNodes(editor, KEY_LIST_STYLE_TYPE, { at: path });
    }

    normalizeListStart([node, path]);

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
          normalizeListStart([node as any, path]);
          return;
        }

        normalizeListStart(prevNodeEntry);
        // FIXME: delete first list
        // if (nextNodeEntryBefore) {
        //   normalizeListStart(nextNodeEntryBefore);
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

        normalizeListStart(nextNodeEntry);
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
          normalizeListStart(prevNodeEntry);
        }

        /**
         * Case:
         * - 1-<2>-3 <- toggle ul
         * - 1-o-<3> <- normalize
         * - 1-o-1
         */
        const nextNodeEntry = getNextIndentList(editor, [nodeBefore, path]);
        if (nextNodeEntry) {
          normalizeListStart(nextNodeEntry);
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
          normalizeListStart(prevNodeEntry);
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
          normalizeListStart(prevNodeEntry);
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
          normalizeListStart(nextNodeEntry);
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
          normalizeListStart(nextNodeEntry);
        }
      }
    }
  };

  return editor;
};
