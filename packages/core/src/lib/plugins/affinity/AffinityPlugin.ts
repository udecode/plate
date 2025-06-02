import {
  type Path,
  type TElement,
  type TText,
  NodeApi,
  TextApi,
} from '@udecode/slate';

import type { PluginConfig } from '../../plugin/BasePlugin';

import { createTSlatePlugin } from '../../plugin/createSlatePlugin';
import { getPluginTypes } from '../../plugin/getSlatePlugin';
import {
  getEdgeNodes,
  hasAffinity,
  hasHardEdgeAtBoundary,
  isOuterEdge,
} from './queries';
import { getMarkBoundaryAffinity } from './queries/getMarkBoundaryAffinity';
import { setAffinitySelection } from './transforms/setAffinitySelection';

export type ElementAffinity = {
  affinity: 'backward' | 'forward';
  at: Path;
  type: string;
};

export type AffinityConfig = PluginConfig<
  'affinity',
  {
    elementAffinity: ElementAffinity | null;
  }
>;

// REVIEW: performance
export const AffinityPlugin = createTSlatePlugin<AffinityConfig>({
  key: 'affinity',
  options: {
    elementAffinity: null,
  },
}).overrideEditor(
  ({ editor, tf: { apply, deleteBackward, insertText, move } }) => ({
    transforms: {
      apply: (options) => {
        console.log(options);
        return apply(options);
      },
      /**
       * On backspace, if the deletion results in the cursor being at a mark
       * boundary, then the affinity should be forward. If the deletion removes
       * a character from the left mark, then the affinity should be backward.
       */
      deleteBackward: (unit) => {
        const apply = () => {
          if (unit === 'character' && editor.api.isCollapsed()) {
            const [start] = getEdgeNodes(editor) ?? [null];

            console.log(start);
            if (!start) return;

            const startText = TextApi.isText(start[0])
              ? start[0].text
              : NodeApi.string(start[0]);

            deleteBackward(unit);

            const edgeNodes = getEdgeNodes(editor);

            if (edgeNodes && hasAffinity(editor, edgeNodes)) {
              const affinity = startText.length > 1 ? 'backward' : 'forward';
              setAffinitySelection(editor, edgeNodes, affinity);
            }
            return true;
          }
        };

        if (apply()) return;

        deleteBackward(unit);
      },
      insertText(text, options) {
        const applyElementAffinity = () => {
          if (!editor.api.isCollapsed()) return;

          const elementAffinity = editor.getOption(
            AffinityPlugin,
            'elementAffinity'
          );

          if (!elementAffinity) return;

          if (!isOuterEdge(editor, elementAffinity)) return;

          const { affinity, at, type } = elementAffinity;

          const entry = editor.api.node<TElement>({
            at,
            match: { type },
          });

          if (!entry) return;

          const [, path] = entry;

          if (affinity === 'backward') {
            editor.tf.select(editor.api.end(path));
          } else {
            editor.tf.select(editor.api.start(path));
          }

          // TODO:
          // const elementText =
          //   affinity === 'forward'
          //     ? text + editor.api.string(newElementPath)
          //     : editor.api.string(newElementPath) + text;

          // if (
          //   elementText?.length &&
          //   elementText !== editor.api.string(newElementPath)
          // ) {
          //   const firstText = newElementNode.children[0];

          //   // remove element children
          //   editor.tf.replaceNodes(
          //     { ...firstText, text: elementText },
          //     {
          //       at: newElementPath,
          //       children: true,
          //       select: affinity === 'backward',
          //     }
          //   );

          //   if (affinity === 'forward') {
          //     const { offset, path } = editor.api.start(newElementPath)!;

          //     editor.tf.select({
          //       offset: offset + 1,
          //       path,
          //     });
          //   }
          //   return true;
          // }
        };

        const applyClearOnEdge = () => {
          if (
            editor.meta.pluginKeys.node.clearOnEdge.length === 0 ||
            !editor.selection ||
            editor.api.isExpanded()
          ) {
            return;
          }

          const textPath = editor.selection.focus.path;
          const textNode = NodeApi.get<TText>(editor, textPath);

          if (!textNode) {
            return;
          }

          const clearOnEdgeMarks = getPluginTypes(
            editor,
            editor.meta.pluginKeys.node.clearOnEdge
          );

          const isMarked = clearOnEdgeMarks.some((key) => !!textNode[key]);

          if (
            !isMarked ||
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
          for (const markKey of clearOnEdgeMarks) {
            if (!textNode[markKey]) {
              continue; // Skip marks not present on current node
            }

            const isBetweenSameMarks = nextTextNode && nextTextNode[markKey];

            if (!isBetweenSameMarks) {
              marksToRemove.push(markKey);
            }
          }

          if (marksToRemove.length > 0) {
            editor.tf.removeMarks(marksToRemove);
          }
        };

        applyElementAffinity();
        applyClearOnEdge();

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

            if (preEdgeNodes && hasHardEdgeAtBoundary(editor, preEdgeNodes)) {
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
             * If the move places the cursor at a mark boundary, then the
             * affinity should be set to the direction the cursor came from.
             */
            if (postEdgeNodes && hasAffinity(editor, postEdgeNodes)) {
              setAffinitySelection(
                editor,
                postEdgeNodes,
                reverse ? 'forward' : 'backward'
              );
            }

            console.log(editor.selection);

            return true;
          }
        };

        console.log('MOVE');

        if (apply()) return;

        console.log(editor.selection);

        move(options);
      },
    },
  })
);
