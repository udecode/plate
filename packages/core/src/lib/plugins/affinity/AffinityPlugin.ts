import {
  type Path,
  type TText,
  ElementApi,
  NodeApi,
  TextApi,
} from '@udecode/slate';

import type { PluginConfig } from '../../plugin/BasePlugin';
import type { EdgeNodes } from './types';

import { createTSlatePlugin } from '../../plugin/createSlatePlugin';
import { getPluginByType } from '../../plugin/getSlatePlugin';
import { getEdgeNodes } from './queries';
import { getMarkBoundaryAffinity } from './queries/getMarkBoundaryAffinity';
import { isNodesAffinity } from './queries/isNodeAffinity';
import { setAffinitySelection } from './transforms/setAffinitySelection';

export type ElementAffinity = {
  affinity: 'backward' | 'forward';
  at: Path;
  type: string;
};

export type AffinityConfig = PluginConfig<'affinity'>;

// REVIEW: performance
export const AffinityPlugin = createTSlatePlugin<AffinityConfig>({
  key: 'affinity',
}).overrideEditor(({ editor, tf: { deleteBackward, insertText, move } }) => ({
  transforms: {
    /**
     * On backspace, if the deletion results in the cursor being at a mark
     * boundary, then the affinity should be forward. If the deletion removes a
     * character from the left mark, then the affinity should be backward.
     */
    deleteBackward: (unit) => {
      const apply = () => {
        if (unit === 'character' && editor.api.isCollapsed()) {
          const [start] = getEdgeNodes(editor) ?? [null];

          const startText =
            start &&
            (TextApi.isText(start[0])
              ? start[0].text
              : NodeApi.string(start[0]));

          deleteBackward(unit);

          const edgeNodes = getEdgeNodes(editor);

          if (
            edgeNodes &&
            isNodesAffinity(editor, edgeNodes, 'directional') &&
            !hasElement(edgeNodes)
          ) {
            const affinity =
              startText && startText.length > 1 ? 'backward' : 'forward';
            setAffinitySelection(editor, edgeNodes, affinity);
          }
          return true;
        }
      };

      if (apply()) return;

      deleteBackward(unit);
    },
    insertText(text, options) {
      /** This will be computed only for text nodes with marks. */
      const applyOutwardAffinity = () => {
        if (!editor.selection || editor.api.isExpanded()) {
          return;
        }

        const textPath = editor.selection.focus.path;
        const textNode = NodeApi.get<TText>(editor, textPath);

        if (!textNode) {
          return;
        }

        const marks = Object.keys(NodeApi.extractProps(textNode));
        const outwardMarks = marks.filter(
          (type) =>
            getPluginByType(editor, type)?.rules.selection?.affinity ===
            'outward'
        );

        if (
          !outwardMarks.length ||
          !editor.api.isEnd(editor.selection.focus, textPath)
        ) {
          return;
        }

        const nextPoint = editor.api.start(textPath, { next: true });
        const marksToRemove: string[] = [];

        // Get next text node once outside the loop
        let nextTextNode: TText | null = null;
        if (nextPoint) {
          const nextTextPath = nextPoint.path;
          nextTextNode = NodeApi.get<TText>(editor, nextTextPath) || null;
        }

        // Check each mark individually
        for (const markKey of outwardMarks) {
          if (!textNode[markKey]) {
            continue; // Skip marks not present on current node
          }

          const isBetweenSameMarks = nextTextNode?.[markKey];

          if (!isBetweenSameMarks) {
            marksToRemove.push(markKey);
          }
        }

        if (marksToRemove.length > 0) {
          editor.tf.removeMarks(marksToRemove);
        }
      };

      applyOutwardAffinity();

      return insertText(text, options);
    },
    move: (options) => {
      const apply = () => {
        const {
          distance = 1,
          reverse = false,
          unit = 'character',
        } = options || {};

        if (
          unit === 'character' &&
          distance === 1 &&
          editor.api.isCollapsed()
        ) {
          const preEdgeNodes = getEdgeNodes(editor);

          if (preEdgeNodes && isNodesAffinity(editor, preEdgeNodes, 'hard')) {
            if (
              preEdgeNodes &&
              preEdgeNodes[reverse ? 0 : 1] === null &&
              getMarkBoundaryAffinity(editor, preEdgeNodes) ===
                (reverse ? 'forward' : 'backward')
            ) {
              setAffinitySelection(
                editor,
                preEdgeNodes,
                reverse ? 'backward' : 'forward'
              );

              return true;
            }

            move({ ...options, unit: 'offset' });
            return true;
          }

          move(options);

          const postEdgeNodes = getEdgeNodes(editor);

          /**
           * If the move places the cursor at a mark boundary, then the affinity
           * should be set to the direction the cursor came from.
           */
          if (
            postEdgeNodes &&
            isNodesAffinity(editor, postEdgeNodes, 'directional') &&
            !hasElement(postEdgeNodes)
          ) {
            setAffinitySelection(
              editor,
              postEdgeNodes,
              reverse ? 'forward' : 'backward'
            );
          }

          return true;
        }
      };

      if (apply()) return;

      move(options);
    },
  },
}));

const hasElement = (edgeNodes: EdgeNodes) => {
  const [before, after] = edgeNodes;

  return (
    (before && ElementApi.isElement(before[0])) ||
    (after && ElementApi.isElement(after[0]))
  );
};
