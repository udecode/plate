import * as React from 'react';

import type { NodeKey } from '../../../facade';
import type { InkMark } from '../../../features/ink/lib';
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
import { createInkLayouts } from './inkLayout.internal';
import {
  type InkMeasuredBlock,
  inkBoxOf,
  inkTextBlocks,
} from './inkMeasure.internal';
import { inkOutline } from './inkPaint.internal';
import {
  type InkPlaced,
  inkInputs,
  NOTHING_PLACED,
  placeInkMarks,
  placeOnInputs,
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

const placeAll = (
  view: Editor,
  layer: HTMLElement,
  editable: HTMLElement,
  layouts: ReturnType<typeof createInkLayouts>
): InkPlaced => {
  const { left, top, width } = layer.getBoundingClientRect();
  const origin = { left, top };
  const boxes = inkTextBlocks(view).map((block) => ({
    block,
    box: inkBoxOf(block.element, origin),
    key: block.key,
  }));
  const byKey = new Map(boxes.map((entry) => [entry.key, entry]));
  const measured = new Map<NodeKey, InkMeasuredBlock | undefined>();
  const measure = (key: NodeKey) => {
    if (!measured.has(key)) {
      const entry = byKey.get(key);

      measured.set(
        key,
        entry &&
          layouts.measure(
            entry.block.element,
            entry.block.text,
            entry.box,
            origin
          )
      );
    }

    return measured.get(key);
  };

  return placeInkMarks(
    view,
    editable,
    origin,
    view.plugin(InkPlugin).read.marks(),
    (mark, copies, places) =>
      placeOnInputs(
        mark,
        copies,
        inkInputs(mark, copies, places, measure, () => boxes),
        width
      )
  );
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
      editor,
      layer,
      preview: path,
      tool: () => currentTool.current,
      view,
    });
    const layouts = createInkLayouts();
    let frame = 0;
    const paint = () => {
      frame = 0;
      setPlaced(placeAll(view, layer, editable, layouts));
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(paint);
    };
    const unsubscribe = editor.subscribeCommit(({ changed }) => {
      if (changed.hasAny('document')) schedule();
    });
    const stopLayout = observeInkLayout(editable, layer, (change, within) => {
      layouts.changed(change, within);
      attached.layoutChanged(change);
      schedule();
    });

    capture.current = attached;
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
      stopLayout();
      attached.detach();
      capture.current = null;
    };
  }, [editableRef, editor, layer, view]);

  React.useLayoutEffect(() =>
    layer && !hidden ? stackInkSigns(layer, placed.signs) : undefined
  );

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
