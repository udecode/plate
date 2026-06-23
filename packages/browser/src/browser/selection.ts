/** Plite model selection endpoint captured from the DOM. */
export type EditorSelectionPoint = {
  path: number[];
  offset: number;
};

/** Plite model selection snapshot resolved from browser selection endpoints. */
export type EditorSelectionSnapshot = {
  anchor: EditorSelectionPoint;
  focus: EditorSelectionPoint;
};

/** Browser-native selection endpoint snapshot for debug proof. */
export type DOMSelectionSnapshot = {
  anchorNodeText: string | null;
  anchorOffset: number;
  focusNodeText: string | null;
  focusOffset: number;
};

const parsePlitePath = (value: string) => {
  const path = value.split(',').map((part) => Number.parseInt(part, 10));

  if (path.some((part) => !Number.isInteger(part))) {
    throw new Error('Invalid Plite DOM path');
  }

  return path;
};

const findZeroWidthMarker = (node: Node | null) => {
  const element =
    node?.nodeType === 1 ? (node as Element) : node?.parentElement;

  return element?.closest('[data-plite-zero-width]') ?? null;
};

const toEditorOffset = (node: Node | null, offset: number) =>
  findZeroWidthMarker(node) ? 0 : offset;

const findTextPath = (root: ParentNode, node: Node | null) => {
  const owner =
    node?.nodeType === 1
      ? (node as Element).closest('[data-plite-node="text"]')
      : node?.parentElement?.closest('[data-plite-node="text"]');

  if (!owner) {
    throw new Error('Cannot resolve selection to a Plite text node');
  }

  if (!(root as Node).contains(owner)) {
    throw new Error('Selection text node is outside the editor root');
  }

  const pathAttribute = owner.getAttribute('data-plite-path');

  if (pathAttribute) {
    return parsePlitePath(pathAttribute);
  }

  throw new Error('Cannot resolve selection to a Plite DOM path');
};

const findTextPathOrNull = (root: ParentNode, node: Node | null) => {
  try {
    return findTextPath(root, node);
  } catch {
    return null;
  }
};

/** Capture the browser-native selection endpoints for debugging. */
export const takeDOMSelectionSnapshot = (
  selection: Selection | null
): DOMSelectionSnapshot | null => {
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  return {
    anchorNodeText: selection.anchorNode?.textContent ?? null,
    anchorOffset: selection.anchorOffset,
    focusNodeText: selection.focusNode?.textContent ?? null,
    focusOffset: selection.focusOffset,
  };
};

/** Resolve browser selection endpoints back to Plite text paths and offsets. */
export const takeEditorSelectionSnapshot = (
  root: ParentNode,
  selection: Selection | null
): EditorSelectionSnapshot | null => {
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const anchorPath = findTextPathOrNull(root, selection.anchorNode);
  const focusPath = findTextPathOrNull(root, selection.focusNode);

  if (anchorPath === null || focusPath === null) {
    return null;
  }

  return {
    anchor: {
      path: anchorPath,
      offset: toEditorOffset(selection.anchorNode, selection.anchorOffset),
    },
    focus: {
      path: focusPath,
      offset: toEditorOffset(selection.focusNode, selection.focusOffset),
    },
  };
};
