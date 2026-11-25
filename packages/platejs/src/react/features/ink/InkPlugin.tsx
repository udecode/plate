import { BaseInkPlugin, type InkTool } from '../../../features/ink/lib';
import { toReactPlugin } from '../../core';

/**
 * Pen markup on a document's text, with each view's Draw tool. A view keeps
 * its own tool, whether it hides ink and signs, and which marks are picked.
 */
export const InkPlugin = toReactPlugin(BaseInkPlugin, {
  api: ({ editor, viewStore }) => ({
    /** Pick the marks `ids` names, which the layer paints distinctly. */
    setPicked: (ids: readonly string[]) => {
      viewStore.set((draft) => {
        draft.picked = [...ids];
      });
    },
    /** Hide or show this view's ink and signs. */
    setHidden: (hidden: boolean) => {
      viewStore.set((draft) => {
        draft.hidden = hidden;
      });
    },
    /**
     * Turn the Draw tool on with `tool`, or off with `null`. Returns false and
     * changes nothing when it would turn the tool on in a read-only view, or
     * with an eraser or brush `size` that is not a finite number above 0, a
     * brush `opacity` that is not a number above 0 and at most 1, or a brush
     * `color` that is not a non-empty string.
     */
    setTool: (tool: InkTool | null) => {
      if (tool !== null) {
        const size = tool.type === 'erase' ? tool.size : tool.brush.size;
        const within = (value: number, max: number) =>
          Number.isFinite(value) && value > 0 && value <= max;

        if (
          editor.read.view.isReadOnly() ||
          !within(size, Number.POSITIVE_INFINITY) ||
          (tool.type === 'draw' &&
            (!within(tool.brush.opacity, 1) ||
              typeof tool.brush.color !== 'string' ||
              tool.brush.color.length === 0))
        ) {
          return false;
        }
      }
      viewStore.set((draft) => {
        draft.tool = tool;
      });

      return true;
    },
  }),
});
