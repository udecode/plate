import type { PluginConfig } from '../../plugin/BasePlugin';

import { createTSlatePlugin } from '../../plugin/createSlatePlugin';
import { hasHardEdgeAtBoundary, hasMarkAtBoundary } from './queries';
import { getMarkBoundary } from './queries/getMarkBoundary';
import { getMarkBoundaryAffinity } from './queries/getMarkBoundaryAffinity';
import { setMarkBoundaryAffinity } from './transforms/setMarkBoundaryAffinity';

export type MarkAffinityConfig = PluginConfig<'mark-affinity'>;

export const MarkAffinityPlugin = createTSlatePlugin<MarkAffinityConfig>({
  key: 'mark-affinity',
  // options: { targetBoxMark: { allow: [] }, targetTextMark: { allow: [] } },
}).overrideEditor(({ editor, tf: { deleteBackward, move } }) => ({
  transforms: {
    /**
     * On backspace, if the deletion results in the cursor being at a mark
     * boundary, then the affinity should be forward. If the deletion removes a
     * character from the left mark, then the affinity should be backward.
     */
    deleteBackward: (unit) => {
      if (
        unit === 'character' &&
        editor.selection &&
        !editor.api.isExpanded()
      ) {
        const [leftMarkEntryBefore] = getMarkBoundary(editor) ?? [null];
        const removingFromLeftMark =
          leftMarkEntryBefore && leftMarkEntryBefore[0].text.length > 1;

        deleteBackward(unit);

        const afterMarkBoundary = getMarkBoundary(editor);

        if (afterMarkBoundary) {
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
    move: (options) => {
      const {
        distance = 1,
        reverse = false,
        unit = 'character',
      } = options || {};

      if (
        unit === 'character' &&
        distance === 1 &&
        editor.selection &&
        !editor.api.isExpanded()
      ) {
        const beforeMarkBoundary = getMarkBoundary(editor);

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

        const afterMarkBoundary = getMarkBoundary(editor);

        /**
         * If the move places the cursor at a mark boundary, then the affinity
         * should be set to the direction the cursor came from.
         */
        if (afterMarkBoundary && hasMarkAtBoundary(editor, afterMarkBoundary)) {
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
}));
