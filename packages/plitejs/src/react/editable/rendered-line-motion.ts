import type { KeyboardEvent } from 'react';

import type { Point } from '../..';
import { getSelection } from '../../dom';
import { resolveSoftLineEndDOMPoint } from '../../dom/dom-soft-line-end';
import {
  createDOMGeometryKernel,
  hasDOMHostQuirk,
  isOnVisualRow,
  readEditableDOMSelectionPoints,
} from '../../dom/internal';
import { resolveDOMPointInRoot } from '../../dom/plugin/dom-editor';
import type { DOMPoint } from '../../dom/utils/dom';
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
import type {
  NativeLineFlow,
  ViewLineDirection,
  ViewLineLanding,
  ViewLines,
} from './view-lines';

export type EditableRenderedLineMoveResult = Readonly<{
  goalX?: number;
  repair: EditableRepairRequest;
}>;

const toPreferencePoint = ([node, offset]: DOMPoint) => ({ node, offset });

const isScrollContainer = (element: Element) => {
  const style = element.ownerDocument.defaultView?.getComputedStyle(element);

  if (!style) return false;
  const { overflowX, overflowY } = style;

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

const landInScrollContainer = ({
  direction,
  editor,
  focus,
  focusDOM,
  readX,
  root,
}: Readonly<{
  direction: ViewLineDirection;
  editor: ReactRuntimeEditor;
  focus: Point;
  focusDOM: DOMPoint;
  readX: () => number | null;
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

  if (!caret || !edge || !isOnVisualRow(caret, edge)) return null;
  const line = kernel.pointRect(nextDOM);
  const host = kernel.visualLineHost(nextDOM);
  const x = readX();
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
  preferredVerticalX,
  viewLines,
}: {
  editor: ReactRuntimeEditor;
  event: KeyboardEvent<HTMLDivElement>;
  inputController: EditableInputController;
  preferredVerticalX?: number;
  viewLines: ViewLines | null | undefined;
}): EditableRenderedLineMoveResult | null => {
  const direction =
    event.key === 'ArrowDown' ? 'down' : event.key === 'ArrowUp' ? 'up' : null;
  const root = event.currentTarget;
  const nativeFlow: NativeLineFlow = hasDOMHostQuirk(
    event.nativeEvent,
    'line-motion-skips-out-of-flow-lines'
  )
    ? 'skips-placed-lines'
    : 'contiguous';
  const paged =
    !!viewLines &&
    (viewLines.interceptsLineMotion
      ? viewLines.interceptsLineMotion(nativeFlow)
      : nativeFlow === 'skips-placed-lines');
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
  const points = readEditableDOMSelectionPoints(root, domSelection);

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
  let resolvedX: number | null | undefined;
  const readX = () => {
    if (resolvedX !== undefined) return resolvedX;
    resolvedX =
      preferredVerticalX ??
      createDOMGeometryKernel({ root }).verticalNavigationX(points.focus);

    return resolvedX;
  };
  const landing =
    (paged
      ? viewLines.lineAfter({
          direction,
          from: {
            point: focus,
            side: resolveSoftLineEndDOMPoint(points.focus)?.side ?? null,
          },
          nativeFlow,
          readX,
        })
      : null) ??
    (scrolling
      ? landInScrollContainer({
          direction,
          editor,
          focus,
          focusDOM: points.focus,
          readX,
          root,
        })
      : null);

  if (!landing) return null;
  event.preventDefault();
  endSelectionImport(inputController);
  const target = {
    anchor: event.shiftKey ? anchor : landing.point,
    focus: landing.point,
  };

  writePliteViewSelection(editor, null, {
    place: () => {
      dispatchCommand(editor, editorCommands.select, { target });
    },
  });
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
  const goalX = landing.goalX ?? preferredVerticalX ?? resolvedX ?? undefined;

  return {
    ...(goalX !== undefined ? { goalX } : {}),
    repair: selectionSyncRepair(),
  };
};
