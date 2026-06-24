import { type CompositionEvent, type RefObject, useEffect } from 'react';
import {
  type EditorMarks,
  NodeApi,
  RangeApi,
  type Text,
  TextApi,
} from '@platejs/plite';
import {
  IS_ANDROID,
  IS_IOS,
  IS_UC_MOBILE,
  IS_WEBKIT,
  IS_WECHATBROWSER,
  isDOMNode,
} from '@platejs/plite-dom';
import {
  EDITOR_TO_PENDING_INSERTION_MARKS,
  EDITOR_TO_USER_MARKS,
} from '@platejs/plite-dom/internal';
import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import type { EditableCompositionStateSetter } from './input-controller';
import { getNativeTextInputHistoryMetadata } from './input-history';
import type { EditableInputController } from './input-state';
import type { Editor } from './runtime-editor-api';
import { readRuntimeText } from './runtime-live-state';
import { writeRuntimeMarks } from './runtime-mutation-state';
import {
  armModelOwnedTextInputGuard,
  setEditableModelSelectionPreference,
} from './selection-controller';

type EditableCompositionHandler = (
  event: CompositionEvent<HTMLDivElement>
) => boolean | void;

const EDITOR_TO_PENDING_COMPOSITION_TEXT = new WeakMap<Editor, string>();
const EDITOR_TO_COMPOSITION_PREDELETE = new WeakSet<Editor>();

const getCompositionEventText = (event: CompositionEvent<HTMLDivElement>) =>
  event.data || (event.nativeEvent as globalThis.CompositionEvent).data;

const isCompositionEventTargetInput = ({
  event,
}: {
  event: CompositionEvent<HTMLDivElement>;
}) =>
  isDOMNode(event.target) &&
  (event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement);

const isCompositionEventHandled = ({
  event,
  handler,
}: {
  event: CompositionEvent<HTMLDivElement>;
  handler?: EditableCompositionHandler;
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

const preventReadOnlyEditableComposition = ({
  editor,
  event,
  setComposing,
}: {
  editor: ReactRuntimeEditor;
  event: CompositionEvent<HTMLDivElement>;
  setComposing?: EditableCompositionStateSetter;
}) => {
  if (!ReactEditor.hasEditableTarget(editor, event.target)) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  EDITOR_TO_PENDING_COMPOSITION_TEXT.delete(editor);
  EDITOR_TO_COMPOSITION_PREDELETE.delete(editor);

  if (setComposing && ReactEditor.isComposing(editor)) {
    setComposing(false);
  }

  return true;
};

export const commitInsertFromComposition = ({
  setComposing,
}: {
  setComposing: EditableCompositionStateSetter;
}) => {
  // COMPAT: in Safari, `compositionend` is dispatched after the
  // `beforeinput` for "insertFromComposition". But if we wait for it
  // then we will abort because we're still composing and the selection
  // won't be updated properly.
  // https://www.w3.org/TR/input-events-2/
  setComposing(false);
};

export const commitChromeCompositionEndFallback = ({
  editor,
  mergeWithCompositionPredelete = false,
  rootElement,
  shouldCommit = true,
  text,
}: {
  editor: Editor;
  mergeWithCompositionPredelete?: boolean;
  rootElement?: HTMLElement | null;
  shouldCommit?: boolean;
  text: string | null | undefined;
}): boolean => {
  // COMPAT: Some browsers do not fire a usable `insertFromComposition`
  // beforeinput. If the composed text reached the DOM but not the model,
  // commit it from compositionend and then remove unmanaged DOM text.
  if (IS_WEBKIT || IS_IOS || IS_WECHATBROWSER || IS_UC_MOBILE || !text) {
    return false;
  }

  const placeholderMarks = EDITOR_TO_PENDING_INSERTION_MARKS.get(editor);
  EDITOR_TO_PENDING_INSERTION_MARKS.delete(editor);

  if (!shouldCommit) {
    removeUnmanagedCompositionTextNodes({ editor, rootElement, text });
    EDITOR_TO_USER_MARKS.delete(editor);
    return false;
  }

  const target = editor.read((state) => state.selection.get());
  // Ensure we insert text with the marks the user was actually seeing
  if (placeholderMarks !== undefined) {
    EDITOR_TO_USER_MARKS.set(
      editor,
      editor.read((state) => state.marks.get())
    );
    writeRuntimeMarks(editor, placeholderMarks);
  }

  editor.update(
    (tx) => {
      if (
        target &&
        placeholderMarks &&
        Object.keys(placeholderMarks).length > 0
      ) {
        tx.nodes.insert(
          { text, ...placeholderMarks },
          { at: target, select: true }
        );
        return;
      }

      tx.text.insert(text, target ? { at: target } : undefined);
    },
    mergeWithCompositionPredelete
      ? { metadata: { history: { mode: 'merge' } } }
      : { metadata: getNativeTextInputHistoryMetadata(editor) }
  );
  removeUnmanagedCompositionTextNodes({ editor, rootElement, text });

  const userMarks = EDITOR_TO_USER_MARKS.get(editor);
  EDITOR_TO_USER_MARKS.delete(editor);
  if (userMarks !== undefined) {
    writeRuntimeMarks(editor, userMarks);
  }

  return true;
};

const removeUnmanagedCompositionTextNodes = ({
  editor,
  rootElement,
  text,
}: {
  editor: Editor;
  rootElement?: HTMLElement | null;
  text: string;
}) => {
  if (!rootElement || text.length === 0) {
    return;
  }

  rootElement
    .querySelectorAll<HTMLElement>('[data-plite-node="text"]')
    .forEach((textElement) => {
      const textNodes: globalThis.Text[] = [];
      const path = textElement
        .getAttribute('data-plite-path')
        ?.split(',')
        .map((segment) => Number.parseInt(segment, 10));
      const modelText = path?.every(Number.isInteger)
        ? (() => {
            try {
              return NodeApi.leaf(editor, path).text;
            } catch {
              return null;
            }
          })()
        : null;
      const walker = textElement.ownerDocument.createTreeWalker(
        textElement,
        NodeFilter.SHOW_TEXT
      );

      for (
        let current = walker.nextNode();
        current;
        current = walker.nextNode()
      ) {
        const textNode = current as globalThis.Text;
        const textContent = textNode.textContent ?? '';
        const pliteString = textNode.parentElement?.closest(
          '[data-plite-string="true"]'
        );

        if (pliteString && modelText != null && textContent.includes(text)) {
          if (
            textContent !== modelText &&
            textContent.endsWith(text) &&
            textContent.slice(0, -text.length) === modelText
          ) {
            textNode.textContent = modelText;
            continue;
          }

          if (
            textContent !== modelText &&
            textContent.startsWith(text) &&
            textContent.slice(text.length) === modelText
          ) {
            textNode.textContent = modelText;
            continue;
          }
        }

        if (
          textContent === text &&
          (!pliteString || (modelText != null && textContent !== modelText))
        ) {
          textNodes.push(textNode);
        }
      }

      textNodes.forEach((textNode) => {
        textNode.parentNode?.removeChild(textNode);
      });
    });
};

export const applyEditableCompositionEnd = ({
  androidInputManagerRef,
  editor,
  event,
  inputController,
  onCompositionEnd,
  readOnly = false,
  setComposing,
}: {
  androidInputManagerRef: RefObject<AndroidInputManager | null | undefined>;
  editor: ReactRuntimeEditor;
  event: CompositionEvent<HTMLDivElement>;
  inputController: EditableInputController;
  onCompositionEnd?: EditableCompositionHandler;
  readOnly?: boolean;
  setComposing: EditableCompositionStateSetter;
}) => {
  if (isCompositionEventTargetInput({ event })) {
    return;
  }
  if (
    readOnly &&
    preventReadOnlyEditableComposition({ editor, event, setComposing })
  ) {
    return;
  }
  if (ReactEditor.hasSelectableTarget(editor, event.target)) {
    if (ReactEditor.isComposing(editor)) {
      Promise.resolve().then(() => {
        setComposing(false);
      });
    }

    androidInputManagerRef.current?.handleCompositionEnd(event);

    if (
      isCompositionEventHandled({ event, handler: onCompositionEnd }) ||
      IS_ANDROID
    ) {
      return;
    }

    const rootText =
      event.currentTarget.textContent?.replace(/\uFEFF/g, '') ?? null;
    const modelText = editor.read((state) => state.text.string([]));
    const hasNativeDOMCompositionDelta =
      rootText != null && rootText !== modelText;
    const shouldCommitCompositionEndFallback =
      ReactEditor.isComposing(editor) && hasNativeDOMCompositionDelta;
    const compositionText =
      getCompositionEventText(event) ??
      EDITOR_TO_PENDING_COMPOSITION_TEXT.get(editor);
    EDITOR_TO_PENDING_COMPOSITION_TEXT.delete(editor);
    const mergeWithCompositionPredelete =
      EDITOR_TO_COMPOSITION_PREDELETE.has(editor);
    EDITOR_TO_COMPOSITION_PREDELETE.delete(editor);

    const committedChromeFallback = commitChromeCompositionEndFallback({
      editor,
      mergeWithCompositionPredelete,
      rootElement: event.currentTarget,
      shouldCommit: shouldCommitCompositionEndFallback,
      text: compositionText,
    });

    if (committedChromeFallback) {
      setEditableModelSelectionPreference({
        inputController,
        preferModelSelection: true,
        reason: 'composition',
        selectionSource: 'model-owned',
      });
      armModelOwnedTextInputGuard({ inputController });
      inputController.state.selectionChangeOrigin = 'programmatic-export';
    }
  }
};

export const applyEditableCompositionStart = ({
  androidInputManagerRef,
  editor,
  event,
  onCompositionStart,
  readOnly = false,
  setComposing,
}: {
  androidInputManagerRef: RefObject<AndroidInputManager | null | undefined>;
  editor: ReactRuntimeEditor;
  event: CompositionEvent<HTMLDivElement>;
  onCompositionStart?: EditableCompositionHandler;
  readOnly?: boolean;
  setComposing: EditableCompositionStateSetter;
}) => {
  if (isCompositionEventTargetInput({ event })) {
    return;
  }
  if (readOnly && preventReadOnlyEditableComposition({ editor, event })) {
    return;
  }
  if (ReactEditor.hasSelectableTarget(editor, event.target)) {
    androidInputManagerRef.current?.handleCompositionStart(event);

    if (
      isCompositionEventHandled({ event, handler: onCompositionStart }) ||
      IS_ANDROID
    ) {
      return;
    }

    const marks = editor.read((state) => state.marks.get());
    if (marks && Object.keys(marks).length > 0) {
      EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, marks);
      writeRuntimeMarks(editor, marks);
    }

    setComposing(true);

    const selection = editor.read((state) => state.selection.get());
    if (
      selection &&
      RangeApi.isExpanded(selection) &&
      event.nativeEvent.isTrusted
    ) {
      EDITOR_TO_COMPOSITION_PREDELETE.add(editor);
      editor.update((tx) => {
        tx.fragment.delete();
      });
      return;
    }

    EDITOR_TO_COMPOSITION_PREDELETE.delete(editor);
  }
};

export const applyEditableCompositionUpdate = ({
  editor,
  event,
  onCompositionUpdate,
  readOnly = false,
  setComposing,
}: {
  editor: ReactRuntimeEditor;
  event: CompositionEvent<HTMLDivElement>;
  onCompositionUpdate?: EditableCompositionHandler;
  readOnly?: boolean;
  setComposing: EditableCompositionStateSetter;
}) => {
  if (isCompositionEventTargetInput({ event })) {
    return;
  }
  if (readOnly && preventReadOnlyEditableComposition({ editor, event })) {
    return;
  }

  if (
    ReactEditor.hasSelectableTarget(editor, event.target) &&
    !isCompositionEventHandled({ event, handler: onCompositionUpdate }) &&
    !ReactEditor.isComposing(editor)
  ) {
    setComposing(true);
  }

  const compositionText = getCompositionEventText(event);
  if (compositionText) {
    EDITOR_TO_PENDING_COMPOSITION_TEXT.set(editor, compositionText);
  }
};

export const usePendingInsertionMarksEffect = ({
  editor,
  marks,
}: {
  editor: Editor;
  marks: EditorMarks | null;
}) => {
  // Update EDITOR_TO_MARK_PLACEHOLDER_MARKS in setTimeout useEffect to ensure we don't set it
  // before we receive the composition end event.
  useEffect(() => {
    setTimeout(() => {
      const selection = editor.read((state) => state.selection.get());
      if (selection) {
        const { anchor } = selection;
        const text = readRuntimeText(editor, anchor.path);

        // While marks isn't a 'complete' text, we can still use loose TextApi.equals
        // here which only compares marks anyway.
        if (
          text &&
          marks &&
          !TextApi.equals(text, marks as Text, { loose: true })
        ) {
          EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, marks);
          return;
        }
      }

      EDITOR_TO_PENDING_INSERTION_MARKS.delete(editor);
    });
  });
};
