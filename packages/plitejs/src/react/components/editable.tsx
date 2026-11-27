import React, {
  useCallback,
  useContext,
  useInsertionEffect,
  useSyncExternalStore,
} from 'react';

import {
  NodeApi,
  type Path,
  type Range,
  RangeApi,
  type NodeKey,
  type RootKey,
} from '../..';
import { markRootViewInteraction } from '../../core/root-target';
import { type DOMRange, isDOMNode } from '../../dom';
import {
  createDOMGeometryKernel,
  findDOMRootRuntime,
  getPliteStringPlacementDOMPoint,
  scrollDOMRangeFocusIntoViewIfNeeded,
} from '../../dom/internal';
import { watchFocusSuperseded } from '../../dom/plugin/dom-editor';
import { focusedElementOnPage } from '../../dom/plugin/dom-root-runtime';
import { isDOMInputOrTextArea } from '../../dom/utils/dom';
import {
  cancelDragRest,
  clearDragScrollRepaint,
} from '../../dom/utils/drag-session';
import type {
  EditableDOMRuntime,
  EditableHistoryReplayEvent,
  EditableDropResult,
  EditablePasteResult,
  EditablePointerSelectionEndHandler,
  NodeSelectionFocus,
} from '../editable/editable-dom-runtime';
import type {
  EditableRepairRequest,
  InputIntent,
} from '../editable/input-controller';
import {
  guardExternalTextEvents,
  isOwnEditableInteractionTarget,
  markCopyChainUsed,
  registerEnclosingEditableRuntime,
} from '../editable/interaction-owner';
import { getPlacedDropPlacement } from '../editable/placed-drag';
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
  isOwnEditableContentTarget,
  resolveEditableSelectableOwnerClickTarget,
} from '../editable/selection-void-target';
import { activateViewCaret } from '../editable/view-caret-restore';
import { type ViewLines, ViewLinesContext } from '../editable/view-lines';
import {
  EditableDOMRuntimeContext,
  useEditableDOMHostFact,
  useEditableDOMRuntime,
} from '../hooks/use-claim-editable-dom-commit';
import { ComposingContext } from '../hooks/use-editor-composing';
import { useEditorContext } from '../hooks/use-editor-context';
import { ReadOnlyContext } from '../hooks/use-editor-read-only';
import { useHydrated } from '../hooks/use-hydrated';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import {
  EditingAreaRootEditors,
  useOptionalPliteRuntimeContext,
  useRequiredPliteRuntimeContext,
} from '../hooks/use-plite-runtime';
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

const CARET_KEYS: ReadonlySet<string> = new Set([
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'End',
  'Home',
  'PageDown',
  'PageUp',
]);

const getDropCursorTargetElement = (target: EventTarget | null) => {
  if (!isDOMNode(target)) {
    return null;
  }

  return target.nodeType === 1 ? (target as HTMLElement) : target.parentElement;
};

/**
 * How much CSS transforms scale an element on each axis: its viewport rect
 * against its layout size. An axis that yields no usable ratio reads 1.
 *
 * @internal
 */
export const getElementTransformScale = (
  element: HTMLElement,
  rect: Pick<DOMRectReadOnly, 'height' | 'width'>
) => {
  const axis = (rendered: number, layout: number) => {
    const scale = layout > 0 ? rendered / layout : 1;

    return Number.isFinite(scale) && scale > 0 ? scale : 1;
  };

  return {
    x: axis(rect.width, element.offsetWidth),
    y: axis(rect.height, element.offsetHeight),
  };
};

const getEditableDropCursorRect = ({
  editor,
  event,
  rootElement,
  viewLines,
}: {
  editor: ReactRuntimeEditor;
  event: React.DragEvent<HTMLDivElement>;
  rootElement: HTMLElement;
  viewLines: ViewLines | null;
}): DropCursorRect | null => {
  const targetElement = getDropCursorTargetElement(event.nativeEvent.target);

  if (!targetElement) {
    return null;
  }

  const voidElement = targetElement.closest<HTMLElement>(
    '[data-editor-node][data-editor-void="true"]'
  );
  const editorNode = editor.api.dom.resolveNode(voidElement ?? targetElement);
  const isVoidTarget =
    !!voidElement ||
    (!!editorNode &&
      NodeApi.isElement(editorNode) &&
      editorIsVoid(editor, editorNode));

  if (!isVoidTarget) {
    const geometry = createDOMGeometryKernel({
      root: rootElement,
      target: targetElement,
    });
    const placement =
      viewLines && getPlacedDropPlacement(viewLines, event.nativeEvent);
    const placedPoint = placement
      ? getPliteStringPlacementDOMPoint(placement)
      : null;
    const point = placedPoint
      ? null
      : geometry.pointAtCoordinates({
          x: event.nativeEvent.clientX,
          y: event.nativeEvent.clientY,
        });
    const caretRect = placedPoint
      ? geometry.pointRect(placedPoint)
      : point
        ? geometry.pointRect(point.point, {
            association: point.association,
          })
        : null;

    if (!caretRect || caretRect.height <= 0) {
      return null;
    }

    const rootRect = rootElement.getBoundingClientRect();
    const { x: scaleX, y: scaleY } = getElementTransformScale(
      rootElement,
      rootRect
    );
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
    (editorNode
      ? editor.api.dom.resolveDOMNode(editorNode)?.getBoundingClientRect()
      : null) ??
    targetElement.getBoundingClientRect();
  const rootRect = rootElement.getBoundingClientRect();

  if (targetRect.width <= 0 || targetRect.height <= 0) {
    return null;
  }

  // DOMRects are viewport-space after CSS transforms; absolute children need
  // root-local CSS pixels so the root transform is not applied twice.
  const { x: scaleX, y: scaleY } = getElementTransformScale(
    rootElement,
    rootRect
  );
  const localX = (value: number) => (value - rootRect.left) / scaleX;
  const localY = (value: number) => (value - rootRect.top) / scaleY;

  const isInlineVoid =
    voidElement?.getAttribute('data-editor-inline') === 'true' ||
    (!!editorNode &&
      NodeApi.isElement(editorNode) &&
      editorIsInline(editor, editorNode));

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

/**
 * What an editable passes each DOM handler after its event. `editor` is the
 * view whose editable runs the handler, such as a content root's.
 */
export type EditableHandlerContext = {
  editor: ReactRuntimeEditor;
};

export type EditableInputEventContext = EditableHandlerContext & {
  data: unknown;
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

export type EditableKeyDownHandler = (
  event: React.KeyboardEvent<HTMLDivElement>,
  context: EditableHandlerContext
) => EditableHandlerResult;

// React runs this layout effect before the pane's children's and connects the
// pane after them, so the history step recorder credits the edits its
// children make on mount to this pane. A pane that Activity hides runs no
// layout effect, so it never takes that credit.
const HistoryStepPane = ({ runtime }: { runtime: EditableDOMRuntime }) => {
  const register = useOptionalPliteRuntimeContext()?.registerHistoryStepPane;

  useIsomorphicLayoutEffect(() => register?.(runtime), [register, runtime]);

  return null;
};

/**
 * Editable.
 */

export const EditableDOMRoot = (
  props: {
    children?: React.ReactNode;
    deferNativeTextInputRepair?: boolean;
    viewportRuntime?: EditableViewportRuntime | null;
    ignoreBlankEditableRootClicks?: boolean;
    nodeSelectionFocus?: NodeSelectionFocus;
    onDOMBeforeInput?: EditableDOMBeforeInputHandler;
    onHistoryReplay?: (event: EditableHistoryReplayEvent) => void;
    onKeyDown?: EditableKeyDownHandler;
    onDropResult?: (result: EditableDropResult) => void;
    onPasteResult?: (result: EditablePasteResult) => void;
    onPointerSelectionEnd?: EditablePointerSelectionEndHandler;
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
    nodeSelectionFocus,
    onKeyDown: propsOnKeyDown,
    onDOMBeforeInput: propsOnDOMBeforeInput,
    onHistoryReplay,
    onDropResult,
    onPasteResult,
    onPointerSelectionEnd,
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
  const enclosingRuntime = useEditableDOMRuntime();
  const editorRoot = toInternalRoot(editor.read((state) => state.view.root()));
  const hasViewSelection = usePliteViewSelectionPresence(editor);
  const { getMountedContentViewEditor } = useRequiredPliteRuntimeContext();
  const getViewEditor = useCallback(
    (root: RootKey) =>
      root === editorRoot ? editor : getMountedContentViewEditor(root),
    [editor, editorRoot, getMountedContentViewEditor]
  );
  const rootRuntime = useEditableRootRuntime({
    autoFocus,
    callbacks: attributes,
    editor,
    forwardedRef,
    deferNativeTextInputRepair,
    viewportRuntime,
    nodeSelectionFocus,
    onDOMBeforeInput: propsOnDOMBeforeInput,
    onHistoryReplay,
    onDropResult,
    onKeyDown: propsOnKeyDown,
    onPasteResult,
    onPointerSelectionEnd,
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
  useInsertionEffect(
    () => registerEnclosingEditableRuntime(runtime, enclosingRuntime),
    [enclosingRuntime, runtime]
  );
  const activateCopyChain = useCallback(() => {
    markCopyChainUsed(editor, runtime.rootElement);
  }, [editor, runtime]);
  const markViewUse = (event: React.SyntheticEvent<HTMLDivElement>) => {
    if (isOwnEditableContentTarget(editor, event.currentTarget, event.target)) {
      markCopyChainUsed(editor, event.currentTarget);
    } else if (
      isOwnEditableInteractionTarget(event.currentTarget, event.target)
    ) {
      markRootViewInteraction(editor);
    }
  };
  const supportsBeforeInput = useSyncExternalStore(
    runtime.subscribeHostFacts,
    () => runtime.supportsBeforeInput,
    () => false
  );
  const hydrated = useHydrated();
  const replacementInputFeaturesAllowed = !hydrated || supportsBeforeInput;
  const viewLines = useContext(ViewLinesContext);
  const rootInteraction = useRootInteractionController({
    disabled: readOnly,
    editor,
    getMountedViewEditor: getViewEditor,
    ignoreBlankEditableRootClicks:
      ignoreBlankEditableRootClicks || viewportRuntime !== null,
    root: editorRoot,
    runtime,
    selection: 'restore',
    selectionBridge: rootInteractionSelectionBridge,
    viewLines,
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
        editor.api.dom.drag.indicate(null);
        clearDragScrollRepaint(event.currentTarget.ownerDocument, editor);
        cancelDragRest(event.currentTarget.ownerDocument, editor);
      }
      propsOnDragLeave?.(event);
    },
    onDragOver: (event: React.DragEvent<HTMLDivElement>) => {
      const shouldHandleDragOver = editableEventBindings.onDragOver?.(event);

      if (shouldHandleDragOver === false || shouldHandleDragOver === 'block') {
        clearEditableDropCursor(event.currentTarget);
        return;
      }

      updateEditableDropCursor(
        event.currentTarget,
        getEditableDropCursorRect({
          editor,
          event,
          rootElement: event.currentTarget,
          viewLines,
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
      // A focus handler can move focus away before this event reaches the
      // editables around its target, and the view that now holds focus got
      // its own focus event.
      if (findDOMRootRuntime(event.target)?.holdsFocus()) {
        markViewUse(event);
        if (
          !runtime.mousePressActive &&
          !runtime.longPressSelected &&
          event.target === event.currentTarget &&
          focusedElementOnPage(event.currentTarget) === event.currentTarget
        ) {
          activateViewCaret(editor, {
            superseded: watchFocusSuperseded(editor, event.currentTarget),
          });
        }
      }
      propsOnFocusCapture?.(event);
    },
    onKeyDownCapture: (event: React.KeyboardEvent<HTMLDivElement>) => {
      runtime.clearNextClickSelected();
      runtime.clearOwnedPressGesture();
      if (CARET_KEYS.has(event.key)) {
        activateViewCaret(editor);
        runtime.beginCaretKey();
      }
      editableEventBindings.onKeyDownCapture?.(event);
    },
    onMouseDownCapture: (event: React.MouseEvent<HTMLDivElement>) => {
      runtime.beginMousePress();
      runtime.clearNextClickSelected();
      runtime.clearOwnedPressGesture();
      runtime.setExternalMouseGesture(event.defaultPrevented);

      if (!runtime.externalMouseGestureActive) markViewUse(event);
      const voidTarget = getDropCursorTargetElement(event.target)?.closest(
        '[data-editor-node][data-editor-void="true"]'
      );
      const inlineVoidTarget =
        voidTarget?.getAttribute('data-editor-inline') === 'true';
      const draggableInlineVoidTarget =
        inlineVoidTarget && voidTarget?.getAttribute('draggable') === 'true';
      const selectableOwnerTarget = Boolean(
        resolveEditableSelectableOwnerClickTarget(editor, event.target)
      );

      if (runtime.externalMouseGestureActive) {
        onRuntimeMouseDownCapture?.(event);
      } else if (draggableInlineVoidTarget || selectableOwnerTarget) {
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
      runtime.duringEditableMouseUp(() => {
        if (!runtime.externalMouseGestureActive) {
          onRootMouseUpCapture(event);
        }
        propsOnMouseUpCapture?.(event);
      });
      runtime.setExternalMouseGesture(false);
    },
  };
  const guardedAttributes = guardExternalTextEvents(
    attributes,
    activateCopyChain
  );
  const ownedEventBindings = guardExternalTextEvents(
    {
      ...editableEventBindingsWithDropCursor,
      ...rootInteractionEventBindings,
      onBlurCapture: (event: React.FocusEvent<HTMLDivElement>) =>
        attributes.onBlurCapture?.(event),
    },
    activateCopyChain,
    { editor, onKeyDown: propsOnKeyDown }
  );

  return (
    <ReadOnlyContext value={readOnly}>
      <ComposingContext value={isComposing}>
        <EditableDOMRuntimeContext value={runtime}>
          <HistoryStepPane runtime={runtime} />
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
              contentEditable={!readOnly}
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
                      position: 'relative',
                      whiteSpace: 'pre-wrap',
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
              <EditingAreaRootEditors>{customChildren}</EditingAreaRootEditors>
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

export const defaultScrollSelectionIntoView = (
  editor: ReactRuntimeEditor,
  domRange: DOMRange
) => {
  const selection = getSelectionDOMRange(editor, readRuntimeSelection(editor));
  const isBackward = Boolean(selection && RangeApi.isBackward(selection));

  scrollDOMRangeFocusIntoViewIfNeeded(domRange, isBackward);
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
) => isDOMInputOrTextArea(event.target);

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
