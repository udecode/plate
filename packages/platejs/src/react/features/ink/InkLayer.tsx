import * as React from 'react';

import type { NodeKey } from '../../../facade';
import type { InkCopy, InkCopyPlace, InkMark } from '../../../features/ink/lib';
import {
  type InkBox,
  inkWords,
  placeMark,
} from '../../../features/ink/lib/inkMatch.internal';
import {
  type EditableSiblingProps,
  type Editor,
  useEditor,
  useEditorViewState,
  useModelEditor,
  useViewStore,
} from '../../core';
import { attachInkCapture } from './inkCapture.internal';
import { INK_TOUCH_ACTION } from './inkInput.internal';
import {
  type InkMeasuredBlock,
  inkBoxOf,
  inkTextBlocks,
  measureInkBlock,
} from './inkMeasure.internal';
import { inkOutline } from './inkPaint.internal';
import { InkPlugin } from './InkPlugin';

/**
 * Marks whose ink is not on the page, shown as one sign: `changed` when their
 * words changed or moved, `deleted` when a marked block is gone, and `narrow`
 * when a margin note's margin is too narrow for it.
 */
export type InkSign = Readonly<{
  marks: readonly string[];
  state: 'changed' | 'deleted' | 'narrow';
}>;

type Placed = Readonly<{
  bottom: number;
  ink: ReadonlyArray<Readonly<{ dx: number; dy: number; mark: InkMark }>>;
  signs: ReadonlyArray<
    Readonly<{ id: string; left: number; sign: InkSign; top: number }>
  >;
}>;

const NOTHING_PLACED: Placed = { bottom: 0, ink: [], signs: [] };

const DELETED = { reason: 'deleted', type: 'sign' } as const;

const wordBoxes = (live: InkMeasuredBlock): InkBox[] =>
  inkWords(live.text).flatMap(([start, end]) =>
    live.lines.flatMap((line, index) => {
      const from = Math.max(start, index === 0 ? 0 : live.lines[index - 1].end);
      const to = Math.min(end, line.end);
      const box = from < to ? live.measure(from, to) : undefined;

      return box
        ? [
            {
              ...box,
              left: live.box.left + box.left,
              top: live.box.top + box.top,
            },
          ]
        : [];
    })
  );

const placeAll = (
  view: Editor,
  layer: HTMLElement,
  editable: HTMLElement
): Placed => {
  const { left, top, width } = layer.getBoundingClientRect();
  const origin = { left, top };
  const { read } = view.plugin(InkPlugin);
  const blocks = inkTextBlocks(view);
  const byKey = new Map(blocks.map((block) => [block.key, block]));
  const boxes = blocks.map((block) => ({
    box: inkBoxOf(block.element, origin),
    key: block.key,
  }));
  const measured = new Map<NodeKey, InkMeasuredBlock | undefined>();
  const measure = (key: NodeKey) => {
    if (!measured.has(key)) {
      const block = byKey.get(key);

      measured.set(
        key,
        block && measureInkBlock(block.element, block.text, origin)
      );
    }

    return measured.get(key);
  };
  const editableBox = inkBoxOf(editable, origin);
  const style = getComputedStyle(editable);
  const rails = {
    ltr:
      editableBox.left +
      editableBox.width -
      (Number.parseFloat(style.paddingRight) || 0),
    rtl: editableBox.left,
  };
  const startTop = editableBox.top + (Number.parseFloat(style.paddingTop) || 0);
  const anchorOf = (place: InkCopyPlace | undefined) => {
    if (place?.kind === 'live' || place?.kind === 'changed') {
      const element = view.api.dom.resolveDOMNode(place.key);

      return {
        id: place.key,
        top: element ? inkBoxOf(element, origin).top : startTop,
      };
    }

    const beside = place?.kind === 'gone' ? place.beside : undefined;

    if (!beside || beside.at === 'start') return { id: 'start', top: startTop };

    const element = view.api.dom.resolveDOMNode(beside.key);
    const box = element ? inkBoxOf(element, origin) : undefined;

    return {
      id: `${beside.at}:${beside.key}`,
      top: box ? box.top + (beside.at === 'after' ? box.height : 0) : startTop,
    };
  };
  const placeOnPage = (
    mark: InkMark,
    copies: readonly InkCopy[],
    places: ReadonlyArray<InkCopyPlace | undefined>
  ) => {
    const live = places.map((place) =>
      place && place.kind !== 'gone' ? measure(place.key) : undefined
    );
    const at = live.findIndex((block) => block !== undefined);
    const first = live[at];
    const reach =
      mark.brush.size / 2 +
      Math.max(
        0,
        ...copies.flatMap((copy) => copy.lines.map((line) => line.height))
      );
    const shift = first ? first.box.top - mark.blocks[at].top : 0;
    const ys = mark.samples.map(([, y]) => y + shift);
    const low = Math.min(...ys) - reach;
    const high = Math.max(...ys) + reach;
    const marked = new Set(
      places.flatMap((place) =>
        place && place.kind !== 'gone' ? [place.key] : []
      )
    );
    const nearby = boxes.flatMap(({ box, key }) => {
      if (marked.has(key) || box.top > high || box.top + box.height < low) {
        return [];
      }

      const block = measure(key);

      return block ? wordBoxes(block) : [];
    });
    return placeMark({
      copies,
      live,
      margins: first
        ? {
            left: first.box.left,
            right: width - first.box.left - first.box.width,
          }
        : { left: 0, right: 0 },
      mark,
      nearby,
    });
  };
  const ink: Array<Placed['ink'][number]> = [];
  const signs = new Map<
    string,
    Readonly<{
      left: number;
      marks: string[];
      state: InkSign['state'];
      top: number;
    }>
  >();

  for (const mark of read.marks()) {
    const copies = mark.blocks.flatMap((block) => read.copy(block.copy) ?? []);

    if (copies.length !== mark.blocks.length) continue;

    const places = copies.map((copy) => read.place(copy.id));
    const placement = places.some((place) => place?.kind === 'gone')
      ? DELETED
      : placeOnPage(mark, copies, places);

    if (placement.type === 'ink') {
      ink.push({ dx: placement.dx, dy: placement.dy, mark });
    }

    const state = placement.type === 'sign' ? placement.reason : placement.sign;

    if (!state) continue;

    const signAt = Math.max(
      0,
      places.findIndex((place) => place?.kind !== 'live')
    );
    const anchor = anchorOf(places[signAt]);
    const id = `${mark.direction}|${anchor.id}|${state}`;
    const sign = signs.get(id) ?? {
      left: rails[mark.direction],
      marks: [],
      state,
      top: anchor.top,
    };

    sign.marks.push(mark.id);
    signs.set(id, sign);
  }

  return {
    bottom: editable.offsetTop + editable.offsetHeight,
    ink,
    signs: [...signs].map(([id, { marks, state, ...place }]) => ({
      ...place,
      id,
      sign: { marks, state },
    })),
  };
};

const useStackedSignTops = (
  layer: HTMLDivElement | null,
  signs: Placed['signs'],
  hidden: boolean
) => {
  React.useLayoutEffect(() => {
    if (!layer || hidden) return;

    const elements = layer.querySelectorAll<HTMLElement>(
      ':scope > [data-ink-sign]'
    );
    const bottoms = new Map<number, number>();
    const byTop = signs
      .map(({ left, top }, index) => ({ element: elements[index], left, top }))
      .sort((a, b) => a.top - b.top);

    for (const { element, left, top } of byTop) {
      const at = Math.max(top, bottoms.get(left) ?? top);

      element.style.top = `${at}px`;
      bottoms.set(left, at + element.getBoundingClientRect().height);
    }
  });
};

/**
 * The ink of a mounted Editable, drawn over it and its margins. Each mark
 * draws on its words while they stand as they were when it was drawn, and
 * otherwise shows as a `sign` in the Editable's padding where the mark's lines
 * end, the left padding for a mark drawn in right-to-left text: at its
 * block's top when the block's words changed or cannot be measured, or a
 * margin note's margin is too narrow, and beside the nearest block left when a
 * marked block is gone, or on the document's start when none is left. A place
 * shows one sign per state, and a sign that would cover the one above it on its
 * side of the Editable moves down below it. A press on a sign is the sign's
 * own. With the Draw tool on, a pen or the primary
 * mouse button draws a mark, which saves when the contact ends and keeps the
 * Editable's focus and caret. A finger still scrolls, and other mouse buttons
 * keep their own behavior. The view's `hidden` hides ink and signs, and picked
 * marks paint with a halo. Turning the view read-only turns the tool off. The
 * layer fills the nearest positioned ancestor of the Editable, which should
 * hold the Editable and its margins, and reaches at least to the Editable's
 * bottom, so it covers the whole content of a scrolling ancestor.
 */
export function InkLayer({
  editableRef,
  sign: Sign,
}: EditableSiblingProps & {
  sign: React.ComponentType<{ sign: InkSign }>;
}) {
  const view = useEditor();
  const editor = useModelEditor();
  const tool = useViewStore(InkPlugin, (state) => state.tool);
  const hidden = useViewStore(InkPlugin, (state) => state.hidden);
  const picked = useViewStore(InkPlugin, (state) => state.picked);
  const readOnly = useEditorViewState(view, (state) => state.isReadOnly());
  const [layer, setLayer] = React.useState<HTMLDivElement | null>(null);
  const [placed, setPlaced] = React.useState(NOTHING_PLACED);
  const [outlines] = React.useState(() => new Map<string, string>());
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

    if (!layer || !editable || !path) return undefined;

    const attached = attachInkCapture({
      editable,
      editor,
      layer,
      preview: path,
      tool: () => currentTool.current,
      view,
    });
    let frame = 0;
    const paint = () => {
      frame = 0;
      setPlaced(placeAll(view, layer, editable));
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(paint);
    };
    const unsubscribe = editor.subscribeCommit(({ changed }) => {
      if (changed.hasAny('document')) schedule();
    });
    const resize = new ResizeObserver(schedule);
    // jsdom and happy-dom have no FontFaceSet.
    const fonts = layer.ownerDocument.fonts as FontFaceSet | undefined;

    capture.current = attached;
    resize.observe(editable);
    resize.observe(layer);
    fonts?.addEventListener('loadingdone', schedule);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
      resize.disconnect();
      fonts?.removeEventListener('loadingdone', schedule);
      attached.detach();
      capture.current = null;
    };
  }, [editableRef, editor, layer, view]);

  useStackedSignTops(layer, placed.signs, hidden);

  const outlineOf = (mark: InkMark) => {
    let outline = outlines.get(mark.id);

    if (outline === undefined) {
      outline = inkOutline(mark.samples, mark.brush);
      outlines.set(mark.id, outline);
    }

    return outline;
  };

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
        {!hidden &&
          placed.ink.map(({ dx, dy, mark }) => {
            const halo = picked.includes(mark.id);

            return (
              <path
                d={outlineOf(mark)}
                data-ink-mark={mark.id}
                data-picked={halo || undefined}
                fill={mark.brush.color}
                key={mark.id}
                opacity={mark.brush.opacity}
                stroke={halo ? mark.brush.color : undefined}
                strokeOpacity={halo ? 0.35 : undefined}
                strokeWidth={halo ? mark.brush.size * 2 : undefined}
                transform={`translate(${dx} ${dy})`}
              />
            );
          })}
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
