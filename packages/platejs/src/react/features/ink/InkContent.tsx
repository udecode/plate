import * as React from 'react';

import { readShownPreview, subscribeEditorViewState } from '../../../facade';
import {
  useEditableRef,
  useEditor,
  useEditorSelector,
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
import { observeInkLayout } from './inkWatch.internal';

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

const firstElementAfter = (element: Element) => {
  for (let at: Element | null = element; at; at = at.parentElement) {
    if (at.nextElementSibling) return at.nextElementSibling;
  }

  return null;
};

/**
 * The ink plugin's `wrapContent` slot: the slot's content, then a layer with
 * the ink of its Editable, drawn over it and its margins. Each mark tracks its
 * words across edits and reflows across wraps by shape family, staying visible
 * on its block by default and clamping margin notes inside narrow viewports.
 * Deleting a marked block or emptying a marked text block removes its marks in
 * the same undo step. Pass the slot's props on, as in
 * `wrapContent: (props) => <InkContent {...props} />`, so the layer comes right
 * after the Editable and before every `afterEditable` slot.
 */
export function InkContent({
  children,
  className,
  style,
}: WrapContentProps & {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <>
      {children}
      <InkLayer className={className} style={style} />
    </>
  );
}

function InkLayer({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const editableRef = useEditableRef();
  const view = useEditor();
  const editor = useModelEditor();
  const tool = useViewStore(InkPlugin, (state) => state.tool);
  const hidden = useViewStore(InkPlugin, (state) => state.hidden);
  const picked = useViewStore(InkPlugin, (state) => state.picked);
  const readOnly = useEditorSelector(
    view,
    (current) =>
      current.read.view.isReadOnly() || readShownPreview(current) !== undefined,
    { dependsOn: ['readOnly', 'authored'] }
  );
  const [layer, setLayer] = React.useState<HTMLDivElement | null>(null);
  const [surface, setSurface] = React.useState<ReturnType<
    typeof createInkSurface
  > | null>(null);
  const mountInk = React.useCallback((into: SVGGElement | null) => {
    setSurface(into && createInkSurface(into));
  }, []);
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
      painted = next;
      surface.paint(next.ink);
      layer.style.minHeight = `${next.bottom}px`;
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
    const unsubscribe = editor.subscribeCommit(({ changed }) => {
      if (!changed.hasAny('document')) return;
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
  }, [editableRef, editor, layer, surface, view]);

  React.useLayoutEffect(() => {
    surface?.setLook(hidden, picked);
  }, [hidden, picked, surface]);

  const activeTool = tool && !readOnly && !hidden ? tool : null;

  return (
    <div
      className={className}
      data-ink-layer=""
      data-ink-tool={activeTool?.type}
      ref={setLayer}
      style={{
        ...style,
        cursor: activeTool ? 'var(--ink-cursor, crosshair)' : undefined,
        inset: 0,
        pointerEvents: activeTool ? 'auto' : 'none',
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
    </div>
  );
}
