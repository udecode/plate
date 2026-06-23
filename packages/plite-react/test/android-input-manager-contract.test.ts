import { createEditor, defineEditorExtension } from '@platejs/plite';
import { Editor } from '@platejs/plite/internal';
import {
  EDITOR_TO_PENDING_ACTION,
  EDITOR_TO_PENDING_DIFFS,
  EDITOR_TO_PENDING_INSERTION_MARKS,
  IS_COMPOSING,
} from '@platejs/plite-dom/internal';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearExpiredTextInputRepairEcho,
  createEditableInputController,
  createEditableInputControllerState,
} from '../src/editable/input-state';
import {
  createAndroidInputManager,
  shouldFlushStoredTextDiffForTransformMiddleware,
} from '../src/hooks/android-input-manager/android-input-manager';
import { ReactEditor } from '../src/plugin/react-editor';

afterEach(() => {
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
  anchor: { path: [0, 0], offset: start },
  focus: { path: [0, 0], offset: end },
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

describe('Android input manager transform middleware flush policy', () => {
  it('flushes stored text diffs when insertText transform middleware is registered', () => {
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          name: 'insert-text-transform',
          transforms: {
            insertText({ next }) {
              return next();
            },
          },
        }),
      ],
    });

    expect(
      shouldFlushStoredTextDiffForTransformMiddleware(editor as never, {
        start: 0,
        end: 0,
        text: ' ',
      })
    ).toBe(true);
  });

  it('keeps plain editors on the deferred pending-diff path', () => {
    const editor = createEditor();

    expect(
      shouldFlushStoredTextDiffForTransformMiddleware(editor as never, {
        start: 0,
        end: 0,
        text: ' ',
      })
    ).toBe(false);
  });

  it('does not fast-flush delete diffs through insertText middleware', () => {
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          name: 'insert-text-transform',
          transforms: {
            insertText({ next }) {
              return next();
            },
          },
        }),
      ],
    });

    expect(
      shouldFlushStoredTextDiffForTransformMiddleware(editor as never, {
        start: 0,
        end: 1,
        text: '',
      })
    ).toBe(false);
  });

  it('does not treat unrelated transform middleware as insertText policy', () => {
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          name: 'insert-break-transform',
          transforms: {
            insertBreak({ next }) {
              return next();
            },
          },
        }),
      ],
    });

    expect(
      shouldFlushStoredTextDiffForTransformMiddleware(editor as never, {
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
      initialValue: [{ children: [{ text: 'abc' }] }],
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

    Editor.select(editor, range(0, 3));
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
      initialValue: [{ children: [{ text: 'Beta!' }] }],
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

    expect(Editor.string(editor, [])).toBe('Beta!');
    expect(EDITOR_TO_PENDING_DIFFS.get(editor)).toEqual([]);
    expect(inputController.state.recentTextInputRepairEcho).toBeNull();
  });

  it('keeps a real follow-up insertion at the repaired caret while the text repair echo is live', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'Beta!' }] }],
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

    expect(Editor.string(editor, [])).toBe('Beta!x');
  });

  it('stores real follow-up text at a pending native repair caret', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: '' }] }],
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

    Editor.select(editor, range(0));
    manager.handleDOMBeforeInput(beforeInputEvent('insertText', 'x'));
    manager.flush();

    expect(Editor.string(editor, [])).toBe('x');
  });

  it('flushes pending text diffs on input while selection is model-owned', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: '' }] }],
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

    expect(Editor.string(editor, [])).toBe('A');
  });

  it('keeps pending text diffs deferred while Android composition is active', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: '' }] }],
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

    expect(Editor.string(editor, [])).toBe('');
    expect(EDITOR_TO_PENDING_DIFFS.get(editor)).toHaveLength(1);
  });

  it('keeps DOM-current pending text diffs deferred on input', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: '' }] }],
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

    expect(Editor.string(editor, [])).toBe('');
    expect(EDITOR_TO_PENDING_DIFFS.get(editor)).toHaveLength(1);
  });

  it('remaps follow-up text through a live repair echo when the native offset is stale', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'A' }] }],
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

    Editor.select(editor, range(0));
    manager.handleDOMBeforeInput(beforeInputEvent('insertText', 'f'));
    manager.flush();

    expect(Editor.string(editor, [])).toBe('Af');
  });

  it('keeps a same-node native user caret over a live repair echo', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'Beta!' }] }],
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

    Editor.select(editor, range(1));
    manager.handleDOMBeforeInput(beforeInputEvent('insertText', 'x'));
    manager.flush();

    expect(Editor.string(editor, [])).toBe('Bxeta!');
  });

  it('preserves native-user DOM order for same-offset inserts while a pending diff is live', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'abc' }] }],
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
      Editor.select(editor, range(1));
      manager.handleDOMBeforeInput(beforeInputEvent('insertText', 'Y'));
      IS_COMPOSING.set(editor, false);
      manager.flush();

      expect(Editor.string(editor, [])).toBe('aYXbc');
    } finally {
      IS_COMPOSING.set(editor, false);
    }
  });

  it('keeps a fresh native caret over a trusted stale runtime caret while pending changes exist', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'abc' }] }],
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

    Editor.select(editor, range(3));
    manager.handleDOMBeforeInput(beforeInputEvent('insertText', 'x'));
    manager.flush();

    expect(Editor.string(editor, [])).toBe('axbc');
  });

  it('does not drop repair-echo-looking text after a fresh native caret move', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'Beta!' }] }],
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

    expect(Editor.string(editor, [])).toBe('Beta!!');
  });

  it('remaps follow-up text through the repaired runtime caret before the echo is live', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'A' }] }],
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

    Editor.select(editor, range(1));
    manager.handleDOMBeforeInput(
      beforeInputEvent('insertText', 'f', [{} as StaticRange])
    );
    manager.flush();

    expect(Editor.string(editor, [])).toBe('Af');
  });

  it('keeps a valid native target range when the model-owned caret is stale', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'ABCDE' }] }],
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

    Editor.select(editor, range(5));
    manager.handleDOMBeforeInput(
      beforeInputEvent('insertText', 'x', [{} as StaticRange])
    );
    manager.flush();

    expect(Editor.string(editor, [])).toBe('xABCDE');
  });

  it('flushes a pending text insert before reading the next insert target', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: '' }] }],
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

    Editor.select(editor, range(0));
    manager.handleDOMBeforeInput(beforeInputEvent('insertText', 'A'));
    resolvePliteRange.mockReturnValue(range(0));
    manager.handleDOMBeforeInput(
      beforeInputEvent('insertText', 'f', [{} as StaticRange])
    );
    manager.flush();

    expect(Editor.string(editor, [])).toBe('Af');
  });

  it('keeps applying pending diffs after the text repair echo expires', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'Beta!' }] }],
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

    expect(Editor.string(editor, [])).toBe('Beta!!');
  });
});

describe('Android input manager SwiftKey insert-position hint', () => {
  it('keeps selection on the marked inserted leaf after collapsed mark typing', () => {
    vi.useFakeTimers();

    const editor = createEditor({
      initialValue: [{ children: [{ text: 'a' }] }],
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

    Editor.select(editor, range(1));
    Editor.addMark(editor, 'bold', true);
    EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, { bold: true });

    manager.handleDOMBeforeInput(beforeInputEvent('insertText', 'w'));
    manager.flush();

    const snapshot = Editor.getSnapshot(editor);
    expect(snapshot.children).toEqual([
      { children: [{ text: 'a' }, { bold: true, text: 'w' }] },
    ]);
    expect(snapshot.selection).toEqual({
      anchor: { path: [0, 1], offset: 1 },
      focus: { path: [0, 1], offset: 1 },
    });
  });

  it('keeps the mark-placeholder hint through scheduled selection restoration', () => {
    vi.useFakeTimers();

    const editor = createEditor({
      initialValue: [{ children: [{ text: '' }] }],
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

    Editor.select(editor, range(0));
    EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, { bold: true });
    EDITOR_TO_PENDING_DIFFS.set(editor, [
      {
        diff: { start: 0, end: 0, text: 'some ' },
        id: 0,
        path: [0, 0],
      },
    ]);

    manager.flush();
    expect(Editor.string(editor, [])).toBe('some ');

    Editor.select(editor, range(5));
    manager.handleDOMBeforeInput(beforeInputEvent('insertText', 'text'));

    resolvePliteRange.mockReturnValueOnce(range(6, 9));
    manager.handleDOMBeforeInput(
      beforeInputEvent('insertCompositionText', 'text', [{} as StaticRange])
    );
    manager.flush();

    expect(Editor.string(editor, [])).toBe('some text');
  });
});
