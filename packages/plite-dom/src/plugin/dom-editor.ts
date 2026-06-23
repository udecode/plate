import {
  type Node,
  NodeApi,
  type Path,
  type Point,
  type Range,
  RangeApi,
  type Editor as PliteEditor,
  TextApi,
  type Value,
} from '@platejs/plite';
import { Editor, formatDebugValue } from '@platejs/plite/internal';
import type { TextDiff } from '../utils/diff-text';
import {
  closestShadowAware,
  containsShadowAware,
  type DOMElement,
  type DOMNode,
  type DOMPoint,
  type DOMRange,
  type DOMSelection,
  type DOMStaticRange,
  getSelection,
  isAfter,
  isBefore,
  isDOMElement,
  isDOMNode,
  isDOMSelection,
  isDOMText,
  normalizeDOMPoint,
} from '../utils/dom';
import { IS_ANDROID, IS_FIREFOX } from '../utils/environment';

import { Key } from '../utils/key';
import {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_KEY_TO_ELEMENT,
  EDITOR_TO_PENDING_DIFFS,
  EDITOR_TO_SCHEDULE_FLUSH,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  IS_COMPOSING,
  IS_FOCUSED,
  IS_NODE_MAP_DIRTY,
  IS_READ_ONLY,
  NODE_TO_ELEMENT,
  NODE_TO_KEY,
} from '../utils/weak-maps';
import {
  insertDOMData,
  insertDOMFragmentData,
  insertDOMTextData,
  writeDOMSelectionData,
} from './dom-clipboard-runtime';
import { DOMCoverage } from './dom-coverage';
import {
  eventCarriesBlockFragment,
  resolveBlockFragmentDropRange,
  resolveVoidEventRange,
} from './dom-event-range-targets';
import {
  findMountedDOMNodeByPath,
  isSamePath,
  parsePliteDOMPath,
  resolveMountedDOMPath,
  resolvePliteNodePath,
  toMountedDOMNodeByPath,
} from './dom-node-path';
import {
  getCollapsedTextOffsetRect,
  getLogicalEdgeFromPhysicalEdge,
  getRectHorizontalDistance,
  getRectVerticalCenterDistance,
  getRectVerticalDistance,
  getPliteStringLineEdgeTextOffset,
  getPliteStringLineOffsetAtX,
  getUsableRangeRect,
} from './plite-string-coordinate-placement';

/**
 * A DOM-specific version of the `Editor` interface.
 */

export interface DOMEditor<V extends Value = Value> extends PliteEditor<V> {
  dom: DOMEditorCapability;
}

export interface DOMEditorCapability {
  blur: () => void;
  deselect: () => void;
  findDocumentOrShadowRoot: () => Document | ShadowRoot;
  assertEventRange: (event: any) => Range;
  findKey: (node: Node) => Key;
  assertPath: (node: Node) => Path;
  focus: (options?: { retries: number }) => void;
  getWindow: () => Window;
  hasDOMNode: (target: DOMNode, options?: { editable?: boolean }) => boolean;
  hasEditableTarget: (target: EventTarget | null) => target is DOMNode;
  hasRange: (range: Range) => boolean;
  hasSelectableTarget: (target: EventTarget | null) => boolean;
  hasTarget: (target: EventTarget | null) => target is DOMNode;
  clipboard: DOMEditorClipboardCapability;
  isComposing: () => boolean;
  isFocused: () => boolean;
  isReadOnly: () => boolean;
  isTargetInsideNonReadonlyVoid: (target: EventTarget | null) => boolean;
  resolveDOMNode: (node: Node) => HTMLElement | null;
  resolveDOMPoint: (point: Point) => DOMPoint | null;
  resolveDOMRange: (range: Range) => DOMRange | null;
  resolveEventRange: (event: any) => Range | null;
  resolvePath: (node: Node) => Path | null;
  resolveRangeRect: (range: Range) => DOMRect | null;
  resolvePliteNode: (domNode: DOMNode) => Node | null;
  resolvePlitePoint: (
    domPoint: DOMPoint,
    options: {
      exactMatch: boolean;
      searchDirection?: 'backward' | 'forward';
    }
  ) => Point | null;
  resolvePliteRange: (
    domRange: DOMRange | DOMSelection | DOMStaticRange | globalThis.Selection,
    options: {
      exactMatch: boolean;
    }
  ) => Range | null;
  assertDOMNode: (node: Node) => HTMLElement;
  assertDOMPoint: (point: Point) => DOMPoint;
  assertDOMRange: (range: Range) => DOMRange;
  assertPliteNode: (domNode: DOMNode) => Node;
  assertPlitePoint: (
    domPoint: DOMPoint,
    options: {
      exactMatch: boolean;
      searchDirection?: 'backward' | 'forward';
    }
  ) => Point;
  assertPliteRange: (
    domRange: DOMRange | DOMSelection | DOMStaticRange | globalThis.Selection,
    options: {
      exactMatch: boolean;
    }
  ) => Range;
}

export interface DOMEditorClipboardCapability {
  /**
   * Insert data from a `DataTransfer` into the editor.
   */
  insertData: (data: DataTransfer) => boolean;

  /**
   * Insert fragment data from a `DataTransfer` into the editor.
   */
  insertFragmentData: (data: DataTransfer) => boolean;

  /**
   * Insert text data from a `DataTransfer` into the editor.
   */
  insertTextData: (data: DataTransfer) => boolean;

  /**
   * Write the current selection to a `DataTransfer`.
   */
  writeSelection: (data: Pick<DataTransfer, 'getData' | 'setData'>) => void;
}

export interface DOMApi extends Omit<DOMEditorCapability, 'clipboard'> {}

export interface DOMClipboardApi extends DOMEditorClipboardCapability {}

/** Error thrown when Plite cannot resolve a DOM node, point, or range. */
export class PliteDOMResolutionError extends Error {
  readonly code: string;
  readonly details: unknown;

  constructor(
    message: string,
    {
      code,
      details,
    }: {
      code: string;
      details?: unknown;
    }
  ) {
    super(message);
    this.name = 'PliteDOMResolutionError';
    this.code = code;
    this.details = details;
  }
}

export type DOMClipboardInsertDataHandler<V extends Value = Value> = (
  editor: DOMEditor<V>,
  data: DataTransfer
) => boolean;

export interface DOMEditorClipboardInterface {
  /**
   * Insert data from a `DataTransfer` into the editor.
   */
  insertData: (editor: DOMEditor<any>, data: DataTransfer) => boolean;

  /**
   * Insert fragment data from a `DataTransfer` into the editor.
   */
  insertFragmentData: (editor: DOMEditor<any>, data: DataTransfer) => boolean;

  /**
   * Insert text data from a `DataTransfer` into the editor.
   */
  insertTextData: (editor: DOMEditor<any>, data: DataTransfer) => boolean;

  /**
   * Write the currently selected fragment to a `DataTransfer`.
   */
  writeSelection: (
    editor: DOMEditor<any>,
    data: Pick<DataTransfer, 'getData' | 'setData'>
  ) => void;
}

export interface DOMEditorInterface {
  /**
   * Android text-repair internal: return pending text diffs.
   */
  androidPendingDiffs: (editor: PliteEditor<any>) => TextDiff[] | undefined;

  /**
   * Android text-repair internal: flush pending diffs and end composition.
   */
  androidScheduleFlush: (editor: PliteEditor<any>) => void;

  /**
   * Blur the editor.
   */
  blur: (editor: DOMEditor<any>) => void;

  /**
   * Deselect the editor.
   */
  deselect: (editor: DOMEditor<any>) => void;

  /**
   * Find the DOM node that implements DocumentOrShadowRoot for the editor.
   */
  findDocumentOrShadowRoot: (editor: DOMEditor<any>) => Document | ShadowRoot;

  /**
   * Get the target range from a DOM `event`.
   */
  assertEventRange: (editor: DOMEditor<any>, event: any) => Range;

  /**
   * Find a key for a Plite node.
   */
  findKey: (editor: DOMEditor<any>, node: Node) => Key;

  /**
   * Find the path of a Plite node.
   */
  assertPath: (editor: DOMEditor<any>, node: Node) => Path;

  /**
   * Focus the editor.
   */
  focus: (editor: DOMEditor<any>, options?: { retries: number }) => void;

  /**
   * Return the host window of the current editor.
   */
  getWindow: (editor: DOMEditor<any>) => Window;

  /**
   * Check if a DOM node is within the editor.
   */
  hasDOMNode: (
    editor: DOMEditor<any>,
    target: DOMNode,
    options?: { editable?: boolean }
  ) => boolean;

  /**
   * Check if the target is editable and in the editor.
   */
  hasEditableTarget: (
    editor: DOMEditor<any>,
    target: EventTarget | null
  ) => target is DOMNode;

  /**
   * Check if every point in a Plite range maps to mounted DOM.
   */
  hasRange: (editor: DOMEditor<any>, range: Range) => boolean;

  /**
   * Check if the target can be selected.
   */
  hasSelectableTarget: (
    editor: DOMEditor<any>,
    target: EventTarget | null
  ) => boolean;

  /**
   * Check if the target is in the editor.
   */
  hasTarget: (
    editor: DOMEditor<any>,
    target: EventTarget | null
  ) => target is DOMNode;

  clipboard: DOMEditorClipboardInterface;

  /**
   * Check if the user is currently composing inside the editor.
   */
  isComposing: (editor: DOMEditor<any>) => boolean;

  /**
   * Check if the editor is focused.
   */
  isFocused: (editor: DOMEditor<any>) => boolean;

  /**
   * Check if the editor is in read-only mode.
   */
  isReadOnly: (editor: DOMEditor<any>) => boolean;

  /**
   * Check if the target is inside a void in a writable editor.
   */
  isTargetInsideNonReadonlyVoid: (
    editor: DOMEditor<any>,
    target: EventTarget | null
  ) => boolean;

  /**
   * Resolve the native DOM element for a Plite node.
   *
   * Returns `null` when the node is not currently mounted or the node maps are
   * stale.
   */
  resolveDOMNode: (editor: DOMEditor<any>, node: Node) => HTMLElement | null;

  /**
   * Resolve a native DOM point from a Plite point.
   *
   * Returns `null` when the point cannot be projected into mounted DOM.
   */
  resolveDOMPoint: (editor: DOMEditor<any>, point: Point) => DOMPoint | null;

  /**
   * Resolve a native DOM range from a Plite range.
   *
   * Returns `null` when either endpoint cannot be projected into mounted DOM.
   */
  resolveDOMRange: (editor: DOMEditor<any>, range: Range) => DOMRange | null;

  /**
   * Resolve the target range from a DOM event.
   *
   * Returns `null` when the browser cannot provide a usable caret range or the
   * target is outside this editor.
   */
  resolveEventRange: (editor: DOMEditor<any>, event: any) => Range | null;

  /**
   * Resolve a Plite node path.
   *
   * Returns `null` for detached nodes or stale path metadata.
   */
  resolvePath: (editor: DOMEditor<any>, node: Node) => Path | null;

  /**
   * Resolve a Plite range to its DOM bounding rectangle.
   */
  resolveRangeRect: (editor: DOMEditor<any>, range: Range) => DOMRect | null;

  /**
   * Resolve a Plite node from a native DOM node.
   *
   * Returns `null` when the DOM node is foreign to this editor or no mounted
   * Plite node can be recovered.
   */
  resolvePliteNode: (editor: DOMEditor<any>, domNode: DOMNode) => Node | null;

  /**
   * Resolve a Plite point from a DOM selection point.
   */
  resolvePlitePoint: (
    editor: DOMEditor<any>,
    domPoint: DOMPoint,
    options: {
      exactMatch: boolean;
      /**
       * The direction to search for Plite leaf nodes if `domPoint` is
       * non-editable and non-void.
       */
      searchDirection?: 'forward' | 'backward';
    }
  ) => Point | null;

  /**
   * Resolve a Plite range from a DOM range or selection.
   */
  resolvePliteRange: (
    editor: DOMEditor<any>,
    domRange: DOMRange | DOMStaticRange | DOMSelection,
    options: {
      exactMatch: boolean;
    }
  ) => Range | null;

  /**
   * Find the native DOM element from a Plite node.
   */
  assertDOMNode: (editor: DOMEditor<any>, node: Node) => HTMLElement;

  /**
   * Find a native DOM selection point from a Plite point.
   */
  assertDOMPoint: (editor: DOMEditor<any>, point: Point) => DOMPoint;

  /**
   * Find a native DOM range from a Plite `range`.
   *
   * Notice: the returned range will always be ordinal regardless of the direction of Plite `range` due to DOM API limit.
   *
   * there is no way to create a reverse DOM Range using Range.setStart/setEnd
   * according to https://dom.spec.whatwg.org/#concept-range-bp-set.
   */
  assertDOMRange: (editor: DOMEditor<any>, range: Range) => DOMRange;

  /**
   * Find a Plite node from a native DOM `element`.
   */
  assertPliteNode: (editor: DOMEditor<any>, domNode: DOMNode) => Node;

  /**
   * Find a Plite point from a DOM selection's `domNode` and `domOffset`.
   */
  assertPlitePoint: (
    editor: DOMEditor<any>,
    domPoint: DOMPoint,
    options: {
      exactMatch: boolean;
      /**
       * The direction to search for Plite leaf nodes if `domPoint` is
       * non-editable and non-void.
       */
      searchDirection?: 'forward' | 'backward';
    }
  ) => Point;

  /**
   * Find a Plite range from a DOM range or selection.
   */
  assertPliteRange: (
    editor: DOMEditor<any>,
    domRange: DOMRange | DOMStaticRange | DOMSelection,
    options: {
      exactMatch: boolean;
    }
  ) => Range;
}

const cachePliteDOMNode = (
  editor: DOMEditor<any>,
  node: Node,
  domNode: HTMLElement
) => {
  const key = DOMEditor.findKey(editor, node);
  const keyToElement = EDITOR_TO_KEY_TO_ELEMENT.get(editor) ?? new WeakMap();

  if (!EDITOR_TO_KEY_TO_ELEMENT.has(editor)) {
    EDITOR_TO_KEY_TO_ELEMENT.set(editor, keyToElement);
  }

  keyToElement.set(key, domNode);
  ELEMENT_TO_NODE.set(domNode, node);
  NODE_TO_ELEMENT.set(node, domNode);

  return domNode;
};

const resolvePlitePointFromDOMCoverageBoundary = (
  editor: DOMEditor<any>,
  domPoint: DOMPoint
): Point | null => {
  const boundaryPoint = DOMCoverage.resolvePlitePointFromBoundary(
    editor,
    domPoint
  );

  if (boundaryPoint?.type !== 'boundary-point') {
    return null;
  }

  const [coveredRange] = boundaryPoint.boundary.coveredPathRanges;
  let targetPath: Path | undefined;

  if (boundaryPoint.edge === 'owner') {
    targetPath = boundaryPoint.boundary.ownerPath;
  } else if (boundaryPoint.edge === 'focus') {
    targetPath = coveredRange?.focus;
  } else {
    targetPath = coveredRange?.anchor;
  }

  if (!targetPath || !Editor.hasPath(editor, targetPath)) {
    return null;
  }

  return Editor.point(editor, targetPath, {
    edge: boundaryPoint.edge === 'focus' ? 'end' : 'start',
  });
};

const resolvePliteTextPoint = ({
  editor,
  exactMatch,
  offset,
  path,
  pliteNode,
}: {
  editor: DOMEditor<any>;
  exactMatch: boolean;
  offset: number;
  path: Path;
  pliteNode: Node;
}): Point | null => {
  if (!TextApi.isText(pliteNode)) {
    if (!Editor.hasPath(editor, path)) {
      return null;
    }

    return Editor.point(editor, path, {
      edge: offset <= 0 ? 'start' : 'end',
    });
  }

  const textLength = pliteNode.text.length;

  if (Number.isFinite(offset) && offset >= 0 && offset <= textLength) {
    return { path, offset };
  }

  if (!exactMatch) {
    const finiteOffset = Number.isFinite(offset) ? offset : 0;

    return {
      path,
      offset: Math.max(0, Math.min(textLength, finiteOffset)),
    };
  }

  return null;
};

const resolvePointNearCoordinatesFromPliteStrings = (
  editor: DOMEditor<any>,
  strings: HTMLElement[],
  x: number,
  y: number
): Point | null => {
  const { document } = DOMEditor.getWindow(editor);
  const bestString = strings
    .map((element) => {
      const rect = element.getBoundingClientRect();
      const verticalDistance =
        y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;

      return { element, rect, verticalDistance };
    })
    .sort((left, right) => {
      if (left.verticalDistance !== right.verticalDistance) {
        return left.verticalDistance - right.verticalDistance;
      }

      return (
        Math.abs(left.rect.left + left.rect.width / 2 - x) -
        Math.abs(right.rect.left + right.rect.width / 2 - x)
      );
    })[0]?.element;
  const textNode = Array.from(bestString?.childNodes ?? []).find(
    (node) => node.nodeType === 3
  );

  if (!bestString || !textNode) {
    return null;
  }

  const textLength = textNode.textContent?.length ?? 0;
  const lineRect = Array.from(bestString.getClientRects())
    .filter((rect) => rect.width > 0 || rect.height > 0)
    .sort((left, right) => {
      const leftVerticalDistance = getRectVerticalDistance(left, y);
      const rightVerticalDistance = getRectVerticalDistance(right, y);

      if (leftVerticalDistance !== rightVerticalDistance) {
        return leftVerticalDistance - rightVerticalDistance;
      }

      const leftHorizontalDistance = getRectHorizontalDistance(left, x);
      const rightHorizontalDistance = getRectHorizontalDistance(right, x);

      if (leftHorizontalDistance !== rightHorizontalDistance) {
        return leftHorizontalDistance - rightHorizontalDistance;
      }

      return (
        getRectVerticalCenterDistance(left, y) -
        getRectVerticalCenterDistance(right, y)
      );
    })[0];
  const edge =
    lineRect && x <= lineRect.left + 3
      ? getLogicalEdgeFromPhysicalEdge(bestString, 'left')
      : lineRect && x >= lineRect.right - 3
        ? getLogicalEdgeFromPhysicalEdge(bestString, 'right')
        : null;
  let bestOffset = bestString?.hasAttribute('data-plite-zero-width') ? 1 : 0;
  let bestDistance = {
    horizontal: Number.POSITIVE_INFINITY,
    vertical: Number.POSITIVE_INFINITY,
  };
  const resolveOffset = (offset: number) => {
    const range = document.createRange();

    range.setStart(textNode, Math.max(0, Math.min(offset, textLength)));
    range.collapse(true);

    const pliteRange = DOMEditor.resolvePliteRange(editor, range, {
      exactMatch: false,
    });

    return pliteRange && RangeApi.isCollapsed(pliteRange)
      ? pliteRange.anchor
      : null;
  };

  if (lineRect && edge) {
    return resolveOffset(
      getPliteStringLineEdgeTextOffset({
        edge,
        rect: lineRect,
        string: bestString,
      })
    );
  }

  if (lineRect) {
    const offset = getPliteStringLineOffsetAtX({
      event: { clientX: x, clientY: y },
      rect: lineRect,
      string: bestString,
    });

    if (offset != null) {
      return resolveOffset(offset);
    }
  }

  for (let offset = 0; offset <= textLength; offset++) {
    const candidate = getCollapsedTextOffsetRect(document, textNode, offset);
    const distance = candidate?.distance({ x, y }) ?? {
      horizontal: Number.POSITIVE_INFINITY,
      vertical: Number.POSITIVE_INFINITY,
    };

    if (
      distance.vertical < bestDistance.vertical ||
      (distance.vertical === bestDistance.vertical &&
        distance.horizontal < bestDistance.horizontal)
    ) {
      bestDistance = distance;
      bestOffset = candidate?.offset ?? bestOffset;
    }
  }

  return bestDistance.vertical === Number.POSITIVE_INFINITY
    ? null
    : resolveOffset(bestOffset);
};

const resolvePointNearCoordinatesFromEventTarget = (
  editor: DOMEditor<any>,
  target: EventTarget | null,
  x: number,
  y: number
): Point | null => {
  const element = isDOMText(target)
    ? target.parentElement
    : isDOMElement(target)
      ? target
      : null;
  const textHost = element?.closest('[data-plite-node="text"]');

  if (!textHost || !DOMEditor.hasDOMNode(editor, textHost)) {
    return null;
  }

  return resolvePointNearCoordinatesFromPliteStrings(
    editor,
    Array.from(
      textHost.querySelectorAll<HTMLElement>(
        '[data-plite-string], [data-plite-zero-width]'
      )
    ),
    x,
    y
  );
};

const resolvePointNearCoordinatesFromPliteDOM = (
  editor: DOMEditor<any>,
  x: number,
  y: number
): Point | null => {
  const editorElement = DOMEditor.resolveDOMNode(editor, editor);

  if (!editorElement) {
    return null;
  }

  return resolvePointNearCoordinatesFromPliteStrings(
    editor,
    Array.from(
      editorElement.querySelectorAll<HTMLElement>(
        '[data-plite-string], [data-plite-zero-width]'
      )
    ),
    x,
    y
  );
};

const shouldUseNearestEventPoint = ({
  domRange,
  range,
  x,
}: {
  domRange: globalThis.Range;
  range: Range | null;
  x: number;
}) => {
  if (range && !RangeApi.isCollapsed(range)) {
    return false;
  }

  if (!domRange.collapsed) {
    return false;
  }

  if (domRange.startContainer.nodeType !== 3) {
    return true;
  }

  const rect = getUsableRangeRect(domRange);

  return !rect || x < rect.left - 8 || x > rect.right + 8;
};

// eslint-disable-next-line no-redeclare
export const DOMEditor: DOMEditorInterface = {
  androidPendingDiffs: (editor) => EDITOR_TO_PENDING_DIFFS.get(editor),

  androidScheduleFlush: (editor) => {
    EDITOR_TO_SCHEDULE_FLUSH.get(editor)?.();
  },

  blur: (editor) => {
    const el = DOMEditor.assertDOMNode(editor, editor);
    const root = DOMEditor.findDocumentOrShadowRoot(editor);
    IS_FOCUSED.set(editor, false);

    if (root.activeElement === el) {
      el.blur();
    }
  },

  deselect: (editor) => {
    const selection = editor.read((state) => state.selection.get());
    const root = DOMEditor.findDocumentOrShadowRoot(editor);
    const domSelection = getSelection(root);

    if (domSelection && domSelection.rangeCount > 0) {
      domSelection.removeAllRanges();
    }

    if (selection) {
      editor.update((tx) => {
        tx.selection.clear();
      });
    }
  },

  findDocumentOrShadowRoot: (editor) => {
    const el = DOMEditor.assertDOMNode(editor, editor);
    const root = el.getRootNode() as Document | ShadowRoot;
    const view = el.ownerDocument.defaultView;

    if (
      root === el.ownerDocument ||
      (view?.ShadowRoot && root instanceof view.ShadowRoot) ||
      'host' in root
    ) {
      return root;
    }

    return el.ownerDocument;
  },

  assertEventRange: (editor, event) => {
    const range = DOMEditor.resolveEventRange(editor, event);

    if (!range) {
      throw new PliteDOMResolutionError(
        `Cannot resolve a Plite range from a DOM event: ${event}`,
        { code: '@platejs/plite-dom/event-range', details: { event } }
      );
    }

    return range;
  },

  resolveEventRange: (editor, event) => {
    const resolvedEvent = 'nativeEvent' in event ? event.nativeEvent : event;

    const { clientX: x, clientY: y, target } = resolvedEvent;

    if (x == null || y == null) {
      return null;
    }

    const targetBoundaryPoint = isDOMNode(target)
      ? resolvePlitePointFromDOMCoverageBoundary(editor, [target, 0])
      : null;

    if (targetBoundaryPoint) {
      return Editor.range(editor, targetBoundaryPoint);
    }

    const targetIsOwned =
      isDOMNode(target) &&
      (() => {
        try {
          return DOMEditor.hasDOMNode(editor, target);
        } catch {
          return false;
        }
      })();
    const node = isDOMNode(target)
      ? DOMEditor.resolvePliteNode(editor, target)
      : null;
    const path = node ? DOMEditor.resolvePath(editor, node) : null;

    if (!targetIsOwned && (!node || !path)) {
      return null;
    }

    const voidRange = resolveVoidEventRange(editor, {
      node,
      path,
      target,
      x,
      y,
    });

    if (voidRange) {
      return voidRange;
    }

    if (
      eventCarriesBlockFragment(
        editor,
        resolvedEvent as DragEvent | ClipboardEvent
      ) &&
      isDOMNode(target)
    ) {
      const blockFragmentRange = resolveBlockFragmentDropRange(editor, {
        path,
        resolveDOMNode: (targetNode) =>
          DOMEditor.resolveDOMNode(editor, targetNode),
        y,
      });

      if (blockFragmentRange) {
        return blockFragmentRange;
      }
    }

    // Else resolve a range from the caret position where the drop occured.
    let domRange: globalThis.Range | null = null;
    const { document } = DOMEditor.getWindow(editor);

    // COMPAT: In Firefox, `caretRangeFromPoint` doesn't exist. (2016/07/25)
    if (document.caretRangeFromPoint) {
      domRange = document.caretRangeFromPoint(x, y);
    } else {
      const position = document.caretPositionFromPoint(x, y);

      if (position) {
        domRange = document.createRange();
        domRange.setStart(position.offsetNode, position.offset);
        domRange.setEnd(position.offsetNode, position.offset);
      }
    }

    if (!domRange) {
      return null;
    }

    const range = DOMEditor.resolvePliteRange(editor, domRange, {
      exactMatch: false,
    });

    const targetPoint = resolvePointNearCoordinatesFromEventTarget(
      editor,
      target,
      x,
      y
    );

    if (targetPoint && (!range || RangeApi.isCollapsed(range))) {
      return Editor.range(editor, targetPoint);
    }

    if (shouldUseNearestEventPoint({ domRange, range, x })) {
      const nearestPoint = resolvePointNearCoordinatesFromPliteDOM(
        editor,
        x,
        y
      );

      if (nearestPoint) {
        return Editor.range(editor, nearestPoint);
      }
    }

    return range;
  },

  findKey: (editor, node) => {
    let key = NODE_TO_KEY.get(node);

    if (!key) {
      key = new Key();
      NODE_TO_KEY.set(node, key);
    }

    return key;
  },

  assertPath: (editor, node) => {
    const path = DOMEditor.resolvePath(editor, node);

    if (path) {
      return path;
    }

    throw new PliteDOMResolutionError(
      `Unable to find the path for Plite node: ${formatDebugValue(node)}`,
      { code: '@platejs/plite-dom/path', details: { node } }
    );
  },

  resolvePath: (editor, node) => resolvePliteNodePath(editor, node),

  focus: (editor, options = { retries: 50 }) => {
    // Return if no dom node is associated with the editor, which means the editor is not yet mounted
    // or has been unmounted. This can happen especially, while retrying to focus the editor.
    if (!EDITOR_TO_ELEMENT.get(editor)) {
      return;
    }

    // Retry setting focus if the editor has pending operations.
    // The DOM (selection) is unstable while changes are applied.
    // Retry until retries are exhausted or editor is focused.
    if (options.retries <= 0) {
      return;
    }
    if (IS_NODE_MAP_DIRTY.get(editor)) {
      setTimeout(() => {
        DOMEditor.focus(editor, { retries: options.retries - 1 });
      }, 10);
      return;
    }

    const el = DOMEditor.assertDOMNode(editor, editor);
    const root = DOMEditor.findDocumentOrShadowRoot(editor);

    const getLiveSelection = () => Editor.getSelection(editor);
    const selection = getLiveSelection();
    const selectionAtFocus = selection
      ? {
          anchor: { ...selection.anchor },
          focus: { ...selection.focus },
        }
      : null;
    // Create a new selection in the top of the document if missing
    if (!selection) {
      editor.update((tx) => {
        tx.selection.set(Editor.point(editor, [], { edge: 'start' }));
      });
    }

    const syncDomSelection = () => {
      const selection = getLiveSelection();

      if (selection) {
        const domSelection = getSelection(root);
        const domRange = DOMEditor.resolveDOMRange(editor, selection);

        if (domSelection && domRange) {
          if (RangeApi.isBackward(selection)) {
            domSelection.setBaseAndExtent(
              domRange.endContainer,
              domRange.endOffset,
              domRange.startContainer,
              domRange.startOffset
            );
          } else {
            domSelection.setBaseAndExtent(
              domRange.startContainer,
              domRange.startOffset,
              domRange.endContainer,
              domRange.endOffset
            );
          }
        }
      }
    };
    const trySyncDomSelection = () => {
      try {
        syncDomSelection();
        return true;
      } catch {
        return false;
      }
    };

    if (root.activeElement !== el) {
      // IS_FOCUSED should be set before calling el.focus() to ensure that
      // FocusedContext is updated to the correct value
      IS_FOCUSED.set(editor, true);
      const activeElement = root.activeElement;
      const activeElementWithBlur = activeElement as
        | (Element & { blur?: () => void })
        | null;

      if (
        isDOMElement(activeElement) &&
        containsShadowAware(el, activeElement) &&
        typeof activeElementWithBlur?.blur === 'function'
      ) {
        activeElementWithBlur.blur();
      }

      el.focus({ preventScroll: true });
      trySyncDomSelection();
      if (selectionAtFocus) {
        queueMicrotask(() => {
          if (root.activeElement !== el) {
            return;
          }

          const currentSelection = getLiveSelection();

          if (
            !currentSelection ||
            !RangeApi.equals(currentSelection, selectionAtFocus)
          ) {
            return;
          }

          trySyncDomSelection();
        });
      }
      return;
    }

    IS_FOCUSED.set(editor, true);
    trySyncDomSelection();
  },

  getWindow: (editor) => {
    const window = EDITOR_TO_WINDOW.get(editor);
    if (!window) {
      throw new Error('Unable to find a host window element for this editor');
    }
    return window;
  },

  hasDOMNode: (editor, target, options = {}) => {
    const { editable = false } = options;
    const editorEl = DOMEditor.assertDOMNode(editor, editor);
    let targetEl: HTMLElement | null | undefined;

    // COMPAT: In Firefox, reading `target.nodeType` will throw an error if
    // target is originating from an internal "restricted" element (e.g. a
    // stepper arrow on a number input). (2018/05/04)
    // https://github.com/ianstormtaylor/slate/issues/1819
    try {
      targetEl = (
        isDOMElement(target) ? target : target.parentElement
      ) as HTMLElement;
    } catch (err) {
      if (
        err instanceof Error &&
        !err.message.includes('Permission denied to access property "nodeType"')
      ) {
        throw err;
      }
    }

    if (!targetEl) {
      return false;
    }

    return (
      closestShadowAware(targetEl, '[data-plite-editor]') === editorEl &&
      (!editable || targetEl.isContentEditable
        ? true
        : (typeof targetEl.isContentEditable === 'boolean' && // isContentEditable exists only on HTMLElement, and on other nodes it will be undefined
            // this is the core logic that lets you know you got the right editor.selection instead of null when editor is contenteditable="false"(readOnly)
            closestShadowAware(targetEl, '[contenteditable="false"]') ===
              editorEl) ||
          !!targetEl.getAttribute('data-plite-zero-width'))
    );
  },

  hasEditableTarget: (editor, target): target is DOMNode =>
    isDOMNode(target) &&
    DOMEditor.hasDOMNode(editor, target, { editable: true }),

  hasRange: (editor, range) => {
    const { anchor, focus } = range;
    return (
      Editor.hasPath(editor, anchor.path) && Editor.hasPath(editor, focus.path)
    );
  },

  hasSelectableTarget: (editor, target) =>
    DOMEditor.hasEditableTarget(editor, target) ||
    DOMEditor.isTargetInsideNonReadonlyVoid(editor, target),

  hasTarget: (editor, target): target is DOMNode =>
    isDOMNode(target) && DOMEditor.hasDOMNode(editor, target),

  clipboard: {
    insertData: (editor, data) => insertDOMData(editor, data),

    insertFragmentData: (editor, data) => insertDOMFragmentData(editor, data),

    insertTextData: (editor, data) => insertDOMTextData(editor, data),

    writeSelection: (editor, data) => {
      writeDOMSelectionData(editor, data);
    },
  },

  isComposing: (editor) => !!IS_COMPOSING.get(editor),

  isFocused: (editor) => !!IS_FOCUSED.get(editor),

  isReadOnly: (editor) => !!IS_READ_ONLY.get(editor),

  isTargetInsideNonReadonlyVoid: (editor, target) => {
    if (IS_READ_ONLY.get(editor)) return false;
    if (!DOMEditor.hasTarget(editor, target)) return false;

    const pliteNode = DOMEditor.resolvePliteNode(editor, target);

    return (
      !!pliteNode &&
      NodeApi.isElement(pliteNode) &&
      Editor.isVoid(editor, pliteNode)
    );
  },

  resolveDOMNode: (editor, node) => {
    const domNode =
      node === editor
        ? EDITOR_TO_ELEMENT.get(editor)
        : EDITOR_TO_KEY_TO_ELEMENT.get(editor)?.get(
            DOMEditor.findKey(editor, node)
          );

    if (domNode) {
      return domNode;
    }

    const fallbackDOMNode = toMountedDOMNodeByPath(editor, node);

    if (fallbackDOMNode) {
      return cachePliteDOMNode(editor, node, fallbackDOMNode);
    }

    return null;
  },

  assertDOMNode: (editor, node) => {
    const domNode = DOMEditor.resolveDOMNode(editor, node);

    if (domNode) {
      return domNode;
    }

    throw new PliteDOMResolutionError(
      `Cannot resolve a DOM node from Plite node: ${formatDebugValue(node)}`,
      { code: '@platejs/plite-dom/dom-node', details: { node } }
    );
  },

  resolveDOMPoint: (editor, point) => {
    if (!Editor.hasPath(editor, point.path)) {
      return null;
    }

    const resolvedPoint = Editor.void(editor, { at: point })
      ? { path: point.path, offset: 0 }
      : point;
    const [node] = editor.read((state) => state.nodes.get(resolvedPoint.path));
    const resolvedElement = DOMEditor.resolveDOMNode(editor, node);
    const fallbackElement =
      resolvedElement ?? findMountedDOMNodeByPath(editor, resolvedPoint.path);
    const el = fallbackElement
      ? cachePliteDOMNode(editor, node, fallbackElement)
      : null;

    if (!el) {
      return null;
    }

    let domPoint: DOMPoint | undefined;

    // For each leaf, we need to isolate its content, which means filtering
    // to its direct text and zero-width spans. (We have to filter out any
    // other siblings that may have been rendered alongside them.)
    const selector = '[data-plite-string], [data-plite-zero-width]';
    const texts = Array.from(el.querySelectorAll(selector));
    let start = 0;

    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      const domNode = text.childNodes[0] as HTMLElement;

      if (domNode == null || domNode.textContent == null) {
        continue;
      }

      const { length } = domNode.textContent;
      const attr = text.getAttribute('data-plite-length');
      const trueLength = attr == null ? length : Number.parseInt(attr, 10);
      const end = start + trueLength;

      // Prefer putting the selection inside the mark placeholder to ensure
      // composed text is displayed with the correct marks.
      const nextText = texts[i + 1];
      if (
        resolvedPoint.offset === end &&
        nextText?.hasAttribute('data-plite-mark-placeholder')
      ) {
        const domText = nextText.childNodes[0];

        domPoint = [
          // COMPAT: If we don't explicity set the dom point to be on the
          // actual dom text element, chrome will put the selection behind
          // the actual dom text element, causing
          // domRange.getBoundingClientRect() calls on a collapsed selection
          // to return incorrect zero values
          // (https://bugs.chromium.org/p/chromium/issues/detail?id=435438)
          // which will cause issues when scrolling to it.
          isDOMText(domText) ? domText : nextText,
          nextText.textContent?.startsWith('\uFEFF') ? 1 : 0,
        ];
        break;
      }

      if (resolvedPoint.offset <= end) {
        const offset = Math.min(
          length,
          Math.max(0, resolvedPoint.offset - start)
        );
        domPoint = [domNode, offset];
        break;
      }

      start = end;
    }

    if (!domPoint) {
      return null;
    }

    return domPoint;
  },

  assertDOMPoint: (editor, point) => {
    const resolvedPoint = Editor.void(editor, { at: point })
      ? { path: point.path, offset: 0 }
      : point;
    const domPoint = DOMEditor.resolveDOMPoint(editor, point);

    if (domPoint) {
      return domPoint;
    }

    if (Editor.hasPath(editor, resolvedPoint.path)) {
      const [node] = editor.read((state) =>
        state.nodes.get(resolvedPoint.path)
      );
      const domNode =
        DOMEditor.resolveDOMNode(editor, node) ??
        findMountedDOMNodeByPath(editor, resolvedPoint.path);

      if (!domNode) {
        throw new PliteDOMResolutionError(
          `Cannot resolve a DOM node from Plite node: ${formatDebugValue(
            node
          )}`,
          {
            code: '@platejs/plite-dom/dom-node',
            details: { node, point: resolvedPoint },
          }
        );
      }
    }

    throw new PliteDOMResolutionError(
      `Cannot resolve a DOM point from Plite point: ${formatDebugValue(
        resolvedPoint
      )}`,
      {
        code: '@platejs/plite-dom/dom-point',
        details: { point: resolvedPoint },
      }
    );
  },

  resolveDOMRange: (editor, range) => {
    const { anchor, focus } = range;
    const isBackward = RangeApi.isBackward(range);
    const domAnchor = DOMEditor.resolveDOMPoint(editor, anchor);

    if (!domAnchor) {
      return null;
    }

    const domFocus = RangeApi.isCollapsed(range)
      ? domAnchor
      : DOMEditor.resolveDOMPoint(editor, focus);

    if (!domFocus) {
      return null;
    }

    const window =
      EDITOR_TO_WINDOW.get(editor) ??
      domAnchor[0].ownerDocument?.defaultView ??
      null;

    if (!window) {
      return null;
    }

    const domRange = window.document.createRange();
    const [startNode, startOffset] = isBackward ? domFocus : domAnchor;
    const [endNode, endOffset] = isBackward ? domAnchor : domFocus;

    // A Plite Point at zero-width Leaf always has an offset of 0 but a native DOM selection at
    // zero-width node has an offset of 1 so we have to check if we are in a zero-width node and
    // adjust the offset accordingly.
    const startEl = (
      isDOMElement(startNode) ? startNode : startNode.parentElement
    ) as HTMLElement;
    const isStartAtZeroWidth = !!startEl.getAttribute('data-plite-zero-width');
    const endEl = (
      isDOMElement(endNode) ? endNode : endNode.parentElement
    ) as HTMLElement;
    const isEndAtZeroWidth = !!endEl.getAttribute('data-plite-zero-width');

    try {
      domRange.setStart(startNode, isStartAtZeroWidth ? 1 : startOffset);
      domRange.setEnd(endNode, isEndAtZeroWidth ? 1 : endOffset);
    } catch {
      return null;
    }

    return domRange;
  },

  assertDOMRange: (editor, range) => {
    const domRange = DOMEditor.resolveDOMRange(editor, range);

    if (domRange) {
      return domRange;
    }

    throw new PliteDOMResolutionError(
      `Cannot resolve a DOM range from Plite range: ${formatDebugValue(range)}`,
      { code: '@platejs/plite-dom/dom-range', details: { range } }
    );
  },

  resolveRangeRect: (editor, range) =>
    DOMEditor.resolveDOMRange(editor, range)?.getBoundingClientRect() ?? null,

  resolvePliteNode: (editor, domNode) => {
    let domEl = isDOMElement(domNode) ? domNode : domNode.parentElement;

    if (domEl && !domEl.hasAttribute('data-plite-node')) {
      domEl = domEl.closest('[data-plite-node]');
    }

    const editorEl = EDITOR_TO_ELEMENT.get(editor);
    const belongsToEditor =
      domEl &&
      editorEl &&
      closestShadowAware(domEl as HTMLElement, '[data-plite-editor]') ===
        editorEl;
    const node = belongsToEditor
      ? ELEMENT_TO_NODE.get(domEl as HTMLElement)
      : null;
    const mountedPath =
      domEl && belongsToEditor
        ? resolveMountedDOMPath(editor, domEl as HTMLElement)
        : null;

    if (node) {
      const nodePath = resolvePliteNodePath(editor, node);

      if (!mountedPath || (nodePath && isSamePath(nodePath, mountedPath))) {
        return node;
      }

      const [mountedNode] = editor.read((state) =>
        state.nodes.get(mountedPath)
      );

      cachePliteDOMNode(editor, mountedNode, domEl as HTMLElement);

      return mountedNode;
    }

    if (mountedPath) {
      const [fallbackNode] = editor.read((state) =>
        state.nodes.get(mountedPath)
      );

      cachePliteDOMNode(editor, fallbackNode, domEl as HTMLElement);

      return fallbackNode;
    }

    return null;
  },

  assertPliteNode: (editor, domNode) => {
    const node = DOMEditor.resolvePliteNode(editor, domNode);

    if (node) {
      return node;
    }

    const domEl = isDOMElement(domNode) ? domNode : domNode.parentElement;

    throw new PliteDOMResolutionError(
      `Cannot resolve a Plite node from DOM node: ${domEl}`,
      { code: '@platejs/plite-dom/plite-node', details: { domNode } }
    );
  },

  resolvePlitePoint: (
    editor: DOMEditor<any>,
    domPoint: DOMPoint,
    options: {
      exactMatch: boolean;
      searchDirection?: 'forward' | 'backward';
    }
  ): Point | null => {
    const { exactMatch } = options;
    const boundaryPlitePoint = resolvePlitePointFromDOMCoverageBoundary(
      editor,
      domPoint
    );

    if (boundaryPlitePoint) {
      return boundaryPlitePoint;
    }

    const [nearestNode, nearestOffset] = exactMatch
      ? domPoint
      : normalizeDOMPoint(domPoint);
    const parentNode = nearestNode.parentNode as DOMElement;
    let searchDirection = options.searchDirection;
    let textNode: DOMElement | null = null;
    let offset = 0;

    if (parentNode) {
      const editorEl = DOMEditor.resolveDOMNode(editor, editor);

      if (!editorEl) {
        return null;
      }

      const potentialVoidNode = parentNode.closest('[data-plite-void="true"]');
      // Need to ensure that the closest void node is actually a void node
      // within this editor, and not a void node within some parent editor. This can happen
      // if this editor is within a void node of another editor ("nested editors", like in
      // the "Editable Voids" example on the docs site).
      const voidNode =
        potentialVoidNode && containsShadowAware(editorEl, potentialVoidNode)
          ? potentialVoidNode
          : null;
      const potentialNonEditableNode = parentNode.closest(
        '[contenteditable="false"]'
      );
      const nonEditableNode =
        potentialNonEditableNode &&
        containsShadowAware(editorEl, potentialNonEditableNode)
          ? potentialNonEditableNode
          : null;
      let leafNode = parentNode.closest('[data-plite-leaf]');
      let domNode: DOMElement | null = null;

      // Calculate how far into the text node the `nearestNode` is, so that we
      // can determine what the offset relative to the text node is.
      if (leafNode) {
        textNode = leafNode.closest('[data-plite-node="text"]');

        if (textNode) {
          const window = DOMEditor.getWindow(editor);
          const range = window.document.createRange();
          range.setStart(textNode, 0);
          range.setEnd(nearestNode, nearestOffset);

          const contents = range.cloneContents();
          const removals = [
            ...Array.prototype.slice.call(
              contents.querySelectorAll('[data-plite-zero-width]')
            ),
            ...Array.prototype.slice.call(
              contents.querySelectorAll('[contenteditable=false]')
            ),
          ];

          removals.forEach((el) => {
            // COMPAT: While composing at the start of a text node, some keyboards put
            // the text content inside the zero width space.
            if (
              IS_ANDROID &&
              !exactMatch &&
              el.hasAttribute('data-plite-zero-width') &&
              el.textContent.length > 0 &&
              el.textContext !== '\uFEFF'
            ) {
              if (el.textContent.startsWith('\uFEFF')) {
                el.textContent = el.textContent.slice(1);
              }

              return;
            }

            el!.parentNode!.removeChild(el);
          });

          // COMPAT: Edge has a bug where Range.prototype.toString() will
          // convert \n into \r\n. The bug causes a loop when plite-dom
          // attempts to reposition its cursor to match the native position. Use
          // textContent.length instead.
          // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/10291116/
          offset = contents.textContent!.length;
          domNode = textNode;
        }
      } else if (voidNode) {
        // For void nodes, the element with the offset key will be a cousin, not an
        // ancestor, so find it by going down from the nearest void parent and taking the
        // first one that isn't inside a nested editor.
        const leafNodes = voidNode.querySelectorAll('[data-plite-leaf]');
        for (const current of leafNodes) {
          if (DOMEditor.hasDOMNode(editor, current)) {
            leafNode = current;
            break;
          }
        }

        // COMPAT: In read-only editors the leaf is not rendered.
        if (leafNode) {
          textNode = leafNode.closest('[data-plite-node="text"]')!;
          domNode = leafNode;
          offset = domNode.textContent!.length;
          domNode.querySelectorAll('[data-plite-zero-width]').forEach((el) => {
            offset -= el.textContent!.length;
          });
        } else {
          offset = 1;
        }
      } else if (nonEditableNode) {
        const boundaryPlitePoint = resolvePlitePointFromDOMCoverageBoundary(
          editor,
          [nonEditableNode, 0]
        );

        if (boundaryPlitePoint) {
          return boundaryPlitePoint;
        }

        // Find the edge of the nearest leaf in `searchDirection`
        const getLeafNodes = (node: DOMElement | null | undefined) =>
          node
            ? node.querySelectorAll(
                // Exclude leaf nodes in nested editors
                '[data-plite-leaf]:not(:scope [data-plite-editor] [data-plite-leaf])'
              )
            : [];
        const elementNode = nonEditableNode.closest(
          '[data-plite-node="element"]'
        );

        if (searchDirection === 'backward' || !searchDirection) {
          const leafNodes = [
            ...getLeafNodes(elementNode?.previousElementSibling),
            ...getLeafNodes(elementNode),
          ];

          leafNode =
            leafNodes.findLast((leaf) => isBefore(nonEditableNode, leaf)) ??
            null;

          if (leafNode) {
            searchDirection = 'backward';
          }
        }

        if (searchDirection === 'forward' || !searchDirection) {
          const leafNodes = [
            ...getLeafNodes(elementNode),
            ...getLeafNodes(elementNode?.nextElementSibling),
          ];

          leafNode =
            leafNodes.find((leaf) => isAfter(nonEditableNode, leaf)) ?? null;

          if (leafNode) {
            searchDirection = 'forward';
          }
        }

        if (leafNode) {
          textNode = leafNode.closest('[data-plite-node="text"]')!;
          domNode = leafNode;
          if (searchDirection === 'forward') {
            offset = 0;
          } else {
            offset = domNode.textContent!.length;
            domNode
              .querySelectorAll('[data-plite-zero-width]')
              .forEach((el) => {
                offset -= el.textContent!.length;
              });
          }
        }
      }

      if (
        domNode &&
        offset === domNode.textContent!.length &&
        // COMPAT: Android IMEs might remove the zero width space while composing,
        // and we don't add it for line-breaks.
        IS_ANDROID &&
        domNode.getAttribute('data-plite-zero-width') === 'z' &&
        domNode.textContent?.startsWith('\uFEFF') &&
        // COMPAT: If the parent node is a Plite zero-width space, editor is
        // because the text node should have no characters. However, during IME
        // composition the ASCII characters will be prepended to the zero-width
        // space, so subtract 1 from the offset to account for the zero-width
        // space character.
        (parentNode.hasAttribute('data-plite-zero-width') ||
          // COMPAT: In Firefox, `range.cloneContents()` returns an extra trailing '\n'
          // when the document ends with a new-line character. This results in the offset
          // length being off by one, so we need to subtract one to account for this.
          (IS_FIREFOX && domNode.textContent?.endsWith('\n\n')))
      ) {
        offset--;
      }
    }

    if (IS_ANDROID && !textNode && !exactMatch) {
      const node = parentNode.hasAttribute('data-plite-node')
        ? parentNode
        : parentNode.closest('[data-plite-node]');

      if (node && DOMEditor.hasDOMNode(editor, node, { editable: true })) {
        const pliteNode = DOMEditor.resolvePliteNode(editor, node);
        const nodePath = pliteNode
          ? DOMEditor.resolvePath(editor, pliteNode)
          : null;

        if (!nodePath) {
          return null;
        }

        let { path, offset } = Editor.point(editor, nodePath, {
          edge: 'start',
        });

        if (!node.querySelector('[data-plite-leaf]')) {
          offset = nearestOffset;
        }

        return { path, offset };
      }
    }

    if (!textNode) {
      return null;
    }

    // COMPAT: If someone is clicking from one Plite editor into another,
    // the select event fires twice, once for the old editor's `element`
    // first, and then afterwards for the correct `element`. (2017/03/03)
    const mountedPath = resolveMountedDOMPath(editor, textNode! as HTMLElement);
    const pliteNode = DOMEditor.resolvePliteNode(editor, textNode!);
    const resolvedPath = pliteNode
      ? DOMEditor.resolvePath(editor, pliteNode)
      : null;
    const path = mountedPath ?? resolvedPath;
    const pointNode = path
      ? editor.read((state) => state.nodes.get(path))[0]
      : pliteNode;

    if (!pointNode || !path) {
      const fallbackPath = parsePliteDOMPath(
        textNode?.getAttribute('data-plite-path') ?? null
      );

      if (fallbackPath && Editor.hasPath(editor, fallbackPath)) {
        const [fallbackNode] = editor.read((state) =>
          state.nodes.get(fallbackPath)
        );
        const point = resolvePliteTextPoint({
          editor,
          exactMatch,
          offset,
          path: fallbackPath,
          pliteNode: fallbackNode,
        });

        return point;
      }

      return null;
    }

    const point = resolvePliteTextPoint({
      editor,
      exactMatch,
      offset,
      path,
      pliteNode: pointNode,
    });

    return point;
  },

  assertPlitePoint: (editor, domPoint, options) => {
    const point = DOMEditor.resolvePlitePoint(editor, domPoint, options);

    if (point) {
      return point;
    }

    throw new PliteDOMResolutionError(
      `Cannot resolve a Plite point from DOM point: ${domPoint}`,
      { code: '@platejs/plite-dom/plite-point', details: { domPoint } }
    );
  },

  resolvePliteRange: (
    editor: DOMEditor<any>,
    domRange: DOMRange | DOMStaticRange | DOMSelection,
    options: {
      exactMatch: boolean;
    }
  ): Range | null => {
    const { exactMatch } = options;
    const el = isDOMSelection(domRange)
      ? domRange.anchorNode
      : domRange.startContainer;
    let anchorNode: globalThis.Node | null = null;
    let anchorOffset = 0;
    let focusNode: globalThis.Node | null = null;
    let focusOffset = 0;
    let isCollapsed = false;

    if (el) {
      if (isDOMSelection(domRange)) {
        // COMPAT: In firefox the normal seletion way does not work
        // (https://github.com/ianstormtaylor/slate/pull/5486#issue-1820720223)
        if (IS_FIREFOX && domRange.rangeCount > 1) {
          focusNode = domRange.focusNode; // Focus node works fine
          const firstRange = domRange.getRangeAt(0);
          const lastRange = domRange.getRangeAt(domRange.rangeCount - 1);

          // Here we are in the contenteditable mode of a table in firefox
          if (
            focusNode instanceof HTMLTableRowElement &&
            firstRange.startContainer instanceof HTMLTableRowElement &&
            lastRange.startContainer instanceof HTMLTableRowElement
          ) {
            // HTMLElement, becouse Element is a Plite element
            function getLastChildren(element: HTMLElement): HTMLElement {
              if (element.childElementCount > 0) {
                return getLastChildren(<HTMLElement>element.children[0]);
              }
              return element;
            }

            const firstNodeRow = <HTMLTableRowElement>firstRange.startContainer;
            const lastNodeRow = <HTMLTableRowElement>lastRange.startContainer;

            // This should never fail as "The HTMLElement interface represents any HTML element."
            const firstNode = getLastChildren(
              <HTMLElement>firstNodeRow.children[firstRange.startOffset]
            );
            const lastNode = getLastChildren(
              <HTMLElement>lastNodeRow.children[lastRange.startOffset]
            );

            // Zero, as we allways take the right one as the anchor point
            focusOffset = 0;

            if (lastNode.childNodes.length > 0) {
              anchorNode = lastNode.childNodes[0];
            } else {
              anchorNode = lastNode;
            }

            if (firstNode.childNodes.length > 0) {
              focusNode = firstNode.childNodes[0];
            } else {
              focusNode = firstNode;
            }

            if (lastNode instanceof HTMLElement) {
              anchorOffset = (<HTMLElement>lastNode).innerHTML.length;
            } else {
              // Fallback option
              anchorOffset = 0;
            }
          } else if (firstRange.startContainer === focusNode) {
            // This is the read only mode of a firefox table
            // Right to left
            anchorNode = lastRange.endContainer;
            anchorOffset = lastRange.endOffset;
            focusOffset = firstRange.startOffset;
          } else {
            // Left to right
            anchorNode = firstRange.startContainer;
            anchorOffset = firstRange.endOffset;
            focusOffset = lastRange.startOffset;
          }
        } else {
          anchorNode = domRange.anchorNode;
          anchorOffset = domRange.anchorOffset;
          focusNode = domRange.focusNode;
          focusOffset = domRange.focusOffset;
        }

        // Endpoint equality is the only collapsed signal Plite can trust across
        // browser timing windows. Some engines expose stale `isCollapsed` while
        // anchor/focus already describe an expanded selection.
        isCollapsed =
          domRange.anchorNode === domRange.focusNode &&
          domRange.anchorOffset === domRange.focusOffset;
      } else {
        anchorNode = domRange.startContainer;
        anchorOffset = domRange.startOffset;
        focusNode = domRange.endContainer;
        focusOffset = domRange.endOffset;
        isCollapsed = domRange.collapsed;
      }
    }

    if (
      anchorNode == null ||
      focusNode == null ||
      anchorOffset == null ||
      focusOffset == null
    ) {
      return null;
    }

    // COMPAT: Firefox sometimes includes an extra \n (rendered by TextString
    // when isTrailing is true) in the focusOffset, resulting in an invalid
    // Plite point. (2023/11/01)
    if (
      IS_FIREFOX &&
      focusNode.textContent?.endsWith('\n\n') &&
      focusOffset === focusNode.textContent.length
    ) {
      focusOffset--;
    }

    const anchor = DOMEditor.resolvePlitePoint(
      editor,
      [anchorNode, anchorOffset],
      {
        exactMatch,
      }
    );
    if (!anchor) {
      return null;
    }

    const focusBeforeAnchor =
      isBefore(anchorNode, focusNode) ||
      (anchorNode === focusNode && focusOffset < anchorOffset);
    const focus = isCollapsed
      ? anchor
      : DOMEditor.resolvePlitePoint(editor, [focusNode, focusOffset], {
          exactMatch,
          searchDirection: focusBeforeAnchor ? 'forward' : 'backward',
        });
    if (!focus) {
      return null;
    }

    let range: Range = { anchor: anchor as Point, focus: focus as Point };
    // if the selection is a hanging range that ends in a void
    // and the DOM focus is an Element
    // (meaning that the selection ends before the element)
    // unhang the range to avoid mistakenly including the void
    if (
      RangeApi.isExpanded(range) &&
      RangeApi.isForward(range) &&
      isDOMElement(focusNode) &&
      Editor.void(editor, { at: range.focus, mode: 'highest' })
    ) {
      range = Editor.unhangRange(editor, range, { voids: true });
    }

    return range;
  },

  assertPliteRange: (editor, domRange, options) => {
    const range = DOMEditor.resolvePliteRange(editor, domRange, options);

    if (range) {
      return range;
    }

    throw new PliteDOMResolutionError(
      `Cannot resolve a Plite range from DOM range: ${domRange}`,
      { code: '@platejs/plite-dom/plite-range', details: { domRange } }
    );
  },
};

export const createDOMEditorCapability = (
  editor: DOMEditor<any>
): DOMEditorCapability => {
  const capability: DOMEditorCapability = {
    blur: () => DOMEditor.blur(editor),
    deselect: () => DOMEditor.deselect(editor),
    findDocumentOrShadowRoot: () => DOMEditor.findDocumentOrShadowRoot(editor),
    assertEventRange: (event) => DOMEditor.assertEventRange(editor, event),
    findKey: (node) => DOMEditor.findKey(editor, node),
    assertPath: (node) => DOMEditor.assertPath(editor, node),
    focus: (options) => DOMEditor.focus(editor, options),
    getWindow: () => DOMEditor.getWindow(editor),
    hasDOMNode: (target, options) =>
      DOMEditor.hasDOMNode(editor, target, options),
    hasEditableTarget: (target) => DOMEditor.hasEditableTarget(editor, target),
    hasRange: (range) => DOMEditor.hasRange(editor, range),
    hasSelectableTarget: (target) =>
      DOMEditor.hasSelectableTarget(editor, target),
    hasTarget: (target) => DOMEditor.hasTarget(editor, target),
    clipboard: Object.freeze({
      insertData: (data: DataTransfer) =>
        DOMEditor.clipboard.insertData(editor, data),
      insertFragmentData: (data: DataTransfer) =>
        DOMEditor.clipboard.insertFragmentData(editor, data),
      insertTextData: (data: DataTransfer) =>
        DOMEditor.clipboard.insertTextData(editor, data),
      writeSelection: (data: Pick<DataTransfer, 'getData' | 'setData'>) =>
        DOMEditor.clipboard.writeSelection(editor, data),
    }),
    isComposing: () => DOMEditor.isComposing(editor),
    isFocused: () => DOMEditor.isFocused(editor),
    isReadOnly: () => DOMEditor.isReadOnly(editor),
    isTargetInsideNonReadonlyVoid: (target) =>
      DOMEditor.isTargetInsideNonReadonlyVoid(editor, target),
    resolveDOMNode: (node) => DOMEditor.resolveDOMNode(editor, node),
    resolveDOMPoint: (point) => DOMEditor.resolveDOMPoint(editor, point),
    resolveDOMRange: (range) => DOMEditor.resolveDOMRange(editor, range),
    resolveEventRange: (event) => DOMEditor.resolveEventRange(editor, event),
    resolvePath: (node) => DOMEditor.resolvePath(editor, node),
    resolveRangeRect: (range) => DOMEditor.resolveRangeRect(editor, range),
    resolvePliteNode: (domNode) => DOMEditor.resolvePliteNode(editor, domNode),
    resolvePlitePoint: (domPoint, options) =>
      DOMEditor.resolvePlitePoint(editor, domPoint, options),
    resolvePliteRange: (domRange, options) =>
      DOMEditor.resolvePliteRange(editor, domRange, options),
    assertDOMNode: (node) => DOMEditor.assertDOMNode(editor, node),
    assertDOMPoint: (point) => DOMEditor.assertDOMPoint(editor, point),
    assertDOMRange: (range) => DOMEditor.assertDOMRange(editor, range),
    assertPliteNode: (domNode) => DOMEditor.assertPliteNode(editor, domNode),
    assertPlitePoint: (domPoint, options) =>
      DOMEditor.assertPlitePoint(editor, domPoint, options),
    assertPliteRange: (domRange, options) =>
      DOMEditor.assertPliteRange(editor, domRange, options),
  };

  return Object.freeze(capability);
};
