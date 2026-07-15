import type { ExtendPlateEditorExtension } from '@platejs/core';
import {
  type EditorUpdateTransaction,
  type Element,
  type NodeEntry,
  type Path,
  ElementApi,
  PathApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { BaseListConfig } from './BaseListPlugin';

import { getPreviousList } from './queries/getPreviousList';
import { getNextList } from './queries/getNextList';
import { normalizeListStart } from './normalizers/normalizeListStart';
import { ListStyleType } from './types';

const outdentListBlock = (
  tx: EditorUpdateTransaction,
  [node, path]: NodeEntry<Element>
) => {
  const indent = Number(node[KEYS.indent] ?? 0);

  if (indent > 1) {
    tx.nodes.set({ [KEYS.indent]: indent - 1 }, { at: path });
  } else {
    tx.nodes.unset(
      [
        KEYS.indent,
        KEYS.listChecked,
        KEYS.listRestart,
        KEYS.listRestartPolite,
        KEYS.listStart,
        KEYS.listType,
      ],
      { at: path }
    );
  }
};

export const withList: ExtendPlateEditorExtension<BaseListConfig> = ({
  editor,
  getOptions,
}) => ({
  priority: 100,
  transforms: {
    deleteBackward({ next, tx, unit }) {
      const nodeEntry = tx.nodes.block<Element>();
      const selection = tx.selection();
      const blockStart = nodeEntry ? tx.points.start(nodeEntry[1]) : undefined;
      const isAtBlockStart =
        !!nodeEntry &&
        !!selection &&
        (tx.points.isStart(selection.anchor, nodeEntry[1]) ||
          (!!blockStart &&
            editor.read.text.string({
              anchor: blockStart,
              focus: selection.anchor,
            }) === ''));

      if (
        !nodeEntry ||
        !selection ||
        !nodeEntry[0][KEYS.listType] ||
        tx.selection.isExpanded() ||
        !isAtBlockStart
      ) {
        return next({ unit });
      }

      outdentListBlock(tx, nodeEntry);

      return true;
    },
    insertBreak({ next, tx }) {
      const nodeEntry = tx.nodes.block<Element>();
      const selection = tx.selection();

      if (
        !nodeEntry ||
        !selection ||
        !nodeEntry[0][KEYS.listType] ||
        tx.selection.isExpanded() ||
        !tx.nodes.isEmpty(nodeEntry[0])
      ) {
        return next();
      }

      outdentListBlock(tx, nodeEntry);

      return true;
    },
  },
  operations: {
    apply({ operation, next, tx }) {
      const { getSiblingListOptions } = getOptions();

      /**
       * Roman and alpha list markers overlap. Preserve the preceding sequence
       * when an inserted item uses the ambiguous marker.
       */
      if (
        operation.type === 'insert_node' &&
        ElementApi.isElement(operation.node)
      ) {
        const listStyleType = operation.node[KEYS.listType];

        if (
          typeof listStyleType === 'string' &&
          ['lower-roman', 'upper-roman'].includes(listStyleType)
        ) {
          const prevNodeEntry = getPreviousList<Element>(
            editor,
            [operation.node, operation.path],
            {
              breakOnEqIndentNeqListStyleType: false,
              eqIndent: false,
              ...getSiblingListOptions,
            }
          );

          if (prevNodeEntry) {
            const prevListStyleType = prevNodeEntry[0][KEYS.listType];

            if (
              prevListStyleType === ListStyleType.LowerAlpha &&
              listStyleType === ListStyleType.LowerRoman
            ) {
              operation.node[KEYS.listType] = ListStyleType.LowerAlpha;
            } else if (
              prevListStyleType === ListStyleType.UpperAlpha &&
              listStyleType === ListStyleType.UpperRoman
            ) {
              operation.node[KEYS.listType] = ListStyleType.UpperAlpha;
            }
          }
        }
      }

      if (
        operation.type === 'split_node' &&
        operation.properties[KEYS.listType]
      ) {
        delete operation.properties[KEYS.listRestart];
        delete operation.properties[KEYS.listRestartPolite];
      }

      next(operation);

      const affectedPaths: Path[] = [];

      switch (operation.type) {
        case 'insert_node':
        case 'remove_node':
        case 'set_node': {
          affectedPaths.push(operation.path);
          break;
        }
        case 'merge_node': {
          if (PathApi.hasPrevious(operation.path)) {
            affectedPaths.push(PathApi.previous(operation.path));
          }
          break;
        }
        case 'move_node': {
          affectedPaths.push(operation.path, operation.newPath);
          break;
        }
        case 'split_node': {
          affectedPaths.push(operation.path, PathApi.next(operation.path));
          break;
        }
      }

      for (const affectedPath of affectedPaths) {
        let entry = editor.read.nodes.get<Element>(affectedPath);

        if (!entry || !isListItem(entry[0])) {
          entry = editor.read.nodes.get<Element>(PathApi.next(affectedPath));
        }

        while (entry && isListItem(entry[0])) {
          if (normalizeListStart(editor, tx, entry, getSiblingListOptions)) {
            break;
          }

          entry = getNextList<Element>(editor, entry, {
            ...getSiblingListOptions,
            breakOnEqIndentNeqListStyleType: false,
            breakOnLowerIndent: false,
            eqIndent: false,
          });
        }
      }
    },
  },
});

const isListItem = (node: Element) => node[KEYS.listType] != null;
