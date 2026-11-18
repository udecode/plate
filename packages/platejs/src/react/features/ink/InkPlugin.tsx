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
     * changes nothing when it would turn the tool on in a read-only view,
     * because a mark is a write to the document.
     */
    setTool: (tool: InkTool | null) => {
      if (tool !== null && editor.read.view.isReadOnly()) return false;
      viewStore.set((draft) => {
        draft.tool = tool;
      });

      return true;
    },
  }),
});
