import { type Path, type TElement, NodeApi, TextApi } from '@udecode/slate';

import type { PluginConfig } from '../../plugin/BasePlugin';

import { createTSlatePlugin } from '../../plugin/createSlatePlugin';
import {
  getBoundary,
  hasHardEdgeAtBoundary,
  hasMarkAtBoundary,
  isFocusBoundaryEdge,
} from './queries';
import { getMarkBoundaryAffinity } from './queries/getMarkBoundaryAffinity';
import { setMarkBoundaryAffinity } from './transforms/setMarkBoundaryAffinity';

export type ElementAffinity = {
  affinity: 'backward' | 'forward';
  at: Path;
  type: string;
};

export type MarkAffinityConfig = PluginConfig<
  'affinity',
  {
    elementAffinity: ElementAffinity | null;
  }
>;

export const AffinityPlugin = createTSlatePlugin<MarkAffinityConfig>({
  key: 'affinity',
  options: {
    elementAffinity: null,
  },
}).overrideEditor(
  ({ editor, tf: { apply, deleteBackward, insertText, move } }) => ({
    transforms: {
      apply: (options) => {
        return apply(options);
      },
      /**
       * On backspace, if the deletion results in the cursor being at a mark
       * boundary, then the affinity should be forward. If the deletion removes
       * a character from the left mark, then the affinity should be backward.
       */
      deleteBackward: (unit) => {
        if (unit === 'character' && editor.api.isCollapsed()) {
          const [leftMarkEntryBefore] = getBoundary(editor) ?? [null];

          if (!leftMarkEntryBefore) return deleteBackward(unit);

          const string = TextApi.isText(leftMarkEntryBefore[0])
            ? leftMarkEntryBefore[0].text
            : NodeApi.string(leftMarkEntryBefore[0]);

          const removingFromLeftMark = string.length > 1;

          deleteBackward(unit);

          const afterMarkBoundary = getBoundary(editor);

          if (
            afterMarkBoundary &&
            hasMarkAtBoundary(editor, afterMarkBoundary)
          ) {
            setMarkBoundaryAffinity(
              editor,
              afterMarkBoundary,
              removingFromLeftMark ? 'backward' : 'forward'
            );
          }
          return;
        }

        deleteBackward(unit);
      },
      insertText(string, options) {
        if (editor.api.isExpanded()) return insertText(string, options);

        const elementAffinity = editor.getOption(
          AffinityPlugin,
          'elementAffinity'
        );

        if (!elementAffinity) return insertText(string, options);

        if (!isFocusBoundaryEdge(editor, elementAffinity))
          return insertText(string, options);

        const { affinity, at, type } = elementAffinity;

        const inlineElement = editor.api.node<TElement>({
          at,
          match: { type },
        });

        if (!inlineElement) return insertText(string, options);

        const [newElementNode, newElementPath] = inlineElement;

        const text =
          affinity === 'forward'
            ? string + editor.api.string(newElementPath)
            : editor.api.string(newElementPath) + string;

        if (text?.length && text !== editor.api.string(newElementPath)) {
          const firstText = newElementNode.children[0];

          // remove element children
          editor.tf.replaceNodes(
            { ...firstText, text },
            {
              at: newElementPath,
              children: true,
              select: affinity === 'backward',
            }
          );

          if (affinity === 'forward') {
            const { offset, path } = editor.api.start(newElementPath)!;

            editor.tf.select({
              offset: offset + 1,
              path,
            });
          }
          return;
        }
        return insertText(string, options);
      },
      move: (options) => {
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
          const beforeMarkBoundary = getBoundary(editor);

          if (
            beforeMarkBoundary &&
            hasHardEdgeAtBoundary(editor, beforeMarkBoundary)
          ) {
            if (
              beforeMarkBoundary &&
              beforeMarkBoundary[reverse ? 0 : 1] === null &&
              getMarkBoundaryAffinity(editor, beforeMarkBoundary) ===
                (reverse ? 'forward' : 'backward')
            ) {
              setMarkBoundaryAffinity(
                editor,
                beforeMarkBoundary,
                reverse ? 'backward' : 'forward'
              );

              return;
            }

            return move({ ...options, unit: 'offset' });
          }

          move(options);

          const afterMarkBoundary = getBoundary(editor);

          /**
           * If the move places the cursor at a mark boundary, then the affinity
           * should be set to the direction the cursor came from.
           */
          if (
            afterMarkBoundary &&
            hasMarkAtBoundary(editor, afterMarkBoundary)
          ) {
            setMarkBoundaryAffinity(
              editor,
              afterMarkBoundary,
              reverse ? 'forward' : 'backward'
            );
          }

          return;
        }

        move(options);
      },
    },
  })
);
