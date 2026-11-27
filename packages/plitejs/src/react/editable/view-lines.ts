import { createContext, type KeyboardEvent } from 'react';

import { type Path, PathApi, type Point, PointApi } from '../..';
import { getSelection } from '../../dom';
import {
  resolveSoftLineEndDOMPoint,
  type SoftLineSide,
} from '../../dom/dom-soft-line-end';
import { createDOMGeometryKernel, hasDOMHostQuirk } from '../../dom/internal';
import { resolveDOMPointInRoot } from '../../dom/plugin/dom-editor';
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
import { readDOMSelectionPoints } from '../../dom/utils/selection-writes';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { writePliteViewSelection } from '../view-selection';
import { selectionSyncRepair } from './caret-engine';
import { findMountedEditableDOMRuntime } from './editable-dom-runtime';
import { isImeKeyDown } from './input-controller';
import {
  type EditableInputController,
  endSelectionImport,
} from './input-state';
import { findNestedEditable } from './interaction-owner';
import type { EditableRepairRequest } from './mutation-controller';
import { dispatchCommand, editorCommands } from './runtime-editor-api';

export type ViewLineDirection = 'down' | 'up';

export type ViewCaret = Readonly<{ point: Point; side: SoftLineSide | null }>;

export type ViewLineLanding = Readonly<{ dom: DOMPoint | null; point: Point }>;

export type PlacementReach = 'drag' | 'press';

export type ViewLines = Readonly<{
  hasDisjointLines?: () => boolean;
  lineAfter: (
    query: Readonly<{
      direction: ViewLineDirection;
      from: ViewCaret;
      nativeLinesReachable?: boolean;
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

const toPreferencePoint = ([node, offset]: DOMPoint) => ({ node, offset });

const isScrollContainer = (element: Element) => {
  const { overflowX, overflowY } = getComputedStyle(element);

  return [overflowX, overflowY].some(
    (overflow) => overflow !== 'visible' && overflow !== 'clip'
  );
};

const entersScrollContainer = (root: HTMLElement, from: Node, to: Node) => {
  for (
    let element = to.parentElement;
    element && element !== root;
    element = element.parentElement
  ) {
    if (element.contains(from)) return false;
    if (isScrollContainer(element)) return true;
  }
  return false;
};

const onSameLine = (a: DOMRect, b: DOMRect) =>
  Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) >
  Math.min(a.height, b.height) / 2;

const landInScrollContainer = ({
  direction,
  editor,
  focus,
  focusDOM,
  root,
}: Readonly<{
  direction: ViewLineDirection;
  editor: ReactRuntimeEditor;
  focus: Point;
  focusDOM: DOMPoint;
  root: HTMLElement;
}>): ViewLineLanding | null => {
  const adjacent = editor.read((state) => {
    const block = state.nodes.block({ at: focus, mode: 'lowest' });
    const edge =
      block &&
      (direction === 'down'
        ? state.points.end(block[1])
        : state.points.start(block[1]));
    const next =
      edge &&
      (direction === 'down'
        ? state.points.after(edge, { unit: 'offset' })
        : state.points.before(edge, { unit: 'offset' }));

    return edge && next ? { edge, next } : null;
  });

  if (!adjacent) return null;
  const nextDOM = resolveDOMPointInRoot(editor, adjacent.next, root);

  if (!nextDOM || !entersScrollContainer(root, focusDOM[0], nextDOM[0])) {
    return null;
  }
  const kernel = createDOMGeometryKernel({ root });
  const edgeDOM = resolveDOMPointInRoot(editor, adjacent.edge, root);
  const caret = kernel.pointRect(focusDOM);
  const edge = edgeDOM && kernel.pointRect(edgeDOM);

  if (!caret || !edge || !onSameLine(caret, edge)) return null;
  const line = kernel.pointRect(nextDOM);
  const host = kernel.visualLineHost(nextDOM);
  const x = kernel.verticalNavigationX(focusDOM);
  const hit =
    line && host && x !== null
      ? kernel.pointInVisualLine({ host, line, x })
      : null;
  const dom: DOMPoint = hit ? [hit[0], hit[1]] : nextDOM;

  return {
    dom,
    point:
      editor.api.dom.resolvePoint(dom, { exactMatch: false }) ?? adjacent.next,
  };
};

export const moveByRenderedLines = ({
  editor,
  event,
  inputController,
  viewLines,
}: {
  editor: ReactRuntimeEditor;
  event: KeyboardEvent<HTMLDivElement>;
  inputController: EditableInputController;
  viewLines: ViewLines | null | undefined;
}): EditableRepairRequest | null => {
  const direction =
    event.key === 'ArrowDown' ? 'down' : event.key === 'ArrowUp' ? 'up' : null;
  const root = event.currentTarget;
  const nativeLinesReachable = !hasDOMHostQuirk(
    event.nativeEvent,
    'line-motion-skips-out-of-flow-lines'
  );
  const paged =
    !!viewLines &&
    (!nativeLinesReachable || Boolean(viewLines.hasDisjointLines?.()));
  const scrolling = hasDOMHostQuirk(
    event.nativeEvent,
    'line-motion-enters-scroll-container-at-end'
  );

  if (
    !(paged || scrolling) ||
    !direction ||
    event.target !== root ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    isImeKeyDown(event.nativeEvent)
  ) {
    return null;
  }
  const domSelection = getSelection(
    root.getRootNode() as Document | ShadowRoot
  );
  const points = domSelection ? readDOMSelectionPoints(domSelection) : null;

  if (
    !points ||
    [points.anchor, points.focus].some(
      ([node]) => !root.contains(node) || !!findNestedEditable(root, node)
    )
  ) {
    return null;
  }
  const collapsed =
    points.anchor[0] === points.focus[0] &&
    points.anchor[1] === points.focus[1];

  if (!event.shiftKey && !collapsed) return null;
  const focus = editor.api.dom.resolvePoint(points.focus, {
    exactMatch: false,
  });
  const anchor = event.shiftKey
    ? editor.api.dom.resolvePoint(points.anchor, { exactMatch: false })
    : focus;

  if (!focus || !anchor) return null;
  const landing =
    (paged
      ? viewLines.lineAfter({
          direction,
          from: {
            point: focus,
            side: resolveSoftLineEndDOMPoint(points.focus)?.side ?? null,
          },
          nativeLinesReachable,
          readX: () =>
            createDOMGeometryKernel({ root }).verticalNavigationX(points.focus),
        })
      : null) ??
    (scrolling
      ? landInScrollContainer({
          direction,
          editor,
          focus,
          focusDOM: points.focus,
          root,
        })
      : null);

  if (!landing) return null;
  event.preventDefault();
  endSelectionImport(inputController);
  writePliteViewSelection(editor, null);
  const target = {
    anchor: event.shiftKey ? anchor : landing.point,
    focus: landing.point,
  };

  dispatchCommand(editor, editorCommands.select, { target });
  const runtime = findMountedEditableDOMRuntime(root);
  const landingDOM =
    landing.dom ??
    resolveDOMPointInRoot(editor, landing.point, root, 'forward');

  if (landingDOM) {
    runtime?.writeModelSelectionDOMPreference(
      target,
      toPreferencePoint(event.shiftKey ? points.anchor : landingDOM),
      toPreferencePoint(landingDOM)
    );
  } else {
    runtime?.clearModelSelectionDOMPreference();
  }
  return selectionSyncRepair();
};
