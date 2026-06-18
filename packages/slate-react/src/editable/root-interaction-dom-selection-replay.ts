const FIREFOX_USER_AGENT_RE = /\bFirefox\//;

export type ExpandedDOMSelectionSnapshot = {
  anchorNode: Node;
  anchorOffset: number;
  focusNode: Node;
  focusOffset: number;
};

export const hasExpandedDOMSelectionInTarget = (target: HTMLElement) => {
  const rootNode = target.getRootNode() as Document | ShadowRoot;
  const selection =
    'getSelection' in rootNode
      ? rootNode.getSelection()
      : target.ownerDocument.getSelection();

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
): ExpandedDOMSelectionSnapshot | null => {
  const rootNode = target.getRootNode() as Document | ShadowRoot;
  const selection =
    'getSelection' in rootNode
      ? rootNode.getSelection()
      : target.ownerDocument.getSelection();

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
    anchorNode,
    anchorOffset: selection.anchorOffset,
    focusNode,
    focusOffset: selection.focusOffset,
  };
};

export const restoreDOMSelectionInTarget = (
  target: HTMLElement,
  snapshot: ExpandedDOMSelectionSnapshot
) => {
  if (
    !target.contains(snapshot.anchorNode) ||
    !target.contains(snapshot.focusNode)
  ) {
    return;
  }

  const rootNode = target.getRootNode() as Document | ShadowRoot;
  const selection =
    'getSelection' in rootNode
      ? rootNode.getSelection()
      : target.ownerDocument.getSelection();

  if (!selection) {
    return;
  }

  selection.removeAllRanges();
  selection.setBaseAndExtent(
    snapshot.anchorNode,
    snapshot.anchorOffset,
    snapshot.focusNode,
    snapshot.focusOffset
  );
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
  const selection =
    'getSelection' in rootNode
      ? rootNode.getSelection()
      : target.ownerDocument.getSelection();

  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return false;
  }

  for (let index = 0; index < selection.rangeCount; index++) {
    const range = selection.getRangeAt(index);

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
  FIREFOX_USER_AGENT_RE.test(
    target.ownerDocument.defaultView?.navigator.userAgent ?? ''
  );

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
