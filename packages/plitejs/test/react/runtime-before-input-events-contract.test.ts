import {
  type InitialValue,
  type Value,
  type TextSelection,
  createEditor,
  createEditorView,
  defineExtension,
  editorCommands,
  getEditorRuntimeOwner,
} from 'plitejs';

import {
  replace as editorReplace,
  string as editorString,
} from '../../src/internal';
import {
  createEditableInputController,
  createEditableInputControllerState,
  setEditableModelSelectionPreference,
} from '../../src/react/editable/input-controller';
import {
  beginEditableCompositionSession,
  type PendingCompositionInput,
} from '../../src/react/editable/input-state';
import {
  type captureCompositionModelInput,
  claimSettledCompositionInput,
  getDeferredNativeTextInputRepairPathKey,
  probeBeforeInputInsertTextCommand,
  queuePendingCompositionModelInput,
  shouldAllowBeforeInputSelectionImport,
  shouldFlushPendingNativeTextInputBeforeDOMBeforeInput,
  shouldFlushSelectionChangeBeforeDOMBeforeInput,
  shouldIgnoreDOMBeforeInputWithoutSelection,
} from '../../src/react/editable/runtime-before-input-events';
import type { ReactRuntimeEditor } from '../../src/react/plugin/react-editor';

const collapsedSelection: TextSelection = {
  kind: 'text',
  anchor: { offset: 1, path: [2500, 0] },
  focus: { offset: 1, path: [2500, 0] },
};

const expandedSelection: TextSelection = {
  kind: 'text',
  anchor: { offset: 1, path: [2500, 0] },
  focus: { offset: 3, path: [2500, 0] },
};

test('beforeinput probes semantic text commands on the mounted owner at the DOM selection', () => {
  const editor = createEditor({
    extensions: [
      defineExtension('mounted-trigger-command', {
        commands: ({ handle }) => [
          handle(editorCommands.insertText, ({ input, state }) => {
            if (input.text !== '@' || !input.options?.at) return false;

            return state.transaction(() => {});
          }),
        ],
      }),
    ],
    initialValue: [
      { children: [{ text: '' }], type: 'paragraph' },
    ] satisfies InitialValue,
    selection: null,
  });
  const mountedEditor = createEditorView(
    editor
  ) as unknown as ReactRuntimeEditor;
  const selection: TextSelection = {
    kind: 'text',
    anchor: { offset: 0, path: [0, 0] },
    focus: { offset: 0, path: [0, 0] },
  };

  expect(getEditorRuntimeOwner(mountedEditor)).toBe(editor);
  expect(
    probeBeforeInputInsertTextCommand({
      editor: mountedEditor,
      selection,
      text: '@',
    })
  ).toEqual({
    materialHandlers: ['mounted-trigger-command'],
    nativeEquivalent: false,
  });
});

test('deferred native text input publishes its repair path before DOM input', () => {
  expect(
    getDeferredNativeTextInputRepairPathKey({
      data: 'X',
      deferNativeTextInputRepair: true,
      inputType: 'insertText',
      native: true,
      selection: collapsedSelection,
    })
  ).toBe('2500,0');
});

test('deferred native text input path is only for collapsed native insertText', () => {
  expect(
    getDeferredNativeTextInputRepairPathKey({
      data: 'X',
      deferNativeTextInputRepair: false,
      inputType: 'insertText',
      native: true,
      selection: collapsedSelection,
    })
  ).toBe(null);
  expect(
    getDeferredNativeTextInputRepairPathKey({
      data: 'X',
      deferNativeTextInputRepair: true,
      inputType: 'deleteContentBackward',
      native: true,
      selection: collapsedSelection,
    })
  ).toBe(null);
  expect(
    getDeferredNativeTextInputRepairPathKey({
      data: 'X',
      deferNativeTextInputRepair: true,
      inputType: 'insertText',
      native: false,
      selection: collapsedSelection,
    })
  ).toBe(null);
  expect(
    getDeferredNativeTextInputRepairPathKey({
      data: '',
      deferNativeTextInputRepair: true,
      inputType: 'insertText',
      native: true,
      selection: collapsedSelection,
    })
  ).toBe(null);
  expect(
    getDeferredNativeTextInputRepairPathKey({
      data: 'X',
      deferNativeTextInputRepair: true,
      inputType: 'insertText',
      native: true,
      selection: expandedSelection,
    })
  ).toBe(null);
});

test('same-burst insertText beforeinput flushes deferred native text repair', () => {
  expect(
    shouldFlushPendingNativeTextInputBeforeDOMBeforeInput({
      inputType: 'insertText',
      pendingNativeTextInputRepairPathKey: '2500,0',
    })
  ).toBe(true);
});

test('beforeinput flushes deferred native text repair boundaries', () => {
  expect(
    shouldFlushPendingNativeTextInputBeforeDOMBeforeInput({
      inputType: 'insertParagraph',
      pendingNativeTextInputRepairPathKey: '2500,0',
    })
  ).toBe(true);
  expect(
    shouldFlushPendingNativeTextInputBeforeDOMBeforeInput({
      inputType: 'deleteContentBackward',
      pendingNativeTextInputRepairPathKey: '2500,0',
    })
  ).toBe(true);
  expect(
    shouldFlushPendingNativeTextInputBeforeDOMBeforeInput({
      inputType: 'insertParagraph',
      pendingNativeTextInputRepairPathKey: null,
    })
  ).toBe(false);
});

test('beforeinput skips pending DOM selection flush for model-preferred insertText', () => {
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });

  setEditableModelSelectionPreference({
    inputController,
    preferModelSelection: true,
    reason: 'model-command',
    selectionSource: 'model-owned',
  });

  expect(
    shouldFlushSelectionChangeBeforeDOMBeforeInput({
      inputController,
      inputType: 'insertText',
    })
  ).toBe(false);
});

test('beforeinput ignores browser events with no selection and no target ranges', () => {
  expect(
    shouldIgnoreDOMBeforeInputWithoutSelection({
      event: {
        getTargetRanges: () => [],
        inputType: 'insertText',
      } as unknown as InputEvent,
      nativeRangeCount: 0,
    })
  ).toBe(true);
  expect(
    shouldIgnoreDOMBeforeInputWithoutSelection({
      event: {
        getTargetRanges: () => [],
        inputType: 'insertText',
      } as unknown as InputEvent,
      nativeRangeCount: 1,
    })
  ).toBe(false);
  expect(
    shouldIgnoreDOMBeforeInputWithoutSelection({
      event: {
        getTargetRanges: () => [{} as StaticRange],
        inputType: 'insertText',
      } as unknown as InputEvent,
      nativeRangeCount: 0,
    })
  ).toBe(false);
  expect(
    shouldIgnoreDOMBeforeInputWithoutSelection({
      event: {
        getTargetRanges: () => [],
        inputType: 'formatBold',
      } as unknown as InputEvent,
      nativeRangeCount: 0,
    })
  ).toBe(false);
});

test('beforeinput target ranges can import even when live DOM selection policy is model-owned', () => {
  expect(
    shouldAllowBeforeInputSelectionImport({
      event: {
        getTargetRanges: () => [{} as StaticRange],
      } as unknown as InputEvent,
      selectionPolicyAllowsDOMImport: false,
    })
  ).toBe(true);
  expect(
    shouldAllowBeforeInputSelectionImport({
      event: {
        getTargetRanges: () => [],
      } as unknown as InputEvent,
      selectionPolicyAllowsDOMImport: false,
    })
  ).toBe(false);
  expect(
    shouldAllowBeforeInputSelectionImport({
      event: {
        getTargetRanges: () => [],
      } as unknown as InputEvent,
      selectionPolicyAllowsDOMImport: true,
    })
  ).toBe(true);
});

test('beforeinput still flushes pending DOM selection for native-owned input', () => {
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });

  expect(
    shouldFlushSelectionChangeBeforeDOMBeforeInput({
      inputController,
      inputType: 'insertText',
    })
  ).toBe(true);

  setEditableModelSelectionPreference({
    inputController,
    preferModelSelection: false,
    reason: 'native-selection',
    selectionSource: 'dom-current',
  });

  expect(
    shouldFlushSelectionChangeBeforeDOMBeforeInput({
      inputController,
      inputType: 'insertText',
    })
  ).toBe(true);
});

test('pending composition input captures immutable input before one model commit', () => {
  const editor = createEditor<Value>() as ReactRuntimeEditor;
  const compositionSelection: TextSelection = {
    kind: 'text',
    anchor: { offset: 1, path: [0, 0] },
    focus: { offset: 3, path: [0, 0] },
  };

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abcd' }] }],
    selection: compositionSelection,
  });
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const pendingInput: { current: PendingCompositionInput | null } = {
    current: null,
  };

  beginEditableCompositionSession(inputController);
  inputController.state.pendingCompositionEnd = {
    cancel: vi.fn(),
    flush: vi.fn(() => false),
    ownership: 'plite',
    phase: 'end-pending',
    replaceWithInput: (input) => {
      pendingInput.current = input;
      return true;
    },
  };
  const requestEditableRepair = vi.fn();
  const command = {
    inputType: 'insertFromComposition',
    kind: 'insert-text',
    text: '文',
  } satisfies Parameters<typeof captureCompositionModelInput>[0]['command'];

  expect(
    queuePendingCompositionModelInput({
      command,
      data: '文',
      editor,
      inputController,
      inputType: 'insertFromComposition',
      repair: { requestEditableRepair },
      selection: compositionSelection,
      setComposing: vi.fn(),
    })
  ).toBe(true);
  expect(editorString(editor, [])).toBe('abcd');
  expect(pendingInput.current).not.toBeNull();
  expect(Object.isFrozen(pendingInput.current)).toBe(true);

  expect(
    pendingInput.current?.commit(compositionSelection, { publish: true })
  ).toBe(true);
  expect(editorString(editor, [])).toBe('a文d');

  pendingInput.current?.complete();
  expect(requestEditableRepair).toHaveBeenCalledOnce();
});

test('pending composition input records only an actual document commit', () => {
  const editor = createEditor<Value>() as ReactRuntimeEditor;
  let commitCount = 0;
  const compositionSelection: TextSelection = {
    kind: 'text',
    anchor: { offset: 1, path: [0, 0] },
    focus: { offset: 3, path: [0, 0] },
  };

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abcd' }] }],
    selection: compositionSelection,
  });
  editor.subscribeCommit(() => {
    commitCount += 1;
  });
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const pendingInput: { current: PendingCompositionInput | null } = {
    current: null,
  };

  beginEditableCompositionSession(inputController);
  inputController.state.pendingCompositionEnd = {
    cancel: vi.fn(),
    flush: vi.fn(() => false),
    ownership: 'plite',
    phase: 'end-pending',
    replaceWithInput: (input) => {
      pendingInput.current = input;
      return true;
    },
  };

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
    setComposing: vi.fn(),
  });

  expect(
    pendingInput.current?.commit(compositionSelection, { publish: true })
  ).toBe(true);
  expect(editorString(editor, [])).toBe('a文d');
  expect(inputController.state.compositionSession?.modelCommitted).toBe(true);
  expect(commitCount).toBe(1);
  expect(
    pendingInput.current?.commit(compositionSelection, { publish: true })
  ).toBe(false);
  expect(commitCount).toBe(1);
});

test('settled composition completion suppresses one matching late final only', () => {
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const cancel = vi.fn(() => {
    inputController.state.pendingCompositionEnd = null;
  });

  inputController.state.pendingCompositionEnd = {
    cancel,
    data: '文',
    inputTypes: ['insertFromComposition', 'insertText'],
    ownership: 'settled',
    phase: 'settled',
  };

  expect(
    claimSettledCompositionInput({
      data: '文',
      inputController,
      inputType: 'insertText',
    })
  ).toBe(true);
  expect(cancel).toHaveBeenCalledOnce();
  expect(
    claimSettledCompositionInput({
      data: '文',
      inputController,
      inputType: 'insertText',
    })
  ).toBe(false);

  inputController.state.pendingCompositionEnd = {
    cancel,
    data: '文',
    inputTypes: ['insertFromComposition', 'insertText'],
    ownership: 'settled',
    phase: 'settled',
  };
  expect(
    claimSettledCompositionInput({
      data: 'x',
      inputController,
      inputType: 'insertText',
    })
  ).toBe(false);
  expect(inputController.state.pendingCompositionEnd).toBeNull();
});
