import React, { useCallback, useSyncExternalStore } from 'react';

import { NodeApi, type Path, type Range, RangeApi, type NodeKey } from '../..';
import { type DOMRange, isDOMNode } from '../../dom';
import { createDOMGeometryKernel } from '../../dom/internal';
import type {
  EditableRepairRequest,
  InputIntent,
} from '../editable/input-controller';
import { guardExternalTextEvents } from '../editable/interaction-owner';
import { useRootInteractionController } from '../editable/root-interaction-controller';
import {
  isVoid as editorIsVoid,
  isInline as editorIsInline,
  getSelectionDOMRange,
  toInternalRoot,
} from '../editable/runtime-editor-api';
import { useEditableRootRuntime } from '../editable/runtime-root-engine';
import { readRuntimeSelection } from '../editable/runtime-selection-state';
import {
  EditableDOMRuntimeContext,
  useEditableDOMHostFact,
} from '../hooks/use-claim-editable-dom-commit';
import { ComposingContext } from '../hooks/use-editor-composing';
import { useEditorContext } from '../hooks/use-editor-context';
import { ReadOnlyContext } from '../hooks/use-editor-read-only';
import { useRequiredPliteRuntimeContext } from '../hooks/use-plite-runtime';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { recordPliteReactRender } from '../render-profiler';
import { usePliteViewSelectionPresence } from '../view-selection-decoration';
import type { MountedTopLevelRange } from '../viewport-commands';
import { EditableDOMCommitFence } from './editable-dom-commit-fence';

export type EditableViewportScrollAlign = 'auto' | 'center' | 'end' | 'start';

export type EditableViewportRuntime = {
  mountedTopLevelNodeKeys: ReadonlySet<NodeKey> | null;
  mountedTopLevelRanges?: readonly MountedTopLevelRange[];
  scrollToPath?: (path: Path, align?: EditableViewportScrollAlign) => boolean;
  type: 'virtualized';
};

type DropCursorRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

const DROP_CURSOR_THICKNESS = 2;
const subscribeHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

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
    '[data-editor-node][data-editor-void="true"]'
  );
  const pliteNode = editor.api.dom.resolveNode(voidElement ?? targetElement);
  const isVoidTarget =
    !!voidElement ||
    (!!pliteNode &&
      NodeApi.isElement(pliteNode) &&
      editorIsVoid(editor, pliteNode));

  if (!isVoidTarget) {
    const geometry = createDOMGeometryKernel({
      root: rootElement,
      target: targetElement,
    });
    const point = geometry.pointAtCoordinates({
      x: event.nativeEvent.clientX,
      y: event.nativeEvent.clientY,
    });
    const caretRect = point
      ? geometry.pointRect(point.point, {
          association: point.association,
        })
      : null;

    if (!caretRect || caretRect.height <= 0) {
      return null;
    }

    const rootRect = rootElement.getBoundingClientRect();
    const rawScaleX =
      rootElement.offsetWidth > 0
        ? rootRect.width / rootElement.offsetWidth
        : 1;
    const rawScaleY =
      rootElement.offsetHeight > 0
        ? rootRect.height / rootElement.offsetHeight
        : 1;
    const scaleX = Number.isFinite(rawScaleX) && rawScaleX > 0 ? rawScaleX : 1;
    const scaleY = Number.isFinite(rawScaleY) && rawScaleY > 0 ? rawScaleY : 1;
    const thickness = DROP_CURSOR_THICKNESS / scaleX;

    return {
      height: caretRect.height / scaleY,
      left: (caretRect.left - rootRect.left) / scaleX - thickness / 2,
      top: (caretRect.top - rootRect.top) / scaleY,
      width: thickness,
    };
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
    voidElement?.getAttribute('data-editor-inline') === 'true' ||
    (!!pliteNode &&
      NodeApi.isElement(pliteNode) &&
      editorIsInline(editor, pliteNode));

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
  rootElement.querySelector('[data-editor-drop-cursor]')?.remove();
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
    '[data-editor-drop-cursor]'
  );

  if (!cursor) {
    cursor = rootElement.ownerDocument.createElement('span');
    cursor.setAttribute('aria-hidden', 'true');
    cursor.setAttribute('contenteditable', 'false');
    cursor.setAttribute('data-editor-drop-cursor', 'true');
    cursor.setAttribute('data-editor-root-chrome-ignore', 'true');
    rootElement.appendChild(cursor);
  }

  cursor.style.display = 'block';
  cursor.style.height = `${rect.height}px`;
  cursor.style.left = `${rect.left}px`;
  cursor.style.margin = '0';
  cursor.style.pointerEvents = 'none';
  cursor.style.position = 'absolute';
  cursor.style.top = `${rect.top}px`;
  cursor.style.width = `${rect.width}px`;
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

export const EditableDOMRoot = (
  props: {
    children?: React.ReactNode;
    deferNativeTextInputRepair?: boolean;
    viewportRuntime?: EditableViewportRuntime | null;
    ignoreBlankEditableRootClicks?: boolean;
    onDOMBeforeInput?: EditableDOMBeforeInputHandler;
    onKeyDown?: EditableKeyDownHandler;
    readOnly?: boolean;
    scrollSelectionIntoView?: (
      editor: ReactRuntimeEditor,
      domRange: DOMRange
    ) => void;
    as?: React.ElementType;
    disableDefaultStyles?: boolean;
  } & Omit<React.ComponentPropsWithRef<'div'>, 'children' | 'onKeyDown'>
) => {
  const { ref: forwardedRef, ...editableProps } = props;
  recordPliteReactRender({ kind: 'editable' });

  const {
    autoFocus,
    children: customChildren,
    deferNativeTextInputRepair = false,
    viewportRuntime = null,
    ignoreBlankEditableRootClicks = false,
    onKeyDown: propsOnKeyDown,
    onDOMBeforeInput: propsOnDOMBeforeInput,
    readOnly: readOnlyProp = false,
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
  const editor = useEditorContext();
  const editorRoot = toInternalRoot(editor.read((state) => state.view.root()));
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
    viewportRuntime,
    onDOMBeforeInput: propsOnDOMBeforeInput,
    onKeyDown: propsOnKeyDown,
    readOnly: readOnlyProp,
    scrollSelectionIntoView,
  });
  const {
    editableEventBindings,
    isComposing,
    rootInteractionSelectionBridge,
    readOnly,
    runtime,
    viewportBackedSelection,
  } = rootRuntime;
  const supportsBeforeInput = useSyncExternalStore(
    runtime.subscribeHostFacts,
    () => runtime.supportsBeforeInput,
    () => false
  );
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  );
  const replacementInputFeaturesAllowed = !hydrated || supportsBeforeInput;
  const rootInteraction = useRootInteractionController({
    disabled: readOnly,
    editor,
    getLastSelectionForRoot,
    getMountedViewEditor,
    ignoreBlankEditableRootClicks:
      ignoreBlankEditableRootClicks || viewportRuntime !== null,
    root: editorRoot,
    runtime,
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
  const editableEventBindingsWithDropCursor = {
    ...editableEventBindings,
    onDragEnd: (event: React.DragEvent<HTMLDivElement>) => {
      editableEventBindings.onDragEnd?.(event);
      clearEditableDropCursor(event.currentTarget);
    },
    onDragLeave: (event: React.DragEvent<HTMLDivElement>) => {
      const { relatedTarget } = event;

      if (
        !isDOMNode(relatedTarget) ||
        !event.currentTarget.contains(relatedTarget)
      ) {
        clearEditableDropCursor(event.currentTarget);
      }
      propsOnDragLeave?.(event);
    },
    onDragOver: (event: React.DragEvent<HTMLDivElement>) => {
      const shouldHandleDragOver = editableEventBindings.onDragOver?.(event);

      if (shouldHandleDragOver === false) {
        clearEditableDropCursor(event.currentTarget);
        return;
      }

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
  };
  const rootInteractionEventBindings = {
    onFocusCapture: (event: React.FocusEvent<HTMLDivElement>) => {
      activateRootView();
      propsOnFocusCapture?.(event);
    },
    onMouseDownCapture: (event: React.MouseEvent<HTMLDivElement>) => {
      runtime.setExternalMouseGesture(event.defaultPrevented);

      if (!runtime.externalMouseGestureActive) {
        activateRootView();
      }
      const voidTarget = getDropCursorTargetElement(event.target)?.closest(
        '[data-editor-node][data-editor-void="true"]'
      );
      const inlineVoidTarget =
        voidTarget?.getAttribute('data-editor-inline') === 'true';
      const draggableInlineVoidTarget =
        inlineVoidTarget && voidTarget?.getAttribute('draggable') === 'true';

      if (runtime.externalMouseGestureActive) {
        onRuntimeMouseDownCapture?.(event);
      } else if (draggableInlineVoidTarget) {
        onRuntimeMouseDownCapture?.(event);
      } else if (inlineVoidTarget) {
        onRootMouseDownCapture(event);
        onRuntimeMouseDownCapture?.(event);
      } else {
        onRuntimeMouseDownCapture?.(event);
        onRootMouseDownCapture(event);
      }
      propsOnMouseDownCapture?.(event);
    },
    onMouseMoveCapture: (event: React.MouseEvent<HTMLDivElement>) => {
      if (!runtime.externalMouseGestureActive) {
        onRootMouseMoveCapture(event);
      }
      propsOnMouseMoveCapture?.(event);
    },
    onMouseUpCapture: (event: React.MouseEvent<HTMLDivElement>) => {
      if (!runtime.externalMouseGestureActive) {
        activateRootView();
        onRootMouseUpCapture(event);
      }
      propsOnMouseUpCapture?.(event);
      runtime.setExternalMouseGesture(false);
    },
  };
  const guardedAttributes = guardExternalTextEvents(
    attributes,
    activateRootView
  );
  const ownedEventBindings = guardExternalTextEvents(
    {
      ...editableEventBindingsWithDropCursor,
      ...rootInteractionEventBindings,
      onBlurCapture: (event: React.FocusEvent<HTMLDivElement>) =>
        attributes.onBlurCapture?.(event),
    },
    activateRootView
  );

  return (
    <ReadOnlyContext value={readOnly}>
      <ComposingContext value={isComposing}>
        <EditableDOMRuntimeContext value={runtime}>
          <EditableDOMCommitFence runtime={runtime}>
            <Component
              aria-multiline
              aria-readonly={readOnly ? true : undefined}
              role="textbox"
              translate="no"
              {...guardedAttributes}
              autoCapitalize={
                replacementInputFeaturesAllowed
                  ? guardedAttributes.autoCapitalize
                  : 'false'
              }
              autoCorrect={
                replacementInputFeaturesAllowed
                  ? guardedAttributes.autoCorrect
                  : 'false'
              }
              // explicitly set this
              contentEditable
              data-editor-viewport-selection={
                viewportBackedSelection ? 'viewport-backed' : undefined
              }
              data-editor
              data-editor-node="value"
              data-editor-root={editorRoot}
              {...ownedEventBindings}
              // Keep server markup and the first client render identical. Once
              // hydration completes, mounted-root facts can disable replacement
              // features in browsers without `beforeinput`.
              spellCheck={
                replacementInputFeaturesAllowed
                  ? guardedAttributes.spellCheck
                  : false
              }
              style={{
                ...(disableDefaultStyles
                  ? {}
                  : {
                      // Keep read-only editors selectable without showing an
                      // insertion caret.
                      caretColor: readOnly ? 'transparent' : undefined,
                      // Allow positioning relative to the editable element.
                      position: 'relative',
                      // Preserve adjacent whitespace and new lines.
                      whiteSpace: 'pre-wrap',
                      // Allow words to break if they are too long.
                      overflowWrap: 'break-word',
                      // Keep the public editable root visible and hittable.
                      zIndex: 0,
                    }),
                // Allow for passed-in styles to override anything.
                ...userStyle,
                // Projected selections own caret paint even with custom styles.
                ...(hasViewSelection ? { caretColor: 'transparent' } : {}),
              }}
              suppressContentEditableWarning
            >
              {customChildren}
            </Component>
          </EditableDOMCommitFence>
        </EditableDOMRuntimeContext>
      </ComposingContext>
    </ReadOnlyContext>
  );
};

/**
 * The default placeholder element
 */

export const DefaultPlaceholder = ({
  attributes,
  children,
}: {
  children: any;
  attributes: {
    'data-editor-placeholder': boolean;
    dir?: 'rtl';
    contentEditable: boolean;
    ref: React.RefCallback<any>;
    style: React.CSSProperties;
  };
}) => {
  const isAndroid = useEditableDOMHostFact(
    (runtime) => runtime.isAndroidHost,
    false
  );

  return (
    // COMPAT: Artificially add a line-break to the end on the placeholder element
    // to prevent Android IMEs to pick up its content in autocorrect and to auto-capitalize the first letter
    <span {...attributes}>
      {children}
      {isAndroid && <br />}
    </span>
  );
};

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

const canScrollAxis = (
  element: HTMLElement,
  style: CSSStyleDeclaration | undefined,
  axis: 'x' | 'y'
) => {
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

const resolveScrollPadding = (value: string | undefined, size: number) => {
  const amount = Number.parseFloat(value ?? '');

  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  return value?.trim().endsWith('%') ? (amount / 100) * size : amount;
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
    const style = parent.ownerDocument.defaultView?.getComputedStyle(parent);
    const canScrollY = canScrollAxis(parent, style, 'y');
    const canScrollX = canScrollAxis(parent, style, 'x');

    if (!canScrollY && !canScrollX) {
      continue;
    }

    const parentRect = parent.getBoundingClientRect();
    const topEdge =
      parentRect.top +
      resolveScrollPadding(style?.scrollPaddingTop, parentRect.height) +
      SCROLL_VISIBILITY_MARGIN;
    const bottomEdge =
      parentRect.bottom -
      resolveScrollPadding(style?.scrollPaddingBottom, parentRect.height) -
      SCROLL_VISIBILITY_MARGIN;
    const leftEdge =
      parentRect.left +
      resolveScrollPadding(style?.scrollPaddingLeft, parentRect.width) +
      SCROLL_VISIBILITY_MARGIN;
    const rightEdge =
      parentRect.right -
      resolveScrollPadding(style?.scrollPaddingRight, parentRect.width) -
      SCROLL_VISIBILITY_MARGIN;
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

  const { scrollingElement } = window.document;
  const scrollingStyle =
    scrollingElement instanceof window.HTMLElement
      ? window.getComputedStyle(scrollingElement)
      : undefined;
  const topEdge =
    resolveScrollPadding(scrollingStyle?.scrollPaddingTop, window.innerHeight) +
    SCROLL_VISIBILITY_MARGIN;
  const bottomEdge =
    window.innerHeight -
    resolveScrollPadding(
      scrollingStyle?.scrollPaddingBottom,
      window.innerHeight
    ) -
    SCROLL_VISIBILITY_MARGIN;
  const leftEdge =
    resolveScrollPadding(scrollingStyle?.scrollPaddingLeft, window.innerWidth) +
    SCROLL_VISIBILITY_MARGIN;
  const rightEdge =
    window.innerWidth -
    resolveScrollPadding(
      scrollingStyle?.scrollPaddingRight,
      window.innerWidth
    ) -
    SCROLL_VISIBILITY_MARGIN;
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
  const selection = getSelectionDOMRange(editor, readRuntimeSelection(editor));
  const isBackward = Boolean(selection && RangeApi.isBackward(selection));
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
export const isDOMEventTargetInput = (
  event: React.SyntheticEvent<unknown, unknown>
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
