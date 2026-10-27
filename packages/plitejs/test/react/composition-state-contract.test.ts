import {
  defineEffect,
  definePlugin,
  defineStateField,
  editorCommands,
  type Point,
  type Value,
} from 'plitejs';
import { createAuthoredPlugin } from 'plitejs/authored';
import { history } from 'plitejs/history';
import { createEditor, type Editor } from 'plitejs/react';
import type { CompositionEvent } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isEditorCompositionPending } from '../../src/core/public-state';
import { EditorRefusalError } from '../../src/core/refusal';
import {
  EDITOR_TO_PENDING_INSERTION_MARKS,
  EDITOR_TO_USER_MARKS,
} from '../../src/dom/internal';
import { projectEditorView } from '../../src/editor-runtime-view';
import {
  applyEditableCompositionEnd as applyEditableCompositionEndRuntime,
  applyEditableCompositionStart,
  applyEditableCompositionUpdate,
  commitChromeCompositionEndFallback,
} from '../../src/react/editable/composition-state';
import { EditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';
import {
  type EditableCompositionStateSetter,
  setEditableComposingState,
} from '../../src/react/editable/input-controller';
import {
  cancelCompositionReceipt,
  commitUnderCompositionReceipt,
  createEditableInputController,
  createEditableInputControllerState,
  beginEditableCompositionSession,
  openCompositionReceipt,
  markEditableCompositionModelCommitted,
  runTrackedEditableCompositionMutation,
  shouldMergeEditableCompositionHistory,
  type EditableInputController,
  type PendingCompositionInput,
} from '../../src/react/editable/input-state';
import { applyModelOwnedBeforeInputMutation } from '../../src/react/editable/model-input-strategy';
import {
  claimSettledCompositionInput,
  queuePendingCompositionModelInput,
} from '../../src/react/editable/runtime-before-input-events';
import { createReactRuntimeViewEditor } from '../../src/react/hooks/use-plite-runtime';
import { ReactEditor } from '../../src/react/plugin/react-editor';
import {
  getSelection as editorGetSelection,
  replace as editorReplace,
  string as editorString,
} from '../../src/testing';
import { readTextSelection } from './read-text-selection';

const replayMountedHistory = async (
  editor: Editor,
  direction: 'redo' | 'undo'
) => {
  const runtime = new EditableDOMRuntime({ editor });

  runtime.setRoot(document.createElement('div'));
  runtime.connect();
  try {
    const result = await new Promise<{ status: string }>((resolve) => {
      runtime.dispatchHistory(direction, 'restore-root', resolve);
    });
    return result.status !== 'unavailable';
  } finally {
    runtime.destroy();
  }
};

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

  return editor;
};

const readVisibleEditorState = (editor: Editor) =>
  editor.read((state) => ({
    selection: structuredClone(state.selection()),
    value: structuredClone(state.value()),
  }));

const createMarkedHistoryEditor = () => {
  const editor = createEditor({ plugins: [history()] });

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
  currentTarget: Pick<
    HTMLElement,
    'querySelectorAll' | 'textContent'
  > = Object.assign(document.createElement('div'), {
    textContent: textContent ?? '',
  })
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
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);

    try {
      applyEditableCompositionStart({
        editor,
        event,
        inputController,
        setComposing,
      });
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

  it('keeps a marked multi-leaf composition replacement in one history unit', async () => {
    const { before, editor } = createMarkedHistoryEditor();
    const inputController = createInputController();
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    const pendingInput: { current: PendingCompositionInput | null } = {
      current: null,
    };

    try {
      applyEditableCompositionStart({
        editor,
        event: createCompositionEvent(),
        inputController,
        setComposing: vi.fn(),
      });
      const compositionSelection = readTextSelection(editor);

      expect(compositionSelection).not.toBeNull();
      expect(editorString(editor, [])).toBe('This is , done');
      inputController.state.pendingCompositionEnd = {
        cancel: vi.fn(),
        flush: vi.fn(() => false),
        ownership: 'editor',
        phase: 'end-pending',
        replaceWithInput: (input) => {
          pendingInput.current = input;
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

      if (!pendingInput.current || !compositionSelection) {
        throw new Error('expected queued composition input');
      }
      expect(
        pendingInput.current.commit(compositionSelection, { publish: true })
      ).toBe(true);
      const composed = readVisibleEditorState(editor);

      expect(editorString(editor, [])).toBe('This is すし, done');
      expect(await replayMountedHistory(editor, 'undo')).toBe(true);
      expect(
        editor.read((state) => ({
          selection: state.selection(),
          value: state.value(),
        }))
      ).toEqual(before);
      expect(await replayMountedHistory(editor, 'redo')).toBe(true);
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

  it('keeps direct final composition input in the expanded replacement history unit', async () => {
    const { before, editor } = createMarkedHistoryEditor();
    const inputController = createInputController();
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);

    try {
      applyEditableCompositionStart({
        editor,
        event: createCompositionEvent(),
        inputController,
        setComposing: vi.fn(),
      });
      const compositionSelection = readTextSelection(editor);

      expect(compositionSelection).not.toBeNull();
      applyModelOwnedBeforeInputMutation({
        data: 'すし',
        editor,
        inputController,
        inputType: 'insertFromComposition',
        mergeHistory: shouldMergeEditableCompositionHistory(inputController),
        native: false,
        selection: compositionSelection,
        setComposing: vi.fn(),
      });
      const composed = readVisibleEditorState(editor);

      expect(editorString(editor, [])).toBe('This is すし, done');
      expect(await replayMountedHistory(editor, 'undo')).toBe(true);
      expect(readVisibleEditorState(editor)).toEqual(before);
      expect(await replayMountedHistory(editor, 'redo')).toBe(true);
      expect(readVisibleEditorState(editor)).toEqual(composed);
    } finally {
      hasSelectableTarget.mockRestore();
    }
  });

  it('keeps the marks where a selection starts when a mounted view composes over it on the direct route', () => {
    const owner = createEditor();

    editorReplace(owner, {
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
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 2], offset: ' text'.length },
      },
    });
    const editor = createReactRuntimeViewEditor(projectEditorView(owner, {}));
    const inputController = createInputController();
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);

    try {
      applyEditableCompositionStart({
        editor,
        event: createCompositionEvent(),
        inputController,
        setComposing: vi.fn(),
      });
      applyModelOwnedBeforeInputMutation({
        data: 'すし',
        editor,
        inputController,
        inputType: 'insertFromComposition',
        mergeHistory: shouldMergeEditableCompositionHistory(inputController),
        native: false,
        selection: readTextSelection(editor),
        setComposing: vi.fn(),
      });

      expect(owner.read((state) => state.children())).toEqual([
        {
          children: [
            { text: 'This is editable ' },
            { bold: true, text: 'すし' },
            { text: ', done' },
          ],
          type: 'paragraph',
        },
      ]);
    } finally {
      hasSelectableTarget.mockRestore();
    }
  });

  it('keeps Chrome fallback input in the expanded replacement history unit', async () => {
    const { before, editor } = createMarkedHistoryEditor();
    const inputController = createInputController();
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);

    try {
      applyEditableCompositionStart({
        editor,
        event: createCompositionEvent(),
        inputController,
        setComposing: vi.fn(),
      });
      const compositionSelection = readTextSelection(editor);

      if (!compositionSelection) {
        throw new Error('expected composition selection');
      }
      expect(
        commitChromeCompositionEndFallback({
          editor,
          inputController,
          mergeHistory: shouldMergeEditableCompositionHistory(inputController),
          target: compositionSelection,
          text: 'すし',
        })
      ).toBe(true);
      const composed = readVisibleEditorState(editor);

      expect(editorString(editor, [])).toBe('This is すし, done');
      expect(await replayMountedHistory(editor, 'undo')).toBe(true);
      expect(readVisibleEditorState(editor)).toEqual(before);
      expect(await replayMountedHistory(editor, 'redo')).toBe(true);
      expect(readVisibleEditorState(editor)).toEqual(composed);
    } finally {
      hasSelectableTarget.mockRestore();
    }
  });

  it('undoes a composition over a selection and its insert handler’s effect in one step', async () => {
    const bump = defineEffect<number>({
      invert: (value) => -value,
      key: 'test.composition-bump',
    });
    const bumps = defineStateField<number>({
      initial: () => 0,
      key: 'test.composition-bumps',
      reduce: (value, effect) =>
        effect.type === bump ? value + effect.value : value,
    });
    const editor = createEditor({
      plugins: [
        history(),
        definePlugin('composition-bump', {
          commands: ({ around }) => [
            around(editorCommands.insertText, ({ input, next, state }) =>
              input.text
                ? next.after(
                    state.transaction((tx) => {
                      tx.effects.emit(bump, 1);
                    })
                  )
                : next()
            ),
          ],
          effectTypes: [bump],
          stateFields: [bumps],
        }),
      ],
    });
    const read = () => ({
      bumps: editor.read.getField(bumps),
      text: editorString(editor, []),
    });

    editorReplace(editor, {
      children: [{ type: 'paragraph', children: [{ text: 'abcd' }] }],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 3 },
      },
    });
    const inputController = createInputController();
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);

    try {
      applyEditableCompositionStart({
        editor,
        event: createCompositionEvent(),
        inputController,
        setComposing: vi.fn(),
      });
      applyModelOwnedBeforeInputMutation({
        data: 'すし',
        editor,
        inputController,
        inputType: 'insertFromComposition',
        mergeHistory: shouldMergeEditableCompositionHistory(inputController),
        native: false,
        selection: readTextSelection(editor),
        setComposing: vi.fn(),
      });
      const composed = read();

      await replayMountedHistory(editor, 'undo');
      const undone = read();

      await replayMountedHistory(editor, 'redo');

      expect({ composed, redone: read(), undone }).toEqual({
        composed: { bumps: 1, text: 'aすしd' },
        redone: { bumps: 1, text: 'aすしd' },
        undone: { bumps: 0, text: 'abcd' },
      });
    } finally {
      hasSelectableTarget.mockRestore();
    }
  });

  it.each([
    ['WebKit’s direct route', 'direct'],
    ['Chrome’s fallback', 'fallback'],
  ] as const)(
    'undoes a composition over a selection whose insert handler only emits an effect in one step on %s',
    async (_, route) => {
      const bump = defineEffect<number>({
        invert: (value) => -value,
        key: 'test.composition-consumed-bump',
      });
      const bumps = defineStateField<number>({
        initial: () => 0,
        key: 'test.composition-consumed-bumps',
        reduce: (value, effect) =>
          effect.type === bump ? value + effect.value : value,
      });
      const editor = createEditor({
        plugins: [
          history(),
          definePlugin('composition-consumed-bump', {
            commands: ({ around }) => [
              around(editorCommands.insertText, ({ input, next, state }) =>
                input.text
                  ? state.transaction((tx) => {
                      tx.effects.emit(bump, 1);
                    })
                  : next()
              ),
            ],
            effectTypes: [bump],
            stateFields: [bumps],
          }),
        ],
      });
      const read = () => ({
        bumps: editor.read.getField(bumps),
        text: editorString(editor, []),
      });

      editorReplace(editor, {
        children: [{ type: 'paragraph', children: [{ text: 'abcd' }] }],
        selection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 3 },
        },
      });
      const inputController = createInputController();
      const hasSelectableTarget = vi
        .spyOn(ReactEditor, 'hasSelectableTarget')
        .mockReturnValue(true);

      try {
        applyEditableCompositionStart({
          editor,
          event: createCompositionEvent(),
          inputController,
          setComposing: vi.fn(),
        });
        const target = readTextSelection(editor);

        if (!target) throw new Error('expected composition selection');
        if (route === 'direct') {
          applyModelOwnedBeforeInputMutation({
            data: 'すし',
            editor,
            inputController,
            inputType: 'insertFromComposition',
            mergeHistory:
              shouldMergeEditableCompositionHistory(inputController),
            native: false,
            selection: target,
            setComposing: vi.fn(),
          });
        } else {
          commitChromeCompositionEndFallback({
            editor,
            inputController,
            mergeHistory:
              shouldMergeEditableCompositionHistory(inputController),
            target,
            text: 'すし',
          });
        }
        const composed = read();

        await replayMountedHistory(editor, 'undo');
        const undone = read();

        await replayMountedHistory(editor, 'redo');

        expect({ composed, redone: read(), undone }).toEqual({
          composed: { bumps: 1, text: 'ad' },
          redone: { bumps: 1, text: 'ad' },
          undone: { bumps: 0, text: 'abcd' },
        });
      } finally {
        hasSelectableTarget.mockRestore();
      }
    }
  );

  it.each([
    ['WebKit’s direct route', 'direct'],
    ['Chrome’s fallback', 'fallback'],
  ] as const)(
    'undoes a composition in crossed-out text whose insert handler emits an effect on every insert in one step on %s',
    async (_, route) => {
      const bump = defineEffect<number>({
        invert: (value) => -value,
        key: 'test.composition-every-bump',
      });
      const bumps = defineStateField<number>({
        initial: () => 0,
        key: 'test.composition-every-bumps',
        reduce: (value, effect) =>
          effect.type === bump ? value + effect.value : value,
      });
      const editor = createEditor({
        initialValue: [
          {
            type: 'paragraph',
            children: [
              { text: 'a' },
              {
                authored: [
                  { at: 1, author: 'bob', change: 'bob:1', kind: 'delete' },
                ],
                text: 'gone',
              },
              { text: 'b' },
            ],
          },
        ],
        plugins: [
          history(),
          createAuthoredPlugin({
            authorId: 'dan',
            createChangeId: () => 'dan:1',
            intent: 'edit',
            now: () => 1000,
          }),
          definePlugin('composition-every-bump', {
            commands: ({ around }) => [
              around(editorCommands.insertText, ({ next, state }) =>
                next.after(
                  state.transaction((tx) => {
                    tx.effects.emit(bump, 1);
                  })
                )
              ),
            ],
            effectTypes: [bump],
            stateFields: [bumps],
          }),
        ],
      });
      editor.update((tx) => {
        tx.selection.set({
          anchor: { path: [0, 1], offset: 1 },
          focus: { path: [0, 1], offset: 3 },
        });
      });
      const read = () => ({
        bumps: editor.read.getField(bumps),
        ...readVisibleEditorState(editor),
      });
      const before = read();
      const inputController = createInputController();
      const hasSelectableTarget = vi
        .spyOn(ReactEditor, 'hasSelectableTarget')
        .mockReturnValue(true);

      try {
        applyEditableCompositionStart({
          editor,
          event: createCompositionEvent(),
          inputController,
          setComposing: vi.fn(),
        });
        const target = readTextSelection(editor);

        if (!target) throw new Error('expected composition selection');
        if (route === 'direct') {
          applyModelOwnedBeforeInputMutation({
            data: 'か',
            editor,
            inputController,
            inputType: 'insertFromComposition',
            mergeHistory:
              shouldMergeEditableCompositionHistory(inputController),
            native: false,
            selection: target,
            setComposing: vi.fn(),
          });
        } else {
          commitChromeCompositionEndFallback({
            editor,
            inputController,
            mergeHistory:
              shouldMergeEditableCompositionHistory(inputController),
            target,
            text: 'か',
          });
        }
        const composed = read().bumps;

        await replayMountedHistory(editor, 'undo');

        expect({ composed, undone: read() }).toEqual({
          composed: 2,
          undone: before,
        });
      } finally {
        hasSelectableTarget.mockRestore();
      }
    }
  );

  it('undoes Korean syllables composed on Safari’s direct route in the steps they took', async () => {
    const editor = createEditor({ plugins: [history()] });

    editorReplace(editor, {
      children: [{ type: 'paragraph', children: [{ text: 'ab' }] }],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      },
    });
    const inputController = createInputController();
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);

    try {
      for (const syllable of ['한', '국', '어']) {
        applyEditableCompositionStart({
          editor,
          event: createCompositionEvent(),
          inputController,
          setComposing: vi.fn(),
        });
        applyModelOwnedBeforeInputMutation({
          data: syllable,
          editor,
          inputController,
          inputType: 'insertFromComposition',
          mergeHistory: shouldMergeEditableCompositionHistory(inputController),
          native: false,
          selection: readTextSelection(editor),
          setComposing: vi.fn(),
        });
        applyEditableCompositionEnd({
          editor,
          event: createCompositionEvent(syllable),
          inputController,
          runOwnedDOMMutation: (callback) => callback(),
          scheduleTask: vi.fn(() => () => {}),
          setComposing: vi.fn(),
        });
      }
      const composed = editorString(editor, []);
      const steps: string[] = [];

      while (steps.length < 3 && editorString(editor, []) !== 'ab') {
        await replayMountedHistory(editor, 'undo');
        steps.push(editorString(editor, []));
      }

      expect({ composed, steps }).toEqual({
        composed: 'ab한국어',
        steps: ['ab'],
      });
    } finally {
      hasSelectableTarget.mockRestore();
    }
  });

  it('does not merge collapsed composition input with an unrelated edit', async () => {
    const editor = createEditor({ plugins: [history()] });
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
        selection: readTextSelection(editor),
        setComposing: vi.fn(),
      });

      expect(editorString(editor, [0])).toBe('a文b');
      expect(editorString(editor, [1])).toBe('tail!');
      expect(await replayMountedHistory(editor, 'undo')).toBe(true);
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
          ownership: 'editor',
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
        editor,
        event: createCompositionEvent('文', 'a文d'),
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask: inputController.scheduleTask!,
        setComposing,
      });
      expect(inputController.state.pendingCompositionEnd).toMatchObject({
        ownership: 'editor',
        phase: 'end-pending',
      });

      applyEditableCompositionStart({
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
          editor,
          event,
          inputController,
          runOwnedDOMMutation: (callback) => callback(),
          scheduleTask,
          setComposing,
        });
        const { pendingCompositionEnd } = inputController.state;

        if (pendingCompositionEnd?.ownership !== 'editor') {
          throw new Error('expected Plite-owned composition end');
        }
        if (phase === 'input-claimed') {
          const selection = readTextSelection(editor);

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

      if (pendingCompositionEnd?.ownership !== 'editor') {
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

  it('settles a successful Chrome fallback before the composition lease settle throws', () => {
    const editor = createTextEditor();
    const event = createCompositionEvent('文', 'a文d');
    const settleFailure = new Error('composition lease settle failed');
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
        editor,
        event,
        inputController,
        lease: {
          grant: vi.fn(),
          settleAndFlushRender: vi.fn(),
          settle: () => {
            throw settleFailure;
          },
        },
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

      expect(thrown).toBe(settleFailure);
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
    const compositionSelection = readTextSelection(editor);
    const anchorFields = {
      association: 'inward' as const,
      deletion: 'drop' as const,
      kind: 'range' as const,
      root: undefined,
      resolve: () => compositionSelection,
    };
    const anchor = vi
      .spyOn(editor, 'anchor')
      .mockReturnValueOnce({
        ...anchorFields,
        release: () => compositionSelection,
      })
      .mockReturnValueOnce({ ...anchorFields, release: () => null });
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
        editor,
        event,
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing,
      });
      const { pendingCompositionEnd } = inputController.state;

      if (pendingCompositionEnd?.ownership !== 'editor') {
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
          editor,
          event,
          inputController,
          runOwnedDOMMutation: (callback) => callback(),
          scheduleTask,
          setComposing,
        });

        const { pendingCompositionEnd } = inputController.state;

        expect(pendingCompositionEnd?.ownership).toBe('editor');
        if (pendingCompositionEnd?.ownership !== 'editor') {
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
        editor,
        event,
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing,
      });
      const { pendingCompositionEnd } = inputController.state;

      if (pendingCompositionEnd?.ownership !== 'editor') {
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
        editor,
        event,
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing,
      });
      const { pendingCompositionEnd } = inputController.state;

      if (pendingCompositionEnd?.ownership !== 'editor') {
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
        editor,
        event,
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing,
      });
      const { pendingCompositionEnd } = inputController.state;

      if (pendingCompositionEnd?.ownership !== 'editor') {
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
        editor,
        event,
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing,
      });
      const { pendingCompositionEnd } = inputController.state;

      if (pendingCompositionEnd?.ownership !== 'editor') {
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
        editor,
        event,
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing,
      });
      const { pendingCompositionEnd } = inputController.state;

      if (pendingCompositionEnd?.ownership !== 'editor') {
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
    const cleanupRead: { current: { mockRestore: () => void } | null } = {
      current: null,
    };
    const anchor = vi.spyOn(editor, 'anchor').mockReturnValue({
      association: 'inward',
      deletion: 'drop',
      kind: 'range',
      root: undefined,
      resolve: () => null,
      release: () => {
        cleanupRead.current = vi
          .spyOn(editor, 'read')
          .mockImplementation(() => {
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
      cleanupRead.current?.mockRestore();
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
    const cleanupUpdate: { current: { mockRestore: () => void } | null } = {
      current: null,
    };

    beginEditableCompositionSession(inputController);
    setComposing(true);

    try {
      applyEditableCompositionEnd({
        editor,
        event,
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing,
      });
      const { pendingCompositionEnd } = inputController.state;

      if (pendingCompositionEnd?.ownership !== 'editor') {
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
          cleanupUpdate.current = vi
            .spyOn(editor, 'update')
            .mockImplementation(() => {
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
      cleanupUpdate.current?.mockRestore();
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

  it('leaves an Android compositionend with no open run alone', () => {
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
        editor,
        event,
        inputController,
        runOwnedDOMMutation: (callback) => callback(),
        scheduleTask,
        setComposing,
      });

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
        editor,
        event,
        inputController,
        onCompositionEnd,
        runOwnedDOMMutation,
        scheduleTask,
        setComposing,
      });
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
          editor,
          event: compositionEnd,
          inputController,
          runOwnedDOMMutation: (callback) => callback(),
          scheduleTask,
          setComposing,
        });
        expect(inputController.state.pendingCompositionEnd).toMatchObject({
          ownership: 'editor',
          phase: 'end-pending',
        });

        if (eventType === 'end') {
          applyEditableCompositionEnd({
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
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);

    try {
      applyEditableCompositionStart({
        editor,
        event,
        onCompositionStart,
        readOnly: true,
        setComposing,
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
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

describe('composition over an expanded selection', () => {
  const suggestingEditor = (initialValue: Value) =>
    createEditor({
      plugins: [
        createAuthoredPlugin({
          authorId: 'dan',
          createChangeId: () => 'dan:1',
          intent: 'propose',
          now: () => 1000,
        }),
      ],
      initialValue,
    });
  const plainEditor = (initialValue: Value) => createEditor({ initialValue });
  const select = (editor: Editor, anchor: Point, focus: Point) =>
    editor.update((tx) => {
      tx.selection.set({ anchor, focus });
    });
  const compose = (editor: Editor, text?: string) => {
    const inputController = createInputController();
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);

    try {
      applyEditableCompositionStart({
        editor,
        event: createCompositionEvent(),
        inputController,
        setComposing: vi.fn(),
      });
      if (text === undefined) return;
      applyModelOwnedBeforeInputMutation({
        data: text,
        editor,
        inputController,
        inputType: 'insertFromComposition',
        mergeHistory: shouldMergeEditableCompositionHistory(inputController),
        native: false,
        selection: readTextSelection(editor),
        setComposing: vi.fn(),
      });
    } finally {
      hasSelectableTarget.mockRestore();
    }
  };
  const carolDeletes = (text: string) => ({
    authored: [
      { at: 1, author: 'carol', change: 'carol:1', kind: 'delete' as const },
    ],
    text,
  });
  const danDeletes = {
    at: 1000,
    author: 'dan',
    change: 'dan:1',
    kind: 'delete' as const,
  };

  it('records what the delete command records when cancelled over a struck-only heading and the next line', () => {
    const editor = suggestingEditor([
      { type: 'heading', children: [carolDeletes('ab')] },
      { type: 'paragraph', children: [{ text: 'cd' }] },
    ]);

    select(editor, { path: [0, 0], offset: 2 }, { path: [1, 0], offset: 1 });
    compose(editor);

    expect(editor.read.children()).toEqual([
      {
        type: 'heading',
        authored: [danDeletes],
        children: [
          {
            authored: [carolDeletes('ab').authored[0], danDeletes],
            text: 'ab',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [{ authored: [danDeletes], text: 'c' }, { text: 'd' }],
      },
    ]);
  });

  it.each([
    ['a whole selected line', { path: [1, 0], offset: 2 }],
    ['a triple-click selection', { path: [2, 0], offset: 0 }],
  ])('lands its text in the line over %s, as typing does', (_, focus) => {
    const editor = plainEditor([
      { type: 'paragraph', children: [{ text: 'ab' }] },
      { type: 'paragraph', children: [{ text: 'cd' }] },
      { type: 'heading', children: [{ text: 'ef' }] },
    ]);

    select(editor, { path: [1, 0], offset: 0 }, focus);
    compose(editor, 'X');

    expect(editor.read.children()).toEqual([
      { type: 'paragraph', children: [{ text: 'ab' }] },
      { type: 'paragraph', children: [{ text: 'X' }] },
      { type: 'heading', children: [{ text: 'ef' }] },
    ]);
  });

  it('lands its text in one new paragraph over a heading and a paragraph selected whole, as typing does', () => {
    const editor = plainEditor([
      { type: 'heading', children: [{ text: 'ab' }] },
      { type: 'paragraph', children: [{ text: 'cd' }] },
    ]);

    select(editor, { path: [0, 0], offset: 0 }, { path: [1, 0], offset: 2 });
    compose(editor, 'に');

    expect(editor.read.children()).toEqual([
      { type: 'paragraph', children: [{ text: 'に' }] },
    ]);
  });
});

describe('a composition’s terminal receipt', () => {
  const dansInsert = {
    at: 1000,
    author: 'dan',
    change: 'dan:1',
    kind: 'insert' as const,
  };
  const tick = () =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
  const attempt = (callback: () => void) => {
    try {
      callback();
      return 'ok';
    } catch (error) {
      return (error as Error).message;
    }
  };
  const setup = (root?: HTMLElement) => {
    const handler = {
      calls: 0,
      outcome: 'pass' as 'pass' | 'refuse' | 'throw',
    };
    const editor = createEditor({
      initialValue: [{ type: 'paragraph', children: [{ text: 'ab' }] }],
      plugins: [
        createAuthoredPlugin({
          authorId: 'dan',
          createChangeId: () => 'dan:1',
          intent: 'edit',
          now: () => 1000,
        }),
        definePlugin('composed-word', {
          commands: ({ handle }) => [
            handle(editorCommands.insertText, ({ input }) => {
              if (input.text !== 'か' || handler.outcome === 'pass') {
                return false;
              }
              handler.calls += 1;
              if (handler.outcome === 'refuse') {
                throw new EditorRefusalError(null, 'The word is refused.');
              }
              throw new Error('The insert handler failed.');
            }),
          ],
        }),
      ],
    });

    editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      });
    });
    const tasks: Array<{
      callback: () => void;
      cancelled: boolean;
      label: string;
    }> = [];
    const scheduleTask: NonNullable<EditableInputController['scheduleTask']> = (
      _phase,
      label,
      callback
    ) => {
      const task = { callback, cancelled: false, label };

      tasks.push(task);
      return () => {
        task.cancelled = true;
      };
    };
    const inputController = createInputController(scheduleTask);
    const setComposing: EditableCompositionStateSetter = (nextValue) => {
      setEditableComposingState({
        editor,
        inputController,
        nextValue,
        setIsComposing: () => {},
      });
    };
    const event = (data = '') => createCompositionEvent(data, null, root);

    return {
      editor,
      handler,
      inputController,
      end: (
        data: string,
        options: Partial<ApplyEditableCompositionEndOptions> = {}
      ) =>
        applyEditableCompositionEnd({
          editor,
          event: event(data),
          inputController,
          runOwnedDOMMutation: (callback) => callback(),
          scheduleTask,
          setComposing,
          ...options,
        }),
      finalInput: (inputComposing = false) => {
        if (
          !inputComposing &&
          claimSettledCompositionInput({
            data: 'か',
            inputController,
            inputType: 'insertFromComposition',
          })
        ) {
          return;
        }
        applyModelOwnedBeforeInputMutation({
          data: 'か',
          editor,
          inputController,
          inputType: 'insertFromComposition',
          native: false,
          selection: readTextSelection(editor),
          setComposing,
        });
      },
      elapse: () => {
        for (const task of tasks.splice(0)) {
          if (task.cancelled) continue;
          task.cancelled = true;
          task.callback();
        }
      },
      run: (label: string) => {
        const task = tasks.findLast(
          (each) => !each.cancelled && each.label === label
        );

        if (!task) throw new Error(`No ${label} task is waiting.`);
        task.cancelled = true;
        task.callback();
      },
      update: (data: string) =>
        applyEditableCompositionUpdate({
          editor,
          event: event(data),
          inputController,
          setComposing,
        }),
      start: () =>
        applyEditableCompositionStart({
          editor,
          event: event(),
          inputController,
          setComposing,
        }),
      switchToSuggesting: () =>
        editor.api.authored.setView({ intent: 'propose' }),
      typeKey: () =>
        editor.update((tx) => {
          tx.command(editorCommands.insertText, { text: 'z' });
        }),
    };
  };
  const nextKeySuggested = (text: string) => [
    {
      type: 'paragraph',
      children: [{ text }, { authored: [dansInsert], text: 'z' }],
    },
  ];
  let hasSelectableTarget: { mockRestore: () => void } | undefined;

  beforeEach(() => {
    hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
  });
  afterEach(() => {
    hasSelectableTarget?.mockRestore();
  });

  it('applies an intent switch asked for during Safari’s direct route after the word lands', async () => {
    const s = setup();

    s.start();
    s.switchToSuggesting();
    await tick();
    s.finalInput(true);
    s.end('か');
    await tick();
    s.typeKey();

    expect(s.editor.read.children()).toEqual(nextKeySuggested('abか'));
  });

  it('keeps the composition pending while another Editable on the editor still owes its word', () => {
    const editor = createEditor();
    const first = createInputController();
    const second = createInputController();

    openCompositionReceipt(editor, first);
    openCompositionReceipt(editor, second);
    commitUnderCompositionReceipt(first, () => {});
    const afterFirst = isEditorCompositionPending(editor);

    cancelCompositionReceipt(second);

    expect([afterFirst, isEditorCompositionPending(editor)]).toEqual([
      true,
      false,
    ]);
  });

  it.each([
    ['refuses the word', 'refuse'],
    ['throws', 'throw'],
  ] as const)(
    'ends the composition once when its insert handler %s',
    (_, outcome) => {
      const s = setup();

      s.handler.outcome = outcome;
      s.start();
      s.end('か');
      const fallback = attempt(() => s.run('finish-composition-end'));
      const late = attempt(() => s.finalInput());

      expect({
        calls: s.handler.calls,
        composing: s.editor.read.view.isComposing(),
        fallback,
        late,
        pending: isEditorCompositionPending(s.editor),
        text: editorString(s.editor, []),
      }).toEqual({
        calls: 1,
        composing: false,
        fallback: outcome === 'throw' ? 'The insert handler failed.' : 'ok',
        late: 'ok',
        pending: false,
        text: 'ab',
      });
    }
  );

  it.each([
    ['an Escape cancel', 'ab', (s: ReturnType<typeof setup>) => s.end('')],
    [
      'an externally owned end',
      'ab',
      (s: ReturnType<typeof setup>) => {
        s.end('か', { onCompositionEnd: () => true });
        s.run('finish-composition-end');
      },
    ],
    [
      'an expired late-input guard',
      'abか',
      (s: ReturnType<typeof setup>) => {
        runTrackedEditableCompositionMutation({
          callback: () =>
            s.editor.update((tx) => {
              tx.text.insert('か');
            }),
          editor: s.editor,
          inputController: s.inputController,
        });
        s.end('か');
        s.run('finish-composition-end');
        s.run('clear-composition-end-tombstone');
      },
    ],
  ] as const)(
    'applies an intent switch waiting through %s, so the next key records under it',
    async (_, text, finish) => {
      const s = setup();

      s.start();
      s.switchToSuggesting();
      await tick();
      finish(s);
      await tick();
      s.typeKey();

      expect(s.editor.read.children()).toEqual(nextKeySuggested(text));
    }
  );

  const onWebKit = async (
    callback: (s: ReturnType<typeof setup>) => Promise<void>
  ) => {
    const frame = document.createElement('iframe');

    document.body.append(frame);
    Object.defineProperty(frame.contentWindow!.navigator, 'userAgent', {
      configurable: true,
      value:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
    });
    const root = frame.contentDocument!.createElement('div');

    frame.contentDocument!.body.append(root);
    try {
      await callback(setup(root));
    } finally {
      frame.remove();
    }
  };

  it('leaves the final input to commit under the composition’s intent when a WebKit fallback returns early and the input lands before the expiry', () =>
    onWebKit(async (s) => {
      s.start();
      s.switchToSuggesting();
      await tick();
      s.end('か');
      s.run('finish-composition-end');
      await tick();
      s.finalInput();
      s.elapse();
      await tick();
      s.typeKey();

      expect(s.editor.read.children()).toEqual(nextKeySuggested('abか'));
    }));

  it('applies an intent switch once a WebKit composition’s late final input never comes', () =>
    onWebKit(async (s) => {
      s.start();
      s.switchToSuggesting();
      await tick();
      s.end('か');
      s.run('finish-composition-end');
      s.elapse();
      await tick();
      s.typeKey();

      expect(s.editor.read.children()).toEqual(nextKeySuggested('ab'));
    }));

  it('keeps an intent switch waiting through the next WebKit composition when the previous one’s expiry fires during it', () =>
    onWebKit(async (s) => {
      s.start();
      s.end('か');
      s.run('finish-composition-end');
      s.start();
      s.switchToSuggesting();
      await tick();
      s.run('expire-composition-receipt');
      s.end('か');
      s.run('finish-composition-end');
      await tick();
      s.finalInput();
      await tick();
      s.typeKey();

      expect(s.editor.read.children()).toEqual(nextKeySuggested('abか'));
    }));

  it('commits a composition opened by compositionupdate while the previous one’s late-input guard expires', () => {
    const s = setup();

    s.start();
    runTrackedEditableCompositionMutation({
      callback: () =>
        s.editor.update((tx) => {
          tx.text.insert('か');
        }),
      editor: s.editor,
      inputController: s.inputController,
    });
    s.end('か');
    s.run('finish-composition-end');
    s.update('き');
    s.run('clear-composition-end-tombstone');
    s.end('き');
    s.run('finish-composition-end');

    expect(editorString(s.editor, [])).toBe('abかき');
  });
});
