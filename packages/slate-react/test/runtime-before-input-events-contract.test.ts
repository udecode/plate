import { readFileSync } from 'node:fs';
import type { Range } from '@platejs/slate';
import {
  createEditableInputController,
  createEditableInputControllerState,
  setEditableModelSelectionPreference,
} from '../src/editable/input-controller';
import {
  getDeferredNativeTextInputRepairPathKey,
  shouldAllowBeforeInputSelectionImport,
  shouldFlushPendingNativeTextInputBeforeDOMBeforeInput,
  shouldFlushSelectionChangeBeforeDOMBeforeInput,
  shouldIgnoreDOMBeforeInputWithoutSelection,
} from '../src/editable/runtime-before-input-events';

const collapsedSelection: Range = {
  anchor: { offset: 1, path: [2500, 0] },
  focus: { offset: 1, path: [2500, 0] },
};

const expandedSelection: Range = {
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
