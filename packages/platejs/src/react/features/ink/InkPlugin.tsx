import { readShownPreview } from '../../../facade';
import {
  BaseInkPlugin,
  type InkPassage,
  type InkTool,
} from '../../../features/ink/lib';
import { toReactPlugin } from '../../core';
import { isImeConfirmKeyEvent } from '../../utils/dispatchPlateShortcut.internal';
import { renderInkPassageImages } from './inkImages.internal';

/** Options for `InkPlugin`'s `api.images(passages, options)`. */
export type InkImagesOptions = Readonly<{
  maxSide: number;
}>;

/**
 * Two PNG data URLs for one passage (`inkAlone` and `inkOnText`), each mark's
 * bounding box in picture pixels (`[left, top, right, bottom]`), and each
 * inline void's visible text keyed by its character offset in the saved copy.
 */
export type InkPassageImages = Readonly<{
  boxes: Readonly<
    Record<
      string,
      readonly [left: number, top: number, right: number, bottom: number]
    >
  >;
  inkAlone: string;
  inkOnText: string;
  voids: Readonly<Record<number, string>>;
}>;

const heldKeys = new WeakMap<object, string>();

/**
 * Pen markup on a document's text, with each view's Draw tool. A view keeps
 * its own tool, whether it hides ink, whether digitized marks show faded, and
 * which marks are picked.
 * While the lasso is on, Backspace or Delete removes the picked marks that
 * are still shown (not digitized) in one undo step, and Escape clears the
 * pick, before the editor handles the key. A key with Alt, Control or Meta, an
 * input method's key, a key another handler took and the repeats of a key held
 * after the press that acted stay out of the pick.
 */
export const InkPlugin = toReactPlugin(BaseInkPlugin, {
  api: ({ editor, viewStore }) => ({
    /**
     * Draw two PNG pictures (`inkAlone` and `inkOnText`) for each passage in
     * Canvas 2D from the live view, reading every input synchronously before
     * returning. Returns `null` for a passage whose block is not live or whose
     * cropped long side passes `maxSide`.
     */
    images: (
      passages: readonly InkPassage[],
      options: InkImagesOptions
    ): Promise<ReadonlyArray<InkPassageImages | null>> =>
      renderInkPassageImages(editor, passages, options),
    /** Pick the marks `ids` names, which the layer paints distinctly. */
    setPicked: (ids: readonly string[]) => {
      viewStore.set((draft) => {
        draft.picked = [...ids];
      });
    },
    /** Hide or show this view's ink. Hiding clears the pick. */
    setHidden: (hidden: boolean) => {
      viewStore.set((draft) => {
        draft.hidden = hidden;
        if (hidden && draft.picked.length > 0) draft.picked = [];
      });
    },
    /**
     * Draw digitized marks faded over their words and let the lasso pick them.
     * Turning it off drops digitized marks from the pick.
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
          readShownPreview(editor) !== undefined ||
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
      if (
        removes &&
        (editor.read.view.isReadOnly() ||
          readShownPreview(editor) !== undefined)
      ) {
        return undefined;
      }

      const picks = editor.read((state) => {
        const { picked, showDigitized, tool } = viewStoreOf(state).get();

        if (tool?.type !== 'lasso' || picked.length === 0) return [];

        const shown = new Set(read.shownMarks().map((mark) => mark.id));

        return picked.filter((id) => {
          const mark = read.mark(id);

          if (!mark) return false;
          if (removes) return shown.has(id);

          return shown.has(id) || showDigitized;
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
