import { createContext, type KeyboardEvent } from 'react';

import { type Path, PathApi, type Point, PointApi } from '../..';
import { getSelection } from '../../dom';
import {
  resolveSoftLineEndDOMPoint,
  type SoftLineSide,
} from '../../dom/dom-soft-line-end';
import { createDOMGeometryKernel, hasDOMHostQuirk } from '../../dom/internal';
import { resolveDOMPointInRoot } from '../../dom/plugin/dom-editor';
import { getUsableRangeRects } from '../../dom/plugin/dom-geometry';
import { findMountedDOMNodeByPath } from '../../dom/plugin/dom-node-path';
import type { DOMPoint } from '../../dom/utils/dom';
import { readDOMSelectionPoints } from '../../dom/utils/selection-writes';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { writePliteViewSelection } from '../view-selection';
import { selectionSyncRepair } from './caret-engine';
import { findMountedEditableDOMRuntime } from './editable-dom-runtime';
import { isImeKeyDown, isNestedEditableDOMTarget } from './input-controller';
import {
  type EditableInputController,
  endSelectionImport,
} from './input-state';
import type { EditableRepairRequest } from './mutation-controller';
import { dispatchCommand, editorCommands } from './runtime-editor-api';

export type ViewLineDirection = 'down' | 'up';

export type ViewCaret = Readonly<{ point: Point; side: SoftLineSide | null }>;

export type ViewLineLanding = Readonly<{ dom: DOMPoint | null; point: Point }>;

export type ViewLines = Readonly<{
  lineAfter: (
    query: Readonly<{
      direction: ViewLineDirection;
      from: ViewCaret;
      readX: () => number | null;
    }>
  ) => ViewLineLanding | null;
}>;

export const ViewLinesContext = createContext<ViewLines | null>(null);

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

export const moveByViewLines = ({
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

  if (
    !viewLines ||
    !direction ||
    event.target !== root ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    isImeKeyDown(event.nativeEvent) ||
    !hasDOMHostQuirk(event.nativeEvent, 'line-motion-skips-out-of-flow-lines')
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
      ([node]) => !root.contains(node) || isNestedEditableDOMTarget(root, node)
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
  const landing = viewLines.lineAfter({
    direction,
    from: {
      point: focus,
      side: resolveSoftLineEndDOMPoint(points.focus)?.side ?? null,
    },
    readX: () =>
      createDOMGeometryKernel({ root }).verticalNavigationX(points.focus),
  });

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
