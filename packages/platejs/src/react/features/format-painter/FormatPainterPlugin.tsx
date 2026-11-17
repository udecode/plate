import * as React from 'react';

import {
  type Anchor,
  PathApi,
  PLUGINS,
  type Point,
  PointApi,
  type Range,
  RangeApi,
} from '../../../core';
import {
  BaseFormattingPlugin,
  type CapturedFormat,
} from '../../../features/basic-styles/lib';
import { definePlugin } from '../../plugin';
import { useViewStore } from '../../stores';

/**
 * One view's format painter. An armed brush always holds the look it copied
 * and an anchor on the range it copied from; `once` puts the brush down after
 * one paint, `sticky` keeps it up until disarmed.
 */
export type FormatPainterViewState =
  | Readonly<{
      armed: 'once' | 'sticky';
      copied: CapturedFormat;
      source: Anchor<Range>;
    }>
  | Readonly<{
      armed: 'off';
      copied: CapturedFormat | null;
      source: null;
    }>;

/**
 * Copy the look of one piece of text onto another. Arm the brush on a
 * selection, then make a mouse selection: the brush paints it, or the word
 * under a click, and a once brush goes down. Mod+Alt+C copies the look and
 * Mod+Alt+V pastes it without arming; in an editable view, Escape puts an
 * armed brush down.
 */
export const FormatPainterPlugin = definePlugin(PLUGINS.formatPainter, {
  dependencies: [BaseFormattingPlugin],
  initialViewState: (): FormatPainterViewState => ({
    armed: 'off',
    copied: null,
    source: null,
  }),
})
  .extend(({ viewStoreOf }) => ({
    api: ({ editor, viewStore }) => {
      const capture = () => {
        const selection = editor.read.selection();
        const copied = editor.plugin(BaseFormattingPlugin).read.capture();

        return copied && selection && RangeApi.isRange(selection)
          ? { copied, selection }
          : null;
      };
      const anchor = (selection: Range) =>
        editor.anchor(selection, {
          association: 'inward',
          deletion: 'nearest',
        });

      return {
        /**
         * Pick up the brush with the look at the selection's start: `sticky`
         * keeps it up after a paint. Returns false in a read-only view or when
         * the selection selects no text.
         */
        arm: ({ sticky = false }: Readonly<{ sticky?: boolean }> = {}) => {
          const captured = !editor.read.view.isReadOnly() && capture();

          if (!captured) return false;

          viewStore.get().source?.release();
          viewStore.set({
            armed: sticky ? 'sticky' : 'once',
            copied: captured.copied,
            source: anchor(captured.selection),
          });

          return true;
        },
        /**
         * Copy the look at the selection's start without arming. Returns false
         * when the selection selects no text.
         */
        copy: () => {
          const captured = capture();

          if (!captured) return false;

          const { source } = viewStore.get();

          source?.release();
          viewStore.set(
            source
              ? { copied: captured.copied, source: anchor(captured.selection) }
              : { copied: captured.copied }
          );

          return true;
        },
        /** Put an armed brush down. Returns false when it is not armed. */
        disarm: () => {
          const { source } = viewStore.get();

          if (!source) return false;

          source.release();
          viewStore.set({ armed: 'off', source: null });

          return true;
        },
        /**
         * Apply the copied look to the selection without arming. Returns false
         * in a read-only view, when nothing is copied, or when the selection is
         * collapsed or selects blocks.
         */
        paste: () => {
          const { copied } = viewStore.get();

          return (
            !!copied &&
            !editor.read.view.isReadOnly() &&
            editor.plugin(BaseFormattingPlugin).update.apply(copied)
          );
        },
      };
    },
    on: {
      pointerSelectionEnd: ({ editor, selection }) => {
        if (editor.read.view.isReadOnly()) return;

        const spent = editor.update((tx) => {
          const store = viewStoreOf(tx);
          const brush = store.get();

          if (brush.armed === 'off') return null;

          const wordAt = (caret: Point) => {
            const [block] = tx.nodes.blocks({ at: caret, mode: 'lowest' });
            const word = (start?: Point, end?: Point) =>
              block &&
              start &&
              end &&
              PathApi.isAncestor(block[1], start.path) &&
              PathApi.isAncestor(block[1], end.path) &&
              PointApi.compare(start, caret) <= 0 &&
              PointApi.compare(caret, end) <= 0 &&
              !PointApi.equals(start, end) &&
              /\S/u.test(tx.text.string({ anchor: start, focus: end }))
                ? { anchor: start, focus: end }
                : null;
            const end = tx.points.after(caret, { unit: 'word' });
            const start = tx.points.before(caret, { unit: 'word' });

            return (
              word(end && tx.points.before(end, { unit: 'word' }), end) ??
              word(start, start && tx.points.after(start, { unit: 'word' }))
            );
          };
          const target = RangeApi.isCollapsed(selection)
            ? wordAt(selection.anchor)
            : selection;
          const source = brush.source.resolve();

          if (
            !target ||
            (source &&
              PointApi.equals(RangeApi.start(source), RangeApi.start(target)) &&
              PointApi.equals(RangeApi.end(source), RangeApi.end(target))) ||
            !tx.formatting.apply(brush.copied, { at: target }) ||
            brush.armed === 'sticky'
          ) {
            return null;
          }

          store.set({ armed: 'off', source: null });

          return brush.source;
        });

        spent?.release();
      },
    },
  }))
  .extend({
    shortcuts: {
      copy: { keys: 'mod+alt+keyc' },
      disarm: { keys: 'escape' },
      paste: { keys: 'mod+alt+keyv' },
    },
    slots: { wrapRoot: ReleaseSourceWithView },
  });

function ReleaseSourceWithView({ children }: { children: React.ReactNode }) {
  const source = useViewStore(FormatPainterPlugin, (state) => state.source);

  React.useInsertionEffect(
    () => () => {
      source?.release();
    },
    [source]
  );

  return children;
}
