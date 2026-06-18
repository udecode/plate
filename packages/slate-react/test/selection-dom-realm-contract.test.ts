const createFrameDocument = () => {
  const frame = document.createElement('iframe');
  document.body.append(frame);

  const frameDocument = frame.contentDocument;
  const frameWindow = frame.contentWindow;

  if (!frameDocument || !frameWindow) {
    throw new Error('Expected iframe document');
  }

  return { frame, frameDocument, frameWindow };
};

const createInputController = () =>
  ({
    preferModelSelectionForInputRef: { current: false },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: null,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: null,
      selectionSource: 'dom-current',
    },
  }) as any;

const importWebKitSelectionModules = async () => {
  vi.resetModules();
  vi.doMock('@platejs/slate-dom', async () => {
    const actual =
      await vi.importActual<typeof import('@platejs\/slate-dom')>(
        '@platejs/slate-dom'
      );

    return {
      ...actual,
      IS_WEBKIT: true,
    };
  });

  const [selectionController, selectionReconciler, reactEditor] =
    await Promise.all([
      import('../src/editable/selection-controller'),
      import('../src/editable/selection-reconciler'),
      import('../src/plugin/react-editor'),
    ]);

  return {
    applyEditableDOMSelectionChange:
      selectionController.applyEditableDOMSelectionChange,
    handleWebKitShadowDOMBeforeInput:
      selectionReconciler.handleWebKitShadowDOMBeforeInput,
    ReactEditor: reactEditor.ReactEditor,
  };
};

afterEach(() => {
  vi.doUnmock('@platejs/slate-dom');
  vi.resetModules();
  vi.restoreAllMocks();
});

test('selectionchange listener ignores input targets from the target document realm', async () => {
  const { attachEditableSelectionChangeListener } = await import(
    '../src/editable/selection-reconciler'
  );
  const { frame, frameDocument, frameWindow } = createFrameDocument();
  const input = frameDocument.createElement('input');
  const scheduleOnDOMSelectionChange = vi.fn();
  const state = { pendingDOMSelectionImport: false };

  frameDocument.body.append(input);

  const detach = attachEditableSelectionChangeListener({
    scheduleOnDOMSelectionChange,
    state,
    targetDocument: frameDocument,
  });

  try {
    input.dispatchEvent(
      new frameWindow.Event('selectionchange', { bubbles: true })
    );

    expect(scheduleOnDOMSelectionChange).not.toHaveBeenCalled();

    frameDocument.dispatchEvent(new frameWindow.Event('selectionchange'));

    expect(scheduleOnDOMSelectionChange).toHaveBeenCalledTimes(1);
    expect(state.pendingDOMSelectionImport).toBe(true);
  } finally {
    detach();
    frame.remove();
  }
});

test('selectionchange listener skips repair-induced model-owned history imports', async () => {
  const { attachEditableSelectionChangeListener } = await import(
    '../src/editable/selection-reconciler'
  );
  const { frame, frameDocument, frameWindow } = createFrameDocument();
  const scheduleOnDOMSelectionChange = vi.fn();
  const state = createInputController().state;

  state.activeIntent = 'history';
  state.selectionChangeOrigin = 'repair-induced';
  state.selectionSource = 'model-owned';
  state.modelSelectionPreference = {
    preferModelSelection: true,
    reason: 'model-command',
    selectionSource: 'model-owned',
  };

  const detach = attachEditableSelectionChangeListener({
    scheduleOnDOMSelectionChange,
    state,
    targetDocument: frameDocument,
  });

  try {
    frameDocument.dispatchEvent(new frameWindow.Event('selectionchange'));

    expect(scheduleOnDOMSelectionChange).not.toHaveBeenCalled();
    expect(state.pendingDOMSelectionImport).toBe(false);

    state.selectionChangeOrigin = 'native-user';
    frameDocument.dispatchEvent(new frameWindow.Event('selectionchange'));

    expect(scheduleOnDOMSelectionChange).toHaveBeenCalledTimes(1);
    expect(state.pendingDOMSelectionImport).toBe(true);
  } finally {
    detach();
    frame.remove();
  }
});

test('WebKit shadow selectionchange uses the editor document realm', async () => {
  const { applyEditableDOMSelectionChange, ReactEditor } =
    await importWebKitSelectionModules();
  const { frame, frameDocument } = createFrameDocument();
  const host = frameDocument.createElement('div');
  const editorElement = frameDocument.createElement('div');
  const execCommand = vi.fn();
  const ambientExecCommand = vi.fn();
  const editor = { update: vi.fn() } as any;
  const processing = { current: false };

  frameDocument.body.append(host);
  host.attachShadow({ mode: 'open' }).append(editorElement);

  Object.defineProperty(frameDocument, 'execCommand', {
    configurable: true,
    value: execCommand,
  });
  Object.defineProperty(document, 'execCommand', {
    configurable: true,
    value: ambientExecCommand,
  });

  vi.spyOn(ReactEditor, 'assertDOMNode').mockReturnValue(editorElement);

  try {
    applyEditableDOMSelectionChange({
      androidInputManager: null,
      editor,
      inputController: createInputController(),
      processing,
      readOnly: false,
      rerunOnDirtyNodeMap: vi.fn(),
    });

    expect(execCommand).toHaveBeenCalledWith('indent');
    expect(ambientExecCommand).not.toHaveBeenCalled();
    expect(editor.update).not.toHaveBeenCalled();
    expect(processing.current).toBe(false);
  } finally {
    frame.remove();
  }
});

test('WebKit shadow beforeinput uses the shadow root realm', async () => {
  const { handleWebKitShadowDOMBeforeInput, ReactEditor } =
    await importWebKitSelectionModules();
  const { frame, frameDocument, frameWindow } = createFrameDocument();
  const host = frameDocument.createElement('div');
  const target = frameDocument.createTextNode('abc');
  const root = host.attachShadow({ mode: 'open' });
  const range = frameDocument.createRange();
  const slateRange = {
    anchor: { offset: 0, path: [0, 0] },
    focus: { offset: 1, path: [0, 0] },
  };
  const setSelection = vi.fn();
  const editor = {
    update: vi.fn((callback) => {
      callback({ selection: { set: setSelection } });
    }),
  } as any;
  const event = new frameWindow.InputEvent('beforeinput', {
    inputType: 'insertText',
  });

  frameDocument.body.append(host);
  root.append(target);
  range.setStart(target, 0);
  range.setEnd(target, 1);

  Object.defineProperty(event, 'getTargetRanges', {
    configurable: true,
    value: () => [range],
  });

  vi.spyOn(event, 'preventDefault');
  vi.spyOn(event, 'stopImmediatePropagation');
  vi.spyOn(ReactEditor, 'resolveSlateRange').mockImplementation(
    (_editor, domRange) => {
      expect(domRange).toBeInstanceOf(frameWindow.Range);
      return slateRange as any;
    }
  );

  try {
    const handled = handleWebKitShadowDOMBeforeInput({
      editor,
      event,
      processing: { current: true },
      root,
      window,
    });

    expect(handled).toBe(true);
    expect(setSelection).toHaveBeenCalledWith(slateRange);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopImmediatePropagation).toHaveBeenCalled();
  } finally {
    frame.remove();
  }
});
