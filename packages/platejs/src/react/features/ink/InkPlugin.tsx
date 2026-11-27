import { BaseInkPlugin, type InkTool } from '../../../features/ink/lib';
import { readInkSign } from '../../../features/ink/lib/inkPlaces.internal';
import { toReactPlugin } from '../../core';
import { isImeConfirmKeyEvent } from '../../utils/dispatchPlateShortcut.internal';

// The key whose press acted on each view's pick, until its next fresh press,
// so the repeats of a held Backspace never reach the text.
const heldKeys = new WeakMap<object, string>();

/**
 * Pen markup on a document's text, with each view's Draw tool. A view keeps
 * its own tool, whether it hides ink and signs, whether digitized marks show
 * faded, and which marks are picked.
 * While the lasso is on, Backspace or Delete removes the picked marks that
 * are still shown (not digitized) and show no sign in one undo step, and
 * Escape clears the pick, before the editor handles the key. A key with Alt,
 * Control or Meta, an input method's key, a key another handler took and the
 * repeats of a key held after the press that acted stay out of the pick.
 */
export const InkPlugin = toReactPlugin(BaseInkPlugin, {
  api: ({ editor, viewStore }) => ({
    /** Pick the marks `ids` names, which the layer paints distinctly. */
    setPicked: (ids: readonly string[]) => {
      viewStore.set((draft) => {
        draft.picked = [...ids];
      });
    },
    /** Hide or show this view's ink and signs. Hiding clears the pick. */
    setHidden: (hidden: boolean) => {
      viewStore.set((draft) => {
        draft.hidden = hidden;
        if (hidden && draft.picked.length > 0) draft.picked = [];
      });
    },
    /**
     * Draw digitized marks faded over their words, or as their sign once their
     * text changed, and let the lasso pick them. Turning it off drops digitized
     * marks from the pick.
     */
    setShowDigitized: (showDigitized: boolean) => {
      viewStore.set((draft) => {
        draft.showDigitized = showDigitized;
        if (!showDigitized && draft.picked.length > 0) {
          const shown = new Set(
            editor
              .plugin(BaseInkPlugin)
              .read.shownMarks()
              .map((mark) => mark.id)
          );
          const kept = draft.picked.filter((id) => shown.has(id));

          if (kept.length !== draft.picked.length) draft.picked = kept;
        }
      });
    },
    /**
     * Turn the Draw tool on with `tool`, or off with `null`. Returns false and
     * changes nothing when it would turn the tool on in a read-only view, or
     * with an eraser or brush `size` that is not a finite number above 0, a
     * brush `opacity` that is not a number above 0 and at most 1, or a brush
     * `color` that is not a non-empty string.
     * Any tool but the lasso clears the pick.
     */
    setTool: (tool: InkTool | null) => {
      if (tool !== null) {
        const size =
          tool.type === 'draw'
            ? tool.brush.size
            : tool.type === 'erase'
              ? tool.size
              : 1;
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
        if (tool?.type !== 'lasso' && draft.picked.length) draft.picked = [];
      });

      return true;
    },
  }),
}).extend(({ viewStoreOf }) => ({
  on: {
    keyDown: ({ api, editor, event, read }) => {
      if (!event.repeat) heldKeys.delete(editor);
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        isImeConfirmKeyEvent(event.nativeEvent)
      ) {
        return undefined;
      }
      if (heldKeys.get(editor) === event.key) return true;

      const removes = event.key === 'Backspace' || event.key === 'Delete';

      if (!removes && event.key !== 'Escape') return undefined;

      const picks = editor.read((state) => {
        const { picked, showDigitized, tool } = viewStoreOf(state).get();

        if (tool?.type !== 'lasso' || picked.length === 0) return [];

        const shown = new Set(read.shownMarks().map((mark) => mark.id));

        return picked.filter((id) => {
          const mark = read.mark(id);

          if (!mark) return false;
          if (removes) {
            return (
              shown.has(id) &&
              !readInkSign({ copy: read.copy, editor, state }, mark)
            );
          }

          return (
            (shown.has(id) || showDigitized) &&
            !readInkSign(
              { copy: read.copy, editor, state },
              mark,
              showDigitized && !shown.has(id)
            )
          );
        });
      });

      if (picks.length === 0) return undefined;
      heldKeys.set(editor, event.key);
      if (!removes) {
        api.setPicked([]);

        return true;
      }
      editor.update((tx) => {
        tx.plugin(BaseInkPlugin).remove(picks);
        viewStoreOf(tx).set((draft) => {
          draft.picked = [];
        });
      });

      return true;
    },
  },
}));
