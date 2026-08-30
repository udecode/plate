import { renderHook } from '@testing-library/react';
import { createEditor, defineExtension, editorCommands } from 'plitejs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createDOMPhaseScheduler,
  type DOMPhaseScheduler,
  EDITOR_TO_PENDING_ACTION,
  EDITOR_TO_PENDING_DIFFS,
  EDITOR_TO_PENDING_INSERTION_MARKS,
  EDITOR_TO_PENDING_SELECTION,
  EDITOR_TO_PLACEHOLDER_ELEMENT,
  EDITOR_TO_SCHEDULE_FLUSH,
  IS_COMPOSING,
} from '../../src/dom/internal';
import {
  addMark as editorAddMark,
  getSnapshot as editorGetSnapshot,
  select as editorSelect,
  string as editorString,
} from '../../src/internal';
import {
  clearExpiredTextInputRepairEcho,
  createEditableInputController,
  createEditableInputControllerState,
} from '../../src/react/editable/input-state';
import {
  createAndroidInputManager as createRawAndroidInputManager,
  type CreateAndroidInputManagerOptions,
  shouldFlushStoredTextDiffForInsertTextHandler,
} from '../../src/react/hooks/android-input-manager/android-input-manager';
import { useAndroidInputManagerForEditor } from '../../src/react/hooks/android-input-manager/use-android-input-manager';
import { ReactEditor } from '../../src/react/plugin/react-editor';

const testSchedulers = new Set<DOMPhaseScheduler>();

const createAndroidInputManager = (
  options: Omit<CreateAndroidInputManagerOptions, 'scheduleTask'>
) => {
  const scheduler = createDOMPhaseScheduler({ getWindow: () => window });

  testSchedulers.add(scheduler);

  return createRawAndroidInputManager({
    ...options,
    scheduleTask: scheduler.schedule,
  });
};

afterEach(() => {
  testSchedulers.forEach((scheduler) => {
    scheduler.destroy();
  });
  testSchedulers.clear();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const createDebouncedSpy = () =>
  Object.assign(vi.fn(), {
    cancel: vi.fn(),
    flush: vi.fn(),
  }) as any;

const createInputController = () =>
  createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });

const range = (start: number, end = start) => ({
  kind: 'text',
  anchor: { path: [0, 0], offset: start },
  focus: { path: [0, 0], offset: end },
});

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

const beforeInputEvent = (
  inputType: string,
  data: string,
  targetRanges: StaticRange[] = []
) =>
  ({
    cancelable: true,
    data,
    getTargetRanges: () => targetRanges,
    inputType,
    preventDefault: vi.fn(),
  }) as unknown as InputEvent;

const createScheduleRecorder = () => {
  const tasks: Array<{
    callback: (frameTime?: number) => void;
    cancel: ReturnType<typeof vi.fn>;
    label: string;
    options: Parameters<DOMPhaseScheduler['schedule']>[3];
    phase: Parameters<DOMPhaseScheduler['schedule']>[0];
  }> = [];
  const scheduleTask: DOMPhaseScheduler['schedule'] = (
    phase,
    label,
    callback,
    options
  ) => {
    const cancel = vi.fn();

    tasks.push({ callback, cancel, label, options, phase });

    return cancel;
  };

  return { scheduleTask, tasks };
};

const createRecordedAndroidInputManager = (
  scheduleTask: DOMPhaseScheduler['schedule']
) =>
  createRawAndroidInputManager({
    editor: createEditor() as never,
    inputController: createInputController(),
    onDOMSelectionChange: createDebouncedSpy(),
    receivedUserInput: { current: true },
    scheduleOnDOMSelectionChange: createDebouncedSpy(),
    scheduleTask,
  });

describe('Android input manager phase scheduling', () => {
  it('recreates and republishes the manager when editor/runtime ownership changes', () => {
    const firstEditor = createEditor();
    const secondEditor = createEditor();
    const firstSchedule = vi.fn(() => vi.fn()) as DOMPhaseScheduler['schedule'];
    const secondSchedule = vi.fn(() =>
      vi.fn()
    ) as DOMPhaseScheduler['schedule'];
    const mounted = renderHook(
      ({ editor, inputController, scheduleTask }) =>
        useAndroidInputManagerForEditor(editor as never, {
          inputController,
          onDOMSelectionChange: createDebouncedSpy(),
          receivedUserInput: { current: true },
          scheduleOnDOMSelectionChange: createDebouncedSpy(),
          scheduleTask,
        }),
      {
        initialProps: {
          editor: firstEditor,
          inputController: createInputController(),
          scheduleTask: firstSchedule,
        },
      }
    );
    const firstManager = mounted.result.current;

    expect(EDITOR_TO_SCHEDULE_FLUSH.get(firstEditor)).toBe(
      firstManager.scheduleFlush
    );

    mounted.rerender({
      editor: secondEditor,
      inputController: createInputController(),
      scheduleTask: secondSchedule,
    });

    const secondManager = mounted.result.current;

    expect(secondManager).not.toBe(firstManager);
    expect(EDITOR_TO_SCHEDULE_FLUSH.get(firstEditor)).toBeUndefined();
    expect(EDITOR_TO_SCHEDULE_FLUSH.get(secondEditor)).toBe(
      secondManager.scheduleFlush
    );

    secondManager.scheduleFlush();
    expect(firstSchedule).not.toHaveBeenCalled();
    expect(secondSchedule).toHaveBeenCalledTimes(1);

    mounted.unmount();
    expect(EDITOR_TO_SCHEDULE_FLUSH.get(secondEditor)).toBeUndefined();
  });

  it('delays composition completion in the model phase and cancels it on restart', () => {
    const { scheduleTask, tasks } = createScheduleRecorder();
    const manager = createRecordedAndroidInputManager(scheduleTask);

    manager.handleCompositionEnd({} as React.CompositionEvent<HTMLDivElement>);

    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      label: 'android-composition-end',
      options: {
        delay: 25,
        key: 'android-composition-end',
        timing: 'timeout',
      },
      phase: 'model',
    });

    manager.handleCompositionStart(
      {} as React.CompositionEvent<HTMLDivElement>
    );

    expect(tasks[0].cancel).toHaveBeenCalledTimes(1);
  });

  it('coalesces action flush latency in the model phase', () => {
    const { scheduleTask, tasks } = createScheduleRecorder();
    const manager = createRecordedAndroidInputManager(scheduleTask);

    manager.scheduleFlush();
    manager.scheduleFlush();

    expect(tasks).toHaveLength(2);
    expect(tasks[0]).toMatchObject({
      label: 'android-action-flush',
      options: {
        key: 'android-action-flush',
        timing: 'timeout',
      },
      phase: 'model',
    });
    expect(tasks[0].cancel).toHaveBeenCalledTimes(1);
    expect(tasks[1].cancel).not.toHaveBeenCalled();
  });

  it('restores placeholder visibility as a scheduled DOM write', () => {
    const { scheduleTask, tasks } = createScheduleRecorder();
    const editor = createEditor();
    const placeholder = document.createElement('span');
    const manager = createRawAndroidInputManager({
      editor: editor as never,
      inputController: createInputController(),
      onDOMSelectionChange: createDebouncedSpy(),
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange: createDebouncedSpy(),
      scheduleTask,
    });

    EDITOR_TO_PLACEHOLDER_ELEMENT.set(editor, placeholder);
    manager.handleKeyDown({} as React.KeyboardEvent<HTMLDivElement>);

    expect(placeholder.style.display).toBe('none');
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      label: 'android-placeholder-visibility',
      options: {
        key: 'android-placeholder-visibility',
        timing: 'timeout',
      },
      phase: 'dom-write',
    });

    tasks[0].callback();
    expect(placeholder.style.display).toBe('');
    EDITOR_TO_PLACEHOLDER_ELEMENT.delete(editor);
  });

  it('routes selection latency and flushing state through model tasks', () => {
    const { scheduleTask, tasks } = createScheduleRecorder();
    const editor = createEditor();
    const manager = createRawAndroidInputManager({
      editor: editor as never,
      inputController: createInputController(),
      onDOMSelectionChange: createDebouncedSpy(),
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange: createDebouncedSpy(),
      scheduleTask,
    });

    manager.handleUserSelect(range(0));

    expect(tasks[0]).toMatchObject({
      label: 'android-selection-flush',
      options: {
        delay: 200,
        key: 'android-selection-flush',
        timing: 'timeout',
      },
      phase: 'model',
    });

    EDITOR_TO_PENDING_ACTION.set(editor, { run: vi.fn() });
    manager.flush();

    expect(tasks[0].cancel).toHaveBeenCalledTimes(1);
    expect(tasks[1]).toMatchObject({
      label: 'android-flushing-reset',
      options: {
        key: 'android-flushing-reset',
        timing: 'timeout',
      },
      phase: 'model',
    });
  });

  it('flushes pending input and resets scheduled state before DOM teardown', () => {
    const { scheduleTask, tasks } = createScheduleRecorder();
    const editor = createEditor();
    const run = vi.fn();
    const manager = createRawAndroidInputManager({
      editor: editor as never,
      inputController: createInputController(),
      onDOMSelectionChange: createDebouncedSpy(),
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange: createDebouncedSpy(),
      scheduleTask,
    });

    manager.handleCompositionStart(
      {} as React.CompositionEvent<HTMLDivElement>
    );
    manager.handleCompositionEnd({} as React.CompositionEvent<HTMLDivElement>);
    EDITOR_TO_PENDING_ACTION.set(editor, { run });
    manager.flush();
    manager.handleKeyDown({} as React.KeyboardEvent<HTMLDivElement>);

    expect(manager.isFlushing()).toBe('action');
    expect(IS_COMPOSING.get(editor)).toBe(true);
    expect(run).toHaveBeenCalledTimes(1);

    manager.prepareDOMTeardown();

    expect(manager.isFlushing()).toBe(false);
    expect(IS_COMPOSING.get(editor)).toBe(false);
    expect(manager.hasPendingChanges()).toBe(false);
    expect(tasks).toHaveLength(3);
    expect(tasks.every(({ cancel }) => cancel.mock.calls.length === 1)).toBe(
      true
    );
  });
});

describe('Android input manager command-handler flush policy', () => {
  it('keeps pass-through insertText handlers on the deferred native path', () => {
    const editor = createEditor({
      extensions: [
        defineExtension('insert-text-command', {
          commands: ({ handle }) => [
            handle(editorCommands.insertText, (_context) => false),
          ],
        }),
      ],
      initialSelection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
    });

    expect(
      shouldFlushStoredTextDiffForInsertTextHandler(editor as never, {
        start: 0,
        end: 0,
        text: ' ',
      })
    ).toBe(false);
  });

  it('flushes stored text diffs when insertText policy is material', () => {
    const editor = createEditor({
      extensions: [
        defineExtension('insert-text-command', {
          commands: ({ handle }) => [
            handle(editorCommands.insertText, ({ state }) =>
              state.transaction((tx) => {
                tx.tags.add('material-insert-text');
              })
            ),
          ],
        }),
      ],
    });

    expect(
      shouldFlushStoredTextDiffForInsertTextHandler(editor as never, {
        start: 0,
        end: 0,
        text: ' ',
      })
    ).toBe(true);
  });

  it('keeps plain editors on the deferred pending-diff path', () => {
    const editor = createEditor({
      initialSelection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
    });

    expect(
      shouldFlushStoredTextDiffForInsertTextHandler(editor as never, {
        start: 0,
        end: 0,
        text: ' ',
      })
    ).toBe(false);
  });

  it('does not fast-flush delete diffs through insertText command handlers', () => {
    const editor = createEditor({
      extensions: [
        defineExtension('insert-text-command', {
          commands: ({ handle }) => [
            handle(editorCommands.insertText, (_context) => false),
          ],
        }),
      ],
      initialSelection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
    });

    expect(
      shouldFlushStoredTextDiffForInsertTextHandler(editor as never, {
        start: 0,
        end: 1,
        text: '',
      })
    ).toBe(false);
  });

  it('does not treat unrelated command handlers as insertText policy', () => {
    const editor = createEditor({
      extensions: [
        defineExtension('insert-break-command', {
          commands: ({ handle }) => [
            handle(editorCommands.insertBreak, (_context) => false),
          ],
        }),
      ],
      initialSelection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
    });

    expect(
      shouldFlushStoredTextDiffForInsertTextHandler(editor as never, {
        start: 0,
        end: 0,
        text: ' ',
      })
    ).toBe(false);
  });
});

describe('Android input manager stored text diffs', () => {
  it('keeps a live text repair echo available for Android flush', () => {
    const inputController = createInputController();

    inputController.state.recentTextInputRepairEcho = {
      expiresAt: 1000,
      pathKey: '0,0',
      selectionOffset: 5,
      text: 'Beta!',
    };

    clearExpiredTextInputRepairEcho(inputController, 999);

    expect(inputController.state.recentTextInputRepairEcho).toEqual({
      expiresAt: 1000,
      pathKey: '0,0',
      selectionOffset: 5,
      text: 'Beta!',
    });
  });

  it('clears an expired text repair echo before follow-up beforeinput work', () => {
    const inputController = createInputController();

    inputController.state.recentTextInputRepairEcho = {
      expiresAt: 1000,
      pathKey: '0,0',
      selectionOffset: 5,
      text: 'Beta!',
    };

    clearExpiredTextInputRepairEcho(inputController, 1001);

    expect(inputController.state.recentTextInputRepairEcho).toBeNull();
  });

  it('stores the normalized replacement diff for a synced text leaf', () => {
    vi.useFakeTimers();

    const editor = createEditor({
      initialValue: [paragraph('abc')],
    });
    const scheduleOnDOMSelectionChange = createDebouncedSpy();
    const onDOMSelectionChange = createDebouncedSpy();
    const textHost = document.createElement('span');
    const textNode = document.createTextNode('abc');

    textHost.setAttribute('data-plite-dom-sync', 'true');
    textHost.setAttribute('data-plite-node', 'text');
    textHost.append(textNode);

    vi.spyOn(ReactEditor, 'getWindow').mockReturnValue(window);
    vi.spyOn(ReactEditor, 'resolveDOMPoint').mockReturnValue([textNode, 0]);
    vi.spyOn(ReactEditor, 'resolvePliteRange').mockReturnValue(null);

    const manager = createAndroidInputManager({
      editor: editor as never,
      inputController: createInputController(),
      onDOMSelectionChange,
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange,
    });

    editorSelect(editor, range(0, 3));
    manager.handleDOMBeforeInput(
      beforeInputEvent('insertReplacementText', 'axc')
    );

    expect(EDITOR_TO_PENDING_DIFFS.get(editor)?.[0]?.diff).toEqual({
      end: 2,
      start: 1,
      text: 'x',
    });
  });

  it('drops a pending diff already applied by a recent text repair echo', () => {
    const editor = createEditor({
      initialValue: [paragraph('Beta!')],
    });
    const inputController = createInputController();
    const scheduleOnDOMSelectionChange = createDebouncedSpy();
    const onDOMSelectionChange = createDebouncedSpy();

    inputController.state.recentTextInputRepairEcho = {
      expiresAt: performance.now() + 1000,
      pathKey: '0,0',
      selectionOffset: 5,
      text: 'Beta!',
    };
    EDITOR_TO_PENDING_DIFFS.set(editor, [
      {
        diff: { start: 4, end: 4, text: '!' },
        id: 0,
        path: [0, 0],
      },
    ]);

    const manager = createAndroidInputManager({
      editor: editor as never,
      inputController,
      onDOMSelectionChange,
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange,
    });

    manager.flush();

    expect(editorString(editor, [])).toBe('Beta!');
    expect(EDITOR_TO_PENDING_DIFFS.get(editor)).toEqual([]);
    expect(inputController.state.recentTextInputRepairEcho).toBeNull();
  });

  it('keeps a real follow-up insertion at the repaired caret while the text repair echo is live', () => {
    const editor = createEditor({
      initialValue: [paragraph('Beta!')],
    });
    const inputController = createInputController();
    const scheduleOnDOMSelectionChange = createDebouncedSpy();
    const onDOMSelectionChange = createDebouncedSpy();
    const textHost = document.createElement('span');
    const textNode = document.createTextNode('A');

    textHost.setAttribute('data-plite-dom-sync', 'true');
    textHost.setAttribute('data-plite-node', 'text');
    textHost.append(textNode);
    inputController.state.recentTextInputRepairEcho = {
      expiresAt: performance.now() + 1000,
      pathKey: '0,0',
      selectionOffset: 5,
      text: 'Beta!',
    };
    EDITOR_TO_PENDING_DIFFS.set(editor, [
      {
        diff: { start: 5, end: 5, text: 'x' },
        id: 0,
        path: [0, 0],
      },
    ]);

    const manager = createAndroidInputManager({
      editor: editor as never,
      inputController,
      onDOMSelectionChange,
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange,
    });

    manager.flush();

    expect(editorString(editor, [])).toBe('Beta!x');
  });

  it('stores real follow-up text at a pending native repair caret', () => {
    const editor = createEditor({
      initialValue: [paragraph('')],
    });
    const inputController = createInputController();
    const scheduleOnDOMSelectionChange = createDebouncedSpy();
    const onDOMSelectionChange = createDebouncedSpy();

    inputController.state.activeIntent = 'text-insert';
    inputController.state.pendingNativeTextInputRepairOffset = 1;
    inputController.state.pendingNativeTextInputRepairPathKey = '0,0';

    vi.spyOn(ReactEditor, 'getWindow').mockReturnValue(window);
    vi.spyOn(ReactEditor, 'resolvePliteRange').mockReturnValue(null);

    const manager = createAndroidInputManager({
      editor: editor as never,
      inputController,
      onDOMSelectionChange,
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange,
    });

    editorSelect(editor, range(0));
    manager.handleDOMBeforeInput(beforeInputEvent('insertText', 'x'));
    manager.flush();

    expect(editorString(editor, [])).toBe('x');
  });

  it('flushes pending text diffs on input while selection is model-owned', () => {
    const editor = createEditor({
      initialValue: [paragraph('')],
    });
    const inputController = createInputController();
    const scheduleOnDOMSelectionChange = createDebouncedSpy();
    const onDOMSelectionChange = createDebouncedSpy();

    inputController.state.selectionSource = 'model-owned';
    EDITOR_TO_PENDING_DIFFS.set(editor, [
      {
        diff: { start: 0, end: 0, text: 'A' },
        id: 0,
        path: [0, 0],
      },
    ]);

    const manager = createAndroidInputManager({
      editor: editor as never,
      inputController,
      onDOMSelectionChange,
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange,
    });

    manager.handleInput();

    expect(editorString(editor, [])).toBe('A');
  });

  it('yields a verified root-captured insert to canonical DOM repair', () => {
    const editor = createEditor({
      initialValue: [paragraph('stale'), paragraph('ABCDE')],
    });
    const inputController = createInputController();
    const scheduleOnDOMSelectionChange = createDebouncedSpy();
    const onDOMSelectionChange = createDebouncedSpy();

    inputController.state.selectionChangeOrigin = 'native-user';
    inputController.state.selectionSource = 'dom-current';
    EDITOR_TO_PENDING_DIFFS.set(editor, [
      {
        diff: { start: 2, end: 2, text: 'x' },
        id: 0,
        path: [1, 0],
      },
    ]);
    editorSelect(editor, range(5));

    const manager = createAndroidInputManager({
      editor: editor as never,
      inputController,
      onDOMSelectionChange,
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange,
    });

    expect(
      manager.handleInput({
        insert: { offset: 1, text: 'x' },
        path: [1, 0],
        preferCapturedInsert: true,
        selectionOffset: 2,
        text: 'AxBCDE',
      })
    ).toBe(false);
    expect(editorString(editor, [])).toBe('staleABCDE');
    expect(editorGetSnapshot(editor).selection).toEqual(range(5));
    expect(EDITOR_TO_PENDING_DIFFS.get(editor)).toEqual([]);
    expect(EDITOR_TO_PENDING_ACTION.get(editor)).toBeUndefined();
  });

  it('declines input without applying a stale pending selection', () => {
    const editor = createEditor({
      initialValue: [paragraph('abc')],
    });
    const inputController = createInputController();
    const scheduleOnDOMSelectionChange = createDebouncedSpy();
    const onDOMSelectionChange = createDebouncedSpy();

    editorSelect(editor, range(0));
    EDITOR_TO_PENDING_SELECTION.set(editor, range(3));

    const manager = createAndroidInputManager({
      editor: editor as never,
      inputController,
      onDOMSelectionChange,
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange,
    });

    expect(manager.handleInput()).toBe(false);
    expect(editorGetSnapshot(editor).selection).toEqual(range(0));
    expect(EDITOR_TO_PENDING_SELECTION.get(editor)).toEqual(range(3));
  });

  it('keeps pending text diffs deferred while Android composition is active', () => {
    const editor = createEditor({
      initialValue: [paragraph('')],
    });
    const inputController = createInputController();
    const scheduleOnDOMSelectionChange = createDebouncedSpy();
    const onDOMSelectionChange = createDebouncedSpy();

    inputController.state.selectionSource = 'model-owned';
    IS_COMPOSING.set(editor, true);
    EDITOR_TO_PENDING_DIFFS.set(editor, [
      {
        diff: { start: 0, end: 0, text: 'A' },
        id: 0,
        path: [0, 0],
      },
    ]);

    const manager = createAndroidInputManager({
      editor: editor as never,
      inputController,
      onDOMSelectionChange,
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange,
    });

    manager.handleInput();

    expect(editorString(editor, [])).toBe('');
    expect(EDITOR_TO_PENDING_DIFFS.get(editor)).toHaveLength(1);
  });

  it('keeps DOM-current pending text diffs deferred on input', () => {
    const editor = createEditor({
      initialValue: [paragraph('')],
    });
    const inputController = createInputController();
    const scheduleOnDOMSelectionChange = createDebouncedSpy();
    const onDOMSelectionChange = createDebouncedSpy();

    inputController.state.selectionSource = 'dom-current';
    inputController.state.selectionChangeOrigin = 'native-user';
    EDITOR_TO_PENDING_DIFFS.set(editor, [
      {
        diff: { start: 0, end: 0, text: 'A' },
        id: 0,
        path: [0, 0],
      },
    ]);

    const manager = createAndroidInputManager({
      editor: editor as never,
      inputController,
      onDOMSelectionChange,
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange,
    });

    manager.handleInput();

    expect(editorString(editor, [])).toBe('');
    expect(EDITOR_TO_PENDING_DIFFS.get(editor)).toHaveLength(1);
  });

  it('remaps follow-up text through a live repair echo when the native offset is stale', () => {
    const editor = createEditor({
      initialValue: [paragraph('A')],
    });
    const inputController = createInputController();
    const scheduleOnDOMSelectionChange = createDebouncedSpy();
    const onDOMSelectionChange = createDebouncedSpy();
    const textHost = document.createElement('span');
    const textNode = document.createTextNode('A');

    textHost.setAttribute('data-plite-dom-sync', 'true');
    textHost.setAttribute('data-plite-node', 'text');
    textHost.append(textNode);
    inputController.state.recentTextInputRepairEcho = {
      expiresAt: performance.now() + 1000,
      pathKey: '0,0',
      selectionOffset: 1,
      text: 'A',
    };
    vi.spyOn(ReactEditor, 'getWindow').mockReturnValue(window);
    vi.spyOn(ReactEditor, 'resolveDOMPoint').mockReturnValue([textNode, 0]);
    vi.spyOn(ReactEditor, 'resolvePliteRange').mockReturnValue(null);

    const manager = createAndroidInputManager({
      editor: editor as never,
      inputController,
      onDOMSelectionChange,
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange,
    });

    editorSelect(editor, range(0));
    manager.handleDOMBeforeInput(beforeInputEvent('insertText', 'f'));
    manager.flush();

    expect(editorString(editor, [])).toBe('Af');
  });

  it('keeps a same-node native user caret over a live repair echo', () => {
    const editor = createEditor({
      initialValue: [paragraph('Beta!')],
    });
    const inputController = createInputController();
    const scheduleOnDOMSelectionChange = createDebouncedSpy();
    const onDOMSelectionChange = createDebouncedSpy();
    const textHost = document.createElement('span');
    const textNode = document.createTextNode('Beta!');

    textHost.setAttribute('data-plite-dom-sync', 'true');
    textHost.setAttribute('data-plite-node', 'text');
    textHost.append(textNode);
    inputController.state.recentTextInputRepairEcho = {
      expiresAt: performance.now() + 1000,
      pathKey: '0,0',
      selectionOffset: 5,
      text: 'Beta!',
    };
    inputController.state.selectionSource = 'dom-current';
    inputController.state.selectionChangeOrigin = 'native-user';
    vi.spyOn(ReactEditor, 'getWindow').mockReturnValue(window);
    vi.spyOn(ReactEditor, 'resolveDOMPoint').mockReturnValue([textNode, 1]);
    vi.spyOn(ReactEditor, 'resolvePliteRange').mockReturnValue(range(1));

    const manager = createAndroidInputManager({
      editor: editor as never,
      inputController,
      onDOMSelectionChange,
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange,
    });

    editorSelect(editor, range(1));
    manager.handleDOMBeforeInput(beforeInputEvent('insertText', 'x'));
    manager.flush();

    expect(editorString(editor, [])).toBe('Bxeta!');
  });

  it('preserves native-user DOM order for same-offset inserts while a pending diff is live', () => {
    const editor = createEditor({
      initialValue: [paragraph('abc')],
    });
    const inputController = createInputController();
    const scheduleOnDOMSelectionChange = createDebouncedSpy();
    const onDOMSelectionChange = createDebouncedSpy();
    const textHost = document.createElement('span');
    const textNode = document.createTextNode('abc');

    textHost.setAttribute('data-plite-dom-sync', 'true');
    textHost.setAttribute('data-plite-node', 'text');
    textHost.append(textNode);
    inputController.state.selectionSource = 'dom-current';
    inputController.state.selectionChangeOrigin = 'native-user';
    EDITOR_TO_PENDING_DIFFS.set(editor, [
      {
        diff: { start: 1, end: 1, text: 'X' },
        id: 0,
        path: [0, 0],
      },
    ]);
    IS_COMPOSING.set(editor, true);
    vi.spyOn(ReactEditor, 'getWindow').mockReturnValue(window);
    vi.spyOn(ReactEditor, 'resolveDOMPoint').mockReturnValue([textNode, 1]);
    vi.spyOn(ReactEditor, 'resolvePliteRange').mockReturnValue(range(1));

    const manager = createAndroidInputManager({
      editor: editor as never,
      inputController,
      onDOMSelectionChange,
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange,
    });

    try {
      editorSelect(editor, range(1));
      manager.handleDOMBeforeInput(beforeInputEvent('insertText', 'Y'));
      IS_COMPOSING.set(editor, false);
      manager.flush();

      expect(editorString(editor, [])).toBe('aYXbc');
    } finally {
      IS_COMPOSING.set(editor, false);
    }
  });

  it('keeps a fresh native caret over a trusted stale runtime caret while pending changes exist', () => {
    const editor = createEditor({
      initialValue: [paragraph('abc')],
    });
    const inputController = createInputController();
    const scheduleOnDOMSelectionChange = createDebouncedSpy();
    const onDOMSelectionChange = createDebouncedSpy();
    const textHost = document.createElement('span');
    const textNode = document.createTextNode('abc');

    textHost.setAttribute('data-plite-dom-sync', 'true');
    textHost.setAttribute('data-plite-node', 'text');
    textHost.append(textNode);
    inputController.state.selectionSource = 'dom-current';
    inputController.state.selectionChangeOrigin = 'native-user';
    EDITOR_TO_PENDING_ACTION.set(editor, {
      at: range(0),
      run: () => {},
    });
    vi.spyOn(ReactEditor, 'getWindow').mockReturnValue(window);
    vi.spyOn(ReactEditor, 'resolveDOMPoint').mockReturnValue([textNode, 1]);
    vi.spyOn(ReactEditor, 'resolvePliteRange').mockReturnValue(range(1));

    const manager = createAndroidInputManager({
      editor: editor as never,
      inputController,
      onDOMSelectionChange,
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange,
    });

    editorSelect(editor, range(3));
    manager.handleDOMBeforeInput(beforeInputEvent('insertText', 'x'));
    manager.flush();

    expect(editorString(editor, [])).toBe('axbc');
  });

  it('does not drop repair-echo-looking text after a fresh native caret move', () => {
    const editor = createEditor({
      initialValue: [paragraph('Beta!')],
    });
    const inputController = createInputController();
    const scheduleOnDOMSelectionChange = createDebouncedSpy();
    const onDOMSelectionChange = createDebouncedSpy();

    inputController.state.recentTextInputRepairEcho = {
      expiresAt: performance.now() + 1000,
      pathKey: '0,0',
      selectionOffset: 5,
      text: 'Beta!',
    };
    inputController.state.selectionSource = 'dom-current';
    inputController.state.selectionChangeOrigin = 'native-user';
    EDITOR_TO_PENDING_DIFFS.set(editor, [
      {
        diff: { start: 4, end: 4, text: '!' },
        id: 0,
        path: [0, 0],
      },
    ]);

    const manager = createAndroidInputManager({
      editor: editor as never,
      inputController,
      onDOMSelectionChange,
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange,
    });

    manager.flush();

    expect(editorString(editor, [])).toBe('Beta!!');
  });

  it('remaps follow-up text through the repaired runtime caret before the echo is live', () => {
    const editor = createEditor({
      initialValue: [paragraph('A')],
    });
    const inputController = createInputController();
    const scheduleOnDOMSelectionChange = createDebouncedSpy();
    const onDOMSelectionChange = createDebouncedSpy();
    const textHost = document.createElement('span');
    const textNode = document.createTextNode('A');

    textHost.setAttribute('data-plite-dom-sync', 'true');
    textHost.setAttribute('data-plite-node', 'text');
    textHost.append(textNode);
    inputController.state.selectionChangeOrigin = 'repair-induced';
    inputController.state.selectionSource = 'dom-current';
    vi.spyOn(ReactEditor, 'getWindow').mockReturnValue(window);
    vi.spyOn(ReactEditor, 'resolveDOMPoint').mockReturnValue([textNode, 0]);
    vi.spyOn(ReactEditor, 'resolvePliteRange').mockReturnValue(range(0));

    const manager = createAndroidInputManager({
      editor: editor as never,
      inputController,
      onDOMSelectionChange,
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange,
    });

    editorSelect(editor, range(1));
    manager.handleDOMBeforeInput(
      beforeInputEvent('insertText', 'f', [{} as StaticRange])
    );
    manager.flush();

    expect(editorString(editor, [])).toBe('Af');
  });

  it('keeps a valid native target range when the model-owned caret is stale', () => {
    const editor = createEditor({
      initialValue: [paragraph('ABCDE')],
    });
    const inputController = createInputController();
    const scheduleOnDOMSelectionChange = createDebouncedSpy();
    const onDOMSelectionChange = createDebouncedSpy();
    const textHost = document.createElement('span');
    const textNode = document.createTextNode('ABCDE');

    textHost.setAttribute('data-plite-dom-sync', 'true');
    textHost.setAttribute('data-plite-node', 'text');
    textHost.append(textNode);
    inputController.state.selectionSource = 'model-owned';
    vi.spyOn(ReactEditor, 'getWindow').mockReturnValue(window);
    vi.spyOn(ReactEditor, 'resolveDOMPoint').mockReturnValue([textNode, 0]);
    vi.spyOn(ReactEditor, 'resolvePliteRange').mockReturnValue(range(0));

    const manager = createAndroidInputManager({
      editor: editor as never,
      inputController,
      onDOMSelectionChange,
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange,
    });

    editorSelect(editor, range(5));
    manager.handleDOMBeforeInput(
      beforeInputEvent('insertText', 'x', [{} as StaticRange])
    );
    manager.flush();

    expect(editorString(editor, [])).toBe('xABCDE');
  });

  it('prefers the live DOM-current caret over a stale target range', () => {
    const editor = createEditor({
      initialValue: [paragraph('ABCDE')],
    });
    const inputController = createInputController();
    const scheduleOnDOMSelectionChange = createDebouncedSpy();
    const onDOMSelectionChange = createDebouncedSpy();
    const textHost = document.createElement('span');
    const textNode = document.createTextNode('ABCDE');
    const staleTarget = {} as StaticRange;
    const liveSelection = {} as Selection;

    textHost.setAttribute('data-plite-dom-sync', 'true');
    textHost.setAttribute('data-plite-node', 'text');
    textHost.append(textNode);
    inputController.state.modelSelectionPreference = {
      preferModelSelection: false,
      reason: 'native-selection',
      selectionSource: 'dom-current',
    };
    inputController.state.selectionSource = 'model-owned';
    vi.spyOn(ReactEditor, 'getWindow').mockReturnValue({
      getSelection: () => liveSelection,
    } as Window);
    vi.spyOn(ReactEditor, 'resolveDOMPoint').mockReturnValue([textNode, 0]);
    vi.spyOn(ReactEditor, 'resolvePliteRange').mockReturnValue(range(2));

    const manager = createAndroidInputManager({
      editor: editor as never,
      inputController,
      onDOMSelectionChange,
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange,
    });

    editorSelect(editor, range(1));
    manager.handleDOMBeforeInput(
      beforeInputEvent('insertText', 'x', [staleTarget])
    );
    manager.flush();

    expect(editorString(editor, [])).toBe('AxBCDE');
  });

  it('flushes a pending text insert before reading the next insert target', () => {
    const editor = createEditor({
      initialValue: [paragraph('')],
    });
    const inputController = createInputController();
    const scheduleOnDOMSelectionChange = createDebouncedSpy();
    const onDOMSelectionChange = createDebouncedSpy();
    const textHost = document.createElement('span');
    const textNode = document.createTextNode('');

    textHost.setAttribute('data-plite-dom-sync', 'true');
    textHost.setAttribute('data-plite-node', 'text');
    textHost.append(textNode);
    vi.spyOn(ReactEditor, 'getWindow').mockReturnValue(window);
    vi.spyOn(ReactEditor, 'resolveDOMPoint').mockReturnValue([textNode, 0]);
    const resolvePliteRange = vi
      .spyOn(ReactEditor, 'resolvePliteRange')
      .mockReturnValue(null);

    const manager = createAndroidInputManager({
      editor: editor as never,
      inputController,
      onDOMSelectionChange,
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange,
    });

    editorSelect(editor, range(0));
    manager.handleDOMBeforeInput(beforeInputEvent('insertText', 'A'));
    resolvePliteRange.mockReturnValue(range(0));
    manager.handleDOMBeforeInput(
      beforeInputEvent('insertText', 'f', [{} as StaticRange])
    );
    manager.flush();

    expect(editorString(editor, [])).toBe('Af');
  });

  it('keeps applying pending diffs after the text repair echo expires', () => {
    const editor = createEditor({
      initialValue: [paragraph('Beta!')],
    });
    const inputController = createInputController();
    const scheduleOnDOMSelectionChange = createDebouncedSpy();
    const onDOMSelectionChange = createDebouncedSpy();

    inputController.state.recentTextInputRepairEcho = {
      expiresAt: performance.now() - 1,
      pathKey: '0,0',
      selectionOffset: 5,
      text: 'Beta!',
    };
    EDITOR_TO_PENDING_DIFFS.set(editor, [
      {
        diff: { start: 5, end: 5, text: '!' },
        id: 0,
        path: [0, 0],
      },
    ]);

    const manager = createAndroidInputManager({
      editor: editor as never,
      inputController,
      onDOMSelectionChange,
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange,
    });

    manager.flush();

    expect(editorString(editor, [])).toBe('Beta!!');
  });
});

describe('Android input manager SwiftKey insert-position hint', () => {
  it('keeps selection on the marked inserted leaf after collapsed mark typing', () => {
    vi.useFakeTimers();

    const editor = createEditor({
      initialValue: [paragraph('a')],
    });
    const scheduleOnDOMSelectionChange = createDebouncedSpy();
    const onDOMSelectionChange = createDebouncedSpy();
    const textHost = document.createElement('span');
    const textNode = document.createTextNode('a');

    textHost.setAttribute('data-plite-dom-sync', 'true');
    textHost.setAttribute('data-plite-node', 'text');
    textHost.append(textNode);

    vi.spyOn(ReactEditor, 'getWindow').mockReturnValue(window);
    vi.spyOn(ReactEditor, 'resolveDOMPoint').mockReturnValue([textNode, 1]);
    vi.spyOn(ReactEditor, 'resolvePliteRange').mockReturnValue(null);

    const manager = createAndroidInputManager({
      editor: editor as never,
      inputController: createInputController(),
      onDOMSelectionChange,
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange,
    });

    editorSelect(editor, range(1));
    editorAddMark(editor, 'bold', true);
    EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, { bold: true });

    manager.handleDOMBeforeInput(beforeInputEvent('insertText', 'w'));
    manager.flush();

    const snapshot = editorGetSnapshot(editor);
    expect(snapshot.children).toEqual([
      {
        children: [{ text: 'a' }, { bold: true, text: 'w' }],
        type: 'paragraph',
      },
    ]);
    expect(snapshot.selection).toEqual({
      kind: 'text',
      anchor: { path: [0, 1], offset: 1 },
      focus: { path: [0, 1], offset: 1 },
    });
  });

  it('keeps the mark-placeholder hint through scheduled selection restoration', () => {
    vi.useFakeTimers();

    const editor = createEditor({
      initialValue: [paragraph('')],
    });
    const scheduleOnDOMSelectionChange = createDebouncedSpy();
    const onDOMSelectionChange = createDebouncedSpy();
    const textHost = document.createElement('span');
    const textNode = document.createTextNode('');

    textHost.setAttribute('data-plite-dom-sync', 'true');
    textHost.setAttribute('data-plite-node', 'text');
    textHost.append(textNode);

    vi.spyOn(ReactEditor, 'getWindow').mockReturnValue(window);
    vi.spyOn(ReactEditor, 'resolveDOMPoint').mockReturnValue([textNode, 0]);
    const resolvePliteRange = vi
      .spyOn(ReactEditor, 'resolvePliteRange')
      .mockReturnValue(null);

    const manager = createAndroidInputManager({
      editor: editor as never,
      inputController: createInputController(),
      onDOMSelectionChange,
      receivedUserInput: { current: true },
      scheduleOnDOMSelectionChange,
    });

    editorSelect(editor, range(0));
    EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, { bold: true });
    EDITOR_TO_PENDING_DIFFS.set(editor, [
      {
        diff: { start: 0, end: 0, text: 'some ' },
        id: 0,
        path: [0, 0],
      },
    ]);

    manager.flush();
    expect(editorString(editor, [])).toBe('some ');

    editorSelect(editor, range(5));
    manager.handleDOMBeforeInput(beforeInputEvent('insertText', 'text'));

    resolvePliteRange.mockReturnValueOnce(range(6, 9));
    manager.handleDOMBeforeInput(
      beforeInputEvent('insertCompositionText', 'text', [{} as StaticRange])
    );
    manager.flush();

    expect(editorString(editor, [])).toBe('some text');
  });
});
