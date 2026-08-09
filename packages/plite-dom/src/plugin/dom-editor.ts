import {
  type Descendant,
  type Node,
  NodeApi,
  type Path,
  PathApi,
  PointApi,
  type Point,
  type Range,
  RangeApi,
  type RootKey,
  type RuntimeId,
  type SelectionAssociation,
  type EditorUpdateTransaction,
  TextApi,
  type Value,
} from '@platejs/plite';
import scrollIntoViewIfNeeded, {
  type StandardBehaviorOptions,
} from 'scroll-into-view-if-needed';
import {
  type AnyEditor as EditorType,
  getSelection as editorGetSelection,
  getActiveEditorTransaction,
  getEditorRuntimeIdForNode,
  getRuntimeId as editorGetRuntimeId,
  getSelectionPrimaryRange,
  hasPath as editorHasPath,
  isVoid as editorIsVoid,
  point as editorPoint,
  range as editorRange,
  setEditorFocused,
  toInternalRoot,
  unhangRange as editorUnhangRange,
  void as editorVoid,
} from '@platejs/plite/internal';
import { formatDebugValue } from '@platejs/plite/internal';
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
import { isAndroidDOMHost, isGeckoDOMHost } from '../utils/environment';

import { Key } from '../utils/key';
import {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_DOM_EDITABLE,
  EDITOR_TO_DOM_ROOT,
  EDITOR_TO_DOM_SCOPE_LISTENERS,
  EDITOR_TO_DOM_SCROLL,
  EDITOR_TO_KEY_TO_ELEMENT,
  EDITOR_TO_RUNTIME_ID_TO_KEY,
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
  NODE_TO_RUNTIME_ID,
} from '../utils/weak-maps';
import {
  type ClipboardSliceRead,
  type ClipboardSliceWrite,
  dispatchDOMClipboardHandlers,
  type DOMClipboardHandler,
  insertDOMData,
  insertDOMFragmentData,
  insertDOMTextData,
  readDOMClipboardSlice,
  writeDOMClipboardSlice,
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
  parsePliteDOMPath,
  resolveMountedDOMPath,
  resolvePliteNodePath,
  toMountedDOMNodeByPath,
} from './dom-node-path';
import { createDOMGeometryKernel } from './dom-geometry';
import {
  destroyEditorDOMPhaseSchedulerFallbackForRoot,
  scheduleEditorDOMPhase,
} from './dom-phase-scheduler';

const EDITOR_TO_CANCEL_FOCUS_RETRY = new WeakMap<EditorType, () => void>();
const EDITOR_TO_FOCUS_REQUEST_GENERATION = new WeakMap<EditorType, number>();
const ROOT_TO_FOCUS_REQUEST_OWNER = new WeakMap<
  Document | ShadowRoot,
  {
    editor: EditorType;
    generation: number;
  }
>();

/** Core editor accepted by the DOM bridge before its API is installed. */
export type DOMEditor<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = EditorType<V, TExtensions>;

export interface DOMApi {
  blur: () => void;
  deselect: () => void;
  editable: (root?: RootKey) => HTMLElement | null;
  findDocumentOrShadowRoot: () => Document | ShadowRoot;
  assertEventRange: (event: any) => Range;
  findKey: (node: Descendant) => Key;
  assertPath: (node: Node) => Path;
  focus: (options?: { retries?: number }) => void;
  getWindow: () => Window;
  hasDOMNode: (target: DOMNode, options?: { editable?: boolean }) => boolean;
  hasEditableTarget: (target: EventTarget | null) => target is DOMNode;
  hasRange: (range: Range) => boolean;
  hasSelectableTarget: (target: EventTarget | null) => boolean;
  hasTarget: (target: EventTarget | null) => target is DOMNode;
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
  /** Resolve one mounted caret step in rendered visual order. */
  resolveVisualPoint: (
    point: Point,
    options: DOMVisualPointOptions
  ) => DOMVisualPoint | null;
  root: () => HTMLElement | null;
  scroll: () => HTMLElement | null;
  /** Scroll a mounted node path, text point/range, or native DOM range. */
  scrollIntoView: (
    target: ScrollIntoViewTarget,
    options?: ScrollIntoViewOptions
  ) => void;
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

export interface DOMEditorCapability<V extends Value = Value> extends DOMApi {
  clipboard: DOMEditorClipboardCapability<V>;
}

/** Clipboard methods installed by the Plite DOM bridge. */
export interface DOMEditorClipboardCapability<V extends Value = Value> {
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

  /** Read an exact Plite slice and distinguish absence from invalid data. */
  readSlice: (
    data: Pick<DataTransfer, 'getData' | 'types'>
  ) => ClipboardSliceRead<V>;

  /**
   * Write the current selection to a `DataTransfer`.
   */
  writeSelection: (data: Pick<DataTransfer, 'getData' | 'setData'>) => void;

  /** Write one exact Plite slice plus optional host formats. */
  writeSlice: (
    data: Pick<DataTransfer, 'getData' | 'setData'>,
    payload: ClipboardSliceWrite<V>
  ) => void;
}

export interface DOMClipboardApi<V extends Value = Value>
  extends DOMEditorClipboardCapability<V> {}

export type ScrollIntoViewOptions = StandardBehaviorOptions | boolean;

export type ScrollIntoViewTarget = DOMRange | Path | Point | Range;

export type DOMVisualPoint = Readonly<{
  affinity: SelectionAssociation;
  point: Point;
}>;

export type DOMVisualPointOptions = Readonly<{
  affinity?: SelectionAssociation;
  direction: 'left' | 'right';
  unit: 'character' | 'word';
}>;

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

export type DOMClipboardInsertDataHandler<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = (editor: DOMEditor<V, TExtensions>, data: DataTransfer) => boolean;

export interface DOMEditorClipboardInterface {
  /**
   * Insert data from a `DataTransfer` into the editor.
   */
  insertData: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    data: DataTransfer
  ) => boolean;

  /**
   * Insert fragment data from a `DataTransfer` into the editor.
   */
  insertFragmentData: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    data: DataTransfer
  ) => boolean;

  /**
   * Insert text data from a `DataTransfer` into the editor.
   */
  insertTextData: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    data: DataTransfer
  ) => boolean;

  /**
   * Write the currently selected fragment to a `DataTransfer`.
   */
  writeSelection: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    data: Pick<DataTransfer, 'getData' | 'setData'>
  ) => void;
}

export interface DOMEditorInterface {
  /**
   * Android text-repair internal: return pending text diffs.
   */
  androidPendingDiffs: <
    V extends Value,
    TExtensions extends readonly unknown[],
  >(
    editor: EditorType<V, TExtensions>
  ) => TextDiff[] | undefined;

  /**
   * Android text-repair internal: flush pending diffs and end composition.
   */
  androidScheduleFlush: <
    V extends Value,
    TExtensions extends readonly unknown[],
  >(
    editor: EditorType<V, TExtensions>
  ) => void;

  /**
   * Blur the editor.
   */
  blur: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>
  ) => void;

  /**
   * Deselect the editor.
   */
  deselect: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>
  ) => void;

  /**
   * Resolve the currently mounted editable element for a Plite root.
   */
  editable: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    root?: RootKey
  ) => HTMLElement | null;

  /**
   * Find the DOM node that implements DocumentOrShadowRoot for the editor.
   */
  findDocumentOrShadowRoot: <
    V extends Value,
    TExtensions extends readonly unknown[],
  >(
    editor: DOMEditor<V, TExtensions>
  ) => Document | ShadowRoot;

  /**
   * Get the target range from a DOM `event`.
   */
  assertEventRange: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    event: any
  ) => Range;

  /**
   * Find a key for a Plite node.
   */
  findKey: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    node: Descendant
  ) => Key;

  /**
   * Find the path of a Plite node.
   */
  assertPath: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    node: Node
  ) => Path;

  /**
   * Focus the editor.
   */
  focus: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    options?: { retries?: number }
  ) => void;

  /**
   * Return the host window of the current editor.
   */
  getWindow: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>
  ) => Window;

  /**
   * Check if a DOM node is within the editor.
   */
  hasDOMNode: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    target: DOMNode,
    options?: { editable?: boolean }
  ) => boolean;

  /**
   * Check if the target is editable and in the editor.
   */
  hasEditableTarget: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    target: EventTarget | null
  ) => target is DOMNode;

  /**
   * Check if every point in a Plite range maps to mounted DOM.
   */
  hasRange: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    range: Range
  ) => boolean;

  /**
   * Check if the target can be selected.
   */
  hasSelectableTarget: <
    V extends Value,
    TExtensions extends readonly unknown[],
  >(
    editor: DOMEditor<V, TExtensions>,
    target: EventTarget | null
  ) => boolean;

  /**
   * Check if the target is in the editor.
   */
  hasTarget: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    target: EventTarget | null
  ) => target is DOMNode;

  clipboard: DOMEditorClipboardInterface;

  /**
   * Check if the user is currently composing inside the editor.
   */
  isComposing: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>
  ) => boolean;

  /**
   * Check if the editor is focused.
   */
  isFocused: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>
  ) => boolean;

  /**
   * Check if the editor is in read-only mode.
   */
  isReadOnly: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>
  ) => boolean;

  /**
   * Check if the target is inside a void in a writable editor.
   */
  isTargetInsideNonReadonlyVoid: <
    V extends Value,
    TExtensions extends readonly unknown[],
  >(
    editor: DOMEditor<V, TExtensions>,
    target: EventTarget | null
  ) => boolean;

  /**
   * Resolve the native DOM element for a Plite node.
   *
   * Returns `null` when the node is not currently mounted or the node maps are
   * stale.
   */
  resolveDOMNode: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    node: Node
  ) => HTMLElement | null;

  /**
   * Resolve a native DOM point from a Plite point.
   *
   * Returns `null` when the point cannot be projected into mounted DOM.
   */
  resolveDOMPoint: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    point: Point
  ) => DOMPoint | null;

  /**
   * Resolve a native DOM range from a Plite range.
   *
   * Returns `null` when either endpoint cannot be projected into mounted DOM.
   */
  resolveDOMRange: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    range: Range
  ) => DOMRange | null;

  /**
   * Resolve the target range from a DOM event.
   *
   * Returns `null` when the browser cannot provide a usable caret range or the
   * target is outside this editor.
   */
  resolveEventRange: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    event: any
  ) => Range | null;

  /**
   * Resolve a Plite node path.
   *
   * Returns `null` for detached nodes or stale path metadata.
   */
  resolvePath: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    node: Node
  ) => Path | null;

  /**
   * Resolve a Plite range to its DOM bounding rectangle.
   */
  resolveRangeRect: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    range: Range
  ) => DOMRect | null;

  /**
   * Resolve the mounted editor root element.
   */
  root: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>
  ) => HTMLElement | null;

  /**
   * Resolve the scroll element used for editor viewport work.
   */
  scroll: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>
  ) => HTMLElement | null;

  /** Scroll a Plite path/point/range or native DOM range into view. */
  scrollIntoView: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    target: ScrollIntoViewTarget,
    options?: ScrollIntoViewOptions
  ) => void;

  /**
   * Resolve a Plite node from a native DOM node.
   *
   * Returns `null` when the DOM node is foreign to this editor or no mounted
   * Plite node can be recovered.
   */
  resolvePliteNode: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    domNode: DOMNode
  ) => Node | null;

  /**
   * Resolve a Plite point from a DOM selection point.
   */
  resolvePlitePoint: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
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
  resolvePliteRange: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    domRange: DOMRange | DOMStaticRange | DOMSelection,
    options: {
      exactMatch: boolean;
    }
  ) => Range | null;

  /**
   * Find the native DOM element from a Plite node.
   */
  assertDOMNode: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    node: Node
  ) => HTMLElement;

  /**
   * Find a native DOM selection point from a Plite point.
   */
  assertDOMPoint: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    point: Point
  ) => DOMPoint;

  /**
   * Find a native DOM range from a Plite `range`.
   *
   * Notice: the returned range will always be ordinal regardless of the direction of Plite `range` due to DOM API limit.
   *
   * there is no way to create a reverse DOM Range using Range.setStart/setEnd
   * according to https://dom.spec.whatwg.org/#concept-range-bp-set.
   */
  assertDOMRange: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    range: Range
  ) => DOMRange;

  /**
   * Find a Plite node from a native DOM `element`.
   */
  assertPliteNode: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    domNode: DOMNode
  ) => Node;

  /**
   * Find a Plite point from a DOM selection's `domNode` and `domOffset`.
   */
  assertPlitePoint: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
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
  assertPliteRange: <V extends Value, TExtensions extends readonly unknown[]>(
    editor: DOMEditor<V, TExtensions>,
    domRange: DOMRange | DOMStaticRange | DOMSelection,
    options: {
      exactMatch: boolean;
    }
  ) => Range;
}

const cachePliteDOMNode = (
  editor: DOMEditor<any>,
  node: Descendant,
  domNode: HTMLElement,
  runtimeId?: RuntimeId | null
) => {
  const key = runtimeId
    ? getOrCreateDOMNodeKey(editor, runtimeId, node)
    : DOMEditor.findKey(editor, node);
  const keyToElement = EDITOR_TO_KEY_TO_ELEMENT.get(editor) ?? new WeakMap();

  if (!EDITOR_TO_KEY_TO_ELEMENT.has(editor)) {
    EDITOR_TO_KEY_TO_ELEMENT.set(editor, keyToElement);
  }

  keyToElement.set(key, domNode);
  ELEMENT_TO_NODE.set(domNode, node);
  NODE_TO_ELEMENT.set(node, domNode);
  if (runtimeId) {
    NODE_TO_RUNTIME_ID.set(node, runtimeId);
  }

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

  if (!targetPath || !editorHasPath(editor, targetPath)) {
    return null;
  }

  return editorPoint(editor, targetPath, {
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
    if (!editorHasPath(editor, path)) {
      return null;
    }

    return editorPoint(editor, path, {
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

const resolvePointNearCoordinates = (
  editor: DOMEditor<any>,
  target: EventTarget | null,
  x: number,
  y: number
): Point | null => {
  const targetElement = isDOMText(target)
    ? target.parentElement
    : isDOMElement(target)
      ? target
      : null;
  const root = DOMEditor.resolveDOMNode(editor, editor);

  if (!root) return null;

  const targetTextHost = targetElement?.closest<HTMLElement>(
    '[data-plite-node="text"]'
  );
  const targetResult = targetTextHost
    ? createDOMGeometryKernel({
        root,
        target: targetTextHost,
      }).pointAtCoordinates({ useNative: false, x, y })
    : null;
  const result =
    targetResult ??
    createDOMGeometryKernel({ root }).pointAtCoordinates({ x, y });

  return result
    ? DOMEditor.resolvePlitePoint(editor, [result.point[0], result.point[1]], {
        exactMatch: false,
      })
    : null;
};

const getEditorDOMViewRoot = (editor: EditorType<any>, root?: RootKey) =>
  toInternalRoot(root ?? editor.read.view.root());

const notifyEditorDOMScopeListeners = (editor: EditorType<any>) => {
  EDITOR_TO_DOM_SCOPE_LISTENERS.get(editor)?.forEach((listener) => {
    listener();
  });
};

const setWeakElement = (
  map: WeakMap<EditorType<any>, HTMLElement>,
  editor: EditorType<any>,
  element: HTMLElement | null
) => {
  if (element) {
    if (map.get(editor) === element) return false;
    map.set(editor, element);

    return true;
  }

  if (!map.has(editor)) return false;
  map.delete(editor);

  return true;
};

export const setEditorDOMRootElement = (
  editor: EditorType<any>,
  element: HTMLElement | null
) => {
  const previousRoot = EDITOR_TO_DOM_ROOT.get(editor) ?? null;

  if (setWeakElement(EDITOR_TO_DOM_ROOT, editor, element)) {
    destroyEditorDOMPhaseSchedulerFallbackForRoot(editor, previousRoot);
    notifyEditorDOMScopeListeners(editor);
  }
};

export const setEditorDOMEditableElement = (
  editor: EditorType<any>,
  element: HTMLElement | null,
  root?: RootKey
) => {
  const rootKey = getEditorDOMViewRoot(editor, root);
  const currentMap = EDITOR_TO_DOM_EDITABLE.get(editor);

  if (element) {
    const editableMap = currentMap ?? new Map<RootKey, HTMLElement>();

    if (editableMap.get(rootKey) === element) return;

    editableMap.set(rootKey, element);
    EDITOR_TO_DOM_EDITABLE.set(editor, editableMap);
    notifyEditorDOMScopeListeners(editor);

    return;
  }

  if (!currentMap?.has(rootKey)) return;

  currentMap.delete(rootKey);

  if (currentMap.size === 0) {
    EDITOR_TO_DOM_EDITABLE.delete(editor);
  }

  notifyEditorDOMScopeListeners(editor);
};

export const setEditorDOMScrollElement = (
  editor: EditorType<any>,
  element: HTMLElement | null
) => {
  if (setWeakElement(EDITOR_TO_DOM_SCROLL, editor, element)) {
    notifyEditorDOMScopeListeners(editor);
  }
};

export const subscribeEditorDOMScope = (
  editor: EditorType<any>,
  listener: () => void
) => {
  const listeners = EDITOR_TO_DOM_SCOPE_LISTENERS.get(editor) ?? new Set();

  listeners.add(listener);
  EDITOR_TO_DOM_SCOPE_LISTENERS.set(editor, listeners);

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      EDITOR_TO_DOM_SCOPE_LISTENERS.delete(editor);
    }
  };
};

/** @internal Reuse one DOM key for a node's editor-scoped runtime identity. */
export const getOrCreateDOMNodeKey = (
  editor: DOMEditor<any>,
  runtimeId: RuntimeId,
  node: Descendant
) => {
  const runtimeKeys =
    EDITOR_TO_RUNTIME_ID_TO_KEY.get(editor) ?? new Map<RuntimeId, Key>();
  let key = runtimeKeys.get(runtimeId);

  if (!key) {
    key = new Key();
    runtimeKeys.set(runtimeId, key);
    EDITOR_TO_RUNTIME_ID_TO_KEY.set(editor, runtimeKeys);
  }

  NODE_TO_KEY.set(node, key);

  return key;
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
    setEditorFocused(editor, false);

    if (root.activeElement === el) {
      el.blur();
    }
  },

  deselect: (editor) => {
    const selection = editor.read((state) => state.selection());
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

  editable: (editor, root) => {
    const rootKey = getEditorDOMViewRoot(editor, root);
    const editable = EDITOR_TO_DOM_EDITABLE.get(editor)?.get(rootKey);

    if (editable) return editable;

    if (root === undefined || rootKey === editor.read.view.root()) {
      return EDITOR_TO_ELEMENT.get(editor) ?? null;
    }

    return null;
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
      return editorRange(editor, targetBoundaryPoint);
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

    const point = resolvePointNearCoordinates(editor, target, x, y);

    return point ? editorRange(editor, point) : null;
  },

  findKey: (editor, node) => {
    const runtimeId = getEditorRuntimeIdForNode(editor, node);

    return getOrCreateDOMNodeKey(editor, runtimeId, node);
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

  focus: (editor, options = {}) => {
    const retries = options.retries ?? 50;
    const focusRequestGeneration =
      (EDITOR_TO_FOCUS_REQUEST_GENERATION.get(editor) ?? 0) + 1;

    EDITOR_TO_FOCUS_REQUEST_GENERATION.set(editor, focusRequestGeneration);

    // Return if no dom node is associated with the editor, which means the editor is not yet mounted
    // or has been unmounted. This can happen especially, while retrying to focus the editor.
    if (!EDITOR_TO_ELEMENT.get(editor)) {
      return;
    }

    const root = DOMEditor.findDocumentOrShadowRoot(editor);
    const focusRequestOwner = {
      editor,
      generation: focusRequestGeneration,
    };

    ROOT_TO_FOCUS_REQUEST_OWNER.set(root, focusRequestOwner);

    // Retry setting focus if the editor has pending updates.
    // The DOM (selection) is unstable while changes are applied.
    // Retry until retries are exhausted or editor is focused.
    if (retries <= 0) {
      return;
    }
    if (IS_NODE_MAP_DIRTY.get(editor)) {
      EDITOR_TO_CANCEL_FOCUS_RETRY.get(editor)?.();
      let cancel = () => {};

      cancel = scheduleEditorDOMPhase(
        editor,
        'dom-write',
        'dom-editor-focus-retry',
        () => {
          if (EDITOR_TO_CANCEL_FOCUS_RETRY.get(editor) === cancel) {
            EDITOR_TO_CANCEL_FOCUS_RETRY.delete(editor);
          }
          if (ROOT_TO_FOCUS_REQUEST_OWNER.get(root) !== focusRequestOwner) {
            return;
          }
          DOMEditor.focus(editor, { retries: retries - 1 });
        },
        {
          delay: 10,
          key: 'dom-editor-focus-retry',
          timing: 'timeout',
        }
      );
      EDITOR_TO_CANCEL_FOCUS_RETRY.set(editor, cancel);
      return;
    }

    EDITOR_TO_CANCEL_FOCUS_RETRY.get(editor)?.();
    EDITOR_TO_CANCEL_FOCUS_RETRY.delete(editor);

    const el = DOMEditor.assertDOMNode(editor, editor);

    const getLiveSelection = () => editorGetSelection(editor);
    const selection = getLiveSelection();
    const selectionAtFocus = selection
      ? {
          anchor: { ...selection.anchor },
          focus: { ...selection.focus },
        }
      : null;
    // Create a new selection in the top of the document if missing
    if (!selection) {
      const start = editorPoint(editor, [], { edge: 'start' });
      const transaction = getActiveEditorTransaction(editor);

      if (transaction) {
        transaction.selection.set(start);
      } else {
        editor.update((tx) => tx.selection.set(start));
      }
    }

    const syncDomSelection = () => {
      const selection = getLiveSelection();

      if (selection) {
        const domSelection = getSelection(root);
        const projectedSelection = getSelectionPrimaryRange(editor, selection);

        if (!domSelection) {
          return;
        }
        if (!projectedSelection) {
          domSelection.removeAllRanges();
          return;
        }
        const domRange = DOMEditor.resolveDOMRange(editor, projectedSelection);

        if (domRange) {
          if (RangeApi.isBackward(projectedSelection)) {
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
    let ownedActiveElement: Element | null =
      root.activeElement === el ||
      (root.activeElement && containsShadowAware(el, root.activeElement))
        ? root.activeElement
        : null;
    const settleFocus = () => {
      if (
        EDITOR_TO_FOCUS_REQUEST_GENERATION.get(editor) !==
          focusRequestGeneration ||
        ROOT_TO_FOCUS_REQUEST_OWNER.get(root) !== focusRequestOwner
      ) {
        return;
      }

      const liveElement = EDITOR_TO_ELEMENT.get(editor);

      if (liveElement !== el || !el.isConnected || el.getRootNode() !== root) {
        return;
      }

      const rootActiveElement = root.activeElement;
      const shadowHost = 'host' in root ? root.host : null;
      const activeElement =
        rootActiveElement ??
        (root === el.ownerDocument ? null : el.ownerDocument.activeElement);

      if (activeElement === el) {
        return;
      }
      if (
        activeElement?.isConnected &&
        containsShadowAware(el, activeElement)
      ) {
        ownedActiveElement = activeElement;
        return;
      }

      const lostToInactiveHost =
        activeElement === null ||
        activeElement === el.ownerDocument.body ||
        (rootActiveElement === null && activeElement === shadowHost) ||
        (activeElement === ownedActiveElement && !activeElement.isConnected);

      if (!lostToInactiveHost) {
        return;
      }

      IS_FOCUSED.set(editor, true);
      setEditorFocused(editor, true);
      el.focus({ preventScroll: true });
      trySyncDomSelection();
    };
    const scheduleFocusSettle = () => {
      scheduleEditorDOMPhase(
        editor,
        'dom-write',
        'dom-editor-focus-settle-microtask',
        settleFocus,
        {
          key: 'dom-editor-focus-settle-microtask',
          timing: 'microtask',
        }
      );
      scheduleEditorDOMPhase(
        editor,
        'dom-write',
        'dom-editor-focus-settle-frame',
        settleFocus,
        {
          key: 'dom-editor-focus-settle-frame',
          timing: 'animation-frame',
        }
      );
      scheduleEditorDOMPhase(
        editor,
        'dom-write',
        'dom-editor-focus-settle-timeout',
        settleFocus,
        {
          delay: 50,
          key: 'dom-editor-focus-settle-timeout',
          timing: 'timeout',
        }
      );
    };

    if (root.activeElement !== el) {
      // IS_FOCUSED should be set before calling el.focus() to ensure that
      // FocusedContext is updated to the correct value
      IS_FOCUSED.set(editor, true);
      setEditorFocused(editor, true);
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
        scheduleEditorDOMPhase(
          editor,
          'selection-repair',
          'dom-editor-focus-selection-sync',
          () => {
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
          },
          {
            key: 'dom-editor-focus-selection-sync',
            timing: 'microtask',
          }
        );
      }
      scheduleFocusSettle();
      return;
    }

    IS_FOCUSED.set(editor, true);
    setEditorFocused(editor, true);
    trySyncDomSelection();
    scheduleFocusSettle();
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

    const isInteractiveControl = closestShadowAware(
      targetEl,
      'button, input, select, textarea, [role="button"]'
    );
    const isContentEditable =
      targetEl.isContentEditable === true ||
      (typeof targetEl.isContentEditable === 'boolean'
        ? closestShadowAware(targetEl, '[contenteditable="false"]') === editorEl
        : !isInteractiveControl &&
          closestShadowAware(targetEl, '[contenteditable]') === editorEl);

    return (
      closestShadowAware(targetEl, '[data-plite-editor]') === editorEl &&
      (!editable ||
        isContentEditable ||
        !!targetEl.getAttribute('data-plite-zero-width'))
    );
  },

  hasEditableTarget: (editor, target): target is DOMNode =>
    isDOMNode(target) &&
    DOMEditor.hasDOMNode(editor, target, { editable: true }),

  hasRange: (editor, range) => {
    const { anchor, focus } = range;
    return (
      editorHasPath(editor, anchor.path) && editorHasPath(editor, focus.path)
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
      editorIsVoid(editor, pliteNode)
    );
  },

  resolveDOMNode: (editor, node) => {
    if (node === editor) return DOMEditor.editable(editor);
    if (NodeApi.isEditor(node)) return null;
    let key: Key;

    try {
      key = DOMEditor.findKey(editor, node);
    } catch {
      return null;
    }
    const domNode = EDITOR_TO_KEY_TO_ELEMENT.get(editor)?.get(key);

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
    const entry = editor.read((state) =>
      state.nodes.get<Descendant>(point.path)
    );

    if (!entry) return null;

    const resolvedPoint = editorVoid(editor, { at: point })
      ? { path: point.path, offset: 0 }
      : point;
    const [node] = entry;
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
    const resolvedPoint = editorVoid(editor, { at: point })
      ? { path: point.path, offset: 0 }
      : point;
    const domPoint = DOMEditor.resolveDOMPoint(editor, point);

    if (domPoint) {
      return domPoint;
    }

    const entry = editor.read((state) => state.nodes.get(resolvedPoint.path));

    if (entry) {
      const [node] = entry;
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

  resolveRangeRect: (editor, range) => {
    const root = DOMEditor.resolveDOMNode(editor, editor);

    if (!root) return null;

    const affinity = (range as Range & { affinity?: 'backward' | 'forward' })
      .affinity;

    return createDOMGeometryKernel({ root }).rangeRect(
      DOMEditor.resolveDOMRange(editor, range),
      {
        association: affinity === 'forward' ? 'forward' : 'backward',
        fallbackPoint: DOMEditor.resolveDOMPoint(editor, range.anchor),
      }
    );
  },

  root: (editor) =>
    EDITOR_TO_DOM_ROOT.get(editor) ?? DOMEditor.editable(editor) ?? null,

  scroll: (editor) =>
    EDITOR_TO_DOM_SCROLL.get(editor) ??
    DOMEditor.root(editor) ??
    DOMEditor.editable(editor) ??
    null,

  scrollIntoView: (editor, target, options = { scrollMode: 'if-needed' }) => {
    const run = () => {
      if (PathApi.isPath(target)) {
        const node = editor.read((state) => state.nodes.get(target)?.[0]);
        const element = node ? DOMEditor.resolveDOMNode(editor, node) : null;

        if (element) scrollIntoViewIfNeeded(element, options);

        return;
      }

      const domRange = PointApi.isPoint(target)
        ? DOMEditor.resolveDOMRange(editor, { anchor: target, focus: target })
        : RangeApi.isRange(target)
          ? DOMEditor.resolveDOMRange(editor, target)
          : target;

      if (!domRange) return;

      const leafElement = (
        isDOMElement(domRange.startContainer)
          ? domRange.startContainer
          : domRange.startContainer.parentElement
      ) as HTMLElement | null;

      if (!leafElement) return;

      const hadOwnRect = Object.hasOwn(leafElement, 'getBoundingClientRect');
      const originalGetBoundingClientRect = leafElement.getBoundingClientRect;

      leafElement.getBoundingClientRect =
        domRange.getBoundingClientRect.bind(domRange);

      try {
        scrollIntoViewIfNeeded(leafElement, options);
      } finally {
        if (hadOwnRect) {
          leafElement.getBoundingClientRect = originalGetBoundingClientRect;
        } else {
          Reflect.deleteProperty(leafElement, 'getBoundingClientRect');
        }
      }
    };

    scheduleEditorDOMPhase(
      editor,
      'dom-write',
      'dom-editor-scroll-into-view',
      run,
      {
        key: 'dom-editor-scroll-into-view',
        timing: 'animation-frame',
      }
    );
  },

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

    if (mountedPath) {
      const mountedNode = editor.read(
        (state) => state.nodes.get<Descendant>(mountedPath)?.[0]
      );

      if (!mountedNode) return null;
      if (mountedNode === node) return node;

      cachePliteDOMNode(
        editor,
        mountedNode,
        domEl as HTMLElement,
        editorGetRuntimeId(editor, mountedPath)
      );

      return mountedNode;
    }

    if (node && resolvePliteNodePath(editor, node)) return node;

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
              isAndroidDOMHost(el) &&
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
        isAndroidDOMHost(parentNode) &&
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
          (isGeckoDOMHost(domNode) && domNode.textContent?.endsWith('\n\n')))
      ) {
        offset--;
      }
    }

    if (isAndroidDOMHost(parentNode) && !textNode && !exactMatch) {
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

        let { path, offset } = editorPoint(editor, nodePath, {
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
      ? editor.read((state) => state.nodes.get(path)?.[0])
      : pliteNode;

    if (!pointNode || !path) {
      const fallbackPath = parsePliteDOMPath(
        textNode?.getAttribute('data-plite-path') ?? null
      );

      if (fallbackPath) {
        const fallbackNode = editor.read(
          (state) => state.nodes.get(fallbackPath)?.[0]
        );

        if (!fallbackNode) return null;

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
        if (
          isGeckoDOMHost(domRange.anchorNode ?? domRange.focusNode ?? el) &&
          domRange.rangeCount > 1
        ) {
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
      isGeckoDOMHost(focusNode) &&
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
      editorVoid(editor, { at: range.focus, mode: 'highest' })
    ) {
      range = editorUnhangRange(editor, range, { voids: true });
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

export const createDOMEditorCapability = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: DOMEditor<V, TExtensions>,
  clipboardHandlers: readonly DOMClipboardHandler<any>[] = []
): DOMEditorCapability<V> => {
  const resolveVisualPoint = (
    point: Point,
    options: DOMVisualPointOptions
  ): DOMVisualPoint | null => {
    const root = DOMEditor.resolveDOMNode(editor, editor);
    const domPoint = DOMEditor.resolveDOMPoint(editor, point);

    if (!root || !domPoint) return null;
    const selection = root.ownerDocument.getSelection();
    const modify = selection
      ? (
          selection as globalThis.Selection & {
            modify?: (
              alter: 'move',
              direction: 'left' | 'right',
              granularity: 'character' | 'word'
            ) => void;
          }
        ).modify
      : undefined;

    if (!selection || !modify) return null;
    const saved =
      selection.anchorNode && selection.focusNode
        ? {
            anchorNode: selection.anchorNode,
            anchorOffset: selection.anchorOffset,
            focusNode: selection.focusNode,
            focusOffset: selection.focusOffset,
          }
        : null;

    try {
      selection.collapse(domPoint[0], domPoint[1]);
      Reflect.apply(modify, selection, [
        'move',
        options.direction,
        options.unit,
      ]);

      if (!selection.focusNode) return null;
      const nextDOMPoint: DOMPoint = [
        selection.focusNode,
        selection.focusOffset,
      ];
      const next = DOMEditor.resolvePlitePoint(editor, nextDOMPoint, {
        exactMatch: false,
      });

      if (!next) return null;
      const geometry = createDOMGeometryKernel({ root });
      const rect = geometry.pointRect(nextDOMPoint, {
        association: options.affinity === 'forward' ? 'forward' : 'backward',
      });
      const affinity = rect
        ? geometry.associationForPoint(nextDOMPoint, rect.left)
        : (options.affinity ??
          (options.direction === 'left' ? 'backward' : 'forward'));

      if (
        PointApi.equals(point, next) &&
        affinity === (options.affinity ?? 'backward')
      ) {
        return null;
      }

      return Object.freeze({ affinity, point: next });
    } finally {
      if (saved) {
        selection.setBaseAndExtent(
          saved.anchorNode,
          saved.anchorOffset,
          saved.focusNode,
          saved.focusOffset
        );
      } else {
        selection.removeAllRanges();
      }
    }
  };
  const runClipboardInsert = (
    data: DataTransfer,
    fallback: (data: DataTransfer) => boolean,
    handlers: readonly DOMClipboardHandler<any>[] = []
  ) => {
    const transaction = getActiveEditorTransaction(editor);
    const insert = (tx: EditorUpdateTransaction<V, TExtensions>) =>
      dispatchDOMClipboardHandlers(handlers, data, tx, fallback);

    if (transaction) {
      transaction.tags.add('paste');

      return insert(transaction);
    }

    let handled = false;

    editor.update((tx) => {
      tx.tags.add('paste');
      handled = insert(tx);
    });

    return handled;
  };
  const capability: DOMEditorCapability<V> = {
    blur: () => DOMEditor.blur(editor),
    deselect: () => DOMEditor.deselect(editor),
    editable: (root) => DOMEditor.editable(editor, root),
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
        runClipboardInsert(
          data,
          (nextData) => DOMEditor.clipboard.insertData(editor, nextData),
          clipboardHandlers
        ),
      insertFragmentData: (data: DataTransfer) =>
        runClipboardInsert(data, (nextData) =>
          DOMEditor.clipboard.insertFragmentData(editor, nextData)
        ),
      insertTextData: (data: DataTransfer) =>
        runClipboardInsert(data, (nextData) =>
          DOMEditor.clipboard.insertTextData(editor, nextData)
        ),
      readSlice: (data: Pick<DataTransfer, 'getData' | 'types'>) =>
        readDOMClipboardSlice(editor, data),
      writeSelection: (data: Pick<DataTransfer, 'getData' | 'setData'>) =>
        DOMEditor.clipboard.writeSelection(editor, data),
      writeSlice: (
        data: Pick<DataTransfer, 'getData' | 'setData'>,
        payload: ClipboardSliceWrite<V>
      ) => writeDOMClipboardSlice(editor, data, payload),
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
    resolveVisualPoint,
    root: () => DOMEditor.root(editor),
    scroll: () => DOMEditor.scroll(editor),
    scrollIntoView: (target, options) =>
      DOMEditor.scrollIntoView(editor, target, options),
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
