import { Extension } from '@core/Extension.js';
import { helpers } from '@core/index.js';
import { Plugin, PluginKey } from 'prosemirror-state';
import { ReplaceStep } from 'prosemirror-transform';
import { v4 as uuidv4 } from 'uuid';

const { findChildren } = helpers;
const SD_BLOCK_ID_ATTRIBUTE_NAME = 'sdBlockId';
export const BlockNodePluginKey = new PluginKey('blockNodePlugin');
export const BlockNode = Extension.create({
  name: 'blockNode',

  addCommands() {
    return {
      replaceBlockNodeById:
        (id, contentNode) =>
        ({ dispatch, tr }) => {
          const blockNode = this.editor.helpers.blockNode.getBlockNodeById(id);
          if (!blockNode || blockNode.length > 1) {
            return false;
          }

          if (dispatch) {
            let { pos, node } = blockNode[0];
            let newPosFrom = tr.mapping.map(pos);
            let newPosTo = tr.mapping.map(pos + node.nodeSize);

            let currentNode = tr.doc.nodeAt(newPosFrom);
            if (node.eq(currentNode)) {
              tr.replaceWith(newPosFrom, newPosTo, contentNode);
            }
          }

          return true;
        },

      deleteBlockNodeById:
        (id) =>
        ({ dispatch, tr }) => {
          const blockNode = this.editor.helpers.blockNode.getBlockNodeById(id);
          if (!blockNode || blockNode.length > 1) {
            return false;
          }

          if (dispatch) {
            let { pos, node } = blockNode[0];
            let newPosFrom = tr.mapping.map(pos);
            let newPosTo = tr.mapping.map(pos + node.nodeSize);

            let currentNode = tr.doc.nodeAt(newPosFrom);
            if (node.eq(currentNode)) {
              tr.delete(newPosFrom, newPosTo);
            }
          }

          return true;
        },

      updateBlockNodeAttributes:
        (id, attrs = {}) =>
        ({ dispatch, tr }) => {
          const blockNode = this.editor.helpers.blockNode.getBlockNodeById(id);
          if (!blockNode || blockNode.length > 1) {
            return false;
          }
          if (dispatch) {
            let { pos, node } = blockNode[0];
            let newPos = tr.mapping.map(pos);
            let currentNode = tr.doc.nodeAt(newPos);
            if (node.eq(currentNode)) {
              tr.setNodeMarkup(newPos, undefined, {
                ...node.attrs,
                ...attrs,
              });
            }

            return true;
          }
        },
    };
  },

  addHelpers() {
    return {
      getBlockNodes: () => {
        return findChildren(this.editor.state.doc, (node) => nodeAllowsSdBlockIdAttr(node));
      },

      getBlockNodeById: (id) => {
        return findChildren(this.editor.state.doc, (node) => node.attrs.sdBlockId === id);
      },

      getBlockNodesByType: (type) => {
        return findChildren(this.editor.state.doc, (node) => node.type.name === type);
      },

      getBlockNodesInRange: (from, to) => {
        let blockNodes = [];

        this.editor.state.doc.nodesBetween(from, to, (node, pos) => {
          if (nodeAllowsSdBlockIdAttr(node)) {
            blockNodes.push({
              node,
              pos,
            });
          }
        });

        return blockNodes;
      },
    };
  },
  addPmPlugins() {
    let hasInitialized = false;

    return [
      new Plugin({
        key: BlockNodePluginKey,
        appendTransaction: (transactions, _oldState, newState) => {
          if (hasInitialized && !transactions.some((tr) => tr.docChanged)) return null;

          // Check for new block nodes and if none found, we don't need to do anything
          if (hasInitialized && !checkForNewBlockNodesInTrs(transactions)) return null;

          let tr = null;
          let changed = false;
          newState.doc.descendants((node, pos) => {
            // Only allow block nodes with a valid sdBlockId attribute
            if (!nodeAllowsSdBlockIdAttr(node) || !nodeNeedsSdBlockId(node)) return null;

            tr = tr ?? newState.tr;
            tr.setNodeMarkup(
              pos,
              undefined,
              {
                ...node.attrs,
                sdBlockId: uuidv4(),
              },
              node.marks,
            );
            changed = true;
          });

          if (changed && !hasInitialized) hasInitialized = true;
          return changed ? tr : null;
        },
      }),
    ];
  },
});

/**
 * Check if a node allows sdBlockId attribute
 * @param {import("prosemirror-model").Node} node - The node to check
 * @returns {boolean} - True if the node type supports sdBlockId attribute
 */
export const nodeAllowsSdBlockIdAttr = (node) => {
  return !!(node?.isBlock && node?.type?.spec?.attrs?.[SD_BLOCK_ID_ATTRIBUTE_NAME]);
};

/**
 * Check if a node needs an sdBlockId (doesn't have one or has null/empty value)
 * @param {import("prosemirror-model").Node} node - The node to check
 * @returns {boolean} - True if the node needs an sdBlockId assigned
 */
export const nodeNeedsSdBlockId = (node) => {
  const currentId = node?.attrs?.[SD_BLOCK_ID_ATTRIBUTE_NAME];
  return !currentId;
};

/**
 * Check for new block nodes in ProseMirror transactions.
 * Iterate through the list of transactions, and in each tr check if there are any new block nodes.
 * @param {Array<Transaction>} transactions - The ProseMirror transactions to check.
 * @returns {boolean} - True if new block nodes are found, false otherwise.
 */
export const checkForNewBlockNodesInTrs = (transactions) => {
  return transactions.some((tr) => {
    return tr.steps.some((step) => {
      const hasValidSdBlockNodes = step.slice?.content?.content?.some((node) => nodeAllowsSdBlockIdAttr(node));
      return step instanceof ReplaceStep && hasValidSdBlockNodes;
    });
  });
};
