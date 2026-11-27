import * as React from 'react';

import {
  getRecordSetVersion,
  readShownPreview,
  readShownRecords,
  subscribeEditorViewState,
} from '../../../facade';
import {
  COPIES,
  DIGITIZED,
  MARKS,
} from '../../../features/ink/lib/inkGone.internal';
import {
  useEditableRef,
  useEditor,
  useEditorViewState,
  useModelEditor,
  useViewStore,
  type WrapContentProps,
} from '../../core';
import { attachInkCapture } from './inkCapture.internal';
import { INK_TOUCH_ACTION } from './inkInput.internal';
import { createInkSurface } from './inkPaint.internal';
import { attachInkPick } from './inkPick.internal';
import {
  createInkPlacer,
  type InkAudit,
  type InkPlaced,
  NOTHING_PLACED,
} from './inkPlacement.internal';
import { InkPlugin } from './InkPlugin';
import { observeInkLayout, stackInkSigns } from './inkWatch.internal';

/**
 * Marks whose ink is not on the page, shown as one sign: `changed` when their
 * words changed or moved, `deleted` when a marked block is gone, and `narrow`
 * when a margin note's margin is too narrow for it. `digitized` is `true` for
 * signs shown while `showDigitized` is on.
 */
export type InkSign = Readonly<{
  digitized?: boolean;
  marks: readonly string[];
  state: 'changed' | 'deleted' | 'narrow';
}>;

type InkSigns = Pick<InkPlaced, 'bottom' | 'signs'>;

const ARRIVE_MS = 50;
const SETTLE_MS = 250;
const SLICE_MS = 3;

const whenIdle = (run: () => void, timeoutMs?: number) => {
  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(
      run,
      // A timeout of 0 is no timeout.
      timeoutMs === undefined ? undefined : { timeout: Math.max(1, timeoutMs) }
    );

    return () => cancelIdleCallback(id);
  }

  const id = setTimeout(run, 0);

  return () => clearTimeout(id);
};

const sameSigns = (a: InkSigns, b: InkSigns) =>
  a.bottom === b.bottom &&
  a.signs.length === b.signs.length &&
  a.signs.every(
    ({ id, left, sign, top }, at) =>
      id === b.signs[at].id &&
      left === b.signs[at].left &&
      top === b.signs[at].top &&
      sign.digitized === b.signs[at].sign.digitized &&
      (sign.marks === b.signs[at].sign.marks ||
        (sign.marks.length === b.signs[at].sign.marks.length &&
          sign.marks.every((mark, n) => mark === b.signs[at].sign.marks[n])))
  );

const firstElementAfter = (element: Element) => {
  for (let at: Element | null = element; at; at = at.parentElement) {
    if (at.nextElementSibling) return at.nextElementSibling;
  }

  return null;
};

/**
 * The ink plugin's `wrapContent` slot: the slot's content, then a layer with
 * the ink of its Editable, drawn over it and its margins. Each mark
 * draws on its words while they stand as they were when it was drawn, and
 * otherwise shows as a `sign` in the Editable's padding where the mark's lines
 * end, the left padding for a mark drawn in right-to-left text: at its
 * block's top when the block's words changed or cannot be measured, or a
 * margin note's margin is too narrow, and beside the nearest block left when a
 * marked block is gone, or on the document's start when none is left. A place
 * shows one sign per state, and a sign that would cover the one above it on its
 * side of the Editable moves down below it. A press on a sign is the sign's
 * own. The layer draws the marks of the blocks within a screen of the view,
 * and every mark once the page is about to print. With the Draw tool on, a pen
 * or the primary mouse button draws a mark, which saves when the contact ends
 * and keeps the Editable's focus and caret. With the eraser on, it removes
 * each mark whose painted ink its path touches, and with the lasso on, it
 * draws a loop that picks the marks it holds and focuses the Editable, so the
 * keys on the pick reach it. An eraser or lasso contact ends when its primary
 * button lifts while another stays down. A finger still scrolls, and
 * other mouse buttons keep their own behavior. The view's `hidden` hides ink and
 * signs and leaves every press to the content, and picked marks paint with a
 * halo. Changing the tool, hiding ink or turning the view read-only ends the
 * contact, and a drawing contact ended so saves nothing more. Turning the view
 * read-only turns the tool off. The layer fills the nearest positioned ancestor
 * of the Editable, which should hold the Editable and its margins, and reaches
 * at least to the Editable's bottom, so it covers the whole content of a
 * scrolling ancestor. Pass the slot's props on with a `sign`, as in
 * `wrapContent: (props) => <InkContent {...props} sign={Sign} />`, so the
 * layer comes right after the Editable and before every `afterEditable` slot.
 * In development, the mount throws unless the layer is the first element after
 * the Editable, so a mount from `wrapRoot`, `beforeEditable` or
 * `afterEditable` that puts the layer elsewhere, such as after a toolbar,
 * fails. The layer sits at z-index 50, so a press on a control inside the
 * content at that level or below, such as a block's drag handle, reaches the
 * layer, while a toolbar or menu at that level from an `afterEditable` slot or
 * a portal stays above it. When page chrome at or below that level, such as a
 * sticky header, can sit over the editor, give the positioned ancestor its own
 * stacking context, such as with `isolation: isolate`, so the layer stays
 * below that chrome.
 */
export function InkContent({
  children,
  sign,
}: WrapContentProps & {
  sign: React.ComponentType<{ sign: InkSign }>;
}) {
  return (
    <>
      {children}
      <InkLayer sign={sign} />
    </>
  );
}

function InkLayer({
  sign: Sign,
}: {
  sign: React.ComponentType<{ sign: InkSign }>;
}) {
  const editableRef = useEditableRef();
  const view = useEditor();
  const editor = useModelEditor();
  const tool = useViewStore(InkPlugin, (state) => state.tool);
  const hidden = useViewStore(InkPlugin, (state) => state.hidden);
  const picked = useViewStore(InkPlugin, (state) => state.picked);
  const readOnly = useEditorViewState(
    view,
    (state) => state.isReadOnly() || readShownPreview(view) !== undefined
  );
  const [layer, setLayer] = React.useState<HTMLDivElement | null>(null);
  const [surface, setSurface] = React.useState<ReturnType<
    typeof createInkSurface
  > | null>(null);
  const mountInk = React.useCallback((into: SVGGElement | null) => {
    setSurface(into && createInkSurface(into));
  }, []);
  const [shown] = React.useState(() => {
    let current: InkSigns = NOTHING_PLACED;
    const listeners = new Set<() => void>();

    return {
      get: () => current,
      set: (next: InkSigns) => {
        current = next;
        for (const listener of listeners) listener();
      },
      subscribe: (listener: () => void) => {
        listeners.add(listener);

        return () => {
          listeners.delete(listener);
        };
      },
    };
  });
  // React renders a store change in the microtask after the listener that
  // made it, so the signs a `beforeprint` listener places print.
  const placed = React.useSyncExternalStore(
    shown.subscribe,
    shown.get,
    shown.get
  );
  const preview = React.useRef<SVGPathElement>(null);

  React.useEffect(() => {
    if (readOnly) view.plugin(InkPlugin).api.setTool(null);
  }, [readOnly, view]);

  React.useEffect(() => {
    const editable = editableRef.current;
    const path = preview.current;

    if (!layer || !editable || !path || !surface) return undefined;
    if (
      process.env.NODE_ENV !== 'production' &&
      firstElementAfter(editable) !== layer
    ) {
      throw new Error(
        'InkContent must be the `wrapContent` slot of its plugin, so its ink layer is the first element after the Editable. Mounted elsewhere, the layer can cover what comes after the Editable, such as a toolbar.'
      );
    }

    const tools = view.plugin(InkPlugin).viewStore;
    const live = () =>
      view.read.view.isReadOnly() ||
      readShownPreview(view) !== undefined ||
      tools.get('hidden')
        ? null
        : tools.get('tool');
    const attached = attachInkCapture({
      editor,
      layer,
      preview: path,
      tool: live,
      view,
    });
    let cachedShownList: ReadonlyArray<{ id: string }> | undefined;
    let cachedShownSet = new Set<object>();
    const isShownMark = (mark: { id: string }) => {
      const list = view.plugin(InkPlugin).read.shownMarks();

      if (list !== cachedShownList) {
        cachedShownList = list;
        cachedShownSet = new Set(list);
      }

      return cachedShownSet.has(mark);
    };
    const picker = attachInkPick({
      canErase: isShownMark,
      editor,
      holds: (mark) =>
        tools.get('showDigitized')
          ? view.plugin(InkPlugin).read.mark(mark.id) === mark
          : isShownMark(mark),
      layer,
      painted: surface.painted,
      preview: path,
      tool: live,
      view,
    });
    const placer = createInkPlacer({ editable, layer, view });
    const page = layer.ownerDocument;
    const win = page.defaultView;
    let frame = 0;
    let moveFrame = 0;
    let settle: ReturnType<typeof setTimeout> | undefined;
    let stopSlice: (() => void) | undefined;
    let audit: InkAudit | undefined;
    let painted = NOTHING_PLACED;
    let printing = false;
    let scrollStartedAt: number | undefined;
    let stopArrival: (() => void) | undefined;
    const show = (next: InkPlaced) => {
      const { bottom, ink, signs } = next;

      painted = next;
      surface.paint(ink);
      if (!sameSigns(next, shown.get())) shown.set({ bottom, signs });

      const currentPicked = tools.get('picked');

      if (currentPicked.length > 0 && signs.length > 0) {
        const signedIds = new Set(signs.flatMap(({ sign }) => sign.marks));
        const keptPicked = currentPicked.filter((id) => !signedIds.has(id));

        if (keptPicked.length !== currentPicked.length) {
          view.plugin(InkPlugin).api.setPicked(keptPicked);
        }
      }
    };
    const stopArriving = () => {
      stopArrival?.();
      stopArrival = undefined;
      scrollStartedAt = undefined;
    };
    const paint = () => {
      frame = 0;
      show(printing ? placer.placeEvery() : placer.place());
    };
    const arrive = () => {
      const start = performance.now();
      const { placed: next, undecided } = placer.arrive(painted, (onScreen) => {
        const now = performance.now();
        const sliceSpent = now - start >= SLICE_MS;
        const screenOverdue =
          onScreen &&
          scrollStartedAt !== undefined &&
          now >= scrollStartedAt + ARRIVE_MS;

        return sliceSpent && !screenOverdue;
      });

      show(next);
      if (undecided !== 'screen') scrollStartedAt = undefined;
      stopArrival = undecided
        ? whenIdle(
            arrive,
            scrollStartedAt === undefined
              ? undefined
              : scrollStartedAt + ARRIVE_MS - performance.now()
          )
        : undefined;
    };
    const move = () => {
      const ink = placer.follow(painted);

      moveFrame = 0;
      if (ink !== painted.ink) {
        surface.paint(ink);
      }
    };
    const stopAudit = () => {
      clearTimeout(settle);
      stopSlice?.();
      stopSlice = undefined;
      audit = undefined;
    };
    const slice = () => {
      const start = performance.now();

      audit ??= placer.audit();
      const marksLeft = audit(() => performance.now() - start >= SLICE_MS);

      if (marksLeft) {
        stopSlice = whenIdle(slice);

        return;
      }
      stopAudit();
      show(printing ? placer.placeEvery() : placer.place());
    };
    // A change that moves words and reports nothing, such as a style rule on
    // a neighbor, leaves a held decision stale, so the audit decides again
    // once the page has gone quiet.
    const settleLater = () => {
      stopAudit();
      settle = setTimeout(() => {
        stopSlice = whenIdle(slice);
      }, SETTLE_MS);
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(paint);
      settleLater();
    };
    const onScroll = ({ target }: Event) => {
      if (
        target instanceof Element &&
        target !== editable &&
        editable.contains(target)
      ) {
        return;
      }
      if (scrollStartedAt === undefined) {
        scrollStartedAt = performance.now();
        stopArrival?.();
        stopArrival = whenIdle(arrive, ARRIVE_MS);
      }
      moveFrame ||= requestAnimationFrame(move);
      settleLater();
    };
    const onPrint = () => {
      printing = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(moveFrame);
      frame = 0;
      moveFrame = 0;
      stopAudit();
      stopArriving();
      show(placer.placeEvery());
    };
    const onAfterPrint = () => {
      printing = false;
      schedule();
    };
    const savedSets = () => {
      const records = readShownRecords(editor);

      return [
        getRecordSetVersion(records, MARKS),
        getRecordSetVersion(records, COPIES),
        getRecordSetVersion(records, DIGITIZED),
      ] as const;
    };
    let saved = savedSets();
    const unsubscribe = editor.subscribeCommit(({ changed }) => {
      if (!changed.hasAny('document')) return;

      const next = savedSets();

      if (
        next[0] !== saved[0] ||
        next[1] !== saved[1] ||
        next[2] !== saved[2]
      ) {
        const { read } = view.plugin(InkPlugin);

        saved = next;
        surface.keep((mark) => read.mark(mark.id) === mark);
        picker.keep((mark) => read.mark(mark.id) === mark);
      }
      schedule();
    });
    const stopLayout = observeInkLayout(editable, layer, (change, within) => {
      placer.layoutChanged(change, within);
      attached.layoutChanged(change);
      if (change !== 'scroll') schedule();
    });

    page.addEventListener('scroll', onScroll, { capture: true, passive: true });
    win?.addEventListener('resize', schedule);
    win?.addEventListener('beforeprint', onPrint);
    win?.addEventListener('afterprint', onAfterPrint);
    const end = () => {
      attached.cancel();
      picker.cancel();
    };
    const stopTool = tools.subscribe((state, previous) => {
      if (state.tool !== previous.tool || state.hidden !== previous.hidden) {
        end();
      }
      if (state.showDigitized !== previous.showDigitized) {
        end();
        schedule();
      }
    });
    const stopViewState = subscribeEditorViewState(view, (change) => {
      if (change !== 'readOnly' && change !== 'authored') return;
      if (change === 'readOnly' || readShownPreview(view) !== undefined) {
        end();
        view.plugin(InkPlugin).api.setTool(null);
      }
    });

    schedule();

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(moveFrame);
      stopAudit();
      stopArriving();
      unsubscribe();
      stopTool();
      stopViewState();
      stopLayout();
      page.removeEventListener('scroll', onScroll, { capture: true });
      win?.removeEventListener('resize', schedule);
      win?.removeEventListener('beforeprint', onPrint);
      win?.removeEventListener('afterprint', onAfterPrint);
      attached.detach();
      picker.detach();
    };
  }, [editableRef, editor, layer, shown, surface, view]);

  React.useLayoutEffect(() => {
    surface?.setLook(hidden, picked);
  }, [hidden, picked, surface]);

  React.useLayoutEffect(() =>
    layer && !hidden ? stackInkSigns(layer, placed.signs) : undefined
  );

  return (
    <div
      data-ink-layer=""
      ref={setLayer}
      style={{
        cursor: tool ? 'crosshair' : undefined,
        inset: 0,
        minHeight: placed.bottom,
        pointerEvents: tool && !readOnly && !hidden ? 'auto' : 'none',
        position: 'absolute',
        touchAction: INK_TOUCH_ACTION,
        zIndex: 50,
      }}
    >
      <svg
        aria-hidden
        style={{
          height: '100%',
          left: 0,
          overflow: 'visible',
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          width: '100%',
        }}
      >
        <g ref={mountInk} />
        <path data-ink-stroke="" ref={preview} />
      </svg>
      {!hidden &&
        placed.signs.map(({ id, left, sign }) => (
          <div
            data-ink-sign={sign.state}
            key={id}
            style={{ left, pointerEvents: 'auto', position: 'absolute' }}
          >
            <Sign sign={sign} />
          </div>
        ))}
    </div>
  );
}
