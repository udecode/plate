import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react';
import {
  NodeApi,
  type Path,
  type Range,
  RangeApi,
  type RootKey,
} from '@platejs/slate';
import {
  getSelection,
  HAS_BEFORE_INPUT_SUPPORT,
  Hotkeys,
  IS_CHROME,
  IS_IOS,
  IS_WEBKIT,
  isDOMElement,
  isDOMText,
} from '@platejs/slate-dom';
import type { EditableKeyDownHandler } from '../components/editable';
import { isSelectAllHotkey } from '../dom-strategy/dom-strategy-commands';
import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager';
import { scheduleSlateReactFocus } from '../hooks/focus-scheduler';
import { focusSlateEditable } from '../hooks/focus-slate-editable';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { getOperationRoot, MAIN_ROOT_KEY } from '../root-key';
import {
  isSlateViewSelectionCollapsed,
  readSlateViewSelection,
} from '../view-selection';
import { applyEditableCaretMovement } from './caret-engine';
import {
  applyContentRootNavigation,
  applyContentRootViewSelection,
} from './content-root-navigation';
import { shouldModelOwnPlainVerticalLargeDocumentExtension } from './dom-coverage-vertical-selection';
import {
  isDestructiveEditableCommand,
  isEditableEditingEpochCommand,
  markEditableEditingEpochCommandHandled,
} from './editing-epoch-kernel';
import { getEditableCommandFromKeyDown } from './editing-kernel';
import {
  type HistoryFocusOwnerApi,
  resolveHistoryFocusEditor,
} from './history-focus';
import {
  type EditableCompositionStateSetter,
  type EditableInputController,
  type EditableRepairRequest,
  isInteractiveInternalTarget,
  isNestedEditableDOMTarget,
  setEditableModelSelectionPreference,
} from './input-controller';
import {
  applyModelOwnedHistoryIntent,
  shouldForceRenderAfterModelOwnedHistory,
} from './model-input-strategy';
import {
  applyEditableCommand,
  consumeModelOwnedHistoryFocusRoot,
} from './mutation-controller';
import { Editor } from './runtime-editor-api';
import { readRuntimeSelection } from './runtime-selection-state';

export type EditableKeyDownResult = {
  handled: boolean;
  repair?: EditableRepairRequest | null;
};

const keyDownHandled = (
  repair?: EditableRepairRequest | null
): EditableKeyDownResult => ({ handled: true, repair });
const keyDownUnhandled = (): EditableKeyDownResult => ({ handled: false });

type TextDirection = 'ltr' | 'neutral' | 'rtl';

const RTL_SCRIPT_NAMES = [
  'Adlam',
  'Arabic',
  'Avestan',
  'Chorasmian',
  'Elymaic',
  'Hanifi_Rohingya',
  'Hatran',
  'Hebrew',
  'Imperial_Aramaic',
  'Inscriptional_Pahlavi',
  'Inscriptional_Parthian',
  'Lydian',
  'Mandaic',
  'Manichaean',
  'Mende_Kikakui',
  'Meroitic_Cursive',
  'Meroitic_Hieroglyphs',
  'Nabataean',
  'Nko',
  'Old_Hungarian',
  'Old_North_Arabian',
  'Old_Sogdian',
  'Old_South_Arabian',
  'Old_Uyghur',
  'Palmyrene',
  'Phoenician',
  'Psalter_Pahlavi',
  'Samaritan',
  'Sogdian',
  'Syriac',
  'Thaana',
  'Yezidi',
];

const createUnicodePropertyMatcher = (property: string) => {
  try {
    return new RegExp(`\\p{${property}}`, 'u');
  } catch {
    return null;
  }
};

const RTL_SCRIPT_MATCHERS = RTL_SCRIPT_NAMES.map((script) =>
  createUnicodePropertyMatcher(`Script=${script}`)
).filter((matcher): matcher is RegExp => matcher !== null);

const LETTER_MATCHER = createUnicodePropertyMatcher('L');

const isRTLScriptCharacter = (character: string) =>
  RTL_SCRIPT_MATCHERS.some((matcher) => matcher.test(character));

const isStrongLetterCharacter = (character: string) =>
  LETTER_MATCHER?.test(character) ?? false;

export const getTextDirection = (value: string): TextDirection => {
  for (const character of value) {
    if (isStrongLetterCharacter(character) && isRTLScriptCharacter(character)) {
      return 'rtl';
    }

    if (isStrongLetterCharacter(character)) {
      return 'ltr';
    }
  }

  return 'neutral';
};

const DEFAULT_MODEL_COMMAND_REPAIR: EditableRepairRequest = {
  focus: true,
  kind: 'repair-caret',
  selectionSourceTransition: {
    preferModelSelection: true,
    reason: 'model-command',
    selectionSource: 'model-owned',
  },
};

const getOwnerlessViewSelectionRange = (
  editor: ReactRuntimeEditor
): Range | null => {
  const viewSelection = readSlateViewSelection(editor);

  if (
    !viewSelection ||
    viewSelection.anchor.owner ||
    viewSelection.focus.owner
  ) {
    return null;
  }

  return {
    anchor: viewSelection.anchor.point,
    focus: viewSelection.focus.point,
  };
};

const isPlainTextKeyboardInput = (event: KeyboardEvent) =>
  event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey;

const selectionSpansNativeTextInputBoundary = ({
  editor,
  selection,
}: {
  editor: ReactRuntimeEditor;
  selection: Range | null;
}) => {
  if (!selection || !RangeApi.isExpanded(selection)) {
    return false;
  }

  return editor.read((state) =>
    state.nodes.some({
      at: selection,
      match: (node) =>
        NodeApi.isElement(node) &&
        (Editor.isInline(editor, node) ||
          Editor.isVoid(editor, node) ||
          Editor.isElementReadOnly(editor, node)),
      voids: true,
    })
  );
};

const getSelectionRootKey = (selection: Range | null): RootKey =>
  (selection?.anchor.root ?? selection?.focus.root ?? MAIN_ROOT_KEY) as RootKey;

const getTargetElement = (target: EventTarget | null) =>
  isDOMElement(target)
    ? target
    : isDOMText(target)
      ? target.parentElement
      : null;

const getNestedEditableRootKey = (
  editor: ReactRuntimeEditor,
  target: EventTarget | null
): RootKey | null => {
  const targetElement = getTargetElement(target);
  const targetEditor = targetElement?.closest('[data-slate-editor="true"]');

  if (!(targetEditor instanceof HTMLElement)) {
    return null;
  }

  let editorElement: HTMLElement;

  try {
    editorElement = ReactEditor.assertDOMNode(editor, editor);
  } catch {
    return null;
  }

  if (targetEditor === editorElement || !editorElement.contains(targetEditor)) {
    return null;
  }

  return (
    (targetEditor.getAttribute('data-slate-root') as RootKey | null) ?? null
  );
};

const qualifySelectionRoot = (
  selection: Range | null,
  root: RootKey | null
): Range | null => {
  if (!selection || !root || root === MAIN_ROOT_KEY) {
    return selection;
  }

  return {
    anchor: { ...selection.anchor, root: selection.anchor.root ?? root },
    focus: { ...selection.focus, root: selection.focus.root ?? root },
  };
};

const readNestedEditableDOMSelection = (
  nestedEditor: ReactRuntimeEditor
): Range | null => {
  let root: Document | ShadowRoot;

  try {
    root = ReactEditor.findDocumentOrShadowRoot(nestedEditor);
  } catch {
    return null;
  }

  const domSelection = getSelection(root);

  if (!domSelection || domSelection.rangeCount === 0) {
    return null;
  }

  if (
    !ReactEditor.hasSelectableTarget(nestedEditor, domSelection.anchorNode) ||
    !ReactEditor.hasSelectableTarget(nestedEditor, domSelection.focusNode)
  ) {
    return null;
  }

  return ReactEditor.resolveSlateRange(nestedEditor, domSelection, {
    exactMatch: false,
  });
};

const getNestedEditableSelectionContext = ({
  editor,
  getMountedViewEditor,
  target,
}: {
  editor: ReactRuntimeEditor;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  target: EventTarget | null;
}) => {
  const root = getNestedEditableRootKey(editor, target);
  const nestedEditor = root ? (getMountedViewEditor?.(root) ?? null) : null;
  const rawSelection = nestedEditor
    ? (readNestedEditableDOMSelection(nestedEditor) ??
      readRuntimeSelection(nestedEditor))
    : null;

  return {
    editor: nestedEditor,
    rawSelection,
    root,
    selection: qualifySelectionRoot(rawSelection, root),
  };
};

const isReadOnlyNativeEditingKey = (nativeEvent: KeyboardEvent) => {
  if (Hotkeys.isUndo(nativeEvent) || Hotkeys.isRedo(nativeEvent)) {
    return true;
  }

  const key = nativeEvent.key.toLowerCase();

  if (
    (nativeEvent.metaKey || nativeEvent.ctrlKey) &&
    (key === 'x' || key === 'v' || key === 'y' || key === 'z')
  ) {
    return true;
  }

  if (nativeEvent.metaKey || nativeEvent.ctrlKey || nativeEvent.altKey) {
    return false;
  }

  return (
    nativeEvent.key.length === 1 ||
    nativeEvent.key === 'Backspace' ||
    nativeEvent.key === 'Delete' ||
    nativeEvent.key === 'Enter'
  );
};

const getLastCommitSingleOperationRoot = (
  editor: ReactRuntimeEditor
): RootKey | null => {
  const commit = editor.read((state) => state.value.lastCommit());
  const roots = new Set(
    (commit?.operations ?? [])
      .filter((operation) => operation.type !== 'set_selection')
      .map(getOperationRoot)
  );

  return roots.size === 1 ? (roots.values().next().value ?? null) : null;
};

const getModelOwnedHistoryRepair = ({
  editor,
  getActiveContentRootOwner,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
}: {
  editor: ReactRuntimeEditor;
} & HistoryFocusOwnerApi): EditableRepairRequest => {
  const forceRender = shouldForceRenderAfterModelOwnedHistory(editor);
  const historyFocusRoot = consumeModelOwnedHistoryFocusRoot(editor);
  const selection = readRuntimeSelection(editor);
  const selectionRoot = selection ? getSelectionRootKey(selection) : null;
  const currentRoot = editor.read((state) => state.view.root());
  const focusEditor = resolveHistoryFocusEditor({
    currentRoot,
    editor,
    getActiveContentRootOwner,
    getContentRootOwnerViewEditor,
    getMountedViewEditor,
    historyRoot: historyFocusRoot ?? getLastCommitSingleOperationRoot(editor),
    selectionRoot,
  });

  if (focusEditor && focusEditor !== editor) {
    focusSlateEditable(focusEditor);
    scheduleSlateReactFocus(() => {
      focusSlateEditable(focusEditor);
    });

    return forceRender
      ? { forceRender, kind: 'force-render' }
      : { kind: 'none' };
  }

  const viewSelection = readSlateViewSelection(editor);
  if (viewSelection && !isSlateViewSelectionCollapsed(viewSelection)) {
    return forceRender
      ? { forceRender, kind: 'force-render' }
      : { kind: 'none' };
  }

  return {
    focus: true,
    forceRender,
    kind: 'repair-caret',
    selectionSourceTransition: {
      preferModelSelection: true,
      reason: 'model-command',
      selectionSource: 'model-owned',
    },
  };
};

const isPartialDOMStrategyRuntime = (domStrategyRuntime: unknown) =>
  typeof domStrategyRuntime === 'object' &&
  domStrategyRuntime !== null &&
  ((domStrategyRuntime as { type?: unknown }).type === 'partial-dom' ||
    (domStrategyRuntime as { type?: unknown }).type === 'staged' ||
    (domStrategyRuntime as { type?: unknown }).type === 'virtualized');

const getSelectionRoot = (selection: Range | null) => selection?.anchor.root;

const isCollapsedSelectionBackedByEditableTextDOM = ({
  editor,
  inputController,
  selection,
}: {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  selection: Range | null;
}) => {
  if (!selection || !RangeApi.isCollapsed(selection)) {
    return false;
  }

  let root: Document | ShadowRoot;

  try {
    root = ReactEditor.findDocumentOrShadowRoot(editor);
  } catch {
    return false;
  }

  const domSelection = getSelection(root);
  const anchorNode = domSelection?.anchorNode ?? null;
  const focusNode = domSelection?.focusNode ?? null;

  if (
    !domSelection?.isCollapsed ||
    !ReactEditor.hasSelectableTarget(editor, anchorNode) ||
    !ReactEditor.hasSelectableTarget(editor, focusNode)
  ) {
    return false;
  }

  const anchorElement = isDOMText(anchorNode)
    ? anchorNode.parentElement
    : isDOMElement(anchorNode)
      ? anchorNode
      : null;
  const textHost = anchorElement?.closest('[data-slate-node="text"]');
  const textHostPath = textHost?.getAttribute('data-slate-path');
  const domOffset = isDOMText(anchorNode) ? domSelection.anchorOffset : null;
  const pendingNativeTextInputRepairPathKey =
    inputController.state?.pendingNativeTextInputRepairPathKey ?? null;

  if (
    pendingNativeTextInputRepairPathKey &&
    textHostPath === pendingNativeTextInputRepairPathKey &&
    selection.anchor.path.join(',') === pendingNativeTextInputRepairPathKey
  ) {
    return true;
  }

  return (
    textHostPath === selection.anchor.path.join(',') &&
    domOffset === selection.anchor.offset
  );
};

export const shouldDeferBackspaceToNativeInput = ({
  isIOS = IS_IOS,
  language = typeof navigator === 'undefined' ? '' : navigator.language,
  nativeEvent,
}: {
  isIOS?: boolean;
  language?: string;
  nativeEvent: KeyboardEvent;
}) => isIOS && language === 'ko-KR' && Hotkeys.isDeleteBackward(nativeEvent);

const applyUserKeyDownHandler = ({
  editor,
  event,
  handler,
}: {
  editor: ReactRuntimeEditor;
  event: ReactKeyboardEvent<HTMLDivElement>;
  handler?: EditableKeyDownHandler;
}): EditableKeyDownResult => {
  if (!handler) {
    return keyDownUnhandled();
  }

  // The custom event handler may return a boolean to specify whether the event
  // shall be treated as being handled or not.
  const shouldTreatEventAsHandled = handler(event, { editor });

  if (shouldTreatEventAsHandled != null) {
    if (!shouldTreatEventAsHandled) {
      return keyDownUnhandled();
    }

    event.preventDefault();

    return keyDownHandled(
      shouldTreatEventAsHandled === true
        ? DEFAULT_MODEL_COMMAND_REPAIR
        : shouldTreatEventAsHandled
    );
  }

  return event.isDefaultPrevented() || event.isPropagationStopped()
    ? keyDownHandled()
    : keyDownUnhandled();
};

export const applyEditableKeyDown = ({
  androidInputManagerRef,
  editor,
  event,
  forceRender,
  inputController,
  domStrategyRuntime,
  onKeyDown,
  readOnly,
  getActiveContentRootOwner,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  setExplicitPartialDOMBackedSelection,
  setComposing,
  partialDOMBackedSelection,
}: {
  androidInputManagerRef: RefObject<AndroidInputManager | null | undefined>;
  editor: ReactRuntimeEditor;
  event: ReactKeyboardEvent<HTMLDivElement>;
  forceRender: () => void;
  inputController: EditableInputController;
  domStrategyRuntime: unknown;
  onKeyDown?: EditableKeyDownHandler;
  readOnly: boolean;
  getActiveContentRootOwner?: (root: RootKey) => {
    childRoot: RootKey;
    ownerPath: Path;
    ownerRoot: RootKey;
  } | null;
  getContentRootOwnerViewEditor?: (owner: {
    childRoot: RootKey;
    ownerPath: Path;
    ownerRoot: RootKey;
  }) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
  setExplicitPartialDOMBackedSelection: (nextValue: boolean) => void;
  setComposing: EditableCompositionStateSetter;
  partialDOMBackedSelection: boolean;
}): EditableKeyDownResult => {
  if (isInteractiveInternalTarget(editor, event.target)) {
    const { nativeEvent } = event;
    const nestedEditableTarget = (() => {
      try {
        return isNestedEditableDOMTarget(
          ReactEditor.assertDOMNode(editor, editor),
          event.target
        );
      } catch {
        return false;
      }
    })();
    const nestedSelectionContext = nestedEditableTarget
      ? getNestedEditableSelectionContext({
          editor,
          getMountedViewEditor,
          target: event.target,
        })
      : null;
    const selection =
      nestedSelectionContext?.selection ?? readRuntimeSelection(editor);
    const projectedCommand =
      nestedEditableTarget && readSlateViewSelection(editor)
        ? getEditableCommandFromKeyDown({
            event,
            selection,
          })
        : null;

    const selectionRoot = getSelectionRootKey(selection);
    const viewRoot = editor.read((state) => state.view.root());
    const shouldHandleProjectedSelection =
      nestedEditableTarget || selectionRoot !== viewRoot;

    if (shouldHandleProjectedSelection) {
      const focusEditor = nestedSelectionContext?.editor ?? editor;
      const focusSelection = nestedSelectionContext?.rawSelection ?? selection;
      const focusNode =
        focusSelection && Editor.hasPath(focusEditor, focusSelection.focus.path)
          ? NodeApi.parent(focusEditor, focusSelection.focus.path)
          : null;
      const isRTL = focusNode
        ? getTextDirection(NodeApi.string(focusNode)) === 'rtl'
        : false;
      const contentRootViewSelectionResult = applyContentRootViewSelection({
        editor,
        event,
        getActiveContentRootOwner,
        getContentRootOwnerViewEditor,
        getMountedViewEditor,
        isRTL,
        selection,
      });

      if (contentRootViewSelectionResult.handled) {
        return keyDownHandled({
          focus: true,
          forceRender: true,
          kind: 'sync-selection',
          selectionSourceTransition: {
            preferModelSelection: true,
            reason: 'model-command',
            selectionSource: 'model-owned',
          },
        });
      }
    }

    if (!readOnly && isEditableEditingEpochCommand(projectedCommand)) {
      event.preventDefault();
      event.stopPropagation();
      applyEditableCommand({ command: projectedCommand, editor });
      markEditableEditingEpochCommandHandled(editor, projectedCommand);

      return keyDownHandled(DEFAULT_MODEL_COMMAND_REPAIR);
    }

    if (!readOnly && Hotkeys.isRedo(nativeEvent)) {
      event.preventDefault();
      event.stopPropagation();

      if (
        applyModelOwnedHistoryIntent({
          direction: 'redo',
          editor,
        })
      ) {
        return keyDownHandled(
          getModelOwnedHistoryRepair({
            editor,
            getActiveContentRootOwner,
            getContentRootOwnerViewEditor,
            getMountedViewEditor,
          })
        );
      }

      return keyDownHandled();
    }

    if (!readOnly && Hotkeys.isUndo(nativeEvent)) {
      event.preventDefault();
      event.stopPropagation();

      if (
        applyModelOwnedHistoryIntent({
          direction: 'undo',
          editor,
        })
      ) {
        return keyDownHandled(
          getModelOwnedHistoryRepair({
            editor,
            getActiveContentRootOwner,
            getContentRootOwnerViewEditor,
            getMountedViewEditor,
          })
        );
      }

      return keyDownHandled();
    }

    event.stopPropagation();
    return keyDownHandled();
  }

  try {
    if (
      isNestedEditableDOMTarget(
        ReactEditor.assertDOMNode(editor, editor),
        event.target
      )
    ) {
      return keyDownUnhandled();
    }
  } catch {
    // Unit tests and unmounted editables can exercise the strategy without DOM.
  }

  if (readOnly && ReactEditor.hasEditableTarget(editor, event.target)) {
    if (isReadOnlyNativeEditingKey(event.nativeEvent)) {
      event.preventDefault();
      event.stopPropagation();
      return keyDownHandled({ forceRender: true, kind: 'force-render' });
    }

    return keyDownUnhandled();
  }

  if (!readOnly && ReactEditor.hasEditableTarget(editor, event.target)) {
    androidInputManagerRef.current?.handleKeyDown(event);

    const { nativeEvent } = event;

    // COMPAT: The composition end event isn't fired reliably in all browsers,
    // so we sometimes might end up stuck in a composition state even though we
    // aren't composing any more.
    if (ReactEditor.isComposing(editor) && nativeEvent.isComposing === false) {
      setComposing(false);
    }

    if (ReactEditor.isComposing(editor)) {
      return keyDownHandled();
    }

    const selection = readRuntimeSelection(editor);
    const selectionRoot = getSelectionRoot(selection);
    const viewRoot = editor.read((state) => state.view.root());

    if (
      selectionRoot &&
      selectionRoot !== viewRoot &&
      nativeEvent.key.length === 1 &&
      !nativeEvent.altKey &&
      !nativeEvent.ctrlKey &&
      !nativeEvent.metaKey
    ) {
      const targetEditor = getMountedViewEditor?.(selectionRoot);

      if (targetEditor) {
        event.preventDefault();
        applyEditableCommand({
          command: {
            inputType: 'insertText',
            kind: 'insert-text',
            text: nativeEvent.key,
          },
          editor: targetEditor,
        });
        focusSlateEditable(targetEditor);
        scheduleSlateReactFocus(() => {
          focusSlateEditable(targetEditor);
        });

        return keyDownHandled();
      }
    }

    const userKeyDownResult = applyUserKeyDownHandler({
      editor,
      event,
      handler: onKeyDown,
    });
    if (userKeyDownResult.handled) {
      return userKeyDownResult;
    }

    if (isSelectAllHotkey(nativeEvent)) {
      event.preventDefault();
      const previousIsUpdatingSelection =
        inputController.state.isUpdatingSelection;
      setEditableModelSelectionPreference({
        inputController,
        preferModelSelection: true,
        reason: 'model-command',
        selectionSource: 'model-owned',
      });
      inputController.state.isUpdatingSelection = true;
      inputController.state.selectionChangeOrigin = 'programmatic-export';
      applyEditableCommand({ command: { kind: 'select-all' }, editor });
      const partialDOMStrategyRuntime =
        isPartialDOMStrategyRuntime(domStrategyRuntime);
      if (partialDOMStrategyRuntime) {
        setEditableModelSelectionPreference({
          inputController,
          preferModelSelection: true,
          selectionSource: 'partial-dom-backed',
        });
      }
      setExplicitPartialDOMBackedSelection(partialDOMStrategyRuntime);
      forceRender();
      setTimeout(() => {
        if (
          inputController.state.selectionChangeOrigin === 'programmatic-export'
        ) {
          inputController.state.isUpdatingSelection =
            previousIsUpdatingSelection;
        }
      });
      return keyDownHandled();
    }

    if (
      selectionSpansNativeTextInputBoundary({ editor, selection }) &&
      isPlainTextKeyboardInput(nativeEvent)
    ) {
      event.preventDefault();
      applyEditableCommand({
        command: {
          inputType: 'insertText',
          kind: 'insert-text',
          text: nativeEvent.key,
        },
        editor,
      });
      return keyDownHandled(DEFAULT_MODEL_COMMAND_REPAIR);
    }

    const children = editor.read((state) => state.nodes.children());
    const element = children[selection === null ? 0 : selection.focus.path[0]];
    const isRTL = getTextDirection(NodeApi.string(element)) === 'rtl';

    // COMPAT: Since we prevent the default behavior on
    // `beforeinput` events, the browser doesn't think there's ever
    // any history stack to undo or redo, so we have to manage these
    // hotkeys ourselves. (2019/11/06)
    if (Hotkeys.isRedo(nativeEvent)) {
      event.preventDefault();

      if (
        applyModelOwnedHistoryIntent({
          direction: 'redo',
          editor,
        })
      ) {
        return keyDownHandled(
          getModelOwnedHistoryRepair({
            editor,
            getActiveContentRootOwner,
            getContentRootOwnerViewEditor,
            getMountedViewEditor,
          })
        );
      }

      return keyDownHandled();
    }

    if (Hotkeys.isUndo(nativeEvent)) {
      event.preventDefault();

      if (
        applyModelOwnedHistoryIntent({
          direction: 'undo',
          editor,
        })
      ) {
        return keyDownHandled(
          getModelOwnedHistoryRepair({
            editor,
            getActiveContentRootOwner,
            getContentRootOwnerViewEditor,
            getMountedViewEditor,
          })
        );
      }

      return keyDownHandled();
    }

    if (
      isPartialDOMStrategyRuntime(domStrategyRuntime) &&
      partialDOMBackedSelection &&
      !isCollapsedSelectionBackedByEditableTextDOM({
        editor,
        inputController,
        selection,
      }) &&
      selection &&
      nativeEvent.key.length === 1 &&
      !nativeEvent.altKey &&
      !nativeEvent.ctrlKey &&
      !nativeEvent.metaKey
    ) {
      event.preventDefault();
      applyEditableCommand({
        command: {
          inputType: 'insertText',
          kind: 'insert-text',
          text: nativeEvent.key,
        },
        editor,
      });
      return keyDownHandled({
        focus: true,
        kind: 'repair-caret-after-text-insert',
        selectionSourceTransition: {
          preferModelSelection: true,
          reason: 'model-command',
          selectionSource: 'model-owned',
        },
      });
    }

    const largeDocumentVerticalSelection =
      getOwnerlessViewSelectionRange(editor) ?? selection;

    if (
      shouldModelOwnPlainVerticalLargeDocumentExtension({
        domStrategyRuntime,
        editor,
        event: nativeEvent,
        selection: largeDocumentVerticalSelection,
      })
    ) {
      const caretMovementResult = applyEditableCaretMovement({
        domStrategyRuntime,
        editor,
        event,
        isRTL,
        selection: largeDocumentVerticalSelection,
      });

      if (caretMovementResult.handled) {
        return keyDownHandled(caretMovementResult.repair);
      }
    }

    const contentRootViewSelectionResult = applyContentRootViewSelection({
      editor,
      event,
      getActiveContentRootOwner,
      getContentRootOwnerViewEditor,
      getMountedViewEditor,
      isRTL,
      selection,
    });

    if (contentRootViewSelectionResult.handled) {
      return keyDownHandled({
        focus: true,
        kind: 'sync-selection',
        selectionSourceTransition: {
          preferModelSelection: true,
          reason: 'model-command',
          selectionSource: 'model-owned',
        },
      });
    }

    const contentRootNavigationResult = applyContentRootNavigation({
      editor,
      event,
      focusEditor: focusSlateEditable,
      getActiveContentRootOwner,
      getContentRootOwnerViewEditor,
      getMountedViewEditor,
      isRTL,
      selection,
    });

    if (contentRootNavigationResult.handled) {
      return keyDownHandled();
    }

    const caretMovementResult = applyEditableCaretMovement({
      domStrategyRuntime,
      editor,
      event,
      isRTL,
      selection,
    });

    if (caretMovementResult.handled) {
      return keyDownHandled(caretMovementResult.repair);
    }

    const keyDownCommand = getEditableCommandFromKeyDown({
      event,
      selection,
    });

    if (
      keyDownCommand?.kind === 'delete' &&
      keyDownCommand.direction === 'backward' &&
      shouldDeferBackspaceToNativeInput({ nativeEvent })
    ) {
      return keyDownUnhandled();
    }

    if (isDestructiveEditableCommand(keyDownCommand)) {
      event.preventDefault();
      applyEditableCommand({ command: keyDownCommand, editor });
      markEditableEditingEpochCommandHandled(editor, keyDownCommand);

      return keyDownHandled({
        focus: true,
        kind: 'repair-caret',
        selectionSourceTransition: {
          preferModelSelection: true,
          reason: 'model-command',
          selectionSource: 'model-owned',
        },
      });
    }

    if (keyDownCommand?.kind === 'insert-break') {
      event.preventDefault();
      applyEditableCommand({ command: keyDownCommand, editor });
      markEditableEditingEpochCommandHandled(editor, keyDownCommand);

      return keyDownHandled({
        focus: true,
        forceRender: true,
        kind: 'repair-caret',
        selectionSourceTransition: {
          preferModelSelection: true,
          reason: 'model-command',
          selectionSource: 'model-owned',
        },
      });
    }

    // COMPAT: Certain browsers don't support the `beforeinput` event, so we
    // fall back to guessing at the input intention for hotkeys.
    // COMPAT: In iOS, some of these hotkeys are handled in the
    if (HAS_BEFORE_INPUT_SUPPORT) {
      if (IS_CHROME || IS_WEBKIT) {
        // COMPAT: Chrome and Safari support `beforeinput` event but do not fire
        // an event when deleting backwards in a selected void inline node
        const currentNode =
          selection && RangeApi.isCollapsed(selection)
            ? NodeApi.parent(editor, selection.anchor.path)
            : null;
        const isDeleteForward = Hotkeys.isDeleteForward(nativeEvent);

        if (
          selection &&
          (Hotkeys.isDeleteBackward(nativeEvent) || isDeleteForward) &&
          RangeApi.isCollapsed(selection) &&
          currentNode &&
          NodeApi.isElement(currentNode) &&
          Editor.isVoid(editor, currentNode) &&
          (Editor.isInline(editor, currentNode) ||
            Editor.isBlock(editor, currentNode))
        ) {
          event.preventDefault();
          applyEditableCommand({
            command: {
              direction: isDeleteForward ? 'forward' : 'backward',
              kind: 'delete',
              unit: 'block',
            },
            editor,
          });

          return keyDownHandled();
        }
      }
    } else {
      const fallbackCommand = getEditableCommandFromKeyDown({
        event,
        selection,
      });

      if (
        selection &&
        RangeApi.isExpanded(selection) &&
        isPlainTextKeyboardInput(nativeEvent) &&
        !ReactEditor.isComposing(editor)
      ) {
        event.preventDefault();
        applyEditableCommand({
          command: {
            inputType: 'insertText',
            kind: 'insert-text',
            text: nativeEvent.key,
          },
          editor,
        });
        return keyDownHandled(DEFAULT_MODEL_COMMAND_REPAIR);
      }

      // We don't have a core behavior for these, but they change the
      // DOM if we don't prevent them, so we have to.
      if (Hotkeys.isBold(nativeEvent) || Hotkeys.isItalic(nativeEvent)) {
        event.preventDefault();
        return keyDownHandled();
      }

      if (Hotkeys.isTransposeCharacter(nativeEvent)) {
        event.preventDefault();
        applyEditableCommand({
          command: { kind: 'transpose-character' },
          editor,
        });
        return keyDownHandled(DEFAULT_MODEL_COMMAND_REPAIR);
      }

      if (Hotkeys.isSoftBreak(nativeEvent)) {
        event.preventDefault();
        if (fallbackCommand) {
          applyEditableCommand({ command: fallbackCommand, editor });
        }
        return keyDownHandled();
      }

      if (
        Hotkeys.isSplitBlock(nativeEvent) ||
        Hotkeys.isOpenLine(nativeEvent)
      ) {
        event.preventDefault();
        if (fallbackCommand) {
          applyEditableCommand({ command: fallbackCommand, editor });
        }
        return keyDownHandled();
      }

      if (Hotkeys.isDeleteBackward(nativeEvent)) {
        event.preventDefault();
        if (fallbackCommand) {
          applyEditableCommand({ command: fallbackCommand, editor });
        }

        return keyDownHandled();
      }

      if (Hotkeys.isDeleteForward(nativeEvent)) {
        event.preventDefault();
        if (fallbackCommand) {
          applyEditableCommand({ command: fallbackCommand, editor });
        }

        return keyDownHandled();
      }

      if (Hotkeys.isDeleteLineBackward(nativeEvent)) {
        event.preventDefault();
        if (fallbackCommand) {
          applyEditableCommand({ command: fallbackCommand, editor });
        }

        return keyDownHandled();
      }

      if (Hotkeys.isDeleteLineForward(nativeEvent)) {
        event.preventDefault();
        if (fallbackCommand) {
          applyEditableCommand({ command: fallbackCommand, editor });
        }

        return keyDownHandled();
      }

      if (Hotkeys.isDeleteWordBackward(nativeEvent)) {
        event.preventDefault();
        if (fallbackCommand) {
          applyEditableCommand({ command: fallbackCommand, editor });
        }

        return keyDownHandled();
      }

      if (Hotkeys.isDeleteWordForward(nativeEvent)) {
        event.preventDefault();
        if (fallbackCommand) {
          applyEditableCommand({ command: fallbackCommand, editor });
        }

        return keyDownHandled();
      }
    }
  }

  return keyDownUnhandled();
};
