import {
  type ClipboardEvent,
  type CompositionEvent,
  type DragEvent,
  type FocusEvent,
  type ForwardedRef,
  type KeyboardEvent,
  type MouseEvent,
  type InputEvent as ReactInputEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { type Path, type Range, RangeApi } from '@platejs/plite';
import {
  getSelection,
  HAS_BEFORE_INPUT_SUPPORT,
  isDOMElement,
  isDOMText,
} from '@platejs/plite-dom';
import {
  EDITOR_TO_ELEMENT,
  NODE_TO_ELEMENT,
} from '@platejs/plite-dom/internal';
import {
  getPliteNodeElementByPath,
  getPliteNodePathFromDOMElement,
} from '../hooks/use-plite-node-ref';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { recordPliteReactRender } from '../render-profiler';
import { isInteractiveInternalTarget } from './input-controller';
import type { EditableInputController } from './input-state';
import { getNativeTextInsertDelta } from './native-text-input-delta';
import { readRuntimeText } from './runtime-live-state';
import { readRuntimeSelection } from './runtime-selection-state';
import { armModelOwnedTextInputGuard } from './selection-controller';

type MutableRefBox<T> = {
  current: T;
};

type CancelableCallback = {
  cancel: () => void;
};

type DeferredTextInputRepair = {
  pathKey: string | null;
  repair: () => boolean;
  source: 'beforeinput' | 'input';
  target: DOMInputRepairTarget | null;
};

const DEFERRED_NATIVE_TEXT_INPUT_REPAIR_IDLE_MS = 1;
const DEFERRED_NATIVE_TEXT_INPUT_REPAIR_MAX_MS = 120;

const now = () => globalThis.performance?.now?.() ?? Date.now();

const profileDOMInputDuration = <T>(id: string, callback: () => T): T => {
  if (!globalThis.__PLITE_REACT_RENDER_PROFILER__) {
    return callback();
  }

  const start = now();

  try {
    return callback();
  } finally {
    recordPliteReactRender({
      duration: now() - start,
      id,
      kind: 'runtime-time',
    });
  }
};

const applyTextInsert = (
  text: string,
  insert: {
    offset: number;
    text: string;
  }
) => text.slice(0, insert.offset) + insert.text + text.slice(insert.offset);

const getCoalescedDeferredTextInputRepairTarget = ({
  data,
  pathKey,
  previousRepair,
  target,
}: {
  data: string;
  pathKey: string | null;
  previousRepair: DeferredTextInputRepair | undefined;
  target: DOMInputRepairTarget | null;
}) => {
  if (
    !pathKey ||
    !target ||
    !previousRepair?.target ||
    previousRepair.pathKey !== pathKey
  ) {
    return null;
  }

  if (
    previousRepair.source === 'beforeinput' &&
    previousRepair.target.insert &&
    target.insert &&
    target.insert.offset === previousRepair.target.insert.offset &&
    target.insert.text === previousRepair.target.insert.text
  ) {
    return target;
  }

  if (previousRepair.target.insert) {
    const expectedText = applyTextInsert(previousRepair.target.text, {
      offset: previousRepair.target.selectionOffset,
      text: data,
    });
    const selectionInsidePendingInsert =
      target.selectionOffset >=
        previousRepair.target.selectionOffset - data.length &&
      target.selectionOffset <= previousRepair.target.selectionOffset;

    if (selectionInsidePendingInsert && target.text === expectedText) {
      return {
        ...target,
        insert: {
          offset: previousRepair.target.insert.offset,
          text: previousRepair.target.insert.text + data,
        },
        preferCapturedInsert: true,
        selectionOffset: previousRepair.target.selectionOffset + data.length,
        text: expectedText,
      };
    }
  }

  const selectionAdvance =
    target.selectionOffset - previousRepair.target.selectionOffset;

  if (
    previousRepair.target.insert &&
    selectionAdvance >= data.length &&
    selectionAdvance <= data.length + 1
  ) {
    return {
      ...target,
      insert: {
        offset: previousRepair.target.insert.offset,
        text: previousRepair.target.insert.text + data,
      },
      preferCapturedInsert: true,
    };
  }

  const insertOffset = target.selectionOffset - data.length;

  if (target.insert && previousRepair.target.insert) {
    return target.insert.offset === previousRepair.target.insert.offset &&
      target.insert.text.startsWith(previousRepair.target.insert.text)
      ? target
      : null;
  }

  return insertOffset === previousRepair.target.selectionOffset &&
    target.text ===
      previousRepair.target.text.slice(0, insertOffset) +
        data +
        previousRepair.target.text.slice(insertOffset)
    ? target
    : null;
};

const isDeferredTextInputContinuationSelection = ({
  previousTarget,
  selectionOffset,
}: {
  previousTarget: DOMInputRepairTarget;
  selectionOffset: number;
}) =>
  previousTarget.insert &&
  selectionOffset >= previousTarget.insert.offset &&
  selectionOffset <= previousTarget.selectionOffset;

const shouldReplacePreviousDeferredTextInputRepair = ({
  pathKey,
  previousRepair,
  target,
}: {
  pathKey: string | null;
  previousRepair: DeferredTextInputRepair | undefined;
  target: DOMInputRepairTarget;
}) =>
  !!pathKey &&
  previousRepair?.pathKey === pathKey &&
  !!previousRepair.target?.insert &&
  !!target.insert &&
  target.insert.offset === previousRepair.target.insert.offset &&
  target.insert.text.startsWith(previousRepair.target.insert.text);

const getExpectedDeferredTextInputRepairTarget = ({
  data,
  editor,
  previousRepair,
  rootElement,
  selection,
}: {
  data: string;
  editor: ReactRuntimeEditor;
  previousRepair: DeferredTextInputRepair | undefined;
  rootElement: HTMLElement;
  selection: Range | null;
}) => {
  if (!selection || !RangeApi.isCollapsed(selection)) {
    return null;
  }

  const path = selection.anchor.path;
  const pathKey = path.join(',');
  const previousTarget =
    previousRepair?.pathKey === pathKey ? previousRepair.target : null;

  if (
    previousTarget?.insert &&
    isDeferredTextInputContinuationSelection({
      previousTarget,
      selectionOffset: selection.anchor.offset,
    })
  ) {
    const insert = {
      offset: previousTarget.insert.offset,
      text: previousTarget.insert.text + data,
    };
    const selectionOffset = previousTarget.selectionOffset + data.length;

    return {
      ...previousTarget,
      insert,
      preferCapturedInsert: true,
      selectionOffset,
      text: applyTextInsert(previousTarget.text, {
        offset: previousTarget.selectionOffset,
        text: data,
      }),
    };
  }

  const pathAttribute = path.join(',');
  const textHost =
    getPliteNodeElementByPath(editor, path) ??
    rootElement.querySelector<HTMLElement>(
      `[data-plite-node="text"][data-plite-path="${pathAttribute}"]`
    );
  const pliteText = readRuntimeText(editor, path);
  const text = textHost?.textContent?.replace(/\uFEFF/g, '') ?? pliteText?.text;

  if (!textHost || text == null || !rootElement.contains(textHost)) {
    return null;
  }

  const insert = {
    offset: selection.anchor.offset,
    text: data,
  };

  return {
    insert,
    path: [...path] as Path,
    preferCapturedInsert: true,
    selectionOffset: selection.anchor.offset + data.length,
    text: applyTextInsert(text, insert),
  };
};

const createDOMInputRepair =
  ({
    inputType,
    data,
    repairDOMInput,
    rootElement,
    target,
  }: {
    data: string | null;
    inputType: string;
    repairDOMInput: RepairDOMInput;
    rootElement: HTMLElement;
    target: DOMInputRepairTarget | null;
  }) =>
  () => {
    if (!rootElement.isConnected) {
      return false;
    }

    repairDOMInput(
      {
        data,
        inputType,
        target,
      },
      rootElement
    );

    return true;
  };

export type DOMInputRepairTarget = {
  insert?: {
    offset: number;
    text: string;
  };
  path: Path;
  preferCapturedInsert?: boolean;
  selectionOffset: number;
  text: string;
};

export type RepairDOMInput = (
  nativeInput: {
    data: string | null;
    inputType: string;
    target?: DOMInputRepairTarget | null;
  },
  rootElement: HTMLElement
) => void;

export const repairPendingNativeTextInputModelSelection = ({
  editor,
  expectedTarget,
  inputController,
}: {
  editor: ReactRuntimeEditor;
  expectedTarget?: DOMInputRepairTarget | null;
  inputController?: EditableInputController;
}) => {
  const pathKey = inputController?.state.pendingNativeTextInputRepairPathKey;
  const offset = inputController?.state.pendingNativeTextInputRepairOffset;

  if (!pathKey || offset == null) {
    return false;
  }

  if (
    expectedTarget &&
    (expectedTarget.path.join(',') !== pathKey ||
      expectedTarget.selectionOffset !== offset ||
      readRuntimeText(editor, expectedTarget.path)?.text !==
        expectedTarget.text)
  ) {
    return false;
  }

  const selection = readRuntimeSelection(editor);

  if (
    !selection ||
    !RangeApi.isCollapsed(selection) ||
    selection.anchor.path.join(',') !== pathKey
  ) {
    return false;
  }

  if (selection.anchor.offset === offset) {
    if (inputController) {
      armModelOwnedTextInputGuard({ inputController });
    }
    return true;
  }

  const path = [...selection.anchor.path];

  editor.update((tx) => {
    tx.selection.set({
      anchor: { path, offset },
      focus: { path, offset },
    });
  });

  if (inputController) {
    armModelOwnedTextInputGuard({ inputController });
  }

  return true;
};

export type HandleEditablePaste = (
  event: ClipboardEvent<HTMLDivElement>
) => void;

export type HandleEditableClipboard = (
  event: ClipboardEvent<HTMLDivElement>
) => void;

export type HandleEditableDrag = (event: DragEvent<HTMLDivElement>) => void;

export type HandleEditableComposition = (
  event: CompositionEvent<HTMLDivElement>
) => void;

export type HandleEditableInput = (
  event: ReactInputEvent<HTMLDivElement>
) => void;

export type HandleEditableDOMBeforeInput = (event: InputEvent) => void;

export type HandleEditableReactBeforeInputFallback = (text: string) => void;

export type HandleEditableFocus = (event: FocusEvent<HTMLDivElement>) => void;

export type HandleEditableMouse = (event: MouseEvent<HTMLDivElement>) => void;

export type HandleEditableKeyboard = (
  event: KeyboardEvent<HTMLDivElement>
) => void;

export type EditableDragLifecycleState = {
  draggedBlock: boolean;
  draggedRange: Range | null;
  isDraggingInternally: boolean;
};

const getReadOnlyDOMStringLengths = ({
  nativeInput,
  rootElement,
  strings,
  text,
}: {
  nativeInput: { data: string | null; inputType: string };
  rootElement: HTMLElement;
  strings: readonly HTMLElement[];
  text: string;
}) => {
  const lengths = strings.map((string) => string.textContent?.length ?? 0);
  const extraLength =
    lengths.reduce((sum, length) => sum + length, 0) - text.length;

  if (
    extraLength <= 0 ||
    nativeInput.inputType !== 'insertText' ||
    !nativeInput.data
  ) {
    return lengths;
  }

  const selection = rootElement.ownerDocument.getSelection();
  const selectionElement =
    selection?.anchorNode instanceof Element
      ? selection.anchorNode
      : selection?.anchorNode?.parentElement;
  const selectedString = selectionElement?.closest(
    '[data-plite-string="true"]'
  );
  const selectedIndex =
    selectedString instanceof HTMLElement
      ? strings.indexOf(selectedString)
      : -1;
  const fallbackIndex = strings.findIndex((string) =>
    string.textContent?.includes(nativeInput.data!)
  );
  const targetIndex = selectedIndex >= 0 ? selectedIndex : fallbackIndex;

  if (targetIndex >= 0) {
    lengths[targetIndex] = Math.max(0, lengths[targetIndex]! - extraLength);
  }

  return lengths;
};

const getTextHostSelectionOffset = ({
  anchorNode,
  anchorOffset,
  textHost,
}: {
  anchorNode: Node | null;
  anchorOffset: number | null;
  textHost: Element;
}) => {
  if (anchorOffset == null || !anchorNode) {
    return null;
  }

  const strings = Array.from(
    textHost.querySelectorAll('[data-plite-string], [data-plite-zero-width]')
  );
  let offset = 0;

  for (const string of strings) {
    const textNode = Array.from(string.childNodes).find(isDOMText);
    const lengthAttribute = string.getAttribute('data-plite-length');
    const length =
      lengthAttribute == null
        ? (textNode?.textContent?.length ?? string.textContent?.length ?? 0)
        : Number.parseInt(lengthAttribute, 10);
    const safeLength = Number.isFinite(length) ? length : 0;

    if (anchorNode === textNode || string.contains(anchorNode)) {
      return offset + Math.max(0, Math.min(anchorOffset, safeLength));
    }

    offset += safeLength;
  }

  return null;
};

const getDOMInputRepairInsert = ({
  editor,
  nativeInput,
  path,
  selectionOffset,
  text,
}: {
  editor: ReactRuntimeEditor;
  nativeInput?: { data: string | null; inputType: string };
  path: Path;
  selectionOffset: number;
  text: string;
}) => {
  if (
    nativeInput?.inputType !== 'insertText' ||
    typeof nativeInput.data !== 'string' ||
    nativeInput.data.length === 0
  ) {
    return;
  }

  const pliteNode = readRuntimeText(editor, path);

  if (!pliteNode || text === pliteNode.text) {
    return;
  }

  const insert = getNativeTextInsertDelta({
    inputText: nativeInput.data,
    selectionOffset,
    pliteText: pliteNode.text,
    textHostText: text,
  });

  return insert.text.length === 0 ? undefined : insert;
};

const getRuntimeDOMInputRepairTarget = ({
  editor,
  nativeInput,
  rootElement,
  selection,
}: {
  editor: ReactRuntimeEditor;
  nativeInput?: { data: string | null; inputType: string };
  rootElement: HTMLElement;
  selection: Range | null;
}): DOMInputRepairTarget | null => {
  if (!selection || !RangeApi.isCollapsed(selection)) {
    return null;
  }

  const path = selection.anchor.path;
  const pathAttribute = path.join(',');
  const textHost =
    getPliteNodeElementByPath(editor, path) ??
    rootElement.querySelector<HTMLElement>(
      `[data-plite-node="text"][data-plite-path="${pathAttribute}"]`
    );
  const pliteText = readRuntimeText(editor, path);

  if (!textHost || !pliteText || !rootElement.contains(textHost)) {
    return null;
  }

  const nativeText =
    nativeInput?.inputType === 'insertText' &&
    typeof nativeInput.data === 'string'
      ? nativeInput.data
      : '';
  const insert =
    nativeText.length > 0
      ? {
          offset: selection.anchor.offset,
          text: nativeText,
        }
      : undefined;
  const selectionOffset = selection.anchor.offset + nativeText.length;

  return {
    ...(insert ? { insert, preferCapturedInsert: true } : {}),
    path: [...path] as Path,
    selectionOffset,
    text: insert ? applyTextInsert(pliteText.text, insert) : pliteText.text,
  };
};

const shouldPreferRuntimeTextInputRepairTarget = ({
  editor,
  inputController,
  nativeInput,
}: {
  editor: ReactRuntimeEditor;
  inputController?: EditableInputController;
  nativeInput: { data: string | null; inputType: string };
}) => {
  if (
    nativeInput.inputType !== 'insertText' ||
    typeof nativeInput.data !== 'string' ||
    nativeInput.data.length === 0 ||
    !inputController
  ) {
    return false;
  }

  if (
    inputController.state.selectionSource === 'dom-current' &&
    inputController.state.selectionChangeOrigin === 'native-user'
  ) {
    return false;
  }

  const selection = readRuntimeSelection(editor);

  if (!selection || !RangeApi.isCollapsed(selection)) {
    return false;
  }

  const pathKey = selection.anchor.path.join(',');
  const text = readRuntimeText(editor, selection.anchor.path)?.text;

  if (text == null) {
    return false;
  }

  const pendingRepairMatches =
    inputController.state.pendingNativeTextInputRepairPathKey === pathKey &&
    inputController.state.pendingNativeTextInputRepairOffset ===
      selection.anchor.offset;
  const recentEcho = inputController.state.recentTextInputRepairEcho;
  const recentEchoMatches =
    !!recentEcho &&
    now() <= recentEcho.expiresAt &&
    recentEcho.pathKey === pathKey &&
    recentEcho.selectionOffset === selection.anchor.offset &&
    recentEcho.text === text;
  const modelOwnsTextInput =
    (inputController.state.modelOwnedTextInputGuard ?? 0) > 0 ||
    (inputController.preferModelSelectionForInputRef.current &&
      inputController.state.selectionSource === 'model-owned');

  return modelOwnsTextInput || pendingRepairMatches || recentEchoMatches;
};

export const getDOMInputRepairTarget = (
  editor: ReactRuntimeEditor,
  rootElement: HTMLElement,
  nativeInput?: { data: string | null; inputType: string },
  options: { preferRuntimeSelection?: boolean } = {}
): DOMInputRepairTarget | null => {
  const rootNode = rootElement.getRootNode?.() ?? rootElement.ownerDocument;
  const root =
    'getSelection' in rootNode
      ? (rootNode as Document | ShadowRoot)
      : rootElement.ownerDocument;
  const domSelection = getSelection(root);
  const anchorNode = domSelection?.anchorNode ?? null;
  const anchorOffset = domSelection?.anchorOffset ?? null;
  const textHost = isDOMText(anchorNode)
    ? anchorNode.parentElement?.closest('[data-plite-node="text"]')
    : isDOMElement(anchorNode)
      ? anchorNode.closest('[data-plite-node="text"]')
      : null;
  const path = textHost ? getPliteNodePathFromDOMElement(textHost) : null;
  const runtimeSelection = readRuntimeSelection(editor);
  const runtimePath =
    runtimeSelection && RangeApi.isCollapsed(runtimeSelection)
      ? runtimeSelection.anchor.path
      : null;
  const nativeTextLength =
    nativeInput?.inputType === 'insertText' &&
    typeof nativeInput.data === 'string'
      ? nativeInput.data.length
      : 0;
  const selectionOffset = textHost
    ? getTextHostSelectionOffset({ anchorNode, anchorOffset, textHost })
    : null;
  const text = textHost?.textContent?.replace(/\uFEFF/g, '') ?? null;

  const canUseDOMTarget =
    !!path &&
    !!textHost &&
    selectionOffset != null &&
    text != null &&
    rootElement.contains(textHost);

  if (options.preferRuntimeSelection) {
    const runtimeTarget = getRuntimeDOMInputRepairTarget({
      editor,
      nativeInput,
      rootElement,
      selection: runtimeSelection,
    });

    if (runtimeTarget) {
      return runtimeTarget;
    }
  }

  if (
    canUseDOMTarget &&
    path &&
    textHost &&
    selectionOffset != null &&
    text != null
  ) {
    const targetPath = [...path] as Path;
    const insert = getDOMInputRepairInsert({
      editor,
      nativeInput,
      path: targetPath,
      selectionOffset,
      text,
    });

    return {
      ...(insert ? { insert } : {}),
      path: targetPath,
      selectionOffset,
      text,
    };
  }

  if (runtimePath) {
    const runtimeTextHost = getPliteNodeElementByPath(editor, runtimePath);
    const runtimeText =
      runtimeTextHost?.textContent?.replace(/\uFEFF/g, '') ?? null;

    if (
      runtimeTextHost &&
      runtimeText != null &&
      rootElement.contains(runtimeTextHost) &&
      readRuntimeText(editor, runtimePath)
    ) {
      const targetPath = [...runtimePath] as Path;
      const selectionOffset =
        runtimeSelection!.anchor.offset + nativeTextLength;
      const insert = getDOMInputRepairInsert({
        editor,
        nativeInput,
        path: targetPath,
        selectionOffset,
        text: runtimeText,
      });

      return {
        ...(insert ? { insert } : {}),
        path: targetPath,
        selectionOffset,
        text: runtimeText,
      };
    }
  }

  return null;
};

const restoreReadOnlyDOMText = ({
  editor,
  nativeInput,
  rootElement,
}: {
  editor: ReactRuntimeEditor;
  nativeInput: { data: string | null; inputType: string };
  rootElement: HTMLElement;
}) => {
  rootElement
    .querySelectorAll<HTMLElement>('[data-plite-node="text"]')
    .forEach((textElement) => {
      const path = getPliteNodePathFromDOMElement(textElement);
      const pliteText = path ? readRuntimeText(editor, path)?.text : null;

      if (pliteText == null) {
        return;
      }

      const strings = Array.from(
        textElement.querySelectorAll<HTMLElement>('[data-plite-string="true"]')
      );

      if (strings.length === 0) {
        return;
      }

      const lengths = getReadOnlyDOMStringLengths({
        nativeInput,
        rootElement,
        strings,
        text: pliteText,
      });
      let offset = 0;

      strings.forEach((stringElement, index) => {
        const length =
          index === strings.length - 1
            ? pliteText.length - offset
            : Math.max(
                0,
                Math.min(lengths[index] ?? 0, pliteText.length - offset)
              );
        const nextText = pliteText.slice(offset, offset + length);

        if (stringElement.textContent !== nextText) {
          stringElement.textContent = nextText;
        }
        offset += length;
      });
    });
};

export const attachEditableGlobalDragLifecycleListeners = ({
  state,
  targetDocument,
}: {
  state: EditableDragLifecycleState;
  targetDocument: Document;
}) => {
  // Listen for dragend and drop globally. In Firefox, if a drop handler
  // initiates an operation that causes the originally dragged element to
  // unmount, that element will not emit a dragend event. (2024/06/21)
  const stoppedDragging = () => {
    state.draggedBlock = false;
    state.draggedRange = null;
    state.isDraggingInternally = false;
  };
  targetDocument.addEventListener('dragend', stoppedDragging);
  targetDocument.addEventListener('drop', stoppedDragging);

  return () => {
    targetDocument.removeEventListener('dragend', stoppedDragging);
    targetDocument.removeEventListener('drop', stoppedDragging);
  };
};

export const attachEditableNativeInputListeners = ({
  node,
  onDOMBeforeInput,
  onDOMInput,
}: {
  node: HTMLElement;
  onDOMBeforeInput: (event: InputEvent) => void;
  onDOMInput: (event: Event) => void;
}) => {
  // Attach a native DOM event handler for `beforeinput` events, because React's
  // built-in `onBeforeInput` is actually a leaky polyfill that doesn't expose
  // real `beforeinput` events sadly... (2019/11/04)
  // https://github.com/facebook/react/issues/11211
  // `beforeinput` is attached directly because React's polyfill does
  // not expose the real event on this path.
  node.addEventListener('beforeinput', onDOMBeforeInput);
  node.addEventListener('input', onDOMInput);

  return () => {
    // `beforeinput` is attached directly because React's polyfill does
    // not expose the real event on this path.
    node.removeEventListener('beforeinput', onDOMBeforeInput);
    node.removeEventListener('input', onDOMInput);
  };
};

export const useEditableRootRef = ({
  detachNativeInputListenersRef,
  editor,
  forwardedRef,
  onDOMBeforeInput,
  onDOMInput,
  onDOMSelectionChange,
  rootRef,
  scheduleOnDOMSelectionChange,
}: {
  detachNativeInputListenersRef: MutableRefBox<(() => void) | null>;
  editor: ReactRuntimeEditor;
  forwardedRef?: ForwardedRef<HTMLDivElement>;
  onDOMBeforeInput: (event: InputEvent) => void;
  onDOMInput: (event: Event) => void;
  onDOMSelectionChange: CancelableCallback;
  rootRef: MutableRefBox<HTMLDivElement | null>;
  scheduleOnDOMSelectionChange: CancelableCallback;
}) => {
  const [nativeInputHandlers] = useState(() => {
    const handlers = {
      onDOMBeforeInput: null as ((event: InputEvent) => void) | null,
      onDOMInput: null as ((event: Event) => void) | null,
      handleDOMBeforeInput(event: InputEvent) {
        handlers.onDOMBeforeInput?.(event);
      },
      handleDOMInput(event: Event) {
        handlers.onDOMInput?.(event);
      },
    };

    return handlers;
  });

  nativeInputHandlers.onDOMBeforeInput = onDOMBeforeInput;
  nativeInputHandlers.onDOMInput = onDOMInput;

  return useCallback(
    (node: HTMLDivElement | null) => {
      if (node == null) {
        onDOMSelectionChange.cancel();
        scheduleOnDOMSelectionChange.cancel();

        EDITOR_TO_ELEMENT.delete(editor);
        NODE_TO_ELEMENT.delete(editor);

        if (rootRef.current) {
          detachNativeInputListenersRef.current?.();
          detachNativeInputListenersRef.current = null;
        }
      } else {
        detachNativeInputListenersRef.current =
          attachEditableNativeInputListeners({
            node,
            onDOMBeforeInput: nativeInputHandlers.handleDOMBeforeInput,
            onDOMInput: nativeInputHandlers.handleDOMInput,
          });
      }
      rootRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [
      detachNativeInputListenersRef,
      editor,
      forwardedRef,
      nativeInputHandlers,
      onDOMSelectionChange,
      rootRef,
      scheduleOnDOMSelectionChange,
    ]
  );
};

export const useEditableDOMInputHandler = ({
  deferNativeTextInputRepair = false,
  editor,
  inputController,
  onHandledDOMInput,
  onReadOnlyDOMInput,
  repairDOMInput,
  readOnly,
  rootRef,
}: {
  deferNativeTextInputRepair?: boolean;
  editor: ReactRuntimeEditor;
  inputController?: EditableInputController;
  onHandledDOMInput?: (event: Event) => void;
  onReadOnlyDOMInput?: () => void;
  repairDOMInput: RepairDOMInput;
  readOnly: boolean;
  rootRef: RefObject<HTMLElement | null>;
}) => {
  const deferredTextInputRepairFrameRef = useRef<number | null>(null);
  const deferredTextInputRepairFirstAtRef = useRef(0);
  const deferredTextInputRepairLastAtRef = useRef(0);
  const deferredTextInputRepairTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const deferredTextInputRepairsRef = useRef<DeferredTextInputRepair[]>([]);
  const clearSettledPendingNativeTextInputRepair = useCallback(() => {
    if (!inputController) {
      return;
    }

    const pathKey = inputController.state.pendingNativeTextInputRepairPathKey;
    const offset = inputController.state.pendingNativeTextInputRepairOffset;

    if (!pathKey || offset == null) {
      return;
    }

    const selection = readRuntimeSelection(editor);

    if (
      !selection ||
      !RangeApi.isCollapsed(selection) ||
      selection.anchor.path.join(',') !== pathKey ||
      selection.anchor.offset !== offset
    ) {
      return;
    }

    let domSelection: Selection | null = null;

    try {
      domSelection = getSelection(ReactEditor.findDocumentOrShadowRoot(editor));
    } catch {
      return;
    }

    if (!domSelection || domSelection.rangeCount === 0) {
      return;
    }

    const domRange = ReactEditor.resolvePliteRange(editor, domSelection, {
      exactMatch: false,
    });

    if (
      !domRange ||
      !RangeApi.isCollapsed(domRange) ||
      domRange.anchor.path.join(',') !== pathKey ||
      domRange.anchor.offset !== offset
    ) {
      return;
    }

    const anchorNode = domSelection.anchorNode;
    const anchorElement = isDOMText(anchorNode)
      ? anchorNode.parentElement
      : isDOMElement(anchorNode)
        ? anchorNode
        : null;
    const textHost = anchorElement?.closest('[data-plite-node="text"]');
    const pliteText = readRuntimeText(editor, domRange.anchor.path)?.text;
    const domText = textHost?.textContent?.replace(/\uFEFF/g, '') ?? null;

    if (
      !textHost ||
      textHost.getAttribute('data-plite-path') !== pathKey ||
      pliteText == null ||
      domText !== pliteText
    ) {
      return;
    }

    inputController.state.pendingNativeTextInputRepairOffset = null;
    inputController.state.pendingNativeTextInputRepairPathKey = null;
  }, [editor, inputController]);
  const flushDeferredTextInputRepairs = useCallback(() => {
    if (deferredTextInputRepairFrameRef.current !== null) {
      cancelAnimationFrame(deferredTextInputRepairFrameRef.current);
      deferredTextInputRepairFrameRef.current = null;
    }
    if (deferredTextInputRepairTimeoutRef.current !== null) {
      clearTimeout(deferredTextInputRepairTimeoutRef.current);
      deferredTextInputRepairTimeoutRef.current = null;
    }
    deferredTextInputRepairFirstAtRef.current = 0;
    deferredTextInputRepairLastAtRef.current = 0;

    const repairs = deferredTextInputRepairsRef.current;

    deferredTextInputRepairsRef.current = [];

    let repairedPendingNativeTextInputTarget: DOMInputRepairTarget | null =
      null;

    for (const { repair, target } of repairs) {
      const didRepair = repair();

      if (
        didRepair &&
        target &&
        inputController?.state.pendingNativeTextInputRepairPathKey ===
          target.path.join(',') &&
        inputController.state.pendingNativeTextInputRepairOffset ===
          target.selectionOffset &&
        readRuntimeText(editor, target.path)?.text === target.text
      ) {
        repairedPendingNativeTextInputTarget = target;
      }
    }

    const repairedPendingNativeTextInputSelection =
      repairedPendingNativeTextInputTarget
        ? repairPendingNativeTextInputModelSelection({
            editor,
            expectedTarget: repairedPendingNativeTextInputTarget,
            inputController,
          })
        : false;

    if (
      inputController &&
      (repairs.length === 0 || !repairedPendingNativeTextInputSelection)
    ) {
      inputController.state.pendingNativeTextInputRepairOffset = null;
      inputController.state.pendingNativeTextInputRepairPathKey = null;
    } else if (repairedPendingNativeTextInputSelection) {
      queueMicrotask(clearSettledPendingNativeTextInputRepair);
      requestAnimationFrame(clearSettledPendingNativeTextInputRepair);
      setTimeout(clearSettledPendingNativeTextInputRepair, 25);
    }
  }, [clearSettledPendingNativeTextInputRepair, editor, inputController]);
  const scheduleDeferredTextInputRepairs = useCallback(() => {
    const scheduledAt = now();

    deferredTextInputRepairFirstAtRef.current ||=
      deferredTextInputRepairLastAtRef.current || scheduledAt;
    deferredTextInputRepairLastAtRef.current = scheduledAt;

    if (deferredTextInputRepairTimeoutRef.current !== null) {
      clearTimeout(deferredTextInputRepairTimeoutRef.current);
    }
    deferredTextInputRepairTimeoutRef.current = setTimeout(
      flushDeferredTextInputRepairs,
      DEFERRED_NATIVE_TEXT_INPUT_REPAIR_IDLE_MS
    );

    if (deferredTextInputRepairFrameRef.current !== null) {
      return;
    }

    const waitForInputIdle = (frameTime: number) => {
      const idleMs = frameTime - deferredTextInputRepairLastAtRef.current;
      const pendingMs = frameTime - deferredTextInputRepairFirstAtRef.current;

      if (
        idleMs < DEFERRED_NATIVE_TEXT_INPUT_REPAIR_IDLE_MS &&
        pendingMs < DEFERRED_NATIVE_TEXT_INPUT_REPAIR_MAX_MS
      ) {
        deferredTextInputRepairFrameRef.current =
          requestAnimationFrame(waitForInputIdle);
        return;
      }

      deferredTextInputRepairFrameRef.current = null;
      flushDeferredTextInputRepairs();
    };

    deferredTextInputRepairFrameRef.current =
      requestAnimationFrame(waitForInputIdle);
  }, [flushDeferredTextInputRepairs]);
  const queuePendingNativeTextInput = useCallback(
    ({
      data,
      inputType,
      rootElement,
      selection,
    }: {
      data: string;
      inputType: string;
      rootElement: HTMLElement;
      selection: Range | null;
    }) => {
      if (
        !deferNativeTextInputRepair ||
        inputType !== 'insertText' ||
        data.length === 0
      ) {
        return false;
      }

      const previousRepair = deferredTextInputRepairsRef.current.at(-1);
      const target = getExpectedDeferredTextInputRepairTarget({
        data,
        editor,
        previousRepair,
        rootElement,
        selection,
      });
      const pathKey = target?.path.join(',') ?? null;

      if (!target || !pathKey) {
        return false;
      }

      const repair = createDOMInputRepair({
        data,
        inputType,
        repairDOMInput,
        rootElement,
        target,
      });

      if (pathKey && inputController) {
        inputController.state.pendingNativeTextInputRepairOffset =
          target.selectionOffset;
        inputController.state.pendingNativeTextInputRepairPathKey = pathKey;
      }

      if (
        previousRepair &&
        shouldReplacePreviousDeferredTextInputRepair({
          pathKey,
          previousRepair,
          target,
        })
      ) {
        previousRepair.repair = repair;
        previousRepair.source = 'beforeinput';
        previousRepair.target = target;
      } else {
        deferredTextInputRepairsRef.current.push({
          pathKey,
          repair,
          source: 'beforeinput',
          target,
        });
      }

      scheduleDeferredTextInputRepairs();
      return true;
    },
    [
      deferNativeTextInputRepair,
      editor,
      inputController,
      repairDOMInput,
      scheduleDeferredTextInputRepairs,
    ]
  );

  useEffect(() => {
    const ownerDocument =
      rootRef.current?.ownerDocument ??
      (typeof document === 'undefined' ? null : document);
    const ownerWindow =
      ownerDocument?.defaultView ??
      (typeof window === 'undefined' ? null : window);
    const flushWhenHidden = () => {
      if (ownerDocument?.visibilityState === 'hidden') {
        flushDeferredTextInputRepairs();
      }
    };

    ownerDocument?.addEventListener('visibilitychange', flushWhenHidden, true);
    ownerWindow?.addEventListener('blur', flushDeferredTextInputRepairs, true);
    ownerWindow?.addEventListener(
      'pagehide',
      flushDeferredTextInputRepairs,
      true
    );

    return () => {
      ownerDocument?.removeEventListener(
        'visibilitychange',
        flushWhenHidden,
        true
      );
      ownerWindow?.removeEventListener(
        'blur',
        flushDeferredTextInputRepairs,
        true
      );
      ownerWindow?.removeEventListener(
        'pagehide',
        flushDeferredTextInputRepairs,
        true
      );
      flushDeferredTextInputRepairs();
    };
  }, [flushDeferredTextInputRepairs, rootRef]);

  const onDOMInput = useCallback(
    (event: Event) =>
      profileDOMInputDuration('dom-input-total', () => {
        const nativeInput = event as InputEvent;

        if (isInteractiveInternalTarget(editor, event.target)) {
          event.stopImmediatePropagation();
          return;
        }

        if (!rootRef.current || typeof nativeInput.inputType !== 'string') {
          return;
        }

        if (readOnly) {
          event.preventDefault();
          event.stopImmediatePropagation();
          restoreReadOnlyDOMText({
            editor,
            nativeInput,
            rootElement: rootRef.current,
          });
          onReadOnlyDOMInput?.();
          return;
        }

        onHandledDOMInput?.(event);
        const rootElement = rootRef.current;
        let preferRuntimeRepairTarget =
          shouldPreferRuntimeTextInputRepairTarget({
            editor,
            inputController,
            nativeInput,
          });
        let target =
          nativeInput.inputType === 'insertText'
            ? getDOMInputRepairTarget(editor, rootElement, nativeInput, {
                preferRuntimeSelection: preferRuntimeRepairTarget,
              })
            : null;

        if (
          deferNativeTextInputRepair &&
          nativeInput.inputType === 'insertText' &&
          typeof nativeInput.data === 'string'
        ) {
          let pathKey = target?.path.join(',') ?? null;
          const modelOwnsTextInput =
            (inputController?.state.modelOwnedTextInputGuard ?? 0) > 0 ||
            (inputController?.preferModelSelectionForInputRef.current ===
              true &&
              inputController.state.selectionSource === 'model-owned');

          if (modelOwnsTextInput) {
            if (inputController) {
              inputController.state.pendingNativeTextInputRepairOffset = null;
              inputController.state.pendingNativeTextInputRepairPathKey = null;
            }
            restoreReadOnlyDOMText({
              editor,
              nativeInput,
              rootElement,
            });
            return;
          }

          const previousRepair = deferredTextInputRepairsRef.current.at(-1);
          let coalescedTarget = getCoalescedDeferredTextInputRepairTarget({
            data: nativeInput.data,
            pathKey,
            previousRepair,
            target,
          });

          if (
            previousRepair &&
            pathKey &&
            previousRepair.pathKey === pathKey &&
            target &&
            !coalescedTarget
          ) {
            flushDeferredTextInputRepairs();
            preferRuntimeRepairTarget =
              shouldPreferRuntimeTextInputRepairTarget({
                editor,
                inputController,
                nativeInput,
              });
            target = getDOMInputRepairTarget(editor, rootElement, nativeInput, {
              preferRuntimeSelection: preferRuntimeRepairTarget,
            });
            pathKey = target?.path.join(',') ?? null;
            coalescedTarget = getCoalescedDeferredTextInputRepairTarget({
              data: nativeInput.data,
              pathKey,
              previousRepair: undefined,
              target,
            });
          }

          if (pathKey && inputController) {
            inputController.state.pendingNativeTextInputRepairOffset =
              (coalescedTarget ?? target)?.selectionOffset ?? null;
            inputController.state.pendingNativeTextInputRepairPathKey = pathKey;
          }

          if (previousRepair && coalescedTarget) {
            target = coalescedTarget;
            const repair = createDOMInputRepair({
              data: nativeInput.data,
              inputType: nativeInput.inputType,
              repairDOMInput,
              rootElement,
              target,
            });

            previousRepair.repair = repair;
            previousRepair.source = 'input';
            previousRepair.target = target;
          } else {
            const repair = createDOMInputRepair({
              data: nativeInput.data,
              inputType: nativeInput.inputType,
              repairDOMInput,
              rootElement,
              target,
            });

            deferredTextInputRepairsRef.current.push({
              pathKey,
              repair,
              source: 'input',
              target,
            });
          }

          scheduleDeferredTextInputRepairs();
          return;
        }

        flushDeferredTextInputRepairs();
        createDOMInputRepair({
          data: nativeInput.data,
          inputType: nativeInput.inputType,
          repairDOMInput,
          rootElement,
          target,
        })();
      }),
    [
      deferNativeTextInputRepair,
      editor,
      flushDeferredTextInputRepairs,
      inputController,
      onHandledDOMInput,
      onReadOnlyDOMInput,
      readOnly,
      repairDOMInput,
      rootRef,
      scheduleDeferredTextInputRepairs,
    ]
  );

  return {
    flushPendingNativeTextInput: flushDeferredTextInputRepairs,
    onDOMInput,
    queuePendingNativeTextInput,
  };
};

export const useEditableDOMBeforeInputHandler = ({
  handleDOMBeforeInput,
}: {
  handleDOMBeforeInput: HandleEditableDOMBeforeInput;
}) =>
  useCallback(
    (event: InputEvent) => {
      handleDOMBeforeInput(event);
    },
    [handleDOMBeforeInput]
  );

export const useEditableReactBeforeInputHandler = ({
  editor,
  handleFallbackInsertText,
  onBeforeInput,
  readOnly,
}: {
  editor: ReactRuntimeEditor;
  handleFallbackInsertText: HandleEditableReactBeforeInputFallback;
  onBeforeInput?:
    | ((event: React.FormEvent<HTMLDivElement>) => boolean | void)
    | undefined;
  readOnly: boolean;
}) =>
  useCallback(
    (event: React.InputEvent<HTMLDivElement>) => {
      if (isInteractiveInternalTarget(editor, event.target)) {
        event.stopPropagation();
        return;
      }

      // COMPAT: Certain browsers don't support the `beforeinput` event, so we
      // fall back to React's leaky polyfill instead just for it. It
      // only works for the `insertText` input type.
      if (
        !HAS_BEFORE_INPUT_SUPPORT &&
        !readOnly &&
        !(onBeforeInput?.(event) ?? event.defaultPrevented) &&
        ReactEditor.hasSelectableTarget(editor, event.target)
      ) {
        event.preventDefault();
        if (!ReactEditor.isComposing(editor)) {
          const text = event.nativeEvent.data;
          if (text != null) {
            handleFallbackInsertText(text);
          }
        }
      }
    },
    [editor, handleFallbackInsertText, onBeforeInput, readOnly]
  );

export const useEditablePasteHandler = ({
  handlePaste,
}: {
  handlePaste: HandleEditablePaste;
}) =>
  useCallback(
    (event: ClipboardEvent<HTMLDivElement>) => {
      handlePaste(event);
    },
    [handlePaste]
  );

export const useEditableClipboardHandler = ({
  handleClipboard,
}: {
  handleClipboard: HandleEditableClipboard;
}) =>
  useCallback(
    (event: ClipboardEvent<HTMLDivElement>) => {
      handleClipboard(event);
    },
    [handleClipboard]
  );

export const useEditableDragHandler = ({
  handleDrag,
}: {
  handleDrag: HandleEditableDrag;
}) =>
  useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      handleDrag(event);
    },
    [handleDrag]
  );

export const useEditableCompositionHandler = ({
  handleComposition,
}: {
  handleComposition: HandleEditableComposition;
}) =>
  useCallback(
    (event: CompositionEvent<HTMLDivElement>) => {
      handleComposition(event);
    },
    [handleComposition]
  );

export const useEditableInputHandler = ({
  handleInput,
}: {
  handleInput: HandleEditableInput;
}) =>
  useCallback(
    (event: ReactInputEvent<HTMLDivElement>) => {
      handleInput(event);
    },
    [handleInput]
  );

export const useEditableFocusHandler = ({
  handleFocus,
}: {
  handleFocus: HandleEditableFocus;
}) =>
  useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      handleFocus(event);
    },
    [handleFocus]
  );

export const useEditableMouseHandler = ({
  handleMouse,
}: {
  handleMouse: HandleEditableMouse;
}) =>
  useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      handleMouse(event);
    },
    [handleMouse]
  );

export const useEditableKeyboardHandler = ({
  handleKeyboard,
}: {
  handleKeyboard: HandleEditableKeyboard;
}) =>
  useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      handleKeyboard(event);
    },
    [handleKeyboard]
  );
