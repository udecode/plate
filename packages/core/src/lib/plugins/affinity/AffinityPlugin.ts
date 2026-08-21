import {
  type Element,
  type EditorStateView,
  type NodeEntry,
  type Point,
  type Text,
  editorCommands,
  ElementApi,
  NodeApi,
  PathApi,
  RangeApi,
  TextApi,
} from '@platejs/plite';
import { findEditorDOMRootRuntime } from '@platejs/plite-dom/internal';
import isEqual from 'lodash/isEqual.js';

import {
  getCompiledPlatePluginByKey,
  getCompiledPlatePluginByType,
} from '../../../internal/plugin/compilePlateModel';
import { defineBasePlugin, type DefinitionOf } from '../../plugin';

export type AffinityEdgeNodes =
  | [NodeEntry<Element | Text>, NodeEntry<Element | Text>]
  | [NodeEntry<Element | Text>, null]
  | [null, NodeEntry<Element | Text>];

type EdgeNodeState = Pick<
  EditorStateView,
  'nodes' | 'points' | 'ranges' | 'selection'
>;

export type AffinityPluginUpdate = {
  setSelection: (
    edgeNodes: AffinityEdgeNodes,
    affinity: 'backward' | 'forward'
  ) => void;
};

export const AffinityPlugin = defineBasePlugin('affinity', {
  update: ({ tx }): AffinityPluginUpdate => ({
    setSelection: (edgeNodes, affinity) => {
      const select = (point: Point) => {
        tx.selection.set({ anchor: point, focus: point });
      };
      const [before, after] = edgeNodes;

      if (affinity === 'backward') {
        if (before === null) {
          tx.marks.set({});

          return;
        }

        const beforeEnd = tx.points.end(before[1]);

        if (beforeEnd) select(beforeEnd);
        if (ElementApi.isElement(before[0])) return;

        tx.marks.set(null);

        return;
      }

      if (before === null) {
        tx.marks.set(null);

        return;
      }
      if (after === null) {
        tx.marks.set({});

        return;
      }

      const beforeEnd = tx.points.end(before[1]);

      if (!beforeEnd) return;

      select(beforeEnd);
      if (ElementApi.isElement(after[0])) return;

      tx.marks.set(NodeApi.extractProps(after[0]));
    },
  }),
}).extend(({ editor, plugin }) => {
  const hasElement = (edgeNodes: AffinityEdgeNodes) => {
    const [before, after] = edgeNodes;

    return (
      (before && ElementApi.isElement(before[0])) ||
      (after && ElementApi.isElement(after[0]))
    );
  };

  const getEdgeNodes = (state: EdgeNodeState): AffinityEdgeNodes | null => {
    if (!state.selection.isCollapsed()) return null;

    const selection = state.selection();
    if (!selection) return null;

    const cursor = selection.anchor;
    const textRange = state.ranges.get(cursor.path);

    if (!textRange) return null;

    const edge = state.points.isStart(cursor, textRange)
      ? 'start'
      : state.points.isEnd(cursor, textRange)
        ? 'end'
        : null;

    if (!edge) return null;

    const parent =
      (state.nodes.parent(cursor.path)?.[0] as Element | undefined) ?? null;
    const parentAffinity =
      parent && ElementApi.isElement(parent)
        ? getCompiledPlatePluginByType(editor, parent.type)?.rules.selection
            ?.affinity
        : undefined;
    const isAffinityInlineElement =
      parentAffinity === 'hard' || parentAffinity === 'directional';
    const currentNode = state.nodes.get(cursor.path)?.[0];

    if (
      !isAffinityInlineElement &&
      (!currentNode || !NodeApi.isDescendant(currentNode))
    ) {
      return null;
    }

    const nodeEntry: NodeEntry<Element | Text> = isAffinityInlineElement
      ? [parent!, PathApi.parent(cursor.path)]
      : [currentNode as Element | Text, cursor.path];

    if (
      edge === 'start' &&
      cursor.path.at(-1) === 0 &&
      !isAffinityInlineElement
    ) {
      return [null, nodeEntry];
    }

    const siblingPath =
      edge === 'end'
        ? PathApi.next(nodeEntry[1])
        : PathApi.previous(nodeEntry[1]);
    const siblingCandidate = state.nodes.get(siblingPath)?.[0];
    const siblingNode =
      siblingCandidate && TextApi.isText(siblingCandidate)
        ? siblingCandidate
        : undefined;
    const siblingEntry: NodeEntry<Text> | null = siblingNode
      ? [siblingNode, siblingPath]
      : null;

    return edge === 'end'
      ? [nodeEntry, siblingEntry]
      : [siblingEntry, nodeEntry];
  };
  const isNodeAffinity = (
    node: Element | Text,
    affinity: 'directional' | 'hard' | 'outward'
  ) => {
    if (ElementApi.isElement(node)) {
      return (
        getCompiledPlatePluginByType(editor, node.type)?.rules.selection
          ?.affinity === affinity
      );
    }

    return Object.keys(NodeApi.extractProps(node)).some(
      (key) =>
        getCompiledPlatePluginByKey(editor, key)?.rules.selection?.affinity ===
        affinity
    );
  };
  const isNodesAffinity = (
    edgeNodes: AffinityEdgeNodes,
    affinity: 'directional' | 'hard' | 'outward'
  ) => {
    const [backwardLeafEntry, forwardLeafEntry] = edgeNodes;

    return (
      (backwardLeafEntry && isNodeAffinity(backwardLeafEntry[0], affinity)) ||
      (forwardLeafEntry && isNodeAffinity(forwardLeafEntry[0], affinity))
    );
  };
  const getMarkBoundaryAffinity = (
    markBoundary: AffinityEdgeNodes,
    state: Pick<EditorStateView, 'marks' | 'selection'>
  ): 'backward' | 'forward' | undefined => {
    const selection = state.selection();
    if (!selection) return;

    const currentMarks = state.marks();
    const boundaryMarks =
      currentMarks && Object.keys(currentMarks).length > 1
        ? currentMarks
        : null;
    const marksMatchLeaf = (leaf: Element | Text) =>
      Boolean(
        boundaryMarks && isEqual(NodeApi.extractProps(leaf), boundaryMarks)
      );
    const [backwardLeafEntry, forwardLeafEntry] = markBoundary;

    if (!backwardLeafEntry || !forwardLeafEntry) {
      const leafEntry = backwardLeafEntry || forwardLeafEntry;
      const affinityIsTowardsLeaf =
        !boundaryMarks || marksMatchLeaf(leafEntry[0]);

      if (affinityIsTowardsLeaf) {
        return leafEntry === backwardLeafEntry ? 'backward' : 'forward';
      }

      return;
    }

    const marksDirection: 'backward' | 'forward' | null = boundaryMarks
      ? (() => {
          if (marksMatchLeaf(backwardLeafEntry[0])) return 'backward';
          if (marksMatchLeaf(forwardLeafEntry[0])) return 'forward';

          return null;
        })()
      : null;
    const selectionDirection =
      selection.anchor.offset === 0 ? 'forward' : 'backward';

    if (selectionDirection === 'backward' && marksDirection === 'forward') {
      return 'forward';
    }

    if (
      findEditorDOMRootRuntime(editor)?.isGeckoHost &&
      selectionDirection === 'forward' &&
      marksDirection !== 'backward'
    ) {
      return 'forward';
    }

    return 'backward';
  };
  return {
    commands: ({ around }) => [
      around(editorCommands.delete, ({ input, state, next }) => {
        if (
          input.direction !== 'backward' ||
          input.unit !== 'character' ||
          !state.selection.isCollapsed()
        ) {
          return false;
        }

        const [start] = getEdgeNodes(state) ?? [null];
        const startText =
          start &&
          (NodeApi.isText(start[0]) ? start[0].text : NodeApi.string(start[0]));
        const result = next();

        if (result === false) return false;

        return state.transaction.extend(result, (tx) => {
          const edgeNodes = getEdgeNodes(tx);

          if (
            edgeNodes &&
            isNodesAffinity(edgeNodes, 'directional') &&
            !hasElement(edgeNodes)
          ) {
            const affinity =
              startText && startText.length > 1 ? 'backward' : 'forward';

            tx.plugin(plugin).setSelection(edgeNodes, affinity);
          }
        });
      }),
      around(editorCommands.insertText, ({ state, next }) => {
        const selection = state.selection();

        if (!selection || RangeApi.isExpanded(selection)) return next();

        const textPath = selection.focus.path;
        const textCandidate = state.nodes.get(textPath)?.[0];
        const textNode =
          textCandidate && TextApi.isText(textCandidate)
            ? textCandidate
            : undefined;

        if (!textNode) return next();

        const marks = Object.keys(NodeApi.extractProps(textNode));
        const outwardMarks = marks.filter(
          (key) =>
            getCompiledPlatePluginByKey(editor, key)?.rules.selection
              ?.affinity === 'outward'
        );

        if (
          !outwardMarks.length ||
          !state.points.isEnd(selection.focus, textPath)
        ) {
          return next();
        }

        const nextPoint = state.points.after(textPath);
        const nextCandidate = nextPoint
          ? state.nodes.get(nextPoint.path)?.[0]
          : undefined;
        const nextTextNode =
          nextCandidate && TextApi.isText(nextCandidate) ? nextCandidate : null;
        const marksToRemove = outwardMarks.filter(
          (markKey) => textNode[markKey] && !nextTextNode?.[markKey]
        );
        const prefix = state.transaction((tx) => {
          outwardMarks.forEach((markKey) => {
            tx.marks.add(markKey, textNode[markKey]);
          });
          marksToRemove.forEach((markKey) => {
            tx.marks.remove(markKey);
          });
        });

        return next.after(prefix);
      }),
      around(editorCommands.move, ({ input, state, next }) => {
        const {
          distance = 1,
          reverse = false,
          unit = 'character',
        } = input.options ?? {};

        if (
          unit === 'character' &&
          distance === 1 &&
          state.selection.isCollapsed()
        ) {
          const preEdgeNodes = getEdgeNodes(state);

          if (preEdgeNodes && isNodesAffinity(preEdgeNodes, 'hard')) {
            if (
              preEdgeNodes[reverse ? 0 : 1] === null &&
              getMarkBoundaryAffinity(preEdgeNodes, state) ===
                (reverse ? 'forward' : 'backward')
            ) {
              return state.transaction((tx) => {
                tx.plugin(plugin).setSelection(
                  preEdgeNodes,
                  reverse ? 'backward' : 'forward'
                );
              });
            }

            return next({
              ...input,
              options: { ...input.options, unit: 'offset' },
            });
          }

          const result = next();

          if (result === false) return false;

          return state.transaction.extend(result, (tx) => {
            const postEdgeNodes = getEdgeNodes(tx);

            if (
              postEdgeNodes &&
              isNodesAffinity(postEdgeNodes, 'directional') &&
              !hasElement(postEdgeNodes)
            ) {
              tx.plugin(plugin).setSelection(
                postEdgeNodes,
                reverse ? 'forward' : 'backward'
              );
            }
          });
        }

        return next();
      }),
    ],
  };
});

export type AffinityDefinition = DefinitionOf<typeof AffinityPlugin>;
