import {
  type EditorUpdateTransaction,
  type EditorStateView,
  type Path,
  type Text,
  editorCommands,
  ElementApi,
  NodeApi,
  RangeApi,
} from '@platejs/plite';

import type { BaseEditor } from '../../editor';
import type { EdgeNodes } from './types';

import { getPluginByType } from '../../plugin';
import { createBasePlugin } from '../../plugin';
import { getEdgeNodes } from './queries';
import { getMarkBoundaryAffinity } from './queries/getMarkBoundaryAffinity';
import { isNodesAffinity } from './queries/isNodeAffinity';
import { setAffinitySelection } from './transforms/setAffinitySelection';

export type ElementAffinity = {
  affinity: 'backward' | 'forward';
  at: Path;
  type: string;
};

export const AffinityPlugin = createBasePlugin({
  key: 'affinity',
  extension: ({ editor }) => ({
    commands: ({ around }) => [
      around(editorCommands.delete, ({ input, state, next }) => {
        if (
          input.direction !== 'backward' ||
          input.unit !== 'character' ||
          !state.selection.isCollapsed()
        ) {
          return false;
        }

        const [start] = getEdgeNodes(editor, state) ?? [null];
        const startText =
          start &&
          (NodeApi.isText(start[0]) ? start[0].text : NodeApi.string(start[0]));
        const result = next();

        if (result === false) return false;

        return state.transaction.extend(result, (tx) => {
          const edgeNodes = getEdgeNodes(editor, tx);

          if (
            edgeNodes &&
            isNodesAffinity(editor, edgeNodes, 'directional') &&
            !hasElement(edgeNodes)
          ) {
            const affinity =
              startText && startText.length > 1 ? 'backward' : 'forward';

            setAffinitySelection(edgeNodes, affinity, tx);
          }
        });
      }),
      around(editorCommands.insertText, ({ state, next }) => {
        const prefix = state.transaction((tx) => {
          applyOutwardAffinity(editor, state, tx);
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
          const preEdgeNodes = getEdgeNodes(editor, state);

          if (preEdgeNodes && isNodesAffinity(editor, preEdgeNodes, 'hard')) {
            if (
              preEdgeNodes[reverse ? 0 : 1] === null &&
              getMarkBoundaryAffinity(editor, preEdgeNodes, state) ===
                (reverse ? 'forward' : 'backward')
            ) {
              return state.transaction((tx) => {
                setAffinitySelection(
                  preEdgeNodes,
                  reverse ? 'backward' : 'forward',
                  tx
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
            const postEdgeNodes = getEdgeNodes(editor, tx);

            if (
              postEdgeNodes &&
              isNodesAffinity(editor, postEdgeNodes, 'directional') &&
              !hasElement(postEdgeNodes)
            ) {
              setAffinitySelection(
                postEdgeNodes,
                reverse ? 'forward' : 'backward',
                tx
              );
            }
          });
        }

        return next();
      }),
    ],
  }),
});

const applyOutwardAffinity = (
  editor: BaseEditor,
  state: Pick<EditorStateView, 'nodes' | 'points' | 'selection'>,
  tx: Pick<EditorUpdateTransaction, 'marks'>
) => {
  const selection = state.selection();

  if (!selection || RangeApi.isExpanded(selection)) return;

  const textPath = selection.focus.path;
  const textNode = state.nodes.get<Text>(textPath)?.[0];

  if (!textNode) return;

  const marks = Object.keys(NodeApi.extractProps(textNode));
  const outwardMarks = marks.filter(
    (type) =>
      getPluginByType(editor, type)?.rules.selection?.affinity === 'outward'
  );

  if (!outwardMarks.length || !state.points.isEnd(selection.focus, textPath)) {
    return;
  }

  const nextTextNode = getNextTextNode(state, textPath);
  const marksToRemove = outwardMarks.filter(
    (markKey) => textNode[markKey] && !nextTextNode?.[markKey]
  );

  outwardMarks.forEach((markKey) => {
    tx.marks.add(markKey, textNode[markKey]);
  });

  marksToRemove.forEach((markKey) => {
    tx.marks.remove(markKey);
  });
};

const getNextTextNode = (
  state: Pick<EditorStateView, 'nodes' | 'points'>,
  path: Path
) => {
  const nextPoint = state.points.after(path);

  if (!nextPoint) return null;

  return state.nodes.get<Text>(nextPoint.path)?.[0] ?? null;
};

const hasElement = (edgeNodes: EdgeNodes) => {
  const [before, after] = edgeNodes;

  return (
    (before && ElementApi.isElement(before[0])) ||
    (after && ElementApi.isElement(after[0]))
  );
};
