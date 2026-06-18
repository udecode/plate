import { readFileSync } from 'node:fs';
import { createEditor } from '@platejs/slate';

import {
  beginEditableEventFrame,
  createEditableKernelResult,
  EDITABLE_COMMAND_DEFINITIONS,
  EDITABLE_KERNEL_TRACE_LIMIT,
  getCurrentEditableEventFrame,
  getEditableCommandDefinition,
  getEditableCommandFromBeforeInput,
  getEditableCommandFromBeforeInputType,
  getEditableCommandFromKeyDown,
  getEditableKernelTrace,
  getEditableKernelTransition,
  getEditableMovementOwnershipTrace,
  getEditableSelectionChangeOwnership,
  prepareEditableBeforeInputKernel,
  prepareEditableCompositionKernel,
  prepareEditableKeyDownKernel,
  recordEditableKernelTrace,
} from '../src/editable/editing-kernel';
import {
  classifyBeforeInputIntent,
  classifyKeyboardIntent,
} from '../src/editable/input-controller';
import {
  createEditableInputController,
  createEditableInputControllerState,
} from '../src/editable/input-state';
import { writeSlateViewSelection } from '../src/view-selection';

const createBaseTrace = () =>
  ({
    command: null,
    eventFamily: 'selectionchange' as const,
    intent: null,
    nativeAllowed: true,
    operations: [],
    ownership: 'native-allowed' as const,
    repair: null,
    selectionBefore: null,
    selectionSource: 'dom-current' as const,
    stateAfter: 'dom-selection' as const,
    stateBefore: 'idle' as const,
    targetOwner: 'editor' as const,
  }) satisfies Parameters<typeof createEditableKernelResult>[0]['trace'];

test('runtime keydown traces stay compact for huge document commands', () => {
  const source = readFileSync('src/editable/runtime-kernel-trace.ts', 'utf8');

  expect(source).toContain('operations: []');
  expect(source).toContain('recordKeyDownTrace');
});

test('runtime browser event traces stay compact for huge document commands', () => {
  const source = readFileSync('src/editable/runtime-kernel-trace.ts', 'utf8');
  const recordKernelEventTraceSource = source.slice(
    source.indexOf('const recordKernelEventTrace'),
    source.indexOf('const repairDOMInputWithTrace')
  );
  const repairDOMInputWithTraceSource = source.slice(
    source.indexOf('const repairDOMInputWithTrace'),
    source.indexOf('const getCurrentKernelFrameId')
  );

  expect(recordKernelEventTraceSource).toContain('operations: []');
  expect(repairDOMInputWithTraceSource).toContain('operations: []');
});

test('kernel results expose explicit selection and repair policies', () => {
  const editor = createEditor();

  beginEditableEventFrame(editor, {
    eventFamily: 'selectionchange',
    focusOwner: 'editor',
    lifecyclePhase: 'event',
    selectionSource: 'dom-current',
    targetOwner: 'editor',
  });

  const result = createEditableKernelResult({
    editor,
    handled: true,
    trace: createBaseTrace(),
  });

  expect(result.selectionPolicy).toEqual({
    kind: 'import-dom',
    reason: 'native-selection',
  });
  expect(result.repairPolicy).toEqual({
    kind: 'none',
    reason: 'not-requested',
  });
  expect(result.trace.selectionPolicy).toEqual(result.selectionPolicy);
  expect(result.trace.repairPolicy).toEqual(result.repairPolicy);
});

test('kernel traces attach the current editable event frame', () => {
  const editor = createEditor();
  const frame = beginEditableEventFrame(editor, {
    commitEpoch: 3,
    eventFamily: 'keydown',
    focusOwner: 'editor',
    inputIntent: 'model-selection-move',
    lifecyclePhase: 'event',
    selectionSource: 'dom-current',
    targetOwner: 'editor',
    viewEpoch: 5,
  });

  const result = createEditableKernelResult({
    editor,
    handled: true,
    trace: {
      ...createBaseTrace(),
      command: {
        axis: 'horizontal',
        kind: 'move-selection',
      },
      eventFamily: 'keydown',
      nativeAllowed: false,
      ownership: 'model-owned',
      selectionSource: 'dom-current',
      stateAfter: 'model-owned',
      stateBefore: 'dom-selection',
    },
  });

  expect(getCurrentEditableEventFrame(editor)).toEqual(frame);
  expect(result.trace.frame).toEqual(frame);
  expect(result.trace.frameId).toBe(frame.id);
  expect(result.trace.frame?.lifecyclePhase).toBe('event');
  expect(result.trace.frame?.root).toBe('main');
  expect(result.trace.frame?.commitEpoch).toBe(3);
  expect(result.trace.frame?.viewEpoch).toBe(5);
});

test('kernel traces attach typed command definitions', () => {
  const command = {
    inputType: 'insertText',
    kind: 'insert-text' as const,
    text: 'x',
  };
  const result = createEditableKernelResult({
    editor: createEditor(),
    handled: true,
    trace: {
      ...createBaseTrace(),
      command,
      eventFamily: 'beforeinput',
      intent: 'insert-text',
      nativeAllowed: false,
      ownership: 'model-owned',
      stateAfter: 'model-owned',
      stateBefore: 'dom-selection',
    },
  });

  expect(result.trace.commandDefinition).toBe(
    EDITABLE_COMMAND_DEFINITIONS['insert-text']
  );
  expect(getEditableCommandDefinition(command)).toBe(
    EDITABLE_COMMAND_DEFINITIONS['insert-text']
  );
});

test('editable command definitions cover every command kind', () => {
  expect(Object.keys(EDITABLE_COMMAND_DEFINITIONS).sort()).toEqual([
    'delete',
    'delete-both',
    'delete-fragment',
    'format',
    'history',
    'insert-break',
    'insert-data',
    'insert-text',
    'move-selection',
    'select',
    'select-all',
    'set-block',
    'toggle-mark',
    'transpose-character',
  ]);
});

test('beforeinput format commands resolve through semantic command definitions', () => {
  expect(
    getEditableCommandFromBeforeInputType({
      data: null,
      inputType: 'formatBold',
      selection: null,
    })
  ).toEqual({ format: 'bold', kind: 'format' });
  expect(
    getEditableCommandFromBeforeInputType({
      data: null,
      inputType: 'formatItalic',
      selection: null,
    })
  ).toEqual({ format: 'italic', kind: 'format' });
  expect(
    getEditableCommandFromBeforeInputType({
      data: null,
      inputType: 'formatUnderline',
      selection: null,
    })
  ).toEqual({ format: 'underline', kind: 'format' });
  expect(
    getEditableCommandFromBeforeInputType({
      data: null,
      inputType: 'formatStrikeThrough',
      selection: null,
    })
  ).toEqual({ format: 'strikethrough', kind: 'format' });

  expect(
    getEditableCommandDefinition({ format: 'bold', kind: 'format' })
      ?.inputFamilies
  ).toContain('beforeinput');
});

test('beforeinput and keydown commands resolve through typed definitions', () => {
  const beforeInputCommand = getEditableCommandFromBeforeInputType({
    data: null,
    inputType: 'deleteContentBackward',
    selection: null,
  });
  const transposeCommand = getEditableCommandFromBeforeInputType({
    data: null,
    inputType: 'insertTranspose',
    selection: null,
  });
  const keyDownCommand = getEditableCommandFromKeyDown({
    event: {
      nativeEvent: {
        altKey: false,
        ctrlKey: false,
        key: 'Enter',
        metaKey: false,
        shiftKey: false,
        which: 13,
      },
    } as any,
    selection: null,
  });

  expect(beforeInputCommand?.kind).toBe('delete');
  expect(
    getEditableCommandDefinition(beforeInputCommand)?.inputFamilies
  ).toContain('beforeinput');
  expect(keyDownCommand?.kind).toBe('insert-break');
  expect(getEditableCommandDefinition(keyDownCommand)?.inputFamilies).toContain(
    'keydown'
  );
  expect(transposeCommand).toEqual({ kind: 'transpose-character' });
  expect(
    getEditableCommandDefinition(transposeCommand)?.inputFamilies
  ).toContain('beforeinput');
});

test('document boundary keydown commands are model-owned selection moves', () => {
  const startCommand = getEditableCommandFromKeyDown({
    event: {
      nativeEvent: {
        altKey: false,
        ctrlKey: true,
        key: 'Home',
        metaKey: false,
        shiftKey: false,
      },
    } as any,
    selection: null,
  });
  const extendEndCommand = getEditableCommandFromKeyDown({
    event: {
      nativeEvent: {
        altKey: false,
        ctrlKey: true,
        key: 'End',
        metaKey: false,
        shiftKey: true,
      },
    } as any,
    selection: null,
  });

  expect(startCommand).toEqual({
    axis: 'document',
    kind: 'move-selection',
    reverse: true,
  });
  expect(extendEndCommand).toEqual({
    axis: 'document',
    extend: true,
    kind: 'move-selection',
  });
  expect(getEditableCommandDefinition(startCommand)?.modelOwned).toBe(true);
});

test('document boundary keyboard intent uses model selection ownership', () => {
  expect(
    classifyKeyboardIntent({
      editor: createEditor() as any,
      event: {
        nativeEvent: {
          altKey: false,
          ctrlKey: true,
          key: 'Home',
          metaKey: false,
          shiftKey: false,
        },
        target: null,
      } as any,
      domStrategyRuntime: null,
    })
  ).toBe('model-selection-move');
});

test('beforeinput data transfer commands preserve the browser payload', () => {
  class DataTransfer {}

  const dataTransfer = new DataTransfer();

  for (const inputType of [
    'insertFromDrop',
    'insertFromPaste',
    'insertFromYank',
  ]) {
    const command = getEditableCommandFromBeforeInputType({
      data: dataTransfer,
      inputType,
      selection: null,
    });

    expect(command).toEqual({ data: dataTransfer, kind: 'insert-data' });
    expect(getEditableCommandDefinition(command)?.inputFamilies).toContain(
      'beforeinput'
    );
  }
});

test('beforeinput insertFromPaste prefers contenteditable dataTransfer over event data', () => {
  class DataTransfer {}

  const dataTransfer = new DataTransfer();
  const command = getEditableCommandFromBeforeInput({
    event: {
      data: 'textarea-style paste text',
      dataTransfer,
      inputType: 'insertFromPaste',
    } as unknown as InputEvent,
    selection: null,
  });

  expect(command).toEqual({ data: dataTransfer, kind: 'insert-data' });
});

test('repair kernel results preserve model selection by default', () => {
  const result = createEditableKernelResult({
    editor: createEditor(),
    handled: true,
    trace: {
      ...createBaseTrace(),
      eventFamily: 'repair',
      nativeAllowed: false,
      ownership: 'model-owned',
      repair: { kind: 'repair-caret' },
      selectionSource: 'model-owned',
      stateAfter: 'repairing',
      stateBefore: 'model-owned',
    },
  });

  expect(result.selectionPolicy).toEqual({
    kind: 'preserve-model',
    reason: 'model-owned',
  });
  expect(result.repairPolicy).toEqual({
    kind: 'repair-caret',
    reason: 'repair-caret',
  });
});

test('kernel traces preserve selectionchange origin metadata', () => {
  const result = createEditableKernelResult({
    editor: createEditor(),
    handled: true,
    trace: {
      ...createBaseTrace(),
      nativeAllowed: false,
      ownership: 'model-owned',
      selectionChangeOrigin: 'repair-induced',
      selectionSource: 'model-owned',
      stateAfter: 'model-owned',
    },
  });

  expect(result.trace.selectionChangeOrigin).toBe('repair-induced');
});

test('editable kernel trace keeps only the newest bounded entries', () => {
  const editor = createEditor();

  beginEditableEventFrame(editor, {
    eventFamily: 'selectionchange',
    focusOwner: 'editor',
    lifecyclePhase: 'event',
    selectionSource: 'dom-current',
    targetOwner: 'editor',
  });

  for (let index = 0; index < EDITABLE_KERNEL_TRACE_LIMIT + 2; index++) {
    recordEditableKernelTrace({
      editor,
      trace: {
        ...createBaseTrace(),
        selectionBefore: {
          anchor: { offset: 0, path: [index] },
          focus: { offset: 0, path: [index] },
        },
      },
    });
  }

  const trace = getEditableKernelTrace(editor);

  expect(trace).toHaveLength(EDITABLE_KERNEL_TRACE_LIMIT);
  expect(trace[0]?.selectionBefore?.anchor.path).toEqual([2]);
  expect(trace.at(-1)?.selectionBefore?.anchor.path).toEqual([
    EDITABLE_KERNEL_TRACE_LIMIT + 1,
  ]);
});

test('movement ownership trace records model-owned horizontal reason', () => {
  expect(
    getEditableMovementOwnershipTrace({
      command: { axis: 'horizontal', kind: 'move-selection' },
      intent: 'model-selection-move',
      key: 'ArrowRight',
      ownership: 'model-owned',
    })
  ).toEqual({
    axis: 'horizontal',
    extend: false,
    key: 'ArrowRight',
    ownership: 'model-owned',
    reason: 'model-horizontal-inline-void',
    reverse: null,
  });
});

test('movement ownership trace records model-owned document reason', () => {
  expect(
    getEditableMovementOwnershipTrace({
      command: { axis: 'document', kind: 'move-selection', reverse: true },
      intent: 'model-selection-move',
      key: 'Home',
      ownership: 'model-owned',
    })
  ).toEqual({
    axis: 'document',
    extend: false,
    key: 'Home',
    ownership: 'model-owned',
    reason: 'model-document-boundary',
    reverse: true,
  });
});

test('movement ownership trace records native vertical reason', () => {
  expect(
    getEditableMovementOwnershipTrace({
      command: null,
      intent: 'native-selection-move',
      key: 'ArrowDown',
      ownership: 'native-allowed',
    })
  ).toEqual({
    axis: 'vertical',
    extend: false,
    key: 'ArrowDown',
    ownership: 'native-allowed',
    reason: 'native-vertical-layout',
    reverse: false,
  });
});

test('keyboard split-block commands are model-owned structural intent', () => {
  expect(
    classifyKeyboardIntent({
      editor: createEditor() as any,
      event: {
        nativeEvent: {
          altKey: false,
          ctrlKey: false,
          key: 'Enter',
          metaKey: false,
          shiftKey: false,
          which: 13,
        },
        target: null,
      } as any,
      domStrategyRuntime: null,
    })
  ).toBe('insert-break');
});

test('keyboard structural commands keep model selection after programmatic DOM export', () => {
  const editor = createEditor() as any;
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  inputController.state.selectionChangeOrigin = 'programmatic-export';
  inputController.state.selectionSource = 'model-owned';

  const decision = prepareEditableKeyDownKernel({
    editor,
    event: {
      nativeEvent: {
        altKey: false,
        ctrlKey: false,
        key: 'Enter',
        metaKey: false,
        shiftKey: false,
        which: 13,
      },
      target: null,
    } as any,
    inputController,
    domStrategyRuntime: null,
  });

  expect(decision).toMatchObject({
    intent: 'insert-break',
    ownership: 'model-owned',
    selectionPolicy: { kind: 'preserve-model', reason: 'model-owned' },
    shouldForceDOMImport: false,
  });
});

test('keyboard structural commands keep model selection after delayed text repair clears origin', () => {
  const editor = createEditor() as any;
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  });
  inputController.state.selectionChangeOrigin = null;
  inputController.state.selectionSource = 'model-owned';

  const decision = prepareEditableKeyDownKernel({
    editor,
    event: {
      nativeEvent: {
        altKey: false,
        ctrlKey: false,
        key: 'Enter',
        metaKey: false,
        shiftKey: false,
        which: 13,
      },
      target: null,
    } as any,
    inputController,
    domStrategyRuntime: null,
  });

  expect(decision).toMatchObject({
    intent: 'insert-break',
    ownership: 'model-owned',
    selectionPolicy: { kind: 'preserve-model', reason: 'model-owned' },
    shouldForceDOMImport: false,
  });
});

test('keyboard history commands preserve model selection before DOM import', () => {
  const editor = createEditor() as any;
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  inputController.state.selectionChangeOrigin = null;
  inputController.state.selectionSource = 'dom-current';

  const decision = prepareEditableKeyDownKernel({
    editor,
    event: {
      nativeEvent: {
        altKey: false,
        code: 'KeyZ',
        ctrlKey: true,
        key: 'z',
        metaKey: false,
        shiftKey: false,
        which: 90,
      },
      target: null,
    } as any,
    inputController,
    domStrategyRuntime: {
      mountedTopLevelRuntimeIds: new Set(),
      type: 'staged',
    },
  });

  expect(decision).toMatchObject({
    command: { direction: 'undo', kind: 'history' },
    intent: 'history',
    ownership: 'model-owned',
    selectionPolicy: { kind: 'preserve-model', reason: 'model-owned' },
    selectionSourceTransition: {
      preferModelSelection: true,
      reason: 'model-command',
      selectionSource: 'model-owned',
    },
    shouldForceDOMImport: false,
  });
});

test('keyboard destructive commands keep partial-DOM-backed model selection', () => {
  const editor = createEditor() as any;
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  });
  inputController.state.selectionChangeOrigin = null;
  inputController.state.selectionSource = 'partial-dom-backed';

  const decision = prepareEditableKeyDownKernel({
    editor,
    event: {
      nativeEvent: {
        altKey: false,
        ctrlKey: false,
        key: 'Delete',
        metaKey: false,
        shiftKey: false,
        which: 46,
      },
      target: null,
    } as any,
    inputController,
    domStrategyRuntime: {
      mountedTopLevelRuntimeIds: new Set(),
      type: 'staged',
    },
  });

  expect(decision).toMatchObject({
    intent: 'delete',
    ownership: 'model-owned',
    selectionPolicy: { kind: 'preserve-model', reason: 'model-owned' },
    shouldForceDOMImport: false,
  });
});

test('keyboard no-op shortcuts keep partial-DOM-backed model selection', () => {
  const editor = createEditor() as any;
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  });
  inputController.state.selectionChangeOrigin = null;
  inputController.state.selectionSource = 'partial-dom-backed';

  const decision = prepareEditableKeyDownKernel({
    editor,
    event: {
      nativeEvent: {
        altKey: false,
        ctrlKey: false,
        key: 'v',
        metaKey: true,
        shiftKey: false,
        which: 86,
      },
      target: null,
    } as any,
    inputController,
    domStrategyRuntime: {
      mountedTopLevelRuntimeIds: new Set(),
      type: 'partial-dom',
    },
  });

  expect(decision).toMatchObject({
    intent: 'clipboard',
    ownership: 'model-owned',
    selectionPolicy: { kind: 'preserve-model', reason: 'model-owned' },
    shouldForceDOMImport: false,
  });
});

test('keyboard text insert keeps model selection after repair-induced text input', () => {
  const editor = createEditor() as any;
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  });
  inputController.state.modelSelectionPreference = {
    preferModelSelection: true,
    reason: 'repair-induced',
    selectionSource: 'model-owned',
  };
  inputController.state.selectionChangeOrigin = null;
  inputController.state.selectionSource = 'model-owned';

  const decision = prepareEditableKeyDownKernel({
    editor,
    event: {
      nativeEvent: {
        altKey: false,
        ctrlKey: false,
        key: 'a',
        metaKey: false,
        shiftKey: false,
        which: 65,
      },
      target: null,
    } as any,
    inputController,
    domStrategyRuntime: null,
  });

  expect(decision).toMatchObject({
    intent: 'text-insert',
    ownership: 'model-owned',
    selectionPolicy: { kind: 'preserve-model', reason: 'model-owned' },
    shouldForceDOMImport: false,
  });
});

test('beforeinput text insert keeps model selection after repair-induced text input', () => {
  const editor = createEditor() as any;
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  });
  inputController.state.modelSelectionPreference = {
    preferModelSelection: true,
    reason: 'repair-induced',
    selectionSource: 'model-owned',
  };
  inputController.state.selectionChangeOrigin = null;
  inputController.state.selectionSource = 'model-owned';

  const decision = prepareEditableBeforeInputKernel({
    editor,
    event: {
      data: 'a',
      inputType: 'insertText',
      target: null,
    } as any,
    inputController,
  });

  expect(decision).toMatchObject({
    intent: 'text-insert',
    ownership: 'model-owned',
    selectionPolicy: { kind: 'preserve-model', reason: 'model-owned' },
  });
});

test('keyboard model selection moves keep model selection after programmatic DOM export', () => {
  const editor = createEditor() as any;
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  inputController.state.selectionChangeOrigin = 'programmatic-export';
  inputController.state.selectionSource = 'model-owned';

  const decision = prepareEditableKeyDownKernel({
    editor,
    event: {
      nativeEvent: {
        altKey: false,
        ctrlKey: false,
        key: 'ArrowRight',
        metaKey: false,
        shiftKey: false,
        which: 39,
      },
      target: null,
    } as any,
    inputController,
    domStrategyRuntime: null,
  });

  expect(decision).toMatchObject({
    intent: 'model-selection-move',
    ownership: 'model-owned',
    selectionPolicy: { kind: 'preserve-model', reason: 'model-owned' },
    shouldForceDOMImport: false,
  });
});

test('keyboard model selection moves import DOM selection when native selection owns it', () => {
  const editor = createEditor() as any;
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  inputController.state.selectionSource = 'dom-current';

  const decision = prepareEditableKeyDownKernel({
    editor,
    event: {
      nativeEvent: {
        altKey: false,
        ctrlKey: false,
        key: 'ArrowRight',
        metaKey: false,
        shiftKey: false,
        which: 39,
      },
      target: null,
    } as any,
    inputController,
    domStrategyRuntime: null,
  });

  expect(decision).toMatchObject({
    intent: 'model-selection-move',
    ownership: 'model-owned',
    selectionPolicy: { kind: 'import-dom', reason: 'unknown-selection' },
    shouldForceDOMImport: true,
  });
});

test('keyboard input preserves projected view selection before command routing', () => {
  const editor = createEditor() as any;
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  inputController.state.selectionSource = 'dom-current';
  writeSlateViewSelection(editor, {
    anchor: { point: { path: [0, 0], offset: 0 } },
    focus: { point: { path: [1, 0], offset: 0 } },
    segments: { backward: false, parts: [] },
  } as any);

  const decision = prepareEditableKeyDownKernel({
    editor,
    event: {
      nativeEvent: {
        altKey: false,
        ctrlKey: false,
        key: 'ArrowDown',
        metaKey: false,
        shiftKey: true,
        which: 40,
      },
      shiftKey: true,
      target: null,
    } as any,
    inputController,
    domStrategyRuntime: null,
  });

  expect(decision).toMatchObject({
    intent: 'native-selection-move',
    nativeAllowed: true,
    selectionPolicy: { kind: 'preserve-model', reason: 'model-owned' },
    selectionSourceTransition: null,
  });
});

test('keyboard structural commands import DOM selection when native selection owns it', () => {
  const editor = createEditor() as any;
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  inputController.state.selectionSource = 'dom-current';

  const decision = prepareEditableKeyDownKernel({
    editor,
    event: {
      nativeEvent: {
        altKey: false,
        ctrlKey: false,
        key: 'Enter',
        metaKey: false,
        shiftKey: false,
        which: 13,
      },
      target: null,
    } as any,
    inputController,
    domStrategyRuntime: null,
  });

  expect(decision).toMatchObject({
    intent: 'insert-break',
    ownership: 'model-owned',
    selectionPolicy: { kind: 'import-dom', reason: 'unknown-selection' },
    shouldForceDOMImport: true,
  });
});

test('keyboard events during composition stay browser-owned', () => {
  const editor = createEditor() as any;
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  inputController.state.isComposing = true;
  inputController.state.selectionSource = 'composition-owned';

  const decision = prepareEditableKeyDownKernel({
    editor,
    event: {
      nativeEvent: {
        altKey: false,
        ctrlKey: false,
        isComposing: true,
        key: 'ArrowRight',
        metaKey: false,
        shiftKey: false,
        which: 39,
      },
      target: null,
    } as any,
    inputController,
    domStrategyRuntime: null,
  });

  expect(decision).toMatchObject({
    command: null,
    intent: 'composition',
    nativeAllowed: true,
    ownership: 'native-allowed',
    selectionPolicy: { kind: 'none', reason: 'not-requested' },
    shouldForceDOMImport: false,
    stateBefore: 'composition',
  });
});

test('composition lifecycle events stay browser-owned', () => {
  const editor = createEditor() as any;
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  inputController.state.isComposing = true;
  inputController.state.selectionSource = 'composition-owned';

  const decision = prepareEditableCompositionKernel({
    editor,
    event: {
      target: null,
    } as any,
    inputController,
  });

  expect(decision).toMatchObject({
    intent: 'composition',
    nativeAllowed: true,
    ownership: 'native-allowed',
    repairPolicy: { kind: 'none', reason: 'not-requested' },
    selectionPolicy: { kind: 'none', reason: 'not-requested' },
    stateBefore: 'composition',
  });
});

test('kernel transition rejects native-owned repair policies', () => {
  expect(
    getEditableKernelTransition({
      command: null,
      eventFamily: 'input',
      nativeAllowed: true,
      ownership: 'native-allowed',
      repairPolicy: { kind: 'repair-caret', reason: 'after-native-input' },
      stateAfter: 'dom-selection',
      targetOwner: 'editor',
    })
  ).toEqual({
    allowed: false,
    reason: 'native-owned events cannot schedule model repair',
  });
});

test('kernel transition allows history commands from internal controls', () => {
  expect(
    getEditableKernelTransition({
      command: { direction: 'undo', kind: 'history' },
      eventFamily: 'keydown',
      nativeAllowed: false,
      ownership: 'model-owned',
      repairPolicy: { kind: 'none', reason: 'not-requested' },
      stateAfter: 'model-owned',
      targetOwner: 'internal-control',
    })
  ).toEqual({
    allowed: true,
    reason: null,
  });
});

test('kernel transition keeps non-history internal control commands rejected', () => {
  expect(
    getEditableKernelTransition({
      command: {
        inputType: 'insertText',
        kind: 'insert-text',
        text: 'x',
      },
      eventFamily: 'keydown',
      nativeAllowed: false,
      ownership: 'model-owned',
      repairPolicy: { kind: 'none', reason: 'not-requested' },
      stateAfter: 'model-owned',
      targetOwner: 'internal-control',
    })
  ).toEqual({
    allowed: false,
    reason: 'internal controls cannot dispatch model commands',
  });
});

test('beforeinput history stays model-owned for internal controls', () => {
  expect(
    classifyBeforeInputIntent({
      editor: createEditor() as any,
      event: {
        inputType: 'historyUndo',
        target: null,
      } as any,
      internalTarget: true,
    })
  ).toBe('history');
});

test('kernel result creation rejects illegal transitions in test mode', () => {
  expect(() =>
    createEditableKernelResult({
      editor: createEditor(),
      handled: true,
      trace: {
        ...createBaseTrace(),
        eventFamily: 'input',
        nativeAllowed: true,
        ownership: 'native-allowed',
        repair: { kind: 'repair-caret' },
      },
    })
  ).toThrow(
    'Illegal Editable kernel transition: native-owned events cannot schedule model repair'
  );
});

test('kernel result creation rejects DOM import during repair frames', () => {
  expect(() =>
    createEditableKernelResult({
      editor: createEditor(),
      handled: true,
      trace: {
        ...createBaseTrace(),
        eventFamily: 'repair',
        nativeAllowed: false,
        ownership: 'model-owned',
        repair: { kind: 'repair-caret' },
        selectionPolicy: { kind: 'import-dom', reason: 'unknown-selection' },
        selectionSource: 'model-owned',
        stateAfter: 'repairing',
        stateBefore: 'model-owned',
      },
    })
  ).toThrow(
    'Illegal Editable kernel transition: repair cannot import DOM selection'
  );
});

test('kernel result creation rejects DOM import from non-event lifecycle frames', () => {
  const editor = createEditor();

  beginEditableEventFrame(editor, {
    eventFamily: 'selectionchange',
    focusOwner: 'editor',
    lifecyclePhase: 'layout-effect',
    selectionSource: 'dom-current',
    targetOwner: 'editor',
  });

  expect(() =>
    createEditableKernelResult({
      editor,
      handled: true,
      trace: createBaseTrace(),
    })
  ).toThrow(
    'Illegal Editable kernel transition: selection import requires event lifecycle frame'
  );
});

test('kernel result creation rejects DOM import without an event frame', () => {
  expect(() =>
    createEditableKernelResult({
      editor: createEditor(),
      handled: true,
      trace: createBaseTrace(),
    })
  ).toThrow(
    'Illegal Editable kernel transition: selection import requires event lifecycle frame'
  );
});

test('selectionchange ownership keeps repair and programmatic changes model-owned', () => {
  expect(
    getEditableSelectionChangeOwnership({
      selectionChangeOrigin: 'repair-induced',
      selectionSource: 'model-owned',
    })
  ).toBe('model-owned');
  expect(
    getEditableSelectionChangeOwnership({
      selectionChangeOrigin: 'programmatic-export',
      selectionSource: 'model-owned',
    })
  ).toBe('model-owned');
  expect(
    getEditableSelectionChangeOwnership({
      selectionChangeOrigin: 'native-user',
      selectionSource: 'dom-current',
    })
  ).toBe('native-allowed');
});

test('kernel transition rejects repair-induced selectionchange as native intent', () => {
  expect(
    getEditableKernelTransition({
      command: null,
      eventFamily: 'selectionchange',
      nativeAllowed: true,
      ownership: 'native-allowed',
      repairPolicy: { kind: 'none', reason: 'not-requested' },
      selectionChangeOrigin: 'repair-induced',
      stateAfter: 'dom-selection',
      targetOwner: 'editor',
    })
  ).toEqual({
    allowed: false,
    reason: 'programmatic selectionchange cannot re-import as native intent',
  });
});
