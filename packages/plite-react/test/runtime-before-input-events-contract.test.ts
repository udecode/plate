import { readFileSync } from 'node:fs';
import { createEditor, type Range } from '@platejs/plite';
import {
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';
import {
  createEditableInputController,
  createEditableInputControllerState,
  setEditableModelSelectionPreference,
} from '../src/editable/input-controller';
import {
  captureCompositionModelInput,
  claimSettledCompositionInput,
  getDeferredNativeTextInputRepairPathKey,
  queuePendingCompositionModelInput,
  shouldAllowBeforeInputSelectionImport,
  shouldFlushPendingNativeTextInputBeforeDOMBeforeInput,
  shouldFlushSelectionChangeBeforeDOMBeforeInput,
  shouldIgnoreDOMBeforeInputWithoutSelection,
} from '../src/editable/runtime-before-input-events';
import type { PendingCompositionInput } from '../src/editable/input-state';
import { beginEditableCompositionSession } from '../src/editable/input-state';
import type { ReactEditor } from '../src/plugin/react-editor';

const collapsedSelection: Range = {
  kind: 'text',
  anchor: { offset: 1, path: [2500, 0] },
  focus: { offset: 1, path: [2500, 0] },
};

const expandedSelection: Range = {
  kind: 'text',
  anchor: { offset: 1, path: [2500, 0] },
  focus: { offset: 3, path: [2500, 0] },
};

test('beforeinput trace keeps an outer event handler duration bucket', () => {
  const source = readFileSync(
    'src/editable/runtime-before-input-events.ts',
    'utf8'
  );

  expect(source).toContain("profileBeforeInputDuration('beforeinput-total'");
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
  const editor = createEditor() as ReactEditor;
  const compositionSelection: Range = {
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
  let pendingInput: PendingCompositionInput | null = null;

  beginEditableCompositionSession(inputController);
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
  expect(pendingInput).not.toBeNull();
  expect(Object.isFrozen(pendingInput)).toBe(true);

  expect(pendingInput?.commit(compositionSelection, { publish: true })).toBe(
    true
  );
  expect(editorString(editor, [])).toBe('a文d');

  pendingInput?.complete();
  expect(requestEditableRepair).toHaveBeenCalledOnce();
});

test('pending composition input records only an actual document commit', () => {
  const editor = createEditor() as ReactEditor;
  let commitCount = 0;
  const compositionSelection: Range = {
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
  let pendingInput: PendingCompositionInput | null = null;

  beginEditableCompositionSession(inputController);
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

  expect(pendingInput?.commit(compositionSelection, { publish: true })).toBe(
    true
  );
  expect(editorString(editor, [])).toBe('a文d');
  expect(inputController.state.compositionSession?.modelCommitted).toBe(true);
  expect(commitCount).toBe(1);
  expect(pendingInput?.commit(compositionSelection, { publish: true })).toBe(
    false
  );
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
