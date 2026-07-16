import type { BaseEditor, ExtendPlateEditorExtension } from '@platejs/core';
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

import { isListSequenceBoundary } from './internal/isSameListSequence';
import { getPreviousList } from './queries/getPreviousList';
import { getNextList } from './queries/getNextList';
import {
  getListExpectedListStart,
  normalizeListStart,
} from './normalizers/normalizeListStart';
import { ListStyleType, ULIST_STYLE_TYPES } from './types';

const getSequenceKey = (editor: BaseEditor, node: Element) => {
  const isHeading = KEYS.heading.some(
    (headingKey) => node.type === editor.getType(headingKey)
  );

  return `${node[KEYS.indent]}:${node[KEYS.listType]}:${isHeading}`;
};

const resolveAmbiguousListStyleType = (
  listStyleType: unknown,
  previousListStyleType: unknown
) => {
  if (
    previousListStyleType === ListStyleType.LowerAlpha &&
    listStyleType === ListStyleType.LowerRoman
  ) {
    return ListStyleType.LowerAlpha;
  }
  if (
    previousListStyleType === ListStyleType.UpperAlpha &&
    listStyleType === ListStyleType.UpperRoman
  ) {
    return ListStyleType.UpperAlpha;
  }

  return listStyleType;
};

const normalizeDefaultListSuffix = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  firstEntry: NodeEntry<Element>
) => {
  const previousBySequence = new Map<
    string,
    { entry: NodeEntry<Element>; indent: number }
  >();
  let previousPath = firstEntry[1];
  let minimumIndent = Number.POSITIVE_INFINITY;
  const [firstNode] = firstEntry;
  let previousStyleEntry = getPreviousList<Element>(editor, firstEntry, {
    breakOnEqIndentNeqListStyleType: false,
    eqIndent: false,
  });

  while (PathApi.hasPrevious(previousPath)) {
    previousPath = PathApi.previous(previousPath);

    const previousEntry = editor.read.nodes.get<Element>(previousPath);
    if (!previousEntry) break;

    const previousIndent = Number(previousEntry[0][KEYS.indent]);
    if (!Number.isFinite(previousIndent)) break;
    if (isListSequenceBoundary(editor, previousEntry[0], firstNode)) break;

    if (isListItem(previousEntry[0]) && previousIndent <= minimumIndent) {
      const key = getSequenceKey(editor, previousEntry[0]);

      if (!previousBySequence.has(key)) {
        previousBySequence.set(key, {
          entry: previousEntry,
          indent: previousIndent,
        });
      }
    }

    minimumIndent = Math.min(minimumIndent, previousIndent);
  }

  let entry: NodeEntry<Element> | undefined = firstEntry;

  while (entry) {
    let node = entry[0];
    const path: Path = entry[1];
    const indent = Number(node[KEYS.indent]);

    if (!Number.isFinite(indent)) break;

    const previousStyleNode = previousStyleEntry?.[0];
    const previousStyleIndent = Number(previousStyleNode?.[KEYS.indent]);
    const resolvedListStyleType = resolveAmbiguousListStyleType(
      node[KEYS.listType],
      previousStyleIndent >= indent
        ? previousStyleNode?.[KEYS.listType]
        : undefined
    );

    if (resolvedListStyleType !== node[KEYS.listType]) {
      tx.nodes.set({ [KEYS.listType]: resolvedListStyleType }, { at: path });
      node = { ...node, [KEYS.listType]: resolvedListStyleType };
    }

    const currentEntry: NodeEntry<Element> = [node, path];

    for (const [key, previous] of previousBySequence) {
      if (
        previous.indent > indent ||
        (isListItem(node) &&
          isListSequenceBoundary(editor, previous.entry[0], node))
      ) {
        previousBySequence.delete(key);
      }
    }

    if (!isListItem(node)) {
      previousStyleEntry = currentEntry;
      entry = editor.read.nodes.get<Element>(PathApi.next(path));
      continue;
    }

    const key = getSequenceKey(editor, node);
    const previousEntry = previousBySequence.get(key)?.entry;
    const expectedListStart = getListExpectedListStart(entry, previousEntry);

    normalizeListStart(editor, tx, entry, undefined, previousEntry ?? null);

    previousBySequence.set(key, {
      entry: [
        {
          ...node,
          [KEYS.listStart]: ULIST_STYLE_TYPES.some(
            (listStyleType) => listStyleType === node[KEYS.listType]
          )
            ? undefined
            : expectedListStart > 1
              ? expectedListStart
              : undefined,
        },
        path,
      ],
      indent,
    });
    previousStyleEntry = currentEntry;

    entry = editor.read.nodes.get<Element>(PathApi.next(path));
  }
};

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

            operation.node[KEYS.listType] = resolveAmbiguousListStyleType(
              listStyleType,
              prevListStyleType
            );
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

      if (editor.runtime.isNormalizing) return;

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

        if (entry && !isListItem(entry[0])) {
          const [affectedNode] = entry;
          const staleListKeys = [
            KEYS.listChecked,
            KEYS.listRestart,
            KEYS.listRestartPolite,
            KEYS.listStart,
            KEYS.listType,
          ].filter((key) => Object.hasOwn(affectedNode, key));

          if (staleListKeys.length > 0) {
            tx.nodes.unset(staleListKeys, { at: affectedPath });
          }
        }

        if (!entry || !isListItem(entry[0])) {
          entry = editor.read.nodes.get<Element>(PathApi.next(affectedPath));
        }

        if (entry && !getSiblingListOptions && !editor.runtime.isNormalizing) {
          normalizeDefaultListSuffix(editor, tx, entry);
          continue;
        }

        while (entry && isListItem(entry[0])) {
          normalizeListStart(editor, tx, entry, getSiblingListOptions);

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
