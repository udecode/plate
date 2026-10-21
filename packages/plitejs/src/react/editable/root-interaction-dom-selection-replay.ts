import { getSelection } from '../../dom';
import { isGeckoDOMHost } from '../../dom/internal';
import {
  type DOMSelectionPoints,
  readDOMSelectionRange,
  writeDOMSelection,
} from '../../dom/utils/selection-writes';

export const hasExpandedDOMSelectionInTarget = (target: HTMLElement) => {
  const rootNode = target.getRootNode() as Document | ShadowRoot;
  const selection = getSelection(rootNode);

  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return false;
  }

  const { anchorNode, focusNode } = selection;

  return (
    !!anchorNode &&
    !!focusNode &&
    target.contains(anchorNode) &&
    target.contains(focusNode)
  );
};

export const getExpandedDOMSelectionInTarget = (
  target: HTMLElement
): DOMSelectionPoints | null => {
  const rootNode = target.getRootNode() as Document | ShadowRoot;
  const selection = getSelection(rootNode);

  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null;
  }

  const { anchorNode, focusNode } = selection;

  if (
    !anchorNode ||
    !focusNode ||
    !target.contains(anchorNode) ||
    !target.contains(focusNode)
  ) {
    return null;
  }

  return {
    anchor: [anchorNode, selection.anchorOffset],
    focus: [focusNode, selection.focusOffset],
  };
};

export const restoreDOMSelectionInTarget = (
  target: HTMLElement,
  points: DOMSelectionPoints
) => {
  if (!target.contains(points.anchor[0]) || !target.contains(points.focus[0])) {
    return false;
  }

  const rootNode = target.getRootNode() as Document | ShadowRoot;

  if (!getSelection(rootNode)) {
    return false;
  }

  writeDOMSelection(rootNode, points);

  return true;
};

export const isPointInsideDOMSelection = ({
  clientX,
  clientY,
  target,
}: {
  clientX: number;
  clientY: number;
  target: HTMLElement;
}) => {
  const rootNode = target.getRootNode() as Document | ShadowRoot;
  const selection = getSelection(rootNode);

  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return false;
  }

  for (let index = 0; index < selection.rangeCount; index++) {
    const range = readDOMSelectionRange(selection, index);

    for (const rect of Array.from(range.getClientRects())) {
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        return true;
      }
    }
  }

  return false;
};

export const needsMouseUpDOMSelectionReplay = (target: HTMLElement) =>
  isGeckoDOMHost(target);

export const shouldReplayMouseUpDOMSelection = ({
  hasExpandedDOMRange,
  isFirefox,
  nativeSelectedTextClick,
  pointerMoved,
}: {
  hasExpandedDOMRange: boolean;
  isFirefox: boolean;
  nativeSelectedTextClick: boolean;
  pointerMoved: boolean;
}) =>
  hasExpandedDOMRange && isFirefox && pointerMoved && !nativeSelectedTextClick;
