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
} from '@platejs/plite';
import { findEditorDOMRootRuntime } from '@platejs/plite-dom/internal';
import isEqual from 'lodash/isEqual.js';

import { createBasePlugin, type DefinitionOf } from '../../plugin';
import { getCompiledPlatePluginByType } from '../../../internal/plugin/compilePlateModel';

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

export const AffinityPlugin = createBasePlugin({
  name: 'affinity',
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
    const currentNode = state.nodes.get<Element | Text>(cursor.path)?.[0];

    if (!isAffinityInlineElement && !currentNode) return null;

    const nodeEntry: NodeEntry<Element | Text> = isAffinityInlineElement
      ? [parent!, PathApi.parent(cursor.path)]
      : [currentNode!, cursor.path];

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
    const siblingNode = state.nodes.get<Text>(siblingPath)?.[0];
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
    const marks = Object.keys(NodeApi.extractProps(node));
    const keys = ElementApi.isElement(node) ? [node.type] : marks;

    return keys.some(
      (type) =>
        getCompiledPlatePluginByType(editor, type)?.rules.selection
          ?.affinity === affinity
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

            tx[plugin.name].setSelection(edgeNodes, affinity);
          }
        });
      }),
      around(editorCommands.insertText, ({ state, next }) => {
        const prefix = state.transaction((tx) => {
          const selection = state.selection();

          if (!selection || RangeApi.isExpanded(selection)) return;

          const textPath = selection.focus.path;
          const textNode = state.nodes.get<Text>(textPath)?.[0];

          if (!textNode) return;

          const marks = Object.keys(NodeApi.extractProps(textNode));
          const outwardMarks = marks.filter(
            (type) =>
              getCompiledPlatePluginByType(editor, type)?.rules.selection
                ?.affinity === 'outward'
          );

          if (
            !outwardMarks.length ||
            !state.points.isEnd(selection.focus, textPath)
          ) {
            return;
          }

          const nextPoint = state.points.after(textPath);
          const nextTextNode = nextPoint
            ? (state.nodes.get<Text>(nextPoint.path)?.[0] ?? null)
            : null;
          const marksToRemove = outwardMarks.filter(
            (markKey) => textNode[markKey] && !nextTextNode?.[markKey]
          );

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
                tx[plugin.name].setSelection(
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
              tx[plugin.name].setSelection(
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
