import type { BaseEditor, PlateEditorExtension } from '@platejs/core';
import {
  type Descendant,
  type EditorDocumentValue,
  editorCommands,
  type EditorTransactionTopLevelRange,
  type EditorTransactionSpecBuilder,
  type EditorUpdateTransaction,
  type Element,
  type NodeEntry,
  type Path,
  ElementApi,
  PathApi,
  TextApi,
} from '@platejs/plite';
import { withEditorUpdateRootScope } from '@platejs/plite/internal';
import { KEYS } from '@platejs/utils';
import isEqual from 'lodash/isEqual.js';

import type { BaseListPluginOptions } from './BaseListPlugin';

import { isListSequenceBoundary } from './internal/isSameListSequence';
import { getPreviousList } from './queries/getPreviousList';
import { getNextList } from './queries/getNextList';
import {
  getListExpectedListStart,
  normalizeListStart,
} from './normalizers/normalizeListStart';
import { ListStyleType, ULIST_STYLE_TYPES } from './types';

const LIST_CHANGE_GUARD = new WeakSet<object>();

const getRootChildren = (value: EditorDocumentValue, root: string | null) =>
  (root === null
    ? value.children
    : (value.roots?.[root] ?? [])) as readonly Descendant[];

const isSameNodeKind = (left: Descendant, right: Descendant) =>
  TextApi.isText(left)
    ? TextApi.isText(right)
    : ElementApi.isElement(right) && left.type === right.type;

const getStructuralKey = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(getStructuralKey).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${getStructuralKey(
            (value as Record<string, unknown>)[key]
          )}`
      )
      .join(',')}}`;
  }

  return JSON.stringify(value) ?? 'undefined';
};

const collectInsertedTopLevelIndices = (
  beforeChildren: readonly Descendant[],
  afterChildren: readonly Descendant[],
  ranges: readonly EditorTransactionTopLevelRange[]
) => {
  const inserted = new Set<number>();
  const windows =
    ranges.length > 0
      ? ranges
      : [
          {
            after:
              afterChildren.length > 0
                ? ([0, afterChildren.length - 1] as const)
                : null,
            before:
              beforeChildren.length > 0
                ? ([0, beforeChildren.length - 1] as const)
                : null,
          },
        ];

  for (const range of windows) {
    if (!range.after) continue;

    const beforeIndices = range.before
      ? Array.from(
          { length: range.before[1] - range.before[0] + 1 },
          (_, offset) => range.before![0] + offset
        )
      : [];
    const afterIndices = Array.from(
      { length: range.after[1] - range.after[0] + 1 },
      (_, offset) => range.after![0] + offset
    );
    const availableBefore = new Set(beforeIndices);
    const unmatchedAfter = new Set(afterIndices);
    const claimByKey = (
      keyOf: (node: Descendant) => object | string | undefined
    ) => {
      const beforeByKey = new Map<object | string, number[]>();

      for (const beforeIndex of availableBefore) {
        const key = keyOf(beforeChildren[beforeIndex]!);

        if (key === undefined) continue;
        const candidates = beforeByKey.get(key) ?? [];
        candidates.push(beforeIndex);
        beforeByKey.set(key, candidates);
      }

      for (const afterIndex of unmatchedAfter) {
        const key = keyOf(afterChildren[afterIndex]!);
        const beforeIndex =
          key === undefined ? undefined : beforeByKey.get(key)?.shift();

        if (beforeIndex === undefined) continue;
        availableBefore.delete(beforeIndex);
        unmatchedAfter.delete(afterIndex);
      }
    };

    claimByKey((node) => node);
    claimByKey((node) => {
      const id = (node as Record<string, unknown>).id;

      return id === undefined
        ? undefined
        : `${ElementApi.isElement(node) ? node.type : 'text'}:${String(id)}`;
    });
    claimByKey(getStructuralKey);

    for (const afterIndex of [...unmatchedAfter]) {
      if (
        availableBefore.has(afterIndex) &&
        isSameNodeKind(afterChildren[afterIndex]!, beforeChildren[afterIndex]!)
      ) {
        availableBefore.delete(afterIndex);
        unmatchedAfter.delete(afterIndex);
      }
    }

    unmatchedAfter.forEach((index) => {
      inserted.add(index);
    });
  }

  return [...inserted].sort((left, right) => left - right);
};

const isSplitTopLevelIndex = (
  beforeChildren: readonly Descendant[],
  afterChildren: readonly Descendant[],
  index: number
) => {
  if (index === 0) return false;

  const beforeNode = beforeChildren[index - 1];
  const leftNode = afterChildren[index - 1];
  const rightNode = afterChildren[index];

  return (
    !!beforeNode &&
    !!leftNode &&
    !!rightNode &&
    ElementApi.isElement(beforeNode) &&
    ElementApi.isElement(leftNode) &&
    ElementApi.isElement(rightNode) &&
    beforeNode.type === leftNode.type &&
    beforeNode.type === rightNode.type &&
    !isEqual(beforeNode, leftNode) &&
    isEqual([...leftNode.children, ...rightNode.children], beforeNode.children)
  );
};

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
  let previousStyleEntry = getPreviousList<Element>(
    editor,
    firstEntry,
    {
      breakOnEqIndentNeqListStyleType: false,
      eqIndent: false,
    },
    tx
  );

  while (PathApi.hasPrevious(previousPath)) {
    previousPath = PathApi.previous(previousPath);

    const previousEntry = tx.nodes.get<Element>(previousPath);
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
      entry = tx.nodes.get<Element>(PathApi.next(path));
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

    entry = tx.nodes.get<Element>(PathApi.next(path));
  }
};

const outdentListBlock = (
  tx: Pick<EditorTransactionSpecBuilder, 'nodes'>,
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

type ListExtensionContext = {
  editor: BaseEditor;
  getOptions: () => BaseListPluginOptions;
};

export const withList = ({
  editor,
  getOptions,
}: ListExtensionContext): PlateEditorExtension => ({
  commands: ({ around, handle }) => [
    handle(editorCommands.delete, ({ input, state }) => {
      if (input.direction !== 'backward') return false;

      const nodeEntry = state.nodes.block<Element>();
      const selection = state.selection();
      const blockStart = nodeEntry
        ? state.points.start(nodeEntry[1])
        : undefined;
      const isAtBlockStart =
        !!nodeEntry &&
        !!selection &&
        (state.points.isStart(selection.anchor, nodeEntry[1]) ||
          (!!blockStart &&
            state.text.string({
              anchor: blockStart,
              focus: selection.anchor,
            }) === ''));

      if (
        !nodeEntry ||
        !selection ||
        !nodeEntry[0][KEYS.listType] ||
        state.selection.isExpanded() ||
        !isAtBlockStart
      ) {
        return false;
      }

      return state.transaction((tx) => {
        outdentListBlock(tx, nodeEntry);
      });
    }),
    around(editorCommands.insertBreak, ({ state, next }) => {
      const nodeEntry = state.nodes.block<Element>();
      const selection = state.selection();

      if (
        !nodeEntry ||
        !selection ||
        !nodeEntry[0][KEYS.listType] ||
        state.selection.isExpanded()
      ) {
        return false;
      }

      if (state.nodes.isEmpty(nodeEntry[0])) {
        return state.transaction((tx) => {
          outdentListBlock(tx, nodeEntry);
        });
      }

      const inserted = next();

      if (inserted === false) return false;

      return state.transaction.extend(inserted, (tx) => {
        const nextPath = PathApi.next(nodeEntry[1]);
        const nextNode = tx.nodes.get<Element>(nextPath)?.[0];
        const staleRestartKeys = [
          KEYS.listRestart,
          KEYS.listRestartPolite,
        ].filter((key) => nextNode && Object.hasOwn(nextNode, key));

        if (staleRestartKeys.length > 0) {
          tx.nodes.unset(staleRestartKeys, { at: nextPath });
        }
      });
    }),
  ],
  priority: 100,
  onTransactionChange({ after, before, change, changed, tx }) {
    if (editor.runtime.isNormalizing || LIST_CHANGE_GUARD.has(tx)) return;

    LIST_CHANGE_GUARD.add(tx);

    try {
      const { getSiblingListOptions } = getOptions();
      const roots = new Set<string | null>([
        ...(change.primary ? [null] : []),
        ...change.roots.keys(),
        ...change.createRoots,
      ]);

      for (const root of roots) {
        const namedRoot = root ?? undefined;
        const propertiesChanged = changed.has('properties', namedRoot);
        const structureChanged = changed.has('structure', namedRoot);

        if (!propertiesChanged && !structureChanged) continue;

        const beforeChildren = getRootChildren(before, root);
        const afterChildren = getRootChildren(after, root);
        const paths = changed.paths(namedRoot);
        const insertedIndices = structureChanged
          ? collectInsertedTopLevelIndices(
              beforeChildren,
              afterChildren,
              changed.topLevelRanges(namedRoot)
            )
          : [];
        const affectedIndices = new Set<number>();
        const affectAll =
          paths.length === 0 || paths.some((path) => path.length === 0);

        if (affectAll) {
          afterChildren.forEach((_, index) => {
            affectedIndices.add(index);
          });
        } else {
          paths.forEach((path) => {
            const index = path[0];

            if (index === undefined) return;

            affectedIndices.add(index);
            if (index > 0) affectedIndices.add(index - 1);
            if (index + 1 < afterChildren.length) {
              affectedIndices.add(index + 1);
            }
          });
        }

        insertedIndices.forEach((index) => {
          affectedIndices.add(index);
        });

        withEditorUpdateRootScope(editor, root, () => {
          if (getSiblingListOptions) {
            const changedPaths: Path[] =
              paths.length && !paths.some((path) => path.length === 0)
                ? paths.map((path) => [...path])
                : [[]];

            for (const path of changedPaths) {
              const nodeEntry = tx.nodes.get(path);
              let entry =
                nodeEntry && ElementApi.isElement(nodeEntry[0])
                  ? ([nodeEntry[0], nodeEntry[1]] as NodeEntry<Element>)
                  : undefined;

              if (!entry || !isListItem(entry[0])) {
                entry = tx.nodes.find<Element>({
                  at: path,
                  match: (node): node is Element =>
                    ElementApi.isElement(node) && isListItem(node),
                });
              }

              while (entry && isListItem(entry[0])) {
                normalizeListStart(editor, tx, entry, getSiblingListOptions);

                entry = getNextList<Element>(
                  editor,
                  entry,
                  {
                    ...getSiblingListOptions,
                    breakOnEqIndentNeqListStyleType: false,
                    breakOnLowerIndent: false,
                    eqIndent: false,
                  },
                  tx
                );
              }
            }

            return;
          }

          for (const index of insertedIndices) {
            if (!isSplitTopLevelIndex(beforeChildren, afterChildren, index)) {
              continue;
            }

            const path: Path = [index];
            const node = tx.nodes.get<Element>(path)?.[0];
            const staleRestartKeys = [
              KEYS.listRestart,
              KEYS.listRestartPolite,
            ].filter((key) => node && Object.hasOwn(node, key));

            if (staleRestartKeys.length > 0) {
              tx.nodes.unset(staleRestartKeys, { at: path });
            }
          }

          /**
           * Roman and alpha markers overlap. Resolve only canonical insertions
           * against the preceding sequence; existing nodes retain their style.
           */
          for (const index of insertedIndices) {
            const path: Path = [index];
            const entry = tx.nodes.get<Element>(path);
            const listStyleType = entry?.[0][KEYS.listType];

            if (
              !entry ||
              typeof listStyleType !== 'string' ||
              !['lower-roman', 'upper-roman'].includes(listStyleType)
            ) {
              continue;
            }

            const previousEntry = getPreviousList<Element>(
              editor,
              entry,
              {
                breakOnEqIndentNeqListStyleType: false,
                eqIndent: false,
              },
              tx
            );
            const resolvedListStyleType = resolveAmbiguousListStyleType(
              listStyleType,
              previousEntry?.[0][KEYS.listType]
            );

            if (resolvedListStyleType !== listStyleType) {
              tx.nodes.set(
                { [KEYS.listType]: resolvedListStyleType },
                { at: path }
              );
            }
          }

          for (const index of [...affectedIndices].sort(
            (left, right) => left - right
          )) {
            const affectedPath: Path = [index];
            let entry = tx.nodes.get<Element>(affectedPath);

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
              entry = tx.nodes.get<Element>(PathApi.next(affectedPath));
            }

            if (entry) {
              normalizeDefaultListSuffix(editor, tx, entry);
            }
          }
        });
      }
    } finally {
      LIST_CHANGE_GUARD.delete(tx);
    }
  },
});

const isListItem = (node: Element) => node[KEYS.listType] != null;
