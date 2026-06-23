import type React from 'react';
import { useCallback, useMemo, useRef } from 'react';
import {
  NodeApi,
  type Path,
  type Range,
  RangeApi,
  type RuntimeId,
} from '@platejs/plite';
import {
  CAN_USE_DOM,
  type DOMRange,
  HAS_BEFORE_INPUT_SUPPORT,
  IS_ANDROID,
  isDOMNode,
} from '@platejs/plite-dom';
import { DOMCoverage } from '@platejs/plite-dom/internal';
import type { MountedTopLevelRange } from '../dom-strategy/dom-strategy-commands';
import type {
  EditableRepairRequest,
  InputIntent,
} from '../editable/input-controller';
import { useRootInteractionController } from '../editable/root-interaction-controller';
import { Editor } from '../editable/runtime-editor-api';
import { useEditableRootRuntime } from '../editable/runtime-root-engine';
import { readLiveSelection } from '../editable/runtime-selection-state';
import { useEditor } from '../hooks/use-editor';
import { ComposingContext } from '../hooks/use-editor-composing';
import { ReadOnlyContext } from '../hooks/use-editor-read-only';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { useRequiredPliteRuntimeContext } from '../hooks/use-plite-runtime';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { recordPliteReactRender } from '../render-profiler';
import { usePliteViewSelectionPresence } from '../view-selection-decoration';
import { RestoreDOM } from './restore-dom/restore-dom';

/**
 * `EditableProps` are passed to the `<Editable>` component.
 */

export type EditableDOMRootProps = {
  children?: React.ReactNode;
  deferNativeTextInputRepair?: boolean;
  domStrategyRuntime?: EditableDOMStrategyRuntime | null;
  domStrategyMetrics?: EditableDOMStrategyMetricsBase | null;
  ignoreBlankEditableRootClicks?: boolean;
  onDOMBeforeInput?: EditableDOMBeforeInputHandler;
  onKeyDown?: EditableKeyDownHandler;
  onDOMStrategyMetrics?: (metrics: EditableDOMStrategyMetrics) => void;
  readOnly?: boolean;
  scrollSelectionIntoView?: (
    editor: ReactRuntimeEditor,
    domRange: DOMRange
  ) => void;
  as?: React.ElementType;
  disableDefaultStyles?: boolean;
} & Omit<React.ComponentPropsWithRef<'div'>, 'children' | 'onKeyDown'>;

export type EditableDOMStrategyScrollAlign =
  | 'auto'
  | 'center'
  | 'end'
  | 'start';

export type EditableDOMStrategyRuntime = {
  mountedTopLevelRuntimeIds: ReadonlySet<RuntimeId> | null;
  mountedTopLevelRanges?: readonly MountedTopLevelRange[];
  scrollToPath?: (
    path: Path,
    align?: EditableDOMStrategyScrollAlign
  ) => boolean;
  type: 'staged' | 'partial-dom' | 'virtualized';
};

export type EditableDOMStrategyCohort =
  | 'normal'
  | 'medium'
  | 'large'
  | 'stress'
  | 'pathological';

export type EditableDOMStrategyEffectiveType =
  | 'full'
  | 'partial-dom'
  | 'plain'
  | 'staged'
  | 'virtualized';

export type EditableDOMStrategyDegradationMode =
  | 'none'
  | 'partial-dom'
  | 'staged-warmup'
  | 'virtualized';

export type EditableDOMStrategyMetricsBase = {
  activeSegmentIndex: number | null;
  overscan: number | null;
  cohort: EditableDOMStrategyCohort;
  degradationMode: EditableDOMStrategyDegradationMode;
  documentSize: number;
  effectiveStrategy: EditableDOMStrategyEffectiveType;
  estimatedBlockSize: number | null;
  segmentSize: number | null;
  mountedGroupCount: number;
  mountedTopLevelCount: number;
  nativeSurfaceComplete: boolean | null;
  pendingGroupCount: number;
  pendingTopLevelCount: number;
  requestedStrategy: string;
  threshold: number | null;
  virtualizerMeasuredCount: number | null;
};

export type EditableDOMStrategyMetrics = EditableDOMStrategyMetricsBase & {
  domCoverageBoundaryCount: number;
  domCoverageBoundaryElementCount: number;
  domNodeCount: number;
  editableDescendantCount: number;
  domStrategyStagedBoundaryCount: number;
  aggressiveDomCoverageBoundaryCount: number;
  viewportVirtualizationBoundaryCount: number;
};

const getEditableDOMStrategyMetrics = ({
  editor,
  metrics,
  rootElement,
}: {
  editor: ReactRuntimeEditor;
  metrics: EditableDOMStrategyMetricsBase;
  rootElement: HTMLElement;
}): EditableDOMStrategyMetrics => {
  const boundaries = DOMCoverage.getBoundaries(editor);

  return {
    ...metrics,
    domCoverageBoundaryCount: boundaries.length,
    domCoverageBoundaryElementCount: rootElement.querySelectorAll(
      '[data-plite-dom-coverage-boundary]'
    ).length,
    domNodeCount: rootElement.querySelectorAll('*').length + 1,
    editableDescendantCount: rootElement.querySelectorAll(
      '[data-plite-node="element"], [data-plite-node="text"], [data-plite-leaf]'
    ).length,
    domStrategyStagedBoundaryCount: boundaries.filter(
      (boundary) => boundary.reason === 'rendering-staged'
    ).length,
    aggressiveDomCoverageBoundaryCount: boundaries.filter(
      (boundary) => boundary.reason === 'partial-dom-aggressive'
    ).length,
    viewportVirtualizationBoundaryCount: boundaries.filter(
      (boundary) => boundary.reason === 'viewport-virtualization'
    ).length,
  };
};

const areEditableDOMStrategyMetricsEqual = (
  left: EditableDOMStrategyMetrics | null,
  right: EditableDOMStrategyMetrics
) =>
  left != null &&
  left.activeSegmentIndex === right.activeSegmentIndex &&
  left.aggressiveDomCoverageBoundaryCount ===
    right.aggressiveDomCoverageBoundaryCount &&
  left.cohort === right.cohort &&
  left.degradationMode === right.degradationMode &&
  left.documentSize === right.documentSize &&
  left.domCoverageBoundaryCount === right.domCoverageBoundaryCount &&
  left.domCoverageBoundaryElementCount ===
    right.domCoverageBoundaryElementCount &&
  left.domNodeCount === right.domNodeCount &&
  left.domStrategyStagedBoundaryCount ===
    right.domStrategyStagedBoundaryCount &&
  left.editableDescendantCount === right.editableDescendantCount &&
  left.effectiveStrategy === right.effectiveStrategy &&
  left.estimatedBlockSize === right.estimatedBlockSize &&
  left.mountedGroupCount === right.mountedGroupCount &&
  left.mountedTopLevelCount === right.mountedTopLevelCount &&
  left.nativeSurfaceComplete === right.nativeSurfaceComplete &&
  left.overscan === right.overscan &&
  left.pendingGroupCount === right.pendingGroupCount &&
  left.pendingTopLevelCount === right.pendingTopLevelCount &&
  left.requestedStrategy === right.requestedStrategy &&
  left.segmentSize === right.segmentSize &&
  left.threshold === right.threshold &&
  left.virtualizerMeasuredCount === right.virtualizerMeasuredCount &&
  left.viewportVirtualizationBoundaryCount ===
    right.viewportVirtualizationBoundaryCount;

type DropCursorRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

const DROP_CURSOR_THICKNESS = 2;

const getDropCursorTargetElement = (target: EventTarget | null) => {
  if (!isDOMNode(target)) {
    return null;
  }

  return target.nodeType === 1 ? (target as HTMLElement) : target.parentElement;
};

const getEditableDropCursorRect = ({
  editor,
  event,
  rootElement,
}: {
  editor: ReactRuntimeEditor;
  event: React.DragEvent<HTMLDivElement>;
  rootElement: HTMLElement;
}): DropCursorRect | null => {
  const targetElement = getDropCursorTargetElement(event.nativeEvent.target);

  if (!targetElement) {
    return null;
  }

  const voidElement = targetElement.closest<HTMLElement>(
    '[data-plite-node][data-plite-void="true"]'
  );
  const pliteNode = editor.api.dom.resolvePliteNode(
    voidElement ?? targetElement
  );
  const isVoidTarget =
    !!voidElement ||
    (!!pliteNode &&
      NodeApi.isElement(pliteNode) &&
      Editor.isVoid(editor, pliteNode));

  if (!isVoidTarget) {
    return null;
  }

  const targetRect =
    voidElement?.getBoundingClientRect() ??
    (pliteNode
      ? editor.api.dom.resolveDOMNode(pliteNode)?.getBoundingClientRect()
      : null) ??
    targetElement.getBoundingClientRect();
  const rootRect = rootElement.getBoundingClientRect();

  if (targetRect.width <= 0 || targetRect.height <= 0) {
    return null;
  }

  // DOMRects are viewport-space after CSS transforms; absolute children need
  // root-local CSS pixels so the root transform is not applied twice.
  const rawScaleX =
    rootElement.offsetWidth > 0 ? rootRect.width / rootElement.offsetWidth : 1;
  const rawScaleY =
    rootElement.offsetHeight > 0
      ? rootRect.height / rootElement.offsetHeight
      : 1;
  const scaleX = Number.isFinite(rawScaleX) && rawScaleX > 0 ? rawScaleX : 1;
  const scaleY = Number.isFinite(rawScaleY) && rawScaleY > 0 ? rawScaleY : 1;
  const localX = (value: number) => (value - rootRect.left) / scaleX;
  const localY = (value: number) => (value - rootRect.top) / scaleY;

  const isInlineVoid =
    voidElement?.getAttribute('data-plite-inline') === 'true' ||
    (!!pliteNode &&
      NodeApi.isElement(pliteNode) &&
      Editor.isInline(editor, pliteNode));

  if (!isInlineVoid) {
    const isBefore =
      event.nativeEvent.clientY - targetRect.top <
      targetRect.bottom - event.nativeEvent.clientY;

    const thickness = DROP_CURSOR_THICKNESS / scaleY;

    return {
      height: thickness,
      left: localX(targetRect.left),
      top:
        localY(isBefore ? targetRect.top : targetRect.bottom) - thickness / 2,
      width: targetRect.width / scaleX,
    };
  }

  const isBefore =
    event.nativeEvent.clientX - targetRect.left <
    targetRect.right - event.nativeEvent.clientX;
  const thickness = DROP_CURSOR_THICKNESS / scaleX;

  return {
    height: targetRect.height / scaleY,
    left: localX(isBefore ? targetRect.left : targetRect.right) - thickness / 2,
    top: localY(targetRect.top),
    width: thickness,
  };
};

const clearEditableDropCursor = (rootElement: HTMLElement) => {
  rootElement.querySelector('[data-plite-drop-cursor]')?.remove();
};

const updateEditableDropCursor = (
  rootElement: HTMLElement,
  rect: DropCursorRect | null
) => {
  if (!rect) {
    clearEditableDropCursor(rootElement);
    return;
  }

  let cursor = rootElement.querySelector<HTMLElement>(
    '[data-plite-drop-cursor]'
  );

  if (!cursor) {
    cursor = rootElement.ownerDocument.createElement('span');
    cursor.setAttribute('aria-hidden', 'true');
    cursor.setAttribute('contenteditable', 'false');
    cursor.setAttribute('data-plite-drop-cursor', 'true');
    cursor.setAttribute('data-plite-root-chrome-ignore', 'true');
    rootElement.appendChild(cursor);
  }

  cursor.style.background = '#2563eb';
  cursor.style.borderRadius = `${DROP_CURSOR_THICKNESS}px`;
  cursor.style.display = 'block';
  cursor.style.height = `${rect.height}px`;
  cursor.style.left = `${rect.left}px`;
  cursor.style.margin = '0';
  cursor.style.pointerEvents = 'none';
  cursor.style.position = 'absolute';
  cursor.style.top = `${rect.top}px`;
  cursor.style.width = `${rect.width}px`;
  cursor.style.zIndex = '2';
};

export type EditableHandlerResult = boolean | EditableRepairRequest | void;

export type EditableInputEventContext = {
  data: unknown;
  editor: ReactRuntimeEditor;
  event?: InputEvent | React.KeyboardEvent<HTMLDivElement>;
  inputType?: string;
  intent: InputIntent | null;
  native: boolean;
  selection: Range | null;
};

export type EditableDOMBeforeInputContext = EditableInputEventContext & {
  event: InputEvent;
  inputType: string;
};

export type EditableDOMBeforeInputHandler = (
  event: InputEvent,
  context: EditableDOMBeforeInputContext
) => EditableHandlerResult;

export type EditableKeyDownContext = {
  editor: ReactRuntimeEditor;
};

export type EditableKeyDownHandler = (
  event: React.KeyboardEvent<HTMLDivElement>,
  context: EditableKeyDownContext
) => EditableHandlerResult;

/**
 * Editable.
 */

export const EditableDOMRoot = (props: EditableDOMRootProps) => {
  const { ref: forwardedRef, ...editableProps } = props;
  recordPliteReactRender({ kind: 'editable' });

  const {
    autoFocus,
    children: customChildren,
    deferNativeTextInputRepair = false,
    domStrategyRuntime = null,
    domStrategyMetrics = null,
    ignoreBlankEditableRootClicks = false,
    onKeyDown: propsOnKeyDown,
    onDOMBeforeInput: propsOnDOMBeforeInput,
    onDOMStrategyMetrics,
    readOnly = false,
    scrollSelectionIntoView = defaultScrollSelectionIntoView,
    style: userStyle = {},
    as: Component = 'div',
    disableDefaultStyles = false,
    onDragLeave: propsOnDragLeave,
    onFocusCapture: propsOnFocusCapture,
    onMouseDownCapture: propsOnMouseDownCapture,
    onMouseMoveCapture: propsOnMouseMoveCapture,
    onMouseUpCapture: propsOnMouseUpCapture,
    ...attributes
  } = editableProps;
  const editor = useEditor<ReactRuntimeEditor>();
  const editorRoot = editor.read((state) => state.view.root());
  const hasViewSelection = usePliteViewSelectionPresence(editor);
  const { getLastSelectionForRoot, getMountedViewEditor, setActiveViewEditor } =
    useRequiredPliteRuntimeContext();
  const activateRootView = useCallback(() => {
    setActiveViewEditor(editor, editorRoot);
  }, [editor, editorRoot, setActiveViewEditor]);
  const rootRuntime = useEditableRootRuntime({
    autoFocus,
    callbacks: attributes,
    editor,
    forwardedRef,
    deferNativeTextInputRepair,
    domStrategyRuntime,
    onDOMBeforeInput: propsOnDOMBeforeInput,
    onKeyDown: propsOnKeyDown,
    readOnly,
    scrollSelectionIntoView,
  });
  const {
    editableEventBindings,
    isComposing,
    receivedUserInput,
    rootRef: ref,
    rootInteractionSelectionBridge,
    partialDOMBackedSelection,
  } = rootRuntime;
  const rootInteraction = useRootInteractionController({
    disabled: readOnly,
    editor,
    getLastSelectionForRoot,
    getMountedViewEditor,
    ignoreBlankEditableRootClicks:
      ignoreBlankEditableRootClicks || domStrategyRuntime !== null,
    root: editorRoot,
    selection: 'restore',
    selectionBridge: rootInteractionSelectionBridge,
  });
  const {
    onMouseDownCapture: onRootMouseDownCapture,
    onMouseMoveCapture: onRootMouseMoveCapture,
    onMouseUpCapture: onRootMouseUpCapture,
  } = rootInteraction;
  const { onMouseDownCapture: onRuntimeMouseDownCapture } =
    editableEventBindings;
  const editableEventBindingsWithDropCursor = useMemo(
    () => ({
      ...editableEventBindings,
      onDragEnd: (event: React.DragEvent<HTMLDivElement>) => {
        editableEventBindings.onDragEnd?.(event);
        clearEditableDropCursor(event.currentTarget);
      },
      onDragLeave: (event: React.DragEvent<HTMLDivElement>) => {
        const relatedTarget = event.relatedTarget;

        if (
          !isDOMNode(relatedTarget) ||
          !event.currentTarget.contains(relatedTarget)
        ) {
          clearEditableDropCursor(event.currentTarget);
        }
        propsOnDragLeave?.(event);
      },
      onDragOver: (event: React.DragEvent<HTMLDivElement>) => {
        editableEventBindings.onDragOver?.(event);
        updateEditableDropCursor(
          event.currentTarget,
          getEditableDropCursorRect({
            editor,
            event,
            rootElement: event.currentTarget,
          })
        );
      },
      onDrop: (event: React.DragEvent<HTMLDivElement>) => {
        editableEventBindings.onDrop?.(event);
        clearEditableDropCursor(event.currentTarget);
      },
    }),
    [editableEventBindings, editor, propsOnDragLeave]
  );
  const lastDOMStrategyMetricsRef = useRef<EditableDOMStrategyMetrics | null>(
    null
  );
  const rootInteractionEventBindings = useMemo(
    () => ({
      onFocusCapture: (event: React.FocusEvent<HTMLDivElement>) => {
        activateRootView();
        propsOnFocusCapture?.(event);
      },
      onMouseDownCapture: (event: React.MouseEvent<HTMLDivElement>) => {
        activateRootView();
        const voidTarget = getDropCursorTargetElement(event.target)?.closest(
          '[data-plite-node][data-plite-void="true"]'
        );
        const inlineVoidTarget =
          voidTarget?.getAttribute('data-plite-inline') === 'true';

        if (inlineVoidTarget) {
          onRootMouseDownCapture(event);
          onRuntimeMouseDownCapture?.(event);
        } else {
          onRuntimeMouseDownCapture?.(event);
          onRootMouseDownCapture(event);
        }
        propsOnMouseDownCapture?.(event);
      },
      onMouseMoveCapture: (event: React.MouseEvent<HTMLDivElement>) => {
        activateRootView();
        onRootMouseMoveCapture(event);
        propsOnMouseMoveCapture?.(event);
      },
      onMouseUpCapture: (event: React.MouseEvent<HTMLDivElement>) => {
        activateRootView();
        onRootMouseUpCapture(event);
        propsOnMouseUpCapture?.(event);
      },
    }),
    [
      activateRootView,
      onRootMouseDownCapture,
      onRootMouseMoveCapture,
      onRootMouseUpCapture,
      onRuntimeMouseDownCapture,
      propsOnFocusCapture,
      propsOnMouseDownCapture,
      propsOnMouseMoveCapture,
      propsOnMouseUpCapture,
    ]
  );

  useIsomorphicLayoutEffect(() => {
    const rootElement = ref.current;

    if (!rootElement || !domStrategyMetrics || !onDOMStrategyMetrics) {
      return;
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      const nextMetrics = getEditableDOMStrategyMetrics({
        editor,
        metrics: domStrategyMetrics,
        rootElement,
      });

      if (
        areEditableDOMStrategyMetricsEqual(
          lastDOMStrategyMetricsRef.current,
          nextMetrics
        )
      ) {
        return;
      }

      lastDOMStrategyMetricsRef.current = nextMetrics;
      onDOMStrategyMetrics(nextMetrics);
    });

    return () => {
      cancelled = true;
    };
  }, [editor, domStrategyMetrics, onDOMStrategyMetrics, ref]);

  return (
    <ReadOnlyContext.Provider value={readOnly}>
      <ComposingContext.Provider value={isComposing}>
        <RestoreDOM node={ref} receivedUserInput={receivedUserInput}>
          <Component
            aria-multiline
            aria-readonly={readOnly ? true : undefined}
            role="textbox"
            translate="no"
            {...attributes}
            autoCapitalize={
              HAS_BEFORE_INPUT_SUPPORT || !CAN_USE_DOM
                ? attributes.autoCapitalize
                : 'false'
            }
            autoCorrect={
              HAS_BEFORE_INPUT_SUPPORT || !CAN_USE_DOM
                ? attributes.autoCorrect
                : 'false'
            }
            // explicitly set this
            contentEditable
            data-plite-dom-strategy-selection={
              partialDOMBackedSelection ? 'partial-dom-backed' : undefined
            }
            data-plite-editor
            data-plite-node="value"
            data-plite-root={editorRoot}
            {...editableEventBindingsWithDropCursor}
            {...rootInteractionEventBindings}
            // Browsers without `beforeinput` need a separate replacement-input
            // implementation. During SSR, pass through consumer props to avoid a
            // hydration mismatch; in the browser, default to a falsy value.
            spellCheck={
              HAS_BEFORE_INPUT_SUPPORT || !CAN_USE_DOM
                ? attributes.spellCheck
                : false
            }
            style={{
              ...(disableDefaultStyles
                ? {}
                : {
                    // Keep read-only editors selectable without showing an
                    // insertion caret.
                    caretColor:
                      readOnly || hasViewSelection ? 'transparent' : undefined,
                    // Allow positioning relative to the editable element.
                    position: 'relative',
                    // Preserve adjacent whitespace and new lines.
                    whiteSpace: 'pre-wrap',
                    // Allow words to break if they are too long.
                    wordWrap: 'break-word',
                    // Keep the public editable root visible and hittable.
                    zIndex: 0,
                  }),
              // Allow for passed-in styles to override anything.
              ...userStyle,
            }}
            suppressContentEditableWarning
          >
            {customChildren}
          </Component>
        </RestoreDOM>
      </ComposingContext.Provider>
    </ReadOnlyContext.Provider>
  );
};

/**
 * The props that get passed to renderPlaceholder
 */
export type RenderPlaceholderProps = {
  children: any;
  attributes: {
    'data-plite-placeholder': boolean;
    dir?: 'rtl';
    contentEditable: boolean;
    ref: React.RefCallback<any>;
    style: React.CSSProperties;
  };
};

/**
 * The default placeholder element
 */

export const DefaultPlaceholder = ({
  attributes,
  children,
}: RenderPlaceholderProps) => (
  // COMPAT: Artificially add a line-break to the end on the placeholder element
  // to prevent Android IMEs to pick up its content in autocorrect and to auto-capitalize the first letter
  <span {...attributes}>
    {children}
    {IS_ANDROID && <br />}
  </span>
);

type ScrollRect = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

const SCROLL_VISIBILITY_MARGIN = 4;
const SCROLLABLE_OVERFLOW_PATTERN = /(auto|scroll|overlay)/;

const isUsableScrollRect = (rect: DOMRect | DOMRectReadOnly) =>
  rect.width > 0 ||
  rect.height > 0 ||
  rect.x !== 0 ||
  rect.y !== 0 ||
  rect.top !== 0 ||
  rect.left !== 0 ||
  rect.bottom !== 0 ||
  rect.right !== 0;

const toScrollRect = (rect: DOMRect | DOMRectReadOnly): ScrollRect => ({
  bottom: rect.bottom,
  left: rect.left,
  right: rect.right,
  top: rect.top,
});

const offsetScrollRect = (
  rect: ScrollRect,
  delta: { left: number; top: number }
): ScrollRect => ({
  bottom: rect.bottom - delta.top,
  left: rect.left - delta.left,
  right: rect.right - delta.left,
  top: rect.top - delta.top,
});

const canScrollAxis = (element: HTMLElement, axis: 'x' | 'y') => {
  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  const overflow =
    axis === 'y'
      ? `${style?.overflowY ?? ''} ${style?.overflow ?? ''}`
      : `${style?.overflowX ?? ''} ${style?.overflow ?? ''}`;

  if (!SCROLLABLE_OVERFLOW_PATTERN.test(overflow)) {
    return false;
  }

  return axis === 'y'
    ? element.scrollHeight > element.clientHeight
    : element.scrollWidth > element.clientWidth;
};

const getComposedParentElement = (element: HTMLElement) => {
  if (element.parentElement) {
    return element.parentElement;
  }

  const window = element.ownerDocument.defaultView;

  if (!window) {
    return null;
  }

  const ShadowRootConstructor = window.ShadowRoot;
  const root = element.getRootNode();

  if (ShadowRootConstructor && root instanceof ShadowRootConstructor) {
    const { host } = root;

    return host instanceof window.HTMLElement ? host : null;
  }

  return null;
};

const scrollRectIntoViewIfNeeded = ({
  rect,
  startElement,
}: {
  rect: ScrollRect;
  startElement: HTMLElement;
}) => {
  let currentRect = rect;

  for (
    let parent = getComposedParentElement(startElement);
    parent;
    parent = getComposedParentElement(parent)
  ) {
    const canScrollY = canScrollAxis(parent, 'y');
    const canScrollX = canScrollAxis(parent, 'x');

    if (!canScrollY && !canScrollX) {
      continue;
    }

    const parentRect = parent.getBoundingClientRect();
    const topEdge = parentRect.top + SCROLL_VISIBILITY_MARGIN;
    const bottomEdge = parentRect.bottom - SCROLL_VISIBILITY_MARGIN;
    const leftEdge = parentRect.left + SCROLL_VISIBILITY_MARGIN;
    const rightEdge = parentRect.right - SCROLL_VISIBILITY_MARGIN;
    const nextTop =
      canScrollY && currentRect.top < topEdge
        ? currentRect.top - topEdge
        : canScrollY && currentRect.bottom > bottomEdge
          ? currentRect.bottom - bottomEdge
          : 0;
    const nextLeft =
      canScrollX && currentRect.left < leftEdge
        ? currentRect.left - leftEdge
        : canScrollX && currentRect.right > rightEdge
          ? currentRect.right - rightEdge
          : 0;

    if (nextTop === 0 && nextLeft === 0) {
      continue;
    }

    const previousTop = parent.scrollTop;
    const previousLeft = parent.scrollLeft;

    parent.scrollTop += nextTop;
    parent.scrollLeft += nextLeft;

    currentRect = offsetScrollRect(currentRect, {
      left: parent.scrollLeft - previousLeft,
      top: parent.scrollTop - previousTop,
    });
  }

  const window = startElement.ownerDocument.defaultView;

  if (!window) {
    return;
  }

  const topEdge = SCROLL_VISIBILITY_MARGIN;
  const bottomEdge = window.innerHeight - SCROLL_VISIBILITY_MARGIN;
  const leftEdge = SCROLL_VISIBILITY_MARGIN;
  const rightEdge = window.innerWidth - SCROLL_VISIBILITY_MARGIN;
  const scrollingElement = window.document.scrollingElement;
  const canScrollWindowY = scrollingElement
    ? scrollingElement.scrollHeight > scrollingElement.clientHeight
    : window.document.documentElement.scrollHeight > window.innerHeight;
  const canScrollWindowX = scrollingElement
    ? scrollingElement.scrollWidth > scrollingElement.clientWidth
    : window.document.documentElement.scrollWidth > window.innerWidth;
  const nextTop =
    canScrollWindowY && currentRect.top < topEdge
      ? currentRect.top - topEdge
      : canScrollWindowY && currentRect.bottom > bottomEdge
        ? currentRect.bottom - bottomEdge
        : 0;
  const nextLeft =
    canScrollWindowX && currentRect.left < leftEdge
      ? currentRect.left - leftEdge
      : canScrollWindowX && currentRect.right > rightEdge
        ? currentRect.right - rightEdge
        : 0;

  if (nextTop !== 0 || nextLeft !== 0) {
    try {
      window.scrollBy(nextLeft, nextTop);
    } catch {
      // Environments like jsdom expose scrollBy but do not implement it.
    }
  }
};

/**
 * A default implement to scroll dom range into view.
 */

export const defaultScrollSelectionIntoView = (
  editor: ReactRuntimeEditor,
  domRange: DOMRange
) => {
  // Scroll to the focus point of the selection, in case the selection is expanded
  const selection = readLiveSelection(editor);
  const isBackward = !!selection && RangeApi.isBackward(selection);
  const domFocusPoint = domRange.cloneRange();
  domFocusPoint.collapse(isBackward);

  if (domFocusPoint.getBoundingClientRect) {
    const leafEl = domFocusPoint.startContainer.parentElement;

    if (!leafEl || typeof leafEl.getBoundingClientRect !== 'function') {
      return;
    }

    // COMPAT: In Chrome, domFocusPoint.getBoundingClientRect() can return zero dimensions for valid ranges (e.g. line breaks).
    // Fall back to the leaf rect so typing through empty lines still keeps the caret visible.
    const domRect = domFocusPoint.getBoundingClientRect();
    const isZeroDimensionRect =
      domRect.width === 0 &&
      domRect.height === 0 &&
      domRect.x === 0 &&
      domRect.y === 0;

    const targetRect =
      !isZeroDimensionRect && isUsableScrollRect(domRect)
        ? domRect
        : leafEl.getBoundingClientRect();

    if (!isUsableScrollRect(targetRect)) {
      return;
    }

    scrollRectIntoViewIfNeeded({
      rect: toScrollRect(targetRect),
      startElement: leafEl,
    });
  }
};

/**
 * Check if an event is overrided by a handler.
 */

export const isEventHandled = <
  EventType extends React.SyntheticEvent<unknown, unknown>,
>(
  event: EventType,
  handler?: (event: EventType) => void | boolean
) => {
  if (!handler) {
    return false;
  }
  // The custom event handler may return a boolean to specify whether the event
  // shall be treated as being handled or not.
  const shouldTreatEventAsHandled = handler(event);

  if (shouldTreatEventAsHandled != null) {
    return shouldTreatEventAsHandled;
  }

  return event.isDefaultPrevented() || event.isPropagationStopped();
};

/**
 * Check if the event's target is an input element
 */
export const isDOMEventTargetInput = <
  EventType extends React.SyntheticEvent<unknown, unknown>,
>(
  event: EventType
) =>
  isDOMNode(event.target) &&
  (event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement);

/**
 * Check if a DOM event is overrided by a handler.
 */

export const isDOMEventHandled = <E extends Event>(
  event: E,
  handler?: (event: E) => void | boolean
) => {
  if (!handler) {
    return false;
  }

  // The custom event handler may return a boolean to specify whether the event
  // shall be treated as being handled or not.
  const shouldTreatEventAsHandled = handler(event);

  if (shouldTreatEventAsHandled != null) {
    return shouldTreatEventAsHandled;
  }

  return event.defaultPrevented;
};
