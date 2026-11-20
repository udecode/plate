import * as React from 'react';

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
 * when a margin note's margin is too narrow for it.
 */
export type InkSign = Readonly<{
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
      sign.marks.join(',') === b.signs[at].sign.marks.join(',')
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
 * and keeps the Editable's focus and caret. A finger still scrolls, and other
 * mouse buttons keep their own behavior. The view's `hidden` hides ink and
 * signs, and picked marks paint with a halo. Turning the view read-only turns
 * the tool off. The layer fills the nearest positioned ancestor of the
 * Editable, which should hold the Editable and its margins, and reaches at
 * least to the Editable's bottom, so it covers the whole content of a
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
  const readOnly = useEditorViewState(view, (state) => state.isReadOnly());
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
  const currentTool = React.useRef(tool);
  const capture = React.useRef<ReturnType<typeof attachInkCapture>>(null);

  React.useLayoutEffect(() => {
    currentTool.current = tool;
  }, [tool]);

  React.useEffect(() => {
    if (!readOnly) return;
    capture.current?.cancel();
    view.plugin(InkPlugin).api.setTool(null);
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

    const attached = attachInkCapture({
      editor,
      layer,
      preview: path,
      tool: () => currentTool.current,
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
    let scrollStartedAt: number | undefined;
    let stopArrival: (() => void) | undefined;
    const show = (next: InkPlaced) => {
      const { bottom, ink, signs } = next;

      painted = next;
      surface.paint(view.plugin(InkPlugin).read.marks(), ink);
      if (!sameSigns(next, shown.get())) shown.set({ bottom, signs });
    };
    const stopArriving = () => {
      stopArrival?.();
      stopArrival = undefined;
      scrollStartedAt = undefined;
    };
    const paint = () => {
      frame = 0;
      show(placer.place());
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
        surface.paint(view.plugin(InkPlugin).read.marks(), ink);
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
      show(placer.place());
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
      cancelAnimationFrame(frame);
      cancelAnimationFrame(moveFrame);
      frame = 0;
      moveFrame = 0;
      stopAudit();
      stopArriving();
      show(placer.placeEvery());
    };
    const unsubscribe = editor.subscribeCommit(({ changed }) => {
      if (!changed.hasAny('document')) return;
      if (
        changed.nodeKeysAll('presence').length > 0 ||
        changed.hasAny('properties')
      ) {
        placer.nodesChanged();
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
    capture.current = attached;
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(moveFrame);
      stopAudit();
      stopArriving();
      unsubscribe();
      stopLayout();
      page.removeEventListener('scroll', onScroll, { capture: true });
      win?.removeEventListener('resize', schedule);
      win?.removeEventListener('beforeprint', onPrint);
      attached.detach();
      capture.current = null;
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
        pointerEvents: tool && !readOnly ? 'auto' : 'none',
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
