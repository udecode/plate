import { createContext } from 'react';

import { type Path, PathApi, type Point, PointApi } from '../..';
import type { SoftLineSide } from '../../dom/dom-soft-line-end';
import { createDOMGeometryKernel } from '../../dom/internal';
import {
  getNearestPliteStringRect,
  getOwnedPliteTextStrings,
  getPliteStringPlacementAtX,
  getUsableRangeRects,
  PLITE_STRING_PRESS_REACH_PX,
  type PliteStringLetterPlacement,
  type PliteStringRectHit,
} from '../../dom/plugin/dom-geometry';
import { findMountedDOMNodeByPath } from '../../dom/plugin/dom-node-path';
import type { DOMPoint } from '../../dom/utils/dom';
import type { ReactRuntimeEditor } from '../plugin/react-editor';

export type NativeLineFlow = 'contiguous' | 'skips-placed-lines';

export type ViewLineDirection = 'down' | 'up';

export type ViewCaret = Readonly<{ point: Point; side: SoftLineSide | null }>;

export type ViewLineLanding = Readonly<{
  dom: DOMPoint | null;
  goalX?: number;
  point: Point;
}>;

export type PlacementReach = 'drag' | 'press';

export type ViewLines = Readonly<{
  interceptsLineMotion?: (nativeFlow: NativeLineFlow) => boolean;
  lineAfter: (
    query: Readonly<{
      direction: ViewLineDirection;
      from: ViewCaret;
      nativeFlow?: NativeLineFlow;
      readX: () => number | null;
    }>
  ) => ViewLineLanding | null;
  placementAt: (
    query: Readonly<{
      reach: PlacementReach;
      target: Element | null;
      x: number;
      y: number;
    }>
  ) => PliteStringLetterPlacement | null;
}>;

export const ViewLinesContext = createContext<ViewLines | null>(null);

export { getPliteStringDirectPlacement } from '../../dom/plugin/dom-geometry';

export const nearestViewText = ({
  editor,
  root,
  scopes,
  target,
  x,
  y,
}: Readonly<{
  editor: ReactRuntimeEditor;
  root: HTMLElement;
  scopes: ReadonlyArray<Readonly<{ path: Path; selector?: string }>>;
  target: Element | null;
  x: number;
  y: number;
}>): PliteStringRectHit | null => {
  const strings: HTMLElement[] = [];

  for (const { path, selector } of scopes) {
    const host = findMountedDOMNodeByPath(editor, path, root);
    const element = selector ? host?.querySelector(selector) : host;

    if (!element) continue;
    const pointerElement =
      target && element.contains(target)
        ? target.closest('[data-editor-node="element"]')
        : null;
    const pointerStrings =
      pointerElement &&
      pointerElement !== element &&
      element.contains(pointerElement)
        ? getOwnedPliteTextStrings(root, pointerElement)
        : [];

    if (pointerStrings.length > 0) {
      const hit = getNearestPliteStringRect({ strings: pointerStrings, x, y });

      return hit && { ...hit, horizontal: 0, vertical: 0 };
    }
    strings.push(...getOwnedPliteTextStrings(root, element));
  }

  return getNearestPliteStringRect({ strings, x, y });
};

export const placeOnViewText = (
  hit: PliteStringRectHit,
  { reach, x }: Readonly<{ reach: PlacementReach; x: number }>
) =>
  reach === 'press' && hit.vertical > PLITE_STRING_PRESS_REACH_PX
    ? null
    : getPliteStringPlacementAtX({ rect: hit.rect, string: hit.string, x });

const unionRect = (rects: readonly DOMRect[]) => {
  const left = Math.min(...rects.map((rect) => rect.left));
  const right = Math.max(...rects.map((rect) => rect.right));
  const top = Math.min(...rects.map((rect) => rect.top));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));

  return {
    bottom,
    height: bottom - top,
    left,
    right,
    top,
    width: right - left,
  };
};

export const landOnViewLine = ({
  editor,
  end,
  path,
  readX,
  root,
  start,
}: Readonly<{
  editor: ReactRuntimeEditor;
  end: Point;
  path: Path;
  readX: () => number | null;
  root: HTMLElement | null;
  start: Point;
}>): ViewLineLanding => {
  const atStart = { dom: null, point: start };

  if (!root) return atStart;
  const host = findMountedDOMNodeByPath(editor, path, root);
  const range = editor.api.dom.resolveDOMRange({ anchor: start, focus: end });
  const rects = range ? getUsableRangeRects(range) : [];
  const x = host && rects.length > 0 ? readX() : null;

  if (!host || x === null) return atStart;
  const hit = createDOMGeometryKernel({ root }).pointInVisualLine({
    host,
    line: unionRect(rects),
    x,
  });
  const dom: DOMPoint | null = hit && [hit[0], hit[1]];
  const point = dom
    ? editor.api.dom.resolvePoint(dom, { exactMatch: false })
    : null;

  return dom &&
    point &&
    PointApi.compare(point, start) >= 0 &&
    PointApi.compare(point, end) <= 0
    ? { dom, point }
    : atStart;
};

export const landInViewBlock = ({
  direction,
  editor,
  path,
  readX,
  root,
}: Readonly<{
  direction: ViewLineDirection;
  editor: ReactRuntimeEditor;
  path: Path;
  readX: () => number | null;
  root: HTMLElement | null;
}>): ViewLineLanding | null => {
  const edgePoint = editor.read((state) =>
    direction === 'down' ? state.points.start(path) : state.points.end(path)
  );

  if (!edgePoint) return null;
  const edge = { dom: null, point: edgePoint };

  if (!root) return edge;
  const host = findMountedDOMNodeByPath(editor, path, root);
  const rect = host?.getBoundingClientRect();
  const x = host && rect ? readX() : null;

  if (!host || !rect || x === null) return edge;
  const y = direction === 'down' ? rect.top + 1 : rect.bottom - 1;
  const kernel = createDOMGeometryKernel({ root, target: host });

  for (const useNative of [true, false]) {
    const hit = kernel.pointAtCoordinates({ useNative, x, y });

    if (!hit || !host.contains(hit.point[0])) continue;
    const dom: DOMPoint = [hit.point[0], hit.point[1]];
    const point = editor.api.dom.resolvePoint(dom, { exactMatch: false });

    if (point && PathApi.isAncestor(path, point.path)) {
      return { dom, point };
    }
  }
  return edge;
};
