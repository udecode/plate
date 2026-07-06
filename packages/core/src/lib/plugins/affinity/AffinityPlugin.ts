import {
  type EditorUpdateTransaction,
  type Path,
  type Text,
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
}).extendExtension(({ editor }) => ({
  transforms: {
    deleteBackward({ next, tx, unit }) {
      if (unit !== 'character' || !editor.read.selection.isCollapsed()) {
        return next();
      }

      const [start] = getEdgeNodes(editor) ?? [null];
      const startText =
        start &&
        (NodeApi.isText(start[0]) ? start[0].text : NodeApi.string(start[0]));

      const didDelete = next();
      const edgeNodes = getEdgeNodes(editor);

      if (edgeNodes && isNodesAffinity(editor, edgeNodes, 'directional')) {
        const affinity =
          startText && startText.length > 1 ? 'backward' : 'forward';
        setAffinitySelection(editor, edgeNodes, affinity, tx);
      }

      return didDelete;
    },
    insertText({ next, tx }) {
      applyOutwardAffinity(editor, tx);

      return next();
    },
    move({ next, options, tx }) {
      const {
        distance = 1,
        reverse = false,
        unit = 'character',
      } = options ?? {};

      if (
        unit === 'character' &&
        distance === 1 &&
        editor.read.selection.isCollapsed()
      ) {
        const preEdgeNodes = getEdgeNodes(editor);

        if (preEdgeNodes && isNodesAffinity(editor, preEdgeNodes, 'hard')) {
          if (
            preEdgeNodes[reverse ? 0 : 1] === null &&
            getMarkBoundaryAffinity(editor, preEdgeNodes) ===
              (reverse ? 'forward' : 'backward')
          ) {
            setAffinitySelection(
              editor,
              preEdgeNodes,
              reverse ? 'backward' : 'forward',
              tx
            );

            return true;
          }

          return next({ options: { ...options, unit: 'offset' } });
        }

        const didMove = next();
        const postEdgeNodes = getEdgeNodes(editor);

        if (
          postEdgeNodes &&
          isNodesAffinity(editor, postEdgeNodes, 'directional') &&
          !hasElement(postEdgeNodes)
        ) {
          setAffinitySelection(
            editor,
            postEdgeNodes,
            reverse ? 'forward' : 'backward',
            tx
          );
        }

        return didMove;
      }

      return next();
    },
  },
}));

const applyOutwardAffinity = (
  editor: BaseEditor,
  tx: Pick<EditorUpdateTransaction, 'marks'>
) => {
  const selection = editor.read.selection();

  if (!selection || RangeApi.isExpanded(selection)) return;

  const textPath = selection.focus.path;
  const textNode = editor.read.nodes.get<Text>(textPath)?.[0];

  if (!textNode) return;

  const marks = Object.keys(NodeApi.extractProps(textNode));
  const outwardMarks = marks.filter(
    (type) =>
      getPluginByType(editor, type)?.rules.selection?.affinity === 'outward'
  );

  if (
    !outwardMarks.length ||
    !editor.read.points.isEnd(selection.focus, textPath)
  ) {
    return;
  }

  const nextTextNode = getNextTextNode(editor, textPath);
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

const getNextTextNode = (editor: BaseEditor, path: Path) => {
  const nextPoint = editor.read.points.after(path);

  if (!nextPoint) return null;

  return editor.read.nodes.get<Text>(nextPoint.path)?.[0] ?? null;
};

const hasElement = (edgeNodes: EdgeNodes) => {
  const [before, after] = edgeNodes;

  return (
    (before && ElementApi.isElement(before[0])) ||
    (after && ElementApi.isElement(after[0]))
  );
};
