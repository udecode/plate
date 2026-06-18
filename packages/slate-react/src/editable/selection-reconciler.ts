import {
  type FocusEvent,
  type MouseEvent,
  type RefObject,
  useCallback,
} from 'react';
import { NodeApi, PathApi, type Range, RangeApi } from '@platejs/slate';
import {
  containsShadowAware,
  type DOMElement,
  type DOMRange,
  getDefaultView,
  getSelection,
  IS_ANDROID,
  IS_FIREFOX,
  IS_WEBKIT,
  isDOMElement,
  isDOMNode,
  isDOMText,
  TRIPLE_CLICK,
} from '@platejs/slate-dom';
import {
  DOMCoverage,
  EDITOR_TO_ELEMENT,
  EDITOR_TO_USER_SELECTION,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  IS_FOCUSED,
  IS_NODE_MAP_DIRTY,
  NODE_TO_ELEMENT,
} from '@platejs/slate-dom/internal';
import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import {
  readSlateViewSelection,
  writeSlateViewSelection,
} from '../view-selection';
import { applyDOMCoverageSelectionPolicy } from './dom-coverage-selection';
import { getInputEventTargetRanges } from './dom-input-event';
import { createFastDOMSelectionRange } from './fast-dom-selection-range';
import {
  type EditableDOMSelectionSyncOptions,
  type EditableInputController,
  executeEditableSelectionExport,
  isEditableOutsideFocusBoundarySettling,
  isInteractiveInternalTarget,
  isSelectionInEditorView,
  type SelectionChangeOrigin,
  setEditableModelSelectionPreference,
  syncEditableDOMSelectionToEditor,
} from './input-controller';
import { readModelSelectionDOMPreference } from './model-selection-dom-preference';
import { Editor } from './runtime-editor-api';
import { writeRuntimeSelection } from './runtime-mutation-state';
import { readRuntimeSelection } from './runtime-selection-state';
import {
  resolveSlateRangeFromDOMSelection,
  resolveSlateRangeFromDOMTextRange,
} from './selection-dom-range';
import {
  shouldSkipDOMSelection,
  shouldSkipSelectionFocus,
  shouldSkipSelectionScroll,
} from './selection-side-effect-policy';
import { exportTripleClickSelectionToDOM } from './selection-triple-click';
import {
  preferModelSelectionForVoidTarget,
  resolveEditableClickTarget,
  resolveEditableVoidClickTarget,
  selectEditableVoidTarget,
} from './selection-void-target';

export {
  selectEditableVoidPath,
  selectEditableVoidTarget,
} from './selection-void-target';

const getDOMSelectionOffsetLimit = (node: globalThis.Node) =>
  isDOMText(node) ? (node.textContent?.length ?? 0) : node.childNodes.length;

const clampDOMSelectionPoint = (
  node: globalThis.Node,
  offset: number
): [globalThis.Node, number] => [
  node,
  Math.max(0, Math.min(offset, getDOMSelectionOffsetLimit(node))),
];

export type EditableSelectionReconcilerState = {
  isUpdatingSelection: boolean;
  latestElement: DOMElement | null;
  outsideFocusBoundarySettleUntil: number;
  pendingDOMSelectionImport: boolean;
  selectionChangeOrigin?: SelectionChangeOrigin | null;
};

type EditableFocusHandler = (
  event: FocusEvent<HTMLDivElement>
) => boolean | void;

type EditableMouseHandler = (
  event: MouseEvent<HTMLDivElement>
) => boolean | void;

const isReactEventHandled = <
  EventType extends {
    isDefaultPrevented: () => boolean;
    isPropagationStopped: () => boolean;
  },
>({
  event,
  handler,
}: {
  event: EventType;
  handler?: (event: EventType) => boolean | void;
}) => {
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

export const attachEditableSelectionChangeListener = ({
  scheduleOnDOMSelectionChange,
  state,
  targetDocument,
}: {
  scheduleOnDOMSelectionChange: () => void;
  state: {
    activeIntent?: EditableInputController['state']['activeIntent'];
    modelSelectionPreference?: EditableInputController['state']['modelSelectionPreference'];
    pendingDOMSelectionImport: boolean;
    selectionChangeOrigin?: EditableInputController['state']['selectionChangeOrigin'];
    selectionSource?: EditableInputController['state']['selectionSource'];
  };
  targetDocument: Document;
}) => {
  const HTMLElementConstructor = targetDocument.defaultView?.HTMLElement;

  // COMPAT: In Chrome, `selectionchange` events can fire when <input> and
  // <textarea> elements are appended to the DOM, causing
  // `editor.selection` to be overwritten in some circumstances.
  // (2025/01/16) https://issues.chromium.org/issues/389368412
  const handleNativeSelectionChange = ({ target }: Event) => {
    const targetElement =
      HTMLElementConstructor && target instanceof HTMLElementConstructor
        ? target
        : null;
    const targetTagName = targetElement?.tagName;
    if (targetTagName === 'INPUT' || targetTagName === 'TEXTAREA') {
      return;
    }
    if (
      state.activeIntent === 'history' &&
      state.selectionChangeOrigin === 'repair-induced' &&
      state.selectionSource === 'model-owned' &&
      state.modelSelectionPreference?.preferModelSelection === true
    ) {
      return;
    }
    state.pendingDOMSelectionImport = true;
    scheduleOnDOMSelectionChange();
  };

  // Attach a native DOM event handler for `selectionchange`, because React's
  // built-in `onSelect` handler doesn't fire for all selection changes. It's
  // a leaky polyfill that only fires on keypresses or clicks. Instead, we
  // want to fire for any change to the selection inside the editor.
  // (2019/11/04) https://github.com/facebook/react/issues/5785
  targetDocument.addEventListener(
    'selectionchange',
    handleNativeSelectionChange
  );

  return () => {
    targetDocument.removeEventListener(
      'selectionchange',
      handleNativeSelectionChange
    );
  };
};

export const applyEditableBlur = ({
  editor,
  event,
  onBlur,
  readOnly,
  state,
}: {
  editor: ReactRuntimeEditor;
  event: FocusEvent<HTMLDivElement>;
  onBlur?: EditableFocusHandler;
  readOnly: boolean;
  state: EditableSelectionReconcilerState;
}) => {
  if (
    state.isUpdatingSelection ||
    !ReactEditor.hasSelectableTarget(editor, event.target) ||
    isReactEventHandled({ event, handler: onBlur })
  ) {
    return;
  }

  // COMPAT: If the current `activeElement` is still the previous
  // one, this is due to the window being blurred when the tab
  // itself becomes unfocused, so we want to abort early to allow to
  // editor to stay focused when the tab becomes focused again.
  const root = ReactEditor.findDocumentOrShadowRoot(editor);
  if (state.latestElement === root.activeElement) {
    return;
  }

  const { relatedTarget } = event;
  const el = ReactEditor.assertDOMNode(editor, editor);

  // COMPAT: The event should be ignored if the focus is returning
  // to the editor from an embedded editable element (eg. an <input>
  // element inside a void node).
  if (relatedTarget === el) {
    return;
  }

  // COMPAT: The event should be ignored if the focus is moving from
  // the editor to inside a void node's spacer element.
  if (
    isDOMElement(relatedTarget) &&
    relatedTarget.hasAttribute('data-slate-spacer')
  ) {
    return;
  }

  // COMPAT: The event should be ignored if the focus is moving to a
  // non- editable section of an element that isn't a void node (eg.
  // a list item of the check list example).
  if (
    relatedTarget != null &&
    isDOMNode(relatedTarget) &&
    ReactEditor.hasDOMNode(editor, relatedTarget)
  ) {
    try {
      const node = ReactEditor.resolveSlateNode(editor, relatedTarget);

      if (node && NodeApi.isElement(node) && !Editor.isVoid(editor, node)) {
        return;
      }
    } catch {
      return;
    }
  }

  // COMPAT: Safari doesn't always remove the selection even if the content-
  // editable element no longer has focus. Refer to:
  // https://stackoverflow.com/questions/12353247/force-contenteditable-div-to-stop-accepting-input-after-it-loses-focus-under-web
  if (IS_WEBKIT) {
    const domSelection = getSelection(root);
    domSelection?.removeAllRanges();
  }

  IS_FOCUSED.delete(editor);
};

export const applyEditableFocus = ({
  editor,
  event,
  onFocus,
  readOnly,
  state,
}: {
  editor: ReactRuntimeEditor;
  event: FocusEvent<HTMLDivElement>;
  onFocus?: EditableFocusHandler;
  readOnly: boolean;
  state: EditableSelectionReconcilerState;
}) => {
  if (isEditableOutsideFocusBoundarySettling(state)) {
    return false;
  }

  if (
    !state.isUpdatingSelection &&
    ReactEditor.hasEditableTarget(editor, event.target) &&
    !isReactEventHandled({ event, handler: onFocus })
  ) {
    const el = ReactEditor.assertDOMNode(editor, editor);
    const root = ReactEditor.findDocumentOrShadowRoot(editor);
    state.latestElement = root.activeElement;

    // COMPAT: If the editor has nested editable elements, the focus
    // can go to them. In Firefox, this must be prevented because it
    // results in issues with keyboard navigation. (2017/03/30)
    if (IS_FIREFOX && event.target !== el) {
      el.focus();
      return;
    }

    IS_FOCUSED.set(editor, true);
    return true;
  }

  return false;
};

export const applyEditableClick = ({
  editor,
  event,
  onClick,
  inputController,
  readOnly,
}: {
  editor: ReactRuntimeEditor;
  event: MouseEvent<HTMLDivElement>;
  inputController: EditableInputController;
  onClick?: EditableMouseHandler;
  readOnly: boolean;
}) => {
  if (isInteractiveInternalTarget(editor, event.target)) {
    setEditableModelSelectionPreference({
      inputController,
      preferModelSelection: true,
      selectionSource: 'app-owned',
    });
    return;
  }

  if (readOnly) {
    isReactEventHandled({ event, handler: onClick });
    return;
  }

  const voidTargetOwnsSelection = preferModelSelectionForVoidTarget({
    editor,
    inputController,
    target: event.target,
  });

  if (!voidTargetOwnsSelection) {
    setEditableModelSelectionPreference({
      inputController,
      preferModelSelection: false,
      selectionSource: 'dom-current',
    });
  }

  if (!isReactEventHandled({ event, handler: onClick })) {
    const target =
      (isDOMNode(event.target)
        ? resolveEditableVoidClickTarget(editor, event.target)
        : null) ?? resolveEditableClickTarget(editor, event.target);

    if (!target) {
      return;
    }

    const { node, path } = target;

    if (event.detail === TRIPLE_CLICK && path.length >= 1) {
      let blockPath = path;
      if (!(NodeApi.isElement(node) && Editor.isBlock(editor, node))) {
        const block = Editor.above(editor, {
          match: (n) => NodeApi.isElement(n) && Editor.isBlock(editor, n),
          at: path,
        });

        blockPath = block?.[1] ?? path.slice(0, 1);
      }

      const range = Editor.range(editor, blockPath);
      writeSlateViewSelection(editor, null);
      setEditableModelSelectionPreference({
        inputController,
        preferModelSelection: true,
        selectionSource: 'model-owned',
      });
      editor.update((tx) => {
        tx.selection.set(range);
      });
      exportTripleClickSelectionToDOM({ editor, inputController, range });
      return;
    }

    if (IS_FIREFOX && event.detail === 1) {
      const range = editor.api.dom.resolveEventRange(event.nativeEvent);
      const clickedInline =
        range && RangeApi.isCollapsed(range)
          ? Editor.above(editor, {
              at: range.anchor,
              match: (n) => NodeApi.isElement(n) && Editor.isInline(editor, n),
            })
          : null;

      if (range && clickedInline) {
        writeSlateViewSelection(editor, null);
        setEditableModelSelectionPreference({
          inputController,
          preferModelSelection: true,
          selectionSource: 'model-owned',
        });
        editor.update((tx) => {
          tx.selection.set(range);
        });
        return;
      }
    }

    const start = Editor.point(editor, path, { edge: 'start' });
    const end = Editor.point(editor, path, { edge: 'end' });
    const startVoid = Editor.void(editor, { at: start });
    const endVoid = Editor.void(editor, { at: end });

    if (startVoid && endVoid && PathApi.equals(startVoid[1], endVoid[1])) {
      const range = Editor.range(editor, start);
      ReactEditor.focus(editor);
      writeSlateViewSelection(editor, null);
      editor.update((tx) => {
        tx.selection.set(range);
      });
    }
  }
};

export const applyEditableMouseDown = ({
  editor,
  event,
  inputController,
  onMouseDown,
}: {
  editor: ReactRuntimeEditor;
  event: MouseEvent<HTMLDivElement>;
  inputController: EditableInputController;
  onMouseDown?: EditableMouseHandler;
}) => {
  inputController.state.outsideFocusBoundarySettleUntil = 0;

  if (isInteractiveInternalTarget(editor, event.target)) {
    setEditableModelSelectionPreference({
      inputController,
      preferModelSelection: true,
      selectionSource: 'app-owned',
    });
    onMouseDown?.(event);
    return null;
  }

  const selectedVoidTarget = selectEditableVoidTarget({
    editor,
    inputController,
    target: event.target,
  });

  if (selectedVoidTarget) {
    event.preventDefault();
  } else {
    inputController.state.modelOwnedTextInputGuard = 0;
    setEditableModelSelectionPreference({
      inputController,
      preferModelSelection: false,
      selectionSource: 'dom-current',
    });
    inputController.state.selectionChangeOrigin = 'native-user';
  }
  onMouseDown?.(event);
  return selectedVoidTarget;
};

export const syncSelectionForBeforeInput = ({
  allowDOMSelectionImport = true,
  data,
  editor,
  editorElement,
  event,
  forceModelOwnedTextInput = false,
  inputType: type,
  isCompositionChange,
  native,
  pendingNativeTextInputRepairOffset = null,
  pendingNativeTextInputRepairPathKey = null,
  preferModelSelectionForInput,
  root,
  selectionChangeOrigin = null,
  selection,
}: {
  allowDOMSelectionImport?: boolean;
  data: unknown;
  editor: ReactRuntimeEditor;
  editorElement: HTMLElement;
  event: InputEvent;
  forceModelOwnedTextInput?: boolean;
  inputType: string;
  isCompositionChange: boolean;
  native: boolean;
  pendingNativeTextInputRepairOffset?: number | null;
  pendingNativeTextInputRepairPathKey?: string | null;
  preferModelSelectionForInput: boolean;
  root: Document | ShadowRoot;
  selectionChangeOrigin?: SelectionChangeOrigin | null;
  selection: Range | null;
}): {
  native: boolean;
  selection: Range | null;
} => {
  let nextNative = native;
  let nextSelection = selection;
  const domSelection = getSelection(root);
  const domSelectionAnchorNode = domSelection?.anchorNode ?? null;
  const domSelectionFocusNode = domSelection?.focusNode ?? null;
  const domSelectionAnchorElement = isDOMText(domSelectionAnchorNode)
    ? domSelectionAnchorNode.parentElement
    : isDOMElement(domSelectionAnchorNode)
      ? domSelectionAnchorNode
      : null;
  const domSelectionTextHost =
    domSelectionAnchorElement?.closest('[data-slate-node="text"]') ?? null;
  const domSelectionUsesProjectedTextHost =
    type === 'insertText' &&
    domSelectionTextHost?.getAttribute('data-slate-dom-sync-reason') ===
      'projection';
  const shouldPreferModelSelectionForInput =
    preferModelSelectionForInput ||
    forceModelOwnedTextInput ||
    domSelectionUsesProjectedTextHost;
  if (
    type === 'insertText' &&
    (forceModelOwnedTextInput || domSelectionUsesProjectedTextHost)
  ) {
    nextNative = false;
  }
  const domSelectionBelongsToEditor =
    !domSelection ||
    domSelection.rangeCount === 0 ||
    (ReactEditor.hasSelectableTarget(editor, domSelectionAnchorNode) &&
      ReactEditor.hasSelectableTarget(editor, domSelectionFocusNode));
  const pendingNativeTextInputRepairPath =
    pendingNativeTextInputRepairPathKey?.split(',').map(Number) ?? null;
  const pendingNativeTextInputRepairTextHostPath =
    domSelectionTextHost?.getAttribute('data-slate-path') ?? null;
  const pendingNativeTextInputRepairDOMOffset =
    domSelection?.isCollapsed && isDOMText(domSelection.anchorNode)
      ? domSelection.anchorOffset
      : null;

  if (
    allowDOMSelectionImport &&
    type === 'insertText' &&
    !shouldPreferModelSelectionForInput &&
    domSelection &&
    domSelectionBelongsToEditor &&
    pendingNativeTextInputRepairPathKey &&
    pendingNativeTextInputRepairPath &&
    pendingNativeTextInputRepairOffset != null &&
    pendingNativeTextInputRepairTextHostPath ===
      pendingNativeTextInputRepairPathKey &&
    pendingNativeTextInputRepairDOMOffset === pendingNativeTextInputRepairOffset
  ) {
    return {
      native: nextNative,
      selection: {
        anchor: {
          offset: pendingNativeTextInputRepairOffset,
          path: [...pendingNativeTextInputRepairPath],
        },
        focus: {
          offset: pendingNativeTextInputRepairOffset,
          path: [...pendingNativeTextInputRepairPath],
        },
      },
    };
  }

  // Most deleting forward/backward input types can derive the target from the
  // current selection, but IME/focus cleanup can provide an expanded
  // beforeinput target range that must become the model delete range.
  let didUseBeforeInputTargetRange = false;
  if (allowDOMSelectionImport) {
    const nodeMapDirty = IS_NODE_MAP_DIRTY.get(editor);
    const targetRanges = getInputEventTargetRanges(event);
    const targetRange = targetRanges.length === 1 ? targetRanges[0] : null;
    const textHostRange = targetRange
      ? resolveSlateRangeFromDOMTextRange(editor, targetRange, {
          requireCurrentRuntimeBinding: nodeMapDirty,
        })
      : null;
    const targetRangeBelongsToEditor =
      !!targetRange &&
      (textHostRange
        ? editorElement.contains(targetRange.startContainer) &&
          editorElement.contains(targetRange.endContainer)
        : ReactEditor.hasSelectableTarget(editor, targetRange.startContainer) &&
          ReactEditor.hasSelectableTarget(editor, targetRange.endContainer));

    if (
      targetRange &&
      domSelectionBelongsToEditor &&
      targetRangeBelongsToEditor
    ) {
      const resolvedRange =
        textHostRange ??
        (nodeMapDirty
          ? null
          : ReactEditor.resolveSlateRange(editor, targetRange, {
              exactMatch: false,
            }));
      const range = resolvedRange;
      const staleBackwardInsertTextTargetRange =
        type === 'insertText' &&
        range &&
        RangeApi.isCollapsed(range) &&
        nextSelection &&
        RangeApi.isCollapsed(nextSelection) &&
        PathApi.equals(range.anchor.path, nextSelection.anchor.path) &&
        range.anchor.offset < nextSelection.anchor.offset;
      const shouldUseTargetRange =
        range &&
        !staleBackwardInsertTextTargetRange &&
        !(
          shouldPreferModelSelectionForInput &&
          type === 'insertText' &&
          RangeApi.isCollapsed(range)
        ) &&
        (!type.startsWith('delete') ||
          type.startsWith('deleteBy') ||
          RangeApi.isExpanded(range));

      if (shouldUseTargetRange) {
        didUseBeforeInputTargetRange = true;
      }

      if (
        shouldUseTargetRange &&
        (!nextSelection || !RangeApi.equals(nextSelection, range))
      ) {
        nextNative = false;

        const selectionRef =
          !isCompositionChange &&
          type !== 'insertText' &&
          nextSelection &&
          Editor.rangeRef(editor, nextSelection);

        writeSlateViewSelection(editor, null);
        editor.update((tx) => {
          tx.selection.set(range);
        });
        nextSelection = range;

        if (selectionRef) {
          EDITOR_TO_USER_SELECTION.set(editor, selectionRef);
        }
      }
    }
  }

  if (
    allowDOMSelectionImport &&
    type === 'insertText' &&
    !didUseBeforeInputTargetRange &&
    !shouldPreferModelSelectionForInput &&
    domSelection &&
    domSelectionBelongsToEditor
  ) {
    const range =
      resolveSlateRangeFromDOMSelection(editor, domSelection, editorElement) ??
      (IS_NODE_MAP_DIRTY.get(editor)
        ? null
        : ReactEditor.resolveSlateRange(editor, domSelection, {
            exactMatch: false,
          }));
    const pendingNativeTextInputRepairOwnsSelection =
      !!pendingNativeTextInputRepairPathKey &&
      !!pendingNativeTextInputRepairPath &&
      !!range &&
      RangeApi.isCollapsed(range);
    const pendingNativeTextInputRepairOwnsPoint =
      pendingNativeTextInputRepairOwnsSelection &&
      pendingNativeTextInputRepairOffset != null &&
      pendingNativeTextInputRepairDOMOffset ===
        pendingNativeTextInputRepairOffset;
    const pendingNativeTextInputRepairOwnsDifferentPath =
      pendingNativeTextInputRepairOwnsSelection &&
      !PathApi.equals(range.anchor.path, pendingNativeTextInputRepairPath!);
    const pendingNativeTextInputRepairOwnsDifferentOffset =
      pendingNativeTextInputRepairOwnsSelection &&
      pendingNativeTextInputRepairOffset != null &&
      pendingNativeTextInputRepairDOMOffset !==
        pendingNativeTextInputRepairOffset;
    const staleBackwardSamePathTextInputDOMSelection =
      !!range &&
      RangeApi.isCollapsed(range) &&
      !!nextSelection &&
      RangeApi.isCollapsed(nextSelection) &&
      PathApi.equals(range.anchor.path, nextSelection.anchor.path) &&
      range.anchor.offset < nextSelection.anchor.offset;
    const staleBackwardTextInputDOMSelection =
      pendingNativeTextInputRepairOwnsSelection &&
      staleBackwardSamePathTextInputDOMSelection;
    const staleRepairInducedTextInputDOMSelection =
      selectionChangeOrigin === 'repair-induced' &&
      staleBackwardSamePathTextInputDOMSelection;

    if (
      staleRepairInducedTextInputDOMSelection ||
      pendingNativeTextInputRepairOwnsDifferentPath ||
      pendingNativeTextInputRepairOwnsDifferentOffset ||
      staleBackwardTextInputDOMSelection
    ) {
      nextNative = false;
    } else if (
      pendingNativeTextInputRepairOwnsSelection &&
      pendingNativeTextInputRepairPath &&
      PathApi.equals(range.anchor.path, pendingNativeTextInputRepairPath) &&
      (pendingNativeTextInputRepairOffset == null ||
        pendingNativeTextInputRepairOwnsPoint)
    ) {
      nextNative = native;
      const repairOffset =
        pendingNativeTextInputRepairOffset ?? range.anchor.offset;
      nextSelection = {
        anchor: {
          offset: repairOffset,
          path: [...pendingNativeTextInputRepairPath],
        },
        focus: {
          offset: repairOffset,
          path: [...pendingNativeTextInputRepairPath],
        },
      };
    } else if (
      range &&
      (!nextSelection || !RangeApi.equals(nextSelection, range))
    ) {
      nextNative = false;
      writeSlateViewSelection(editor, null);
      editor.update((tx) => {
        tx.selection.set(range);
      });
      nextSelection = range;
    }
  }

  if (
    allowDOMSelectionImport &&
    type !== 'insertText' &&
    !type.startsWith('delete') &&
    domSelection &&
    domSelectionBelongsToEditor &&
    !IS_NODE_MAP_DIRTY.get(editor)
  ) {
    const range =
      resolveSlateRangeFromDOMSelection(editor, domSelection, editorElement) ??
      ReactEditor.resolveSlateRange(editor, domSelection, {
        exactMatch: false,
      });

    if (range && (!nextSelection || !RangeApi.equals(nextSelection, range))) {
      nextNative = false;
      writeSlateViewSelection(editor, null);
      editor.update((tx) => {
        tx.selection.set(range);
      });
      nextSelection = range;
    }
  }

  if (
    type === 'insertText' &&
    typeof data === 'string' &&
    (!nextSelection || !Editor.hasPath(editor, nextSelection.anchor.path)) &&
    Editor.string(editor, []) === ''
  ) {
    const firstText = Array.from(NodeApi.texts(editor))[0];

    if (firstText) {
      const [, path] = firstText;
      const range = Editor.range(editor, { path, offset: 0 });
      writeSlateViewSelection(editor, null);
      editor.update((tx) => {
        tx.selection.set(range);
      });
      nextSelection = range;
    }
  }

  if (
    allowDOMSelectionImport &&
    type.startsWith('delete') &&
    !didUseBeforeInputTargetRange &&
    !shouldPreferModelSelectionForInput
  ) {
    const range =
      domSelectionBelongsToEditor && domSelection
        ? resolveSlateRangeFromDOMSelection(editor, domSelection, editorElement)
        : null;

    if (range && (!nextSelection || !RangeApi.equals(nextSelection, range))) {
      writeSlateViewSelection(editor, null);
      editor.update((tx) => {
        tx.selection.set(range);
      });
      nextSelection = range;
    }
  }

  return {
    native: nextNative,
    selection: nextSelection,
  };
};

export const restoreUserSelectionAfterBeforeInput = ({
  editor,
}: {
  editor: ReactRuntimeEditor;
}) => {
  // Restore the actual user section if nothing manually set it.
  const toRestore = EDITOR_TO_USER_SELECTION.get(editor)?.unref();
  EDITOR_TO_USER_SELECTION.delete(editor);

  if (
    toRestore &&
    (!readRuntimeSelection(editor) ||
      !RangeApi.equals(readRuntimeSelection(editor)!, toRestore))
  ) {
    writeSlateViewSelection(editor, null);
    editor.update((tx) => {
      tx.selection.set(toRestore);
    });
  }
};

export const handleWebKitShadowDOMBeforeInput = ({
  editor,
  event,
  processing,
  root,
  window,
}: {
  editor: ReactRuntimeEditor;
  event: InputEvent;
  processing: RefObject<boolean>;
  root: globalThis.Node;
  window: Window & typeof globalThis;
}) => {
  const rootWindow = root.ownerDocument?.defaultView ?? window;
  const ShadowRootConstructor = rootWindow.ShadowRoot;

  if (
    !(
      processing.current &&
      IS_WEBKIT &&
      ShadowRootConstructor &&
      root instanceof ShadowRootConstructor
    )
  ) {
    return false;
  }

  const ranges = getInputEventTargetRanges(event);
  const range = ranges[0];

  if (!range) {
    return true;
  }

  const newRange = new rootWindow.Range();

  newRange.setStart(range.startContainer, range.startOffset);
  newRange.setEnd(range.endContainer, range.endOffset);

  // Translate the DOM Range into a Slate Range
  const slateRange = ReactEditor.resolveSlateRange(editor, newRange, {
    exactMatch: false,
  });

  if (!slateRange) {
    return true;
  }

  writeSlateViewSelection(editor, null);
  editor.update((tx) => {
    tx.selection.set(slateRange);
  });

  event.preventDefault();
  event.stopImmediatePropagation();
  return true;
};

export const useEditableSelectionReconciler = ({
  androidInputManagerRef,
  editor,
  inputController,
  rootRef,
  scrollSelectionIntoView,
  partialDOMBackedSelection,
  state,
}: {
  androidInputManagerRef: RefObject<AndroidInputManager | null | undefined>;
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  rootRef: RefObject<HTMLDivElement | null>;
  scrollSelectionIntoView: (
    editor: ReactRuntimeEditor,
    domRange: DOMRange
  ) => void;
  partialDOMBackedSelection: boolean;
  state: EditableSelectionReconcilerState;
}) => {
  useIsomorphicLayoutEffect(() => {
    // Update element-related weak maps with the DOM element ref.
    const editorWindow = rootRef.current
      ? getDefaultView(rootRef.current)
      : null;
    if (rootRef.current && editorWindow) {
      EDITOR_TO_WINDOW.set(editor, editorWindow);
      EDITOR_TO_ELEMENT.set(editor, rootRef.current);
      NODE_TO_ELEMENT.set(editor, rootRef.current);
      ELEMENT_TO_NODE.set(rootRef.current, editor);
    } else {
      NODE_TO_ELEMENT.delete(editor);
    }

    // Make sure the DOM selection state is in sync.
    const selection = readRuntimeSelection(editor);
    const root = ReactEditor.findDocumentOrShadowRoot(editor);
    const domSelection = getSelection(root);

    if (!isSelectionInEditorView(editor, selection)) {
      return;
    }

    if (isEditableOutsideFocusBoundarySettling(state)) {
      return;
    }

    if (!domSelection || androidInputManagerRef.current?.hasPendingAction()) {
      return;
    }

    if (isInteractiveInternalTarget(editor, root.activeElement)) {
      return;
    }

    const editorElementForActiveTarget = EDITOR_TO_ELEMENT.get(editor);
    if (
      !editorElementForActiveTarget ||
      (root.activeElement &&
        root.activeElement !==
          editorElementForActiveTarget.ownerDocument.body &&
        root.activeElement !==
          editorElementForActiveTarget.ownerDocument.documentElement &&
        !containsShadowAware(editorElementForActiveTarget, root.activeElement))
    ) {
      return;
    }

    if (shouldSkipDOMSelection(editor)) {
      return;
    }

    const selectionHasDOMCoverage =
      !!selection &&
      DOMCoverage.getBoundariesForRange(editor, selection).length > 0;

    if (
      state.pendingDOMSelectionImport &&
      containsShadowAware(
        editorElementForActiveTarget,
        domSelection.anchorNode
      ) &&
      containsShadowAware(editorElementForActiveTarget, domSelection.focusNode)
    ) {
      return;
    }

    if (partialDOMBackedSelection && selectionHasDOMCoverage) {
      domSelection.removeAllRanges();
      return;
    }

    const clearUpdatingSelection = () => {
      setTimeout(() => {
        state.isUpdatingSelection = false;
      }, 80);
    };

    const setDomSelection = (forceChange?: boolean) => {
      const hasDomSelection = domSelection.type !== 'None';

      // If the DOM selection is properly unset, we're done.
      if (!selection && !hasDomSelection) {
        return;
      }

      // Get anchorNode and focusNode
      const focusNode = domSelection.focusNode;
      let anchorNode: globalThis.Node | null = null;

      // COMPAT: In firefox the normal selection way does not work
      // (https://github.com/ianstormtaylor/slate/pull/5486#issue-1820720223)
      if (IS_FIREFOX && domSelection.rangeCount > 1) {
        const firstRange = domSelection.getRangeAt(0);
        const lastRange = domSelection.getRangeAt(domSelection.rangeCount - 1);

        // Right to left
        if (firstRange.startContainer === focusNode) {
          anchorNode = lastRange.endContainer;
        } else {
          // Left to right
          anchorNode = firstRange.startContainer;
        }
      } else {
        anchorNode = domSelection.anchorNode;
      }

      // verify that the dom selection is in the editor
      const editorElement = EDITOR_TO_ELEMENT.get(editor)!;
      let hasDomSelectionInEditor = false;
      if (
        containsShadowAware(editorElement, anchorNode) &&
        containsShadowAware(editorElement, focusNode)
      ) {
        hasDomSelectionInEditor = true;
      }

      // If the DOM selection is in the editor and the editor selection is already correct, we're done.
      if (
        hasDomSelection &&
        hasDomSelectionInEditor &&
        selection &&
        !forceChange
      ) {
        const slateRange = ReactEditor.resolveSlateRange(editor, domSelection, {
          exactMatch: true,

          // domSelection is not necessarily a valid Slate range
          // (e.g. when clicking on contentEditable:false element)
        });

        const isCollapsedElementSelection =
          domSelection.isCollapsed && !isDOMText(anchorNode);

        if (
          slateRange &&
          RangeApi.equals(slateRange, selection) &&
          !isCollapsedElementSelection
        ) {
          return;
        }
      }

      // when <Editable/> is being controlled through external value
      // then its children might just change - DOM responds to it on its own
      // but Slate's value is not being updated through any operation
      // and thus it doesn't transform selection on its own
      if (selection && !ReactEditor.hasRange(editor, selection)) {
        writeRuntimeSelection(
          editor,
          ReactEditor.resolveSlateRange(editor, domSelection, {
            exactMatch: false,
          })
        );
        return;
      }

      if (readSlateViewSelection(editor)) {
        return;
      }

      if (
        selection &&
        selectionHasDOMCoverage &&
        applyDOMCoverageSelectionPolicy({
          domSelection,
          editor,
          onDOMSelectionWillChange: () => {
            state.isUpdatingSelection = true;
            state.selectionChangeOrigin = 'programmatic-export';
            clearUpdatingSelection();
          },
          selection,
        })
      ) {
        return;
      }

      // Otherwise the DOM selection is out of sync, so update it.
      state.isUpdatingSelection = true;
      state.selectionChangeOrigin = 'programmatic-export';

      let newDomRange: DOMRange | null = null;

      newDomRange = selection
        ? (readModelSelectionDOMPreference({
            editor,
            editorElement,
            selection,
          }) ??
          createFastDOMSelectionRange({
            editor,
            editorElement,
            includeFullDocument: false,
            selection,
          }) ??
          ReactEditor.resolveDOMRange(editor, selection))
        : null;

      if (newDomRange) {
        const [startContainer, startOffset] = clampDOMSelectionPoint(
          newDomRange.startContainer,
          newDomRange.startOffset
        );
        const [endContainer, endOffset] = clampDOMSelectionPoint(
          newDomRange.endContainer,
          newDomRange.endOffset
        );

        if (ReactEditor.isComposing(editor) && !IS_ANDROID) {
          if (domSelection.rangeCount > 0) {
            domSelection.collapseToEnd();
          } else {
            domSelection.setBaseAndExtent(
              endContainer,
              endOffset,
              endContainer,
              endOffset
            );
          }
        } else if (RangeApi.isBackward(selection!)) {
          domSelection.setBaseAndExtent(
            endContainer,
            endOffset,
            startContainer,
            startOffset
          );
        } else {
          domSelection.setBaseAndExtent(
            startContainer,
            startOffset,
            endContainer,
            endOffset
          );
        }
        if (!shouldSkipSelectionScroll(editor)) {
          scrollSelectionIntoView(editor, newDomRange);
        }
        if (readSlateViewSelection(editor) && !selectionHasDOMCoverage) {
          writeSlateViewSelection(editor, null);
        }
      } else if (!selection) {
        domSelection.removeAllRanges();
      }

      return newDomRange;
    };

    // In firefox if there is more then 1 range and we call setDomSelection we remove the ability to select more cells in a table
    if (domSelection.rangeCount <= 1) {
      try {
        setDomSelection();
      } catch (_e) {
        clearUpdatingSelection();
        return;
      }
    }

    const ensureSelection =
      androidInputManagerRef.current?.isFlushing() === 'action';

    if (!IS_ANDROID || !ensureSelection) {
      clearUpdatingSelection();
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const animationFrameId = requestAnimationFrame(() => {
      if (ensureSelection) {
        const ensureDomSelection = (forceChange?: boolean) => {
          try {
            const el = ReactEditor.assertDOMNode(editor, editor);
            if (!shouldSkipSelectionFocus(editor)) {
              el.focus();
            }

            setDomSelection(forceChange);
          } catch (_e) {
            // Ignore, dom and state might be out of sync
          }
        };

        // Compat: Android IMEs try to force their selection by manually re-applying it even after we set it.
        // This essentially would make setting the slate selection during an update meaningless, so we force it
        // again here. We can't only do it in the setTimeout after the animation frame since that would cause a
        // visible flicker.
        ensureDomSelection();

        timeoutId = setTimeout(() => {
          // COMPAT: While setting the selection in an animation frame visually correctly sets the selection,
          // it doesn't update GBoards spellchecker state. We have to manually trigger a selection change after
          // the animation frame to ensure it displays the correct state.
          ensureDomSelection(true);
          state.isUpdatingSelection = false;
        });
      }
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  });

  const syncDOMSelectionToEditor = useCallback(
    (options?: EditableDOMSelectionSyncOptions) => {
      executeEditableSelectionExport({
        exportSelection: () => {
          syncEditableDOMSelectionToEditor({
            editor,
            options,
            scrollSelectionIntoView,
            partialDOMBackedSelection,
            state,
          });
        },
        selectionPolicy: { kind: 'export-model', reason: 'model-owned' },
      });
    },
    [editor, scrollSelectionIntoView, partialDOMBackedSelection, state]
  );

  return { syncDOMSelectionToEditor };
};
