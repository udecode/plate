import React from 'react';

import type { InkCopy, InkMark, InkRun } from '../../../features/ink/lib';
import { INK_VOID } from '../../../features/ink/lib/inkMatch.internal';
import { useEditor, useEditorSelector } from '../../core';
import { inkOutline } from './inkPaint.internal';
import { InkPlugin } from './InkPlugin';

const LINE_HEIGHT_PER_FONT_SIZE = 1.2;

type Anchor = Readonly<{ left: number; top: number }>;

type Edge = Readonly<{ at: number; x: number }>;

const sameIds = (a: readonly string[] | null, b: readonly string[]) =>
  a !== null && a.length === b.length && a.every((id, at) => id === b[at]);

const span = (values: readonly number[]) =>
  values.reduce(
    ([low, high], value) => [Math.min(low, value), Math.max(high, value)],
    [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
  );

const anchorOf = (mark: InkMark): Anchor => ({
  left: Math.min(...mark.blocks.map((block) => block.left)),
  top: Math.min(...mark.blocks.map((block) => block.top)),
});

const placesOf = (mark: InkMark, anchor: Anchor) =>
  mark.blocks.map(
    (block) =>
      [block.copy, block.left - anchor.left, block.top - anchor.top] as const
  );

const grows = (from: Edge, to: Edge) => to.at > from.at && to.x >= from.x;

const sliceCopyText = (copy: InkCopy, from: number, to: number) => {
  const slice = copy.text.slice(from, to);

  if (!copy.voidLabels || !slice.includes(INK_VOID)) return slice;

  let rendered = '';

  for (let index = 0; index < slice.length; index += 1) {
    const ch = slice[index];

    rendered += ch === INK_VOID ? (copy.voidLabels[from + index] ?? ch) : ch;
  }

  return rendered;
};

const piecesOf = (copy: InkCopy, runs: readonly InkRun[]) =>
  copy.lines.flatMap((line, index) => {
    const start = index === 0 ? 0 : copy.lines[index - 1].end;
    const end: Edge = { at: line.end, x: line.left + line.width };
    const kept: Edge[] = [{ at: start, x: line.left }];
    const inner = runs
      .filter((run) => run.start >= start && run.end <= line.end)
      .flatMap((run) => [
        { at: run.start, x: run.left },
        { at: run.end, x: run.left + run.width },
      ])
      .sort((a, b) => a.at - b.at);

    for (const edge of inner) {
      if (grows(kept.at(-1) ?? end, edge) && grows(edge, end)) kept.push(edge);
    }
    if (end.at > start) kept.push(end);

    return kept.slice(1).map((to, at) => ({ from: kept[at], line, to }));
  });

/**
 * The words the marks `marks` names were drawn on, as plain text laid out by
 * their saved lines, with each mark's ink over them. Marks drawn on the
 * same blocks share one copy, and the copy's box takes in their ink, so a
 * note drawn in the margin shows beside its words. A mark no longer saved
 * shows nothing.
 */
export function InkCopyView({ marks }: { marks: readonly string[] }) {
  const editor = useEditor();
  const saved = useEditorSelector(
    () => marks.filter((id) => editor.plugin(InkPlugin).read.mark(id)),
    { equalityFn: sameIds }
  );
  const { read } = editor.plugin(InkPlugin);
  const shown = new Map<
    string,
    {
      copies: readonly InkCopy[];
      drawn: Array<Readonly<{ anchor: Anchor; mark: InkMark }>>;
    }
  >();

  for (const id of saved) {
    const mark = read.mark(id);
    const copies = mark?.blocks.flatMap((block) => read.copy(block.copy) ?? []);

    if (!mark || copies?.length !== mark.blocks.length) continue;

    const anchor = anchorOf(mark);
    const key = JSON.stringify(
      placesOf(mark, anchor).sort(
        ([copyA, leftA, topA], [copyB, leftB, topB]) =>
          copyA === copyB
            ? leftA - leftB || topA - topB
            : copyA < copyB
              ? -1
              : 1
      )
    );
    const group = shown.get(key);

    if (group) group.drawn.push({ anchor, mark });
    else shown.set(key, { copies, drawn: [{ anchor, mark }] });
  }

  return (
    <div data-ink-copy-view="">
      {[...shown.values()].map(({ copies, drawn }) => {
        const [{ anchor: origin, mark: frame }] = drawn;
        const framePlaces = placesOf(frame, origin);
        const shifts = drawn.map(({ anchor, mark }) => ({
          dx: origin.left - anchor.left,
          dy: origin.top - anchor.top,
          mark,
          places: placesOf(mark, anchor),
          // perfect-freehand draws a lone point as two points a hair apart,
          // so a full-pressure dot reaches a hair past half the brush.
          reach: mark.brush.size / 2 + 1,
        }));
        const [left, right] = span([
          ...frame.blocks.flatMap((block, at) => [
            block.left,
            block.left + copies[at].width,
          ]),
          ...shifts.flatMap(({ dx, mark, reach }) =>
            mark.samples.flatMap(([x]) => [x + dx - reach, x + dx + reach])
          ),
        ]);
        const [top, bottom] = span([
          ...frame.blocks.flatMap((block, at) => [
            block.top,
            block.top + copies[at].height,
          ]),
          ...shifts.flatMap(({ dy, mark, reach }) =>
            mark.samples.flatMap(([, y]) => [y + dy - reach, y + dy + reach])
          ),
        ]);
        const width = right - left;
        const height = bottom - top;

        return (
          <div
            data-ink-copy={drawn.map(({ mark }) => mark.id).join(' ')}
            key={frame.id}
            style={{ height, position: 'relative', width }}
          >
            <svg
              height={height}
              style={{
                left: 0,
                overflow: 'visible',
                position: 'absolute',
                top: 0,
              }}
              width={width}
            >
              {frame.blocks.map((block, at) => {
                const [copyId, offsetLeft, offsetTop] = framePlaces[at];
                const runs = shifts
                  .filter(({ mark }) => mark.direction === 'ltr')
                  .flatMap(({ mark, places }) => {
                    const index = places.findIndex(
                      ([id, dx, dy]) =>
                        id === copyId && dx === offsetLeft && dy === offsetTop
                    );

                    return index === -1 ? [] : mark.blocks[index].runs;
                  });

                return piecesOf(copies[at], runs).map(({ from, line, to }) => (
                  <text
                    dominantBaseline="central"
                    fill="currentColor"
                    fontSize={line.height / LINE_HEIGHT_PER_FONT_SIZE}
                    key={`${at}:${from.at}`}
                    lengthAdjust="spacingAndGlyphs"
                    style={{ whiteSpace: 'pre' }}
                    textLength={to.x > from.x ? to.x - from.x : undefined}
                    x={block.left - left + from.x}
                    xmlSpace="preserve"
                    y={block.top - top + line.top + line.height / 2}
                  >
                    {sliceCopyText(copies[at], from.at, to.at)}
                  </text>
                ));
              })}
              {shifts.map(({ dx, dy, mark }) => (
                <path
                  aria-hidden
                  d={inkOutline(mark.samples, mark.brush, {
                    dx: dx - left,
                    dy: dy - top,
                  })}
                  fill={mark.brush.color}
                  key={mark.id}
                  opacity={mark.brush.opacity}
                />
              ))}
            </svg>
          </div>
        );
      })}
    </div>
  );
}
