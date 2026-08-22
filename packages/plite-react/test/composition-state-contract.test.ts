import { createEditor } from '@platejs/plite';
import {
  EDITOR_TO_PENDING_INSERTION_MARKS,
  EDITOR_TO_USER_MARKS,
} from '@platejs/plite-dom/internal';
import { history } from '@platejs/plite-history';
import {
  getSelection as editorGetSelection,
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';
import type { CompositionEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  applyEditableCompositionEnd as applyEditableCompositionEndRuntime,
  applyEditableCompositionStart,
  applyEditableCompositionUpdate,
  commitChromeCompositionEndFallback,
} from '../src/editable/composition-state';
import {
  type EditableCompositionStateSetter,
  setEditableComposingState,
} from '../src/editable/input-controller';
import {
  createEditableInputController,
  createEditableInputControllerState,
  beginEditableCompositionSession,
  markEditableCompositionModelCommitted,
  shouldMergeEditableCompositionHistory,
  type EditableInputController,
  type PendingCompositionInput,
} from '../src/editable/input-state';
import { applyModelOwnedBeforeInputMutation } from '../src/editable/model-input-strategy';
import { applyModelOwnedHistoryIntent } from '../src/editable/mutation-controller';
import {
  claimSettledCompositionInput,
  queuePendingCompositionModelInput,
} from '../src/editable/runtime-before-input-events';
import { ReactEditor } from '../src/plugin/react-editor';

const createTextEditor = (text = 'abcd') => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    },
  });

  return editor as ReactEditor;
};

const readVisibleEditorState = (editor: ReactEditor) =>
  editor.read((state) => ({
    selection: structuredClone(state.selection()),
    value: structuredClone(state.value()),
  }));

const createMarkedHistoryEditor = () => {
  const editor = createEditor({ extensions: [history()] }) as ReactEditor;

  editorReplace(editor, {
    children: [
      {
        children: [
          { text: 'This is editable ' },
          { bold: true, text: 'rich' },
          { text: ' text, done' },
        ],
        type: 'paragraph',
      },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 'This is '.length },
      focus: { path: [0, 2], offset: ' text'.length },
    },
  });

  return { before: readVisibleEditorState(editor), editor };
};

const createCompositionEvent = (
  data = '',
  textContent: string | null = null,
  currentTarget: Pick<HTMLElement, 'querySelectorAll' | 'textContent'> = {
    querySelectorAll: () => [],
    textContent,
  }
) => {
  const event = {
    currentTarget,
    data,
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    nativeEvent: {
      data,
      isTrusted: true,
    },
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    target: {},
  };

  return event as unknown as CompositionEvent<HTMLDivElement> & {
    preventDefault: ReturnType<typeof vi.fn>;
    stopPropagation: ReturnType<typeof vi.fn>;
  };
};

const createInputController = (
  scheduleTask?: EditableInputController['scheduleTask']
) =>
  createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    scheduleTask,
    state: createEditableInputControllerState(),
  });

type ApplyEditableCompositionEndOptions = Parameters<
  typeof applyEditableCompositionEndRuntime
>[0];

const applyEditableCompositionEnd = (
  options: Omit<
    ApplyEditableCompositionEndOptions,
    'requestModelSelectionExportAfterRender'
  > &
    Partial<
      Pick<
        ApplyEditableCompositionEndOptions,
        'requestModelSelectionExportAfterRender'
      >
    >
) =>
  applyEditableCompositionEndRuntime({
    requestModelSelectionExportAfterRender: () => {},
    ...options,
  });

describe('composition state', () => {
  it('predeletes expanded native composition selections before input commits', () => {
    const editor = createTextEditor();
    const event = createCompositionEvent('文');
    const setComposing = vi.fn();
    const inputController = createInputController();
    const androidInputManager = { handleCompositionStart: vi.fn() };
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);

    try {
      applyEditableCompositionStart({
        androidInputManagerRef: { current: androidInputManager },
        editor,
        event,
        inputController,
        setComposing,
      });

      expect(androidInputManager.handleCompositionStart).toHaveBeenCalled();
      expect(setComposing).toHaveBeenCalledWith(true);
      expect(editorString(editor, [])).toBe('ad');
      expect(editorGetSelection(editor)).toEqual({
        kind: 'text',
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      });
      expect(inputController.state.compositionSession).toEqual({
        modelCommitted: false,
        text: null,
      });
      expect(shouldMergeEditableCompositionHistory(inputController)).toBe(true);
    } finally {
      hasEditableTarget.mockRestore();
    }
  });

  it('keeps a marked multi-leaf composition replacement in one history unit', () => {
    const { before, editor } = createMarkedHistoryEditor();
    const inputController = createInputController();
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    let pendingInput: PendingCompositionInput | null = null;

    try {
      applyEditableCompositionStart({
        androidInputManagerRef: { current: null },
        editor,
        event: createCompositionEvent(),
        inputController,
        setComposing: vi.fn(),
      });
      const compositionSelection = editorGetSelection(editor);

      expect(compositionSelection).not.toBeNull();
      expect(editorString(editor, [])).toBe('This is , done');
      inputController.state.pendingCompositionEnd = {
        cancel: vi.fn(),
        flush: vi.fn(() => false),
        ownership: 'plite',
        phase: 'end-pending',
        replaceWithInput: (input) => {
          pendingInput = input;
          return true;
        },
      };
      expect(
        queuePendingCompositionModelInput({
          command: {
            inputType: 'insertFromComposition',
            kind: 'insert-text',
            text: 'すし',
          },
          data: 'すし',
          editor,
          inputController,
          inputType: 'insertFromComposition',
          repair: { requestEditableRepair: vi.fn() },
          selection: compositionSelection,
          setComposing: vi.fn(),
        })
      ).toBe(true);

      if (!pendingInput || !compositionSelection) {
        throw new Error('expected queued composition input');
      }
      expect(pendingInput.commit(compositionSelection, { publish: true })).toBe(
        true
      );
      const composed = readVisibleEditorState(editor);

      expect(editorString(editor, [])).toBe('This is すし, done');
      expect(applyModelOwnedHistoryIntent({ direction: 'undo', editor })).toBe(
        true
      );
      expect(
        editor.read((state) => ({
          selection: state.selection(),
          value: state.value(),
        }))
      ).toEqual(before);
      expect(applyModelOwnedHistoryIntent({ direction: 'redo', editor })).toBe(
        true
      );
      expect(
        editor.read((state) => ({
          selection: state.selection(),
          value: state.value(),
        }))
      ).toEqual(composed);
    } finally {
      hasSelectableTarget.mockRestore();
    }
  });

  it('keeps direct final composition input in the expanded replacement history unit', () => {
    const { before, editor } = createMarkedHistoryEditor();
    const inputController = createInputController();
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);

    try {
      applyEditableCompositionStart({
        androidInputManagerRef: { current: null },
        editor,
        event: createCompositionEvent(),
        inputController,
        setComposing: vi.fn(),
      });
      const compositionSelection = editorGetSelection(editor);

      expect(compositionSelection).not.toBeNull();
      applyModelOwnedBeforeInputMutation({
        data: 'すし',
        editor,
        inputType: 'insertFromComposition',
        mergeHistory: shouldMergeEditableCompositionHistory(inputController),
        native: false,
        selection: compositionSelection,
        setComposing: vi.fn(),
      });
      const composed = readVisibleEditorState(editor);

      expect(editorString(editor, [])).toBe('This is すし, done');
      expect(applyModelOwnedHistoryIntent({ direction: 'undo', editor })).toBe(
        true
      );
      expect(readVisibleEditorState(editor)).toEqual(before);
      expect(applyModelOwnedHistoryIntent({ direction: 'redo', editor })).toBe(
        true
      );
      expect(readVisibleEditorState(editor)).toEqual(composed);
    } finally {
      hasSelectableTarget.mockRestore();
    }
  });

  it('keeps Chrome fallback input in the expanded replacement history unit', () => {
    const { before, editor } = createMarkedHistoryEditor();
    const inputController = createInputController();
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);

    try {
      applyEditableCompositionStart({
        androidInputManagerRef: { current: null },
        editor,
        event: createCompositionEvent(),
        inputController,
        setComposing: vi.fn(),
      });
      const compositionSelection = editorGetSelection(editor);

      if (!compositionSelection) {
        throw new Error('expected composition selection');
      }
      expect(
        commitChromeCompositionEndFallback({
          editor,
          mergeHistory: shouldMergeEditableCompositionHistory(inputController),
          target: compositionSelection,
          text: 'すし',
        })
      ).toBe(true);
      const composed = readVisibleEditorState(editor);

      expect(editorString(editor, [])).toBe('This is すし, done');
      expect(applyModelOwnedHistoryIntent({ direction: 'undo', editor })).toBe(
        true
      );
      expect(readVisibleEditorState(editor)).toEqual(before);
      expect(applyModelOwnedHistoryIntent({ direction: 'redo', editor })).toBe(
        true
      );
      expect(readVisibleEditorState(editor)).toEqual(composed);
    } finally {
      hasSelectableTarget.mockRestore();
    }
  });

  it('does not merge collapsed composition input with an unrelated edit', () => {
    const editor = createEditor({ extensions: [history()] }) as ReactEditor;
    const firstSelection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };

    editorReplace(editor, {
      children: [
        { children: [{ text: 'ab' }], type: 'paragraph' },
        { children: [{ text: 'tail' }], type: 'paragraph' },
      ],
      selection: {
        kind: 'text',
        anchor: { path: [1, 0], offset: 4 },
        focus: { path: [1, 0], offset: 4 },
      },
    });
    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.insert('!', { at: { path: [1, 0], offset: 4 } });
    });
    const valueAfterUnrelatedEdit = structuredClone(
      editor.read((state) => state.value())
    );

    editor.update({ history: 'skip' }, (tx) => {
      tx.selection.set(firstSelection);
    });
    const inputController = createInputController();
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);

    try {
      applyEditableCompositionStart({
        androidInputManagerRef: { current: null },
        editor,
        event: createCompositionEvent(),
        inputController,
        setComposing: vi.fn(),
      });
      expect(shouldMergeEditableCompositionHistory(inputController)).toBe(
        false
      );
      applyModelOwnedBeforeInputMutation({
        data: '文',
        editor,
        inputType: 'insertFromComposition',
        mergeHistory: shouldMergeEditableCompositionHistory(inputController),
        native: false,
        selection: editorGetSelection(editor),
        setComposing: vi.fn(),
      });

      expect(editorString(editor, [0])).toBe('a文b');
      expect(editorString(editor, [1])).toBe('tail!');
      expect(applyModelOwnedHistoryIntent({ direction: 'undo', editor })).toBe(
        true
      );
      expect(editor.read((state) => state.value())).toEqual(
        valueAfterUnrelatedEdit
      );
    } finally {
      hasSelectableTarget.mockRestore();
    }
  });

  it('defers Chrome fallback replacement until compositionend releases the DOM', () => {
    const editor = createTextEditor();
    const event = createCompositionEvent('文', 'a文d');
    const androidInputManager = { handleCompositionEnd: vi.fn() };
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    let deferredCommit: (() => void) | undefined;
    const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
      vi.fn((_phase, _label, callback) => {
        deferredCommit = callback;

        return () => {};
      });
    const runOwnedDOMMutation: NonNullable<
      Parameters<typeof applyEditableCompositionEnd>[0]['runOwnedDOMMutation']
    > = vi.fn((callback) => callback());
    const inputController = createInputController(scheduleTask);
    const requestModelSelectionExportAfterRender = vi.fn();
    const setIsComposing = vi.fn();
    const setComposing: EditableCompositionStateSetter = (nextValue) => {
      setEditableComposingState({
        editor,
        inputController,
        nextValue,
        setIsComposing,
      });
    };

    setComposing(true);
    setIsComposing.mockClear();

    try {
      applyEditableCompositionEnd({
        androidInputManagerRef: { current: androidInputManager },
        editor,
        event,
        inputController,
        requestModelSelectionExportAfterRender,
        runOwnedDOMMutation,
        scheduleTask,
        setComposing,
      });

      expect(scheduleTask).toHaveBeenCalledWith(
        'model',
        'finish-composition-end',
        expect.any(Function),
        { timing: 'timeout' }
      );
      expect(setIsComposing).not.toHaveBeenCalled();
      expect(ReactEditor.isComposing(editor)).toBe(true);
      expect(inputController.state).toMatchObject({
        isComposing: true,
        pendingCompositionEnd: {
          ownership: 'plite',
          phase: 'end-pending',
        },
        selectionSource: 'composition-owned',
      });
      expect(editorString(editor, [])).toBe('abcd');
      expect(editorGetSelection(editor)).toEqual({
        kind: 'text',
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 3 },
      });
      expect(deferredCommit).toBeTypeOf('function');

      deferredCommit?.();

      expect(runOwnedDOMMutation).toHaveBeenCalledOnce();
      expect(setIsComposing).toHaveBeenCalledOnce();
      expect(setIsComposing).toHaveBeenCalledWith(false);
      expect(ReactEditor.isComposing(editor)).toBe(false);
      expect(inputController.state).toMatchObject({
        isComposing: false,
        pendingCompositionEnd: {
          ownership: 'settled',
          phase: 'settled',
        },
        selectionSource: 'model-owned',
      });
      expect(editorString(editor, [])).toBe('a文d');
      expect(editorGetSelection(editor)).toEqual({
        kind: 'text',
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      });
      expect(requestModelSelectionExportAfterRender).toHaveBeenCalledOnce();
      expect(inputController.state.modelSelectionPreference).toEqual({
        preferModelSelection: true,
        reason: 'composition',
        selectionSource: 'model-owned',
      });
      expect(inputController.state.modelOwnedTextInputGuard).toBe(1);
    } finally {
      hasSelectableTarget.mockRestore();
    }
  });

  it('keeps the new composition intent when start flushes the previous pending end', () => {
    const editor = createTextEditor();
    const inputController = createInputController(() => () => {});
    const setComposing: EditableCompositionStateSetter = (nextValue) => {
      setEditableComposingState({
        editor,
        inputController,
        nextValue,
        setIsComposing: vi.fn(),
      });
    };
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);

    setComposing(true);
    inputController.state.activeIntent = 'composition';

    try {
      applyEditableCompositionEnd({
        androidInputManagerRef: { current: null },
        editor,
        event: createCompositionEvent('文', 'a文d'),
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask: inputController.scheduleTask!,
        setComposing,
      });
      expect(inputController.state.pendingCompositionEnd).toMatchObject({
        ownership: 'plite',
        phase: 'end-pending',
      });

      applyEditableCompositionStart({
        androidInputManagerRef: { current: null },
        editor,
        event: createCompositionEvent(),
        inputController,
        setComposing,
      });

      expect(inputController.state.activeIntent).toBe('composition');
      expect(inputController.state.compositionSession).toEqual({
        modelCommitted: false,
        text: null,
      });
      expect(inputController.state.isComposing).toBe(true);
    } finally {
      hasSelectableTarget.mockRestore();
    }
  });

  it('clears a duplicate compositionend intent behind a settled tombstone', () => {
    const editor = createTextEditor();
    const inputController = createInputController();
    const tombstone = {
      cancel: vi.fn(),
      data: '文',
      inputTypes: ['insertFromComposition', 'insertText'] as const,
      ownership: 'settled',
      phase: 'settled',
    } as const;
    const setComposing: EditableCompositionStateSetter = (nextValue) => {
      setEditableComposingState({
        editor,
        inputController,
        nextValue,
        setIsComposing: vi.fn(),
      });
    };
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);

    setComposing(true);
    inputController.state.activeIntent = 'composition';
    inputController.state.pendingCompositionEnd = tombstone;

    try {
      applyEditableCompositionEnd({
        androidInputManagerRef: { current: null },
        editor,
        event: createCompositionEvent('文', 'a文d'),
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask: () => () => {},
        setComposing,
      });

      expect(inputController.state.activeIntent).toBeNull();
      expect(inputController.state.pendingCompositionEnd).toBe(tombstone);
      expect(tombstone.cancel).not.toHaveBeenCalled();
    } finally {
      hasSelectableTarget.mockRestore();
    }
  });

  for (const phase of ['end-pending', 'input-claimed'] satisfies ReadonlyArray<
    'end-pending' | 'input-claimed'
  >) {
    it(`flushes real ${phase} work model-only during teardown`, () => {
      const editor = createTextEditor();
      const event = createCompositionEvent('文', 'a文d');
      const hasSelectableTarget = vi
        .spyOn(ReactEditor, 'hasSelectableTarget')
        .mockReturnValue(true);
      const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
        vi.fn(() => () => {});
      const inputController = createInputController(scheduleTask);
      const setIsComposing = vi.fn();
      const setComposing: EditableCompositionStateSetter = (nextValue) => {
        setEditableComposingState({
          editor,
          inputController,
          nextValue,
          setIsComposing,
        });
      };

      beginEditableCompositionSession(inputController);
      setComposing(true);
      setIsComposing.mockClear();

      try {
        applyEditableCompositionEnd({
          androidInputManagerRef: { current: null },
          editor,
          event,
          inputController,
          runOwnedDOMMutation: (callback) => callback(),
          scheduleTask,
          setComposing,
        });
        const { pendingCompositionEnd } = inputController.state;

        if (pendingCompositionEnd?.ownership !== 'plite') {
          throw new Error('expected Plite-owned composition end');
        }
        if (phase === 'input-claimed') {
          const selection = editorGetSelection(editor);

          if (!selection) throw new Error('expected composition selection');
          queuePendingCompositionModelInput({
            command: {
              inputType: 'insertFromComposition',
              kind: 'insert-text',
              text: '文',
            },
            data: '文',
            editor,
            inputController,
            inputType: 'insertFromComposition',
            repair: { requestEditableRepair: vi.fn() },
            selection,
            setComposing,
          });
        }

        expect(pendingCompositionEnd.phase).toBe(phase);
        expect(pendingCompositionEnd.flush({ publish: false })).toBe(true);
        expect(editorString(editor, [])).toBe('a文d');
        expect(setIsComposing).not.toHaveBeenCalled();
      } finally {
        inputController.state.pendingCompositionEnd?.cancel();
        setComposing(false);
        hasSelectableTarget.mockRestore();
      }
    });
  }

  it('keeps model-only flush silent when owned mutation fails before entry', () => {
    const editor = createTextEditor();
    const event = createCompositionEvent('文', 'a文d');
    const ownerFailure = new Error('owned mutation prelude failed');
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
      vi.fn(() => () => {});
    const inputController = createInputController(scheduleTask);
    const setIsComposing = vi.fn();
    const setComposing: EditableCompositionStateSetter = (nextValue) => {
      setEditableComposingState({
        editor,
        inputController,
        nextValue,
        setIsComposing,
      });
    };

    beginEditableCompositionSession(inputController);
    setComposing(true);
    setIsComposing.mockClear();

    try {
      applyEditableCompositionEnd({
        androidInputManagerRef: { current: null },
        editor,
        event,
        inputController,
        runOwnedDOMMutation: () => {
          throw ownerFailure;
        },
        scheduleTask,
        setComposing,
      });
      const { pendingCompositionEnd } = inputController.state;

      if (pendingCompositionEnd?.ownership !== 'plite') {
        throw new Error('expected Plite-owned composition end');
      }
      let thrown: unknown;

      try {
        pendingCompositionEnd.flush({ publish: false });
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBe(ownerFailure);
      expect(setIsComposing).not.toHaveBeenCalled();
      expect(inputController.state).toMatchObject({
        compositionSession: { modelCommitted: false },
        isComposing: true,
        pendingCompositionEnd: null,
      });
      expect(editorString(editor, [])).toBe('abcd');
    } finally {
      setComposing(false);
      hasSelectableTarget.mockRestore();
    }
  });

  it('settles a successful Chrome fallback before unmanaged-DOM cleanup throws', () => {
    const editor = createTextEditor();
    const event = createCompositionEvent('文', 'a文d');
    const cleanupFailure = new Error('unmanaged DOM cleanup failed');

    const querySelectorAll = vi
      .spyOn(event.currentTarget, 'querySelectorAll')
      .mockImplementation(() => {
        throw cleanupFailure;
      });
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    let deferredCommit: (() => void) | undefined;
    const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
      vi.fn((_phase, _label, callback) => {
        deferredCommit = callback;
        return () => {};
      });
    const inputController = createInputController(scheduleTask);
    const setComposing: EditableCompositionStateSetter = (nextValue) => {
      setEditableComposingState({
        editor,
        inputController,
        nextValue,
        setIsComposing: vi.fn(),
      });
    };

    beginEditableCompositionSession(inputController);
    setComposing(true);

    try {
      applyEditableCompositionEnd({
        androidInputManagerRef: { current: null },
        editor,
        event,
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing,
      });
      let thrown: unknown;

      try {
        deferredCommit?.();
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBe(cleanupFailure);
      expect(editorString(editor, [])).toBe('a文d');
      expect(inputController.state.pendingCompositionEnd).toMatchObject({
        data: '文',
        ownership: 'settled',
        phase: 'settled',
      });
    } finally {
      inputController.state.pendingCompositionEnd?.cancel();
      hasSelectableTarget.mockRestore();
      querySelectorAll.mockRestore();
    }
  });

  it('commits the anchored fallback even when flattened root text is unchanged', () => {
    const editor = createTextEditor();

    editorReplace(editor, {
      children: [
        { type: 'paragraph', children: [{ text: 'abcd' }] },
        { type: 'paragraph', children: [{ text: 'same root text' }] },
      ],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 3 },
      },
    });
    const event = createCompositionEvent('文', editorString(editor, []));
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    let deferredCommit: (() => void) | undefined;
    const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
      vi.fn((_phase, _label, callback) => {
        deferredCommit = callback;
        return () => {};
      });
    const inputController = createInputController(scheduleTask);
    const setComposing: EditableCompositionStateSetter = (nextValue) => {
      setEditableComposingState({
        editor,
        inputController,
        nextValue,
        setIsComposing: vi.fn(),
      });
    };

    beginEditableCompositionSession(inputController);
    setComposing(true);

    try {
      applyEditableCompositionEnd({
        androidInputManagerRef: { current: null },
        editor,
        event,
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing,
      });
      deferredCommit?.();

      expect(editorString(editor, [0])).toBe('a文d');
      expect(editorString(editor, [1])).toBe('same root text');
    } finally {
      inputController.state.pendingCompositionEnd?.cancel();
      hasSelectableTarget.mockRestore();
    }
  });

  it('uses session commit evidence to suppress a duplicate fallback', () => {
    const editor = createTextEditor();
    const event = createCompositionEvent('文', 'a文d');
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    let deferredCommit: (() => void) | undefined;
    const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
      vi.fn((_phase, _label, callback) => {
        deferredCommit = callback;
        return () => {};
      });
    const inputController = createInputController(scheduleTask);
    const setComposing: EditableCompositionStateSetter = (nextValue) => {
      setEditableComposingState({
        editor,
        inputController,
        nextValue,
        setIsComposing: vi.fn(),
      });
    };

    beginEditableCompositionSession(inputController);
    markEditableCompositionModelCommitted(inputController);
    setComposing(true);

    try {
      applyEditableCompositionEnd({
        androidInputManagerRef: { current: null },
        editor,
        event,
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing,
      });
      deferredCommit?.();

      expect(editorString(editor, [])).toBe('abcd');
      expect(inputController.state.pendingCompositionEnd).toMatchObject({
        data: '文',
        ownership: 'settled',
        phase: 'settled',
      });
    } finally {
      inputController.state.pendingCompositionEnd?.cancel();
      hasSelectableTarget.mockRestore();
    }
  });

  it('falls back to the live compositionend anchor when the late-input anchor dies', () => {
    const editor = createTextEditor();
    const event = createCompositionEvent('文', 'a文d');
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    const compositionSelection = editorGetSelection(editor);
    const anchor = vi
      .spyOn(editor, 'anchor')
      .mockReturnValueOnce({ release: () => compositionSelection })
      .mockReturnValueOnce({ release: () => null });
    const scheduled: Array<{ callback: () => void; cancelled: boolean }> = [];
    const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
      vi.fn((_phase, _label, callback) => {
        const task = { callback, cancelled: false };

        scheduled.push(task);
        return () => {
          task.cancelled = true;
        };
      });
    const inputController = createInputController(scheduleTask);
    const setComposing: EditableCompositionStateSetter = (nextValue) => {
      setEditableComposingState({
        editor,
        inputController,
        nextValue,
        setIsComposing: vi.fn(),
      });
    };
    beginEditableCompositionSession(inputController);
    setComposing(true);

    try {
      applyEditableCompositionEnd({
        androidInputManagerRef: { current: null },
        editor,
        event,
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing,
      });
      const { pendingCompositionEnd } = inputController.state;

      if (pendingCompositionEnd?.ownership !== 'plite') {
        throw new Error('expected Plite-owned composition end');
      }
      if (!compositionSelection) {
        throw new Error('expected composition selection');
      }
      expect(
        queuePendingCompositionModelInput({
          command: {
            inputType: 'insertFromComposition',
            kind: 'insert-text',
            text: '文',
          },
          data: '文',
          editor,
          inputController,
          inputType: 'insertFromComposition',
          repair: { requestEditableRepair: vi.fn() },
          selection: compositionSelection,
          setComposing,
        })
      ).toBe(true);
      scheduled.findLast((task) => !task.cancelled)?.callback();

      expect(editorString(editor, [])).toBe('a文d');
      expect(inputController.state.pendingCompositionEnd).toMatchObject({
        data: '文',
        ownership: 'settled',
        phase: 'settled',
      });
    } finally {
      inputController.state.pendingCompositionEnd?.cancel();
      anchor.mockRestore();
      hasSelectableTarget.mockRestore();
    }
  });

  it('does not tombstone a null-selection Chrome fallback no-op', () => {
    const editor = createTextEditor();

    editorReplace(editor, {
      children: [{ type: 'paragraph', children: [{ text: 'abcd' }] }],
      selection: null,
    });
    const event = createCompositionEvent('文', 'abcd');
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    let deferredCommit: (() => void) | undefined;
    const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
      vi.fn((_phase, _label, callback) => {
        deferredCommit = callback;
        return () => {};
      });
    const inputController = createInputController(scheduleTask);
    const setComposing: EditableCompositionStateSetter = (nextValue) => {
      setEditableComposingState({
        editor,
        inputController,
        nextValue,
        setIsComposing: vi.fn(),
      });
    };

    beginEditableCompositionSession(inputController);
    setComposing(true);

    try {
      applyEditableCompositionEnd({
        androidInputManagerRef: { current: null },
        editor,
        event,
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing,
      });
      deferredCommit?.();

      expect(editorString(editor, [])).toBe('abcd');
      expect(inputController.state.pendingCompositionEnd).toBeNull();
    } finally {
      hasSelectableTarget.mockRestore();
    }
  });

  for (const inputType of [
    'insertFromComposition',
    'insertText',
  ] satisfies ReadonlyArray<'insertFromComposition' | 'insertText'>) {
    it(`lets the first ${inputType} replace fallback exactly once`, () => {
      const editor = createTextEditor();
      const event = createCompositionEvent('文', 'a文d');
      const hasSelectableTarget = vi
        .spyOn(ReactEditor, 'hasSelectableTarget')
        .mockReturnValue(true);
      const scheduled: Array<{
        callback: () => void;
        cancelled: boolean;
      }> = [];
      const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
        vi.fn((_phase, _label, callback) => {
          const task = { callback, cancelled: false };

          scheduled.push(task);
          return () => {
            task.cancelled = true;
          };
        });
      const inputController = createInputController(scheduleTask);
      const setIsComposing = vi.fn();
      const setComposing: EditableCompositionStateSetter = (nextValue) => {
        setEditableComposingState({
          editor,
          inputController,
          nextValue,
          setIsComposing,
        });
      };
      const complete = vi.fn();
      const duplicateCommit = vi.fn(() => true);
      const duplicateDiscard = vi.fn();

      setComposing(true);
      setIsComposing.mockClear();

      try {
        applyEditableCompositionEnd({
          androidInputManagerRef: { current: null },
          editor,
          event,
          inputController,
          runOwnedDOMMutation: (callback) => callback(),
          scheduleTask,
          setComposing,
        });

        const { pendingCompositionEnd } = inputController.state;

        expect(pendingCompositionEnd?.ownership).toBe('plite');
        if (pendingCompositionEnd?.ownership !== 'plite') {
          throw new Error('expected Plite-owned composition end');
        }

        expect(
          pendingCompositionEnd.replaceWithInput(
            Object.freeze({
              commit: (fallbackSelection) => {
                if (!fallbackSelection) return false;

                editor.update((tx) => {
                  tx.text.insert('文', { at: fallbackSelection });
                });
                return true;
              },
              complete,
              data: '文',
              discard: vi.fn(),
              inputType,
            })
          )
        ).toBe(true);
        expect(pendingCompositionEnd.phase).toBe('input-claimed');
        expect(editorString(editor, [])).toBe('abcd');

        expect(
          pendingCompositionEnd.replaceWithInput(
            Object.freeze({
              commit: duplicateCommit,
              complete: vi.fn(),
              data: '文',
              discard: duplicateDiscard,
              inputType,
            })
          )
        ).toBe(true);
        expect(duplicateDiscard).toHaveBeenCalledOnce();

        const pendingTask = scheduled.findLast((task) => !task.cancelled);

        expect(pendingTask).toBeDefined();
        pendingTask?.callback();

        expect(duplicateCommit).not.toHaveBeenCalled();
        expect(complete).toHaveBeenCalledOnce();
        expect(editorString(editor, [])).toBe('a文d');
        expect(setIsComposing).toHaveBeenCalledWith(false);
        expect(inputController.state.pendingCompositionEnd).toMatchObject({
          data: '文',
          inputTypes: ['insertFromComposition', 'insertText'],
          ownership: 'settled',
          phase: 'settled',
        });
      } finally {
        inputController.state.pendingCompositionEnd?.cancel();
        hasSelectableTarget.mockRestore();
      }
    });
  }

  it('installs the duplicate tombstone before post-commit publication throws', () => {
    const editor = createTextEditor();
    const event = createCompositionEvent('文', 'a文d');
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    const scheduled: Array<{ callback: () => void; cancelled: boolean }> = [];
    const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
      vi.fn((_phase, _label, callback) => {
        const task = { callback, cancelled: false };

        scheduled.push(task);
        return () => {
          task.cancelled = true;
        };
      });
    const inputController = createInputController(scheduleTask);
    const setComposing: EditableCompositionStateSetter = (nextValue) => {
      setEditableComposingState({
        editor,
        inputController,
        nextValue,
        setIsComposing: vi.fn(),
      });
    };

    beginEditableCompositionSession(inputController);
    setComposing(true);

    try {
      applyEditableCompositionEnd({
        androidInputManagerRef: { current: null },
        editor,
        event,
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing,
      });
      const { pendingCompositionEnd } = inputController.state;

      if (pendingCompositionEnd?.ownership !== 'plite') {
        throw new Error('expected Plite-owned composition end');
      }
      pendingCompositionEnd.replaceWithInput({
        commit: (fallbackSelection) => {
          if (!fallbackSelection) return false;

          editor.update((tx) => {
            tx.text.insert('文', { at: fallbackSelection });
          });
          return true;
        },
        complete: () => {
          throw new Error('publication failed');
        },
        data: '文',
        discard: vi.fn(),
        inputType: 'insertFromComposition',
      });

      expect(() =>
        scheduled.findLast((task) => !task.cancelled)?.callback()
      ).toThrow('publication failed');
      expect(editorString(editor, [])).toBe('a文d');
      expect(inputController.state.pendingCompositionEnd).toMatchObject({
        data: '文',
        ownership: 'settled',
        phase: 'settled',
      });
    } finally {
      inputController.state.pendingCompositionEnd?.cancel();
      hasSelectableTarget.mockRestore();
    }
  });

  it('keeps the one-shot tombstone when expiry scheduling throws', () => {
    const editor = createTextEditor();
    const event = createCompositionEvent('文', 'a文d');
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    const expiryFailure = new Error('expiry scheduling failed');
    const scheduled: Array<{ callback: () => void; cancelled: boolean }> = [];
    let scheduleCount = 0;
    const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
      vi.fn((_phase, _label, callback) => {
        scheduleCount += 1;
        if (scheduleCount === 3) throw expiryFailure;

        const task = { callback, cancelled: false };

        scheduled.push(task);
        return () => {
          task.cancelled = true;
        };
      });
    const inputController = createInputController(scheduleTask);
    const setComposing: EditableCompositionStateSetter = (nextValue) => {
      setEditableComposingState({
        editor,
        inputController,
        nextValue,
        setIsComposing: vi.fn(),
      });
    };

    beginEditableCompositionSession(inputController);
    setComposing(true);

    try {
      applyEditableCompositionEnd({
        androidInputManagerRef: { current: null },
        editor,
        event,
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing,
      });
      const { pendingCompositionEnd } = inputController.state;

      if (pendingCompositionEnd?.ownership !== 'plite') {
        throw new Error('expected Plite-owned composition end');
      }
      pendingCompositionEnd.replaceWithInput({
        commit: (fallbackSelection) => {
          if (!fallbackSelection) return false;

          editor.update((tx) => {
            tx.text.insert('文', { at: fallbackSelection });
          });
          return true;
        },
        complete: vi.fn(),
        data: '文',
        discard: vi.fn(),
        inputType: 'insertFromComposition',
      });

      expect(() => scheduled.at(-1)?.callback()).not.toThrow();
      expect(editorString(editor, [])).toBe('a文d');
      expect(inputController.state.pendingCompositionEnd).toMatchObject({
        data: '文',
        ownership: 'settled',
        phase: 'settled',
      });
      expect(
        claimSettledCompositionInput({
          data: '文',
          inputController,
          inputType: 'insertFromComposition',
        })
      ).toBe(true);
      expect(inputController.state.pendingCompositionEnd).toBeNull();
    } finally {
      inputController.state.pendingCompositionEnd?.cancel();
      hasSelectableTarget.mockRestore();
    }
  });

  it('clears claimed composition state when deferred model commit throws', () => {
    const editor = createTextEditor();
    const event = createCompositionEvent('文', 'a文d');
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    let deferredCommit: (() => void) | undefined;
    const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
      vi.fn((_phase, _label, callback) => {
        deferredCommit = callback;
        return () => {};
      });
    const inputController = createInputController(scheduleTask);
    const setIsComposing = vi.fn();
    const setComposing: EditableCompositionStateSetter = (nextValue) => {
      setEditableComposingState({
        editor,
        inputController,
        nextValue,
        setIsComposing,
      });
    };

    setComposing(true);
    setIsComposing.mockClear();

    try {
      applyEditableCompositionEnd({
        androidInputManagerRef: { current: null },
        editor,
        event,
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing,
      });
      const { pendingCompositionEnd } = inputController.state;

      if (pendingCompositionEnd?.ownership !== 'plite') {
        throw new Error('expected Plite-owned composition end');
      }
      pendingCompositionEnd.replaceWithInput(
        Object.freeze({
          commit: () => {
            throw new Error('model commit failed');
          },
          complete: vi.fn(),
          data: '文',
          discard: vi.fn(),
          inputType: 'insertFromComposition',
        })
      );

      expect(() => deferredCommit?.()).toThrow('model commit failed');
      expect(inputController.state.pendingCompositionEnd).toBeNull();
      expect(setIsComposing).toHaveBeenCalledWith(false);
    } finally {
      hasSelectableTarget.mockRestore();
    }
  });

  it('finishes composition when initial fallback scheduling throws', () => {
    const editor = createTextEditor();
    const event = createCompositionEvent('文', 'a文d');
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
      vi.fn(() => {
        throw new Error('scheduler failed');
      });
    const inputController = createInputController(scheduleTask);
    const setIsComposing = vi.fn();
    const setComposing: EditableCompositionStateSetter = (nextValue) => {
      setEditableComposingState({
        editor,
        inputController,
        nextValue,
        setIsComposing,
      });
    };

    beginEditableCompositionSession(inputController);
    setComposing(true);
    EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, { bold: true });

    try {
      expect(() =>
        applyEditableCompositionEnd({
          androidInputManagerRef: { current: null },
          editor,
          event,
          inputController,
          runOwnedDOMMutation: (callback) => callback(),
          scheduleTask,
          setComposing,
        })
      ).toThrow('scheduler failed');

      expect(inputController.state).toMatchObject({
        compositionSession: null,
        isComposing: false,
        pendingCompositionEnd: null,
      });
      expect(ReactEditor.isComposing(editor)).toBe(false);
      expect(EDITOR_TO_PENDING_INSERTION_MARKS.has(editor)).toBe(false);
    } finally {
      hasSelectableTarget.mockRestore();
    }
  });

  it('finishes composition when claimed-input scheduling throws', () => {
    const editor = createTextEditor();
    const event = createCompositionEvent('文', 'a文d');
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    let scheduleCount = 0;
    const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
      vi.fn(() => {
        scheduleCount += 1;
        if (scheduleCount === 2) throw new Error('claimed schedule failed');

        return () => {};
      });
    const inputController = createInputController(scheduleTask);
    const setIsComposing = vi.fn();
    const setComposing: EditableCompositionStateSetter = (nextValue) => {
      setEditableComposingState({
        editor,
        inputController,
        nextValue,
        setIsComposing,
      });
    };
    const discard = vi.fn();

    beginEditableCompositionSession(inputController);
    setComposing(true);
    EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, { bold: true });

    try {
      applyEditableCompositionEnd({
        androidInputManagerRef: { current: null },
        editor,
        event,
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing,
      });
      const { pendingCompositionEnd } = inputController.state;

      if (pendingCompositionEnd?.ownership !== 'plite') {
        throw new Error('expected Plite-owned composition end');
      }
      expect(() =>
        pendingCompositionEnd.replaceWithInput({
          commit: () => true,
          complete: vi.fn(),
          data: '文',
          discard,
          inputType: 'insertFromComposition',
        })
      ).toThrow('claimed schedule failed');

      expect(discard).toHaveBeenCalledOnce();
      expect(inputController.state).toMatchObject({
        compositionSession: null,
        isComposing: false,
        pendingCompositionEnd: null,
      });
      expect(ReactEditor.isComposing(editor)).toBe(false);
      expect(EDITOR_TO_PENDING_INSERTION_MARKS.has(editor)).toBe(false);
    } finally {
      hasSelectableTarget.mockRestore();
    }
  });

  it('preserves replacement cancellation failure while every cleanup runs', () => {
    const editor = createTextEditor();
    const event = createCompositionEvent('文', 'a文d');
    const cancelFailure = new Error('old composition task cancellation failed');
    const discardFailure = new Error('claimed input discard failed');
    const finishFailure = new Error('replacement finish failed');
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    let scheduleCount = 0;
    const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
      vi.fn(() => {
        scheduleCount += 1;
        return scheduleCount === 1
          ? () => {
              throw cancelFailure;
            }
          : () => {};
      });
    const inputController = createInputController(scheduleTask);
    const setComposing: EditableCompositionStateSetter = (nextValue) => {
      setEditableComposingState({
        editor,
        inputController,
        nextValue,
        setIsComposing: vi.fn(),
      });
      if (!nextValue) throw finishFailure;
    };
    const discard = vi.fn(() => {
      throw discardFailure;
    });

    beginEditableCompositionSession(inputController);
    setComposing(true);
    EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, { bold: true });

    try {
      applyEditableCompositionEnd({
        androidInputManagerRef: { current: null },
        editor,
        event,
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing,
      });
      const { pendingCompositionEnd } = inputController.state;

      if (pendingCompositionEnd?.ownership !== 'plite') {
        throw new Error('expected Plite-owned composition end');
      }
      let thrown: unknown;

      try {
        pendingCompositionEnd.replaceWithInput({
          commit: () => false,
          complete: vi.fn(),
          data: '文',
          discard,
          inputType: 'insertFromComposition',
        });
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBe(cancelFailure);
      expect(scheduleTask).toHaveBeenCalledTimes(2);
      expect(discard).toHaveBeenCalledOnce();
      expect(inputController.state).toMatchObject({
        compositionSession: null,
        isComposing: false,
        pendingCompositionEnd: null,
      });
      expect(EDITOR_TO_PENDING_INSERTION_MARKS.has(editor)).toBe(false);
    } finally {
      hasSelectableTarget.mockRestore();
    }
  });

  it('preserves the end-pending failure across cleanup and owner-postlude failures', () => {
    const editor = createTextEditor();
    const event = createCompositionEvent('文', 'a文d');
    const targetFailure = new Error('target release failed');
    const cleanupFailure = new Error('marks cleanup failed');
    const finishFailure = new Error('finish composing failed');
    const ownerFailure = new Error('owned mutation postlude failed');
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    let cleanupRead: { mockRestore: () => void } | null = null;
    const anchor = vi.spyOn(editor, 'anchor').mockReturnValue({
      release: () => {
        cleanupRead = vi.spyOn(editor, 'read').mockImplementation(() => {
          throw cleanupFailure;
        });
        throw targetFailure;
      },
    });
    let deferredCommit: (() => void) | undefined;
    const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
      vi.fn((_phase, _label, callback) => {
        deferredCommit = callback;
        return () => {};
      });
    const inputController = createInputController(scheduleTask);
    const setComposing: EditableCompositionStateSetter = (nextValue) => {
      setEditableComposingState({
        editor,
        inputController,
        nextValue,
        setIsComposing: vi.fn(),
      });
      if (!nextValue) throw finishFailure;
    };
    const runOwnedDOMMutation = vi.fn((callback: () => void) => {
      callback();
      throw ownerFailure;
    });

    beginEditableCompositionSession(inputController);
    setComposing(true);
    EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, { bold: true });
    EDITOR_TO_USER_MARKS.set(editor, { italic: true });

    try {
      applyEditableCompositionEnd({
        androidInputManagerRef: { current: null },
        editor,
        event,
        inputController,
        runOwnedDOMMutation,
        scheduleTask,
        setComposing,
      });
      let thrown: unknown;

      try {
        deferredCommit?.();
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBe(targetFailure);
      expect(runOwnedDOMMutation).toHaveBeenCalledOnce();
      expect(inputController.state).toMatchObject({
        compositionSession: null,
        isComposing: false,
        pendingCompositionEnd: null,
      });
      expect(EDITOR_TO_PENDING_INSERTION_MARKS.has(editor)).toBe(false);
      expect(EDITOR_TO_USER_MARKS.has(editor)).toBe(false);
    } finally {
      cleanupRead?.mockRestore();
      anchor.mockRestore();
      hasSelectableTarget.mockRestore();
    }
  });

  it('preserves a claimed model failure across marks and finish cleanup failures', () => {
    const editor = createTextEditor();
    const event = createCompositionEvent('文', 'a文d');
    const modelFailure = new Error('claimed model commit failed');
    const cleanupFailure = new Error('claimed marks cleanup failed');
    const finishFailure = new Error('claimed finish failed');
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    const scheduled: Array<{ callback: () => void; cancelled: boolean }> = [];
    const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
      vi.fn((_phase, _label, callback) => {
        const task = { callback, cancelled: false };

        scheduled.push(task);
        return () => {
          task.cancelled = true;
        };
      });
    const inputController = createInputController(scheduleTask);
    const setComposing: EditableCompositionStateSetter = (nextValue) => {
      setEditableComposingState({
        editor,
        inputController,
        nextValue,
        setIsComposing: vi.fn(),
      });
      if (!nextValue) throw finishFailure;
    };
    let cleanupUpdate: { mockRestore: () => void } | null = null;

    beginEditableCompositionSession(inputController);
    setComposing(true);

    try {
      applyEditableCompositionEnd({
        androidInputManagerRef: { current: null },
        editor,
        event,
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing,
      });
      const { pendingCompositionEnd } = inputController.state;

      if (pendingCompositionEnd?.ownership !== 'plite') {
        throw new Error('expected Plite-owned composition end');
      }
      pendingCompositionEnd.replaceWithInput({
        commit: (fallbackSelection) => {
          if (!fallbackSelection) return false;

          editor.update((tx) => {
            tx.text.insert('文', { at: fallbackSelection });
          });
          markEditableCompositionModelCommitted(inputController);
          EDITOR_TO_USER_MARKS.set(editor, { italic: true });
          cleanupUpdate = vi.spyOn(editor, 'update').mockImplementation(() => {
            throw cleanupFailure;
          });
          throw modelFailure;
        },
        complete: vi.fn(),
        data: '文',
        discard: vi.fn(),
        inputType: 'insertFromComposition',
      });
      const pendingTask = scheduled.findLast((task) => !task.cancelled);
      let thrown: unknown;

      try {
        pendingTask?.callback();
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBe(modelFailure);
      expect(editorString(editor, [])).toBe('a文d');
      expect(inputController.state).toMatchObject({
        compositionSession: null,
        isComposing: false,
        pendingCompositionEnd: {
          data: '文',
          ownership: 'settled',
          phase: 'settled',
        },
      });
      expect(EDITOR_TO_USER_MARKS.has(editor)).toBe(false);
    } finally {
      cleanupUpdate?.mockRestore();
      inputController.state.pendingCompositionEnd?.cancel();
      hasSelectableTarget.mockRestore();
    }
  });

  it('restores marks and clears composition maps when Chrome fallback throws', () => {
    const editor = createTextEditor();
    const mutationFailure = new Error('mutation failed');
    const cleanupFailure = new Error('cleanup failed');
    const target = new Proxy(
      {},
      {
        get: () => {
          throw mutationFailure;
        },
      }
    ) as never;
    const rootElement = {
      querySelectorAll: () => {
        throw cleanupFailure;
      },
    } as unknown as HTMLElement;

    editor.update((tx) => {
      tx.selection.set({ path: [0, 0], offset: 1 });
      tx.marks.set({ italic: true });
    });
    EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, { bold: true });

    let thrown: unknown;

    try {
      commitChromeCompositionEndFallback({
        editor,
        rootElement,
        target,
        text: '文',
      });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBe(mutationFailure);
    expect(EDITOR_TO_PENDING_INSERTION_MARKS.has(editor)).toBe(false);
    expect(EDITOR_TO_USER_MARKS.has(editor)).toBe(false);
    expect(editor.read((state) => state.marks())).toEqual({ italic: true });
  });

  it('restores stale composition marks when Safari already ended composing', () => {
    const editor = createTextEditor();
    const event = createCompositionEvent('文', 'a文d');
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    const inputController = createInputController();
    const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
      vi.fn(() => () => {});

    editor.update((tx) => {
      tx.selection.set({ path: [0, 0], offset: 1 });
      tx.marks.set({ bold: true });
    });
    EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, { bold: true });
    EDITOR_TO_USER_MARKS.set(editor, { italic: true });
    beginEditableCompositionSession(inputController);
    inputController.state.activeIntent = 'composition';

    try {
      applyEditableCompositionEnd({
        androidInputManagerRef: { current: null },
        editor,
        event,
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing: vi.fn(),
      });

      expect(scheduleTask).not.toHaveBeenCalled();
      expect(inputController.state.activeIntent).toBeNull();
      expect(inputController.state.compositionSession).toBeNull();
      expect(EDITOR_TO_PENDING_INSERTION_MARKS.has(editor)).toBe(false);
      expect(EDITOR_TO_USER_MARKS.has(editor)).toBe(false);
      expect(editor.read((state) => state.marks())).toEqual({ italic: true });
    } finally {
      hasSelectableTarget.mockRestore();
    }
  });

  it('leaves Android composition completion to the Android manager', () => {
    const editor = createTextEditor();
    const frame = document.createElement('iframe');

    document.body.append(frame);
    const frameWindow = frame.contentWindow!;
    const root = frame.contentDocument!.createElement('div');

    Object.defineProperty(frameWindow.navigator, 'userAgent', {
      configurable: true,
      value:
        'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36',
    });
    frame.contentDocument!.body.append(root);
    const event = createCompositionEvent('文', 'a文d', root);
    const inputController = createInputController();
    const manager = { handleCompositionEnd: vi.fn() };
    const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
      vi.fn(() => () => {});
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    const setComposing = vi.fn();

    inputController.state.activeIntent = 'composition';
    inputController.state.isComposing = true;

    try {
      applyEditableCompositionEnd({
        androidInputManagerRef: { current: manager },
        editor,
        event,
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing,
      });

      expect(manager.handleCompositionEnd).toHaveBeenCalledOnce();
      expect(scheduleTask).not.toHaveBeenCalled();
      expect(setComposing).not.toHaveBeenCalled();
      expect(inputController.state.activeIntent).toBeNull();
      expect(inputController.state.pendingCompositionEnd).toBeNull();
      expect(editorString(editor, [])).toBe('abcd');
    } finally {
      frame.remove();
      hasSelectableTarget.mockRestore();
    }
  });

  it('defers externally owned composition completion without running fallback', () => {
    const editor = createTextEditor();
    const event = createCompositionEvent('文', 'a文d');
    const androidInputManager = { handleCompositionEnd: vi.fn() };
    const onCompositionEnd = vi.fn(() => true);
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    let deferredCompletion: (() => void) | undefined;
    const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
      vi.fn((_phase, _label, callback) => {
        deferredCompletion = callback;

        return () => {};
      });
    const runOwnedDOMMutation: NonNullable<
      Parameters<typeof applyEditableCompositionEnd>[0]['runOwnedDOMMutation']
    > = vi.fn((callback) => callback());
    const inputController = createInputController(scheduleTask);
    const setIsComposing = vi.fn();
    const setComposing: EditableCompositionStateSetter = (nextValue) => {
      setEditableComposingState({
        editor,
        inputController,
        nextValue,
        setIsComposing,
      });
    };

    setComposing(true);
    setIsComposing.mockClear();

    try {
      applyEditableCompositionEnd({
        androidInputManagerRef: { current: androidInputManager },
        editor,
        event,
        inputController,
        onCompositionEnd,
        runOwnedDOMMutation,
        scheduleTask,
        setComposing,
      });

      expect(androidInputManager.handleCompositionEnd).toHaveBeenCalledOnce();
      expect(onCompositionEnd).toHaveBeenCalledOnce();
      expect(scheduleTask).toHaveBeenCalledWith(
        'model',
        'finish-composition-end',
        expect.any(Function),
        { timing: 'timeout' }
      );
      expect(setIsComposing).not.toHaveBeenCalled();
      expect(editorString(editor, [])).toBe('abcd');
      expect(inputController.state).toMatchObject({
        isComposing: true,
        pendingCompositionEnd: {
          ownership: 'external',
          phase: 'end-pending',
        },
        selectionSource: 'composition-owned',
      });

      deferredCompletion?.();

      expect(runOwnedDOMMutation).toHaveBeenCalledOnce();
      expect(setIsComposing).toHaveBeenCalledOnce();
      expect(setIsComposing).toHaveBeenCalledWith(false);
      expect(editorString(editor, [])).toBe('abcd');
      expect(inputController.state).toMatchObject({
        isComposing: false,
        pendingCompositionEnd: null,
        selectionSource: 'unknown',
      });
    } finally {
      hasSelectableTarget.mockRestore();
    }
  });

  it('clears pending compositionend ownership when deferred completion throws', () => {
    const editor = createTextEditor();
    const event = createCompositionEvent('文');
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(true);
    let deferredCompletion: (() => void) | undefined;
    const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
      vi.fn((_phase, _label, callback) => {
        deferredCompletion = callback;

        return () => {};
      });
    const inputController = createInputController(scheduleTask);
    inputController.state.isComposing = true;
    const setComposing = vi.fn(() => {
      throw new Error('completion failed');
    });

    try {
      applyEditableCompositionEnd({
        androidInputManagerRef: { current: null },
        editor,
        event,
        inputController,
        onCompositionEnd: () => true,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing,
      });

      expect(inputController.state.pendingCompositionEnd).toMatchObject({
        ownership: 'external',
        phase: 'end-pending',
      });
      expect(() => deferredCompletion?.()).toThrow('completion failed');
      expect(inputController.state.pendingCompositionEnd).toBeNull();
    } finally {
      hasSelectableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it.each(['end', 'start', 'update'] as const)(
    'settles pending Plite composition model-only on a read-only %s event',
    (eventType) => {
      const editor = createTextEditor();
      const compositionEnd = createCompositionEvent('文', 'a文d');
      const readOnlyEvent = createCompositionEvent('文', 'a文d');
      const hasSelectableTarget = vi
        .spyOn(ReactEditor, 'hasSelectableTarget')
        .mockReturnValue(true);
      const hasEditableTarget = vi
        .spyOn(ReactEditor, 'hasEditableTarget')
        .mockReturnValue(true);
      const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
        vi.fn(() => () => {});
      const inputController = createInputController(scheduleTask);
      const setIsComposing = vi.fn();
      const setComposing: EditableCompositionStateSetter = (nextValue) => {
        setEditableComposingState({
          editor,
          inputController,
          nextValue,
          setIsComposing,
        });
      };

      beginEditableCompositionSession(inputController);
      setComposing(true);
      inputController.state.activeIntent = 'composition';
      editor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 1 });
      });
      EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, { bold: true });
      EDITOR_TO_USER_MARKS.set(editor, { italic: true });

      try {
        applyEditableCompositionEnd({
          androidInputManagerRef: { current: null },
          editor,
          event: compositionEnd,
          inputController,
          runOwnedDOMMutation: (callback) => callback(),
          scheduleTask,
          setComposing,
        });
        expect(inputController.state.pendingCompositionEnd).toMatchObject({
          ownership: 'plite',
          phase: 'end-pending',
        });

        if (eventType === 'end') {
          applyEditableCompositionEnd({
            androidInputManagerRef: { current: null },
            editor,
            event: readOnlyEvent,
            inputController,
            readOnly: true,
            runOwnedDOMMutation: (callback) => callback(),
            scheduleTask,
            setComposing,
          });
        } else if (eventType === 'start') {
          applyEditableCompositionStart({
            androidInputManagerRef: { current: null },
            editor,
            event: readOnlyEvent,
            inputController,
            readOnly: true,
            setComposing,
          });
        } else {
          applyEditableCompositionUpdate({
            editor,
            event: readOnlyEvent,
            inputController,
            readOnly: true,
            setComposing,
          });
        }

        expect(readOnlyEvent.preventDefault).toHaveBeenCalledOnce();
        expect(readOnlyEvent.stopPropagation).toHaveBeenCalledOnce();
        expect(editorString(editor, [])).toBe('a文bcd');
        expect(inputController.state).toMatchObject({
          activeIntent: null,
          compositionSession: null,
          isComposing: false,
          pendingCompositionEnd: null,
          selectionSource: 'unknown',
        });
        expect(ReactEditor.isComposing(editor)).toBe(false);
        expect(EDITOR_TO_PENDING_INSERTION_MARKS.has(editor)).toBe(false);
        expect(EDITOR_TO_USER_MARKS.has(editor)).toBe(false);
      } finally {
        inputController.state.pendingCompositionEnd?.cancel();
        if (ReactEditor.isComposing(editor)) setComposing(false);
        hasEditableTarget.mockRestore();
        hasSelectableTarget.mockRestore();
      }
    }
  );

  it.each(['external', 'settled'] as const)(
    'cancels %s composition ownership on a read-only update',
    (ownership) => {
      const editor = createTextEditor();
      const event = createCompositionEvent('ghost');
      const inputController = createInputController();
      const cancel = vi.fn(() => {
        inputController.state.pendingCompositionEnd = null;
      });
      const setIsComposing = vi.fn();
      const setComposing: EditableCompositionStateSetter = (nextValue) => {
        setEditableComposingState({
          editor,
          inputController,
          nextValue,
          setIsComposing,
        });
      };
      const hasEditableTarget = vi
        .spyOn(ReactEditor, 'hasEditableTarget')
        .mockReturnValue(true);

      beginEditableCompositionSession(inputController);
      setComposing(true);
      inputController.state.pendingCompositionEnd =
        ownership === 'external'
          ? { cancel, ownership, phase: 'end-pending' }
          : {
              cancel,
              data: 'ghost',
              inputTypes: ['insertText'],
              ownership,
              phase: 'settled',
            };

      try {
        applyEditableCompositionUpdate({
          editor,
          event,
          inputController,
          readOnly: true,
          setComposing,
        });

        expect(cancel).toHaveBeenCalledOnce();
        expect(inputController.state).toMatchObject({
          compositionSession: null,
          isComposing: false,
          pendingCompositionEnd: null,
        });
      } finally {
        hasEditableTarget.mockRestore();
      }
    }
  );

  it('does not predelete expanded selections on read-only compositionstart', () => {
    const editor = createTextEditor();
    const event = createCompositionEvent('文');
    const setComposing = vi.fn();
    const onCompositionStart = vi.fn();
    const androidInputManager = { handleCompositionStart: vi.fn() };
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);

    try {
      applyEditableCompositionStart({
        androidInputManagerRef: { current: androidInputManager },
        editor,
        event,
        onCompositionStart,
        readOnly: true,
        setComposing,
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(androidInputManager.handleCompositionStart).not.toHaveBeenCalled();
      expect(onCompositionStart).not.toHaveBeenCalled();
      expect(setComposing).not.toHaveBeenCalled();
      expect(editorString(editor, [])).toBe('abcd');
    } finally {
      hasEditableTarget.mockRestore();
    }
  });

  it('does not commit Chrome composition fallback while read-only', () => {
    const editor = createTextEditor('stable');
    const event = createCompositionEvent('!');
    const setComposing = vi.fn();
    const onCompositionEnd = vi.fn();
    const androidInputManager = { handleCompositionEnd: vi.fn() };
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(true);
    const scheduleTask: NonNullable<EditableInputController['scheduleTask']> =
      vi.fn(() => () => {});

    try {
      applyEditableCompositionEnd({
        androidInputManagerRef: { current: androidInputManager },
        editor,
        event,
        inputController: createInputController(),
        onCompositionEnd,
        readOnly: true,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing,
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(androidInputManager.handleCompositionEnd).not.toHaveBeenCalled();
      expect(onCompositionEnd).not.toHaveBeenCalled();
      expect(scheduleTask).not.toHaveBeenCalled();
      expect(setComposing).toHaveBeenCalledWith(false);
      expect(editorString(editor, [])).toBe('stable');
    } finally {
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('does not enter composition state on read-only compositionupdate', () => {
    const editor = createTextEditor();
    const event = createCompositionEvent('ghost');
    const setComposing = vi.fn();
    const onCompositionUpdate = vi.fn();
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);

    try {
      applyEditableCompositionUpdate({
        editor,
        event,
        onCompositionUpdate,
        readOnly: true,
        setComposing,
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(onCompositionUpdate).not.toHaveBeenCalled();
      expect(setComposing).not.toHaveBeenCalled();
      expect(editorString(editor, [])).toBe('abcd');
    } finally {
      hasEditableTarget.mockRestore();
    }
  });
});
