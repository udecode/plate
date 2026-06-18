import {
  createEditor,
  createEditorRuntime,
  createEditorView,
  type Descendant,
  defineEditorExtension,
} from '@platejs/slate';
import { Hotkeys } from '@platejs/slate-dom';
import { DOMCoverage } from '@platejs/slate-dom/internal';
import { history } from '@platejs/slate-history';
import { describe, expect, it, vi } from 'vitest';
import { isSelectAllHotkey } from '../src/dom-strategy/dom-strategy-commands';
import { resolveHistoryFocusEditor } from '../src/editable/history-focus';
import {
  applyEditableKeyDown,
  getTextDirection,
  shouldDeferBackspaceToNativeInput,
} from '../src/editable/keyboard-input-strategy';
import { applyEditableCommand } from '../src/editable/mutation-controller';
import { isNativeVerticalKeyFastPathFullyMounted } from '../src/editable/runtime-keyboard-events';
import { ReactEditor } from '../src/plugin/react-editor';
import { createSlateProjectionGraph } from '../src/projection-graph';
import {
  createSlateViewSelection,
  readSlateViewSelection,
  writeSlateViewSelection,
} from '../src/view-selection';

const keyEvent = (
  key: string,
  options: Partial<
    Pick<KeyboardEvent, 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey'>
  > = {}
) =>
  ({
    altKey: false,
    ctrlKey: false,
    key,
    metaKey: false,
    shiftKey: false,
    ...options,
  }) as KeyboardEvent;

const reactKeyEvent = (nativeEvent: KeyboardEvent) =>
  ({
    altKey: nativeEvent.altKey,
    ctrlKey: nativeEvent.ctrlKey,
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    key: nativeEvent.key,
    metaKey: nativeEvent.metaKey,
    nativeEvent,
    preventDefault: vi.fn(),
    shiftKey: nativeEvent.shiftKey,
    stopPropagation: vi.fn(),
    target: null,
  }) as any;

const paragraph = (text: string) =>
  ({
    type: 'paragraph',
    children: [{ text }],
  }) satisfies Descendant;

const contentRootExtension = defineEditorExtension({
  name: 'keyboard-content-root-test',
  elements: [
    {
      type: 'content-card',
      contentRoot: { slot: 'body' },
      void: 'editable-island',
    },
  ],
});

const contentCard = (bodyRoot = 'card:body') =>
  ({
    type: 'content-card',
    childRoots: { body: bodyRoot },
    children: [{ text: '' }],
  }) satisfies Descendant;

it('detects first-strong keyboard text direction for modern RTL scripts', () => {
  expect(getTextDirection(`123 ${String.fromCodePoint(0x08_a0)}`)).toBe('rtl');
  expect(getTextDirection(`123 ${String.fromCodePoint(0x1_e9_00)}`)).toBe(
    'rtl'
  );
  expect(getTextDirection('abc \u05d0')).toBe('ltr');
  expect(getTextDirection('123 \u05d0')).toBe('rtl');
  expect(getTextDirection('123 456')).toBe('neutral');
  expect(getTextDirection('\u0661\u0662\u0663')).toBe('neutral');
  expect(getTextDirection('\u06f1\u06f2\u06f3 abc')).toBe('ltr');
});

const domRect = ({
  bottom,
  left = 0,
  right = 100,
  top,
}: {
  bottom: number;
  left?: number;
  right?: number;
  top: number;
}) =>
  ({
    bottom,
    height: bottom - top,
    left,
    right,
    top,
    width: right - left,
    x: left,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

describe('keyboard input strategy', () => {
  it('keeps macOS Control+A available for line-start movement', () => {
    expect(
      isSelectAllHotkey(
        {
          altKey: false,
          ctrlKey: true,
          key: 'a',
          metaKey: false,
          shiftKey: false,
        },
        'apple'
      )
    ).toBe(false);
    expect(
      isSelectAllHotkey(
        {
          altKey: false,
          ctrlKey: false,
          key: 'a',
          metaKey: true,
          shiftKey: false,
        },
        'apple'
      )
    ).toBe(true);
    expect(
      isSelectAllHotkey(
        {
          altKey: false,
          ctrlKey: true,
          key: 'a',
          metaKey: false,
          shiftKey: false,
        },
        'other'
      )
    ).toBe(true);
  });

  it('defers iOS Korean Backspace to native input', () => {
    expect(
      shouldDeferBackspaceToNativeInput({
        isIOS: true,
        language: 'ko-KR',
        nativeEvent: keyEvent('Backspace'),
      })
    ).toBe(true);
  });

  it('keeps non-Korean Backspace model-owned', () => {
    expect(
      shouldDeferBackspaceToNativeInput({
        isIOS: true,
        language: 'en-US',
        nativeEvent: keyEvent('Backspace'),
      })
    ).toBe(false);
  });

  it('keeps non-Backspace keys model-owned for iOS Korean input', () => {
    expect(
      shouldDeferBackspaceToNativeInput({
        isIOS: true,
        language: 'ko-KR',
        nativeEvent: keyEvent('Delete'),
      })
    ).toBe(false);
  });

  it('allows native vertical key fast path only when top-level DOM coverage is complete', () => {
    const editor = createEditor({
      initialValue: [paragraph('one'), paragraph('two'), paragraph('three')],
    }) as any;

    expect(
      isNativeVerticalKeyFastPathFullyMounted({
        domStrategyRuntime: null,
        editor,
      })
    ).toBe(true);
    expect(
      isNativeVerticalKeyFastPathFullyMounted({
        domStrategyRuntime: {
          mountedTopLevelRuntimeIds: new Set(['a', 'b']),
          mountedTopLevelRanges: [{ endIndex: 1, startIndex: 0 }],
        },
        editor,
      })
    ).toBe(false);
    expect(
      isNativeVerticalKeyFastPathFullyMounted({
        domStrategyRuntime: {
          mountedTopLevelRuntimeIds: new Set(['a', 'b', 'c']),
          mountedTopLevelRanges: [
            { endIndex: 0, startIndex: 0 },
            { endIndex: 2, startIndex: 1 },
          ],
        },
        editor,
      })
    ).toBe(true);
  });

  it('model-owns plain vertical shift extension in large DOM-strategy documents', () => {
    const initialValue = Array.from({ length: 1001 }, (_, index) =>
      paragraph(`row-${index}`)
    );
    const editor = createEditor({
      initialSelection: {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      },
      initialValue,
    }) as ReactEditorType;
    const event = reactKeyEvent(keyEvent('ArrowDown', { shiftKey: true }));
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: {
          mountedTopLevelRuntimeIds: new Set(),
          type: 'staged',
        },
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(result.repair).toMatchObject({
        forceRender: false,
        kind: 'sync-selection',
        syncDOMSelection: false,
      });
      expect(event.preventDefault).toHaveBeenCalled();
      expect(editor.read((state) => state.selection.get())).toEqual({
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [1, 0] },
      });
    } finally {
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('model-owns virtualized plain vertical shift through view selection', () => {
    const initialValue = Array.from({ length: 1001 }, (_, index) =>
      paragraph(`row-${index}`)
    );
    const editor = createEditor({
      initialSelection: {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      },
      initialValue,
    }) as ReactEditorType;
    const event = reactKeyEvent(keyEvent('ArrowDown', { shiftKey: true }));
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: {
          mountedTopLevelRanges: [{ endIndex: 6, startIndex: 0 }],
          mountedTopLevelRuntimeIds: new Set([
            '0',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
          ]),
          type: 'virtualized',
        },
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(result.repair).toMatchObject({
        forceRender: false,
        kind: 'sync-selection',
        syncDOMSelection: false,
      });
      expect(event.preventDefault).toHaveBeenCalled();
      expect(editor.read((state) => state.selection.get())).toEqual({
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [1, 0] },
      });
      expect(readSlateViewSelection(editor)).not.toBe(null);
    } finally {
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('leaves plain vertical shift extension native in small DOM-strategy documents', () => {
    const editor = createEditor({
      initialSelection: {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      },
      initialValue: [paragraph('one'), paragraph('two'), paragraph('three')],
    }) as ReactEditorType;
    const event = reactKeyEvent(keyEvent('ArrowDown', { shiftKey: true }));
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: {
          mountedTopLevelRuntimeIds: new Set(),
          type: 'staged',
        },
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(false);
      expect(event.preventDefault).not.toHaveBeenCalled();
    } finally {
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('model-owns rich multi-leaf vertical shift extension in large DOM-strategy documents', () => {
    const initialValue = Array.from({ length: 1001 }, (_, index) =>
      index === 0
        ? {
            type: 'paragraph',
            children: [{ text: 'ro' }, { bold: true, text: 'w-0' }],
          }
        : paragraph(`row-${index}`)
    );
    const editor = createEditor({
      initialSelection: {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      },
      initialValue,
    }) as ReactEditorType;
    const event = reactKeyEvent(keyEvent('ArrowDown', { shiftKey: true }));
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: {
          mountedTopLevelRuntimeIds: new Set(),
          type: 'staged',
        },
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(editor.read((state) => state.selection.get())).not.toEqual({
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      });
    } finally {
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('model-owns wrapped single-leaf vertical shift extension in large DOM-strategy documents', () => {
    const initialValue = Array.from({ length: 1001 }, (_, index) =>
      paragraph(index === 0 ? 'wrapped row 0' : `row-${index}`)
    );
    const editor = createEditor({
      initialSelection: {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      },
      initialValue,
    }) as ReactEditorType;
    const root = document.createElement('div');
    const block = document.createElement('div');
    const textHost = document.createElement('span');
    const text = document.createTextNode('wrapped row 0');
    const event = reactKeyEvent(keyEvent('ArrowDown', { shiftKey: true }));
    const rangeClientRects = Object.getOwnPropertyDescriptor(
      Range.prototype,
      'getClientRects'
    );
    const rangeBoundingRect = Object.getOwnPropertyDescriptor(
      Range.prototype,
      'getBoundingClientRect'
    );
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);
    const resolveDOMPoint = vi.fn(() => [text, 2] as any);
    (editor as any).api = {
      ...(editor as any).api,
      dom: {
        ...(editor as any).api?.dom,
        resolveDOMPoint,
      },
    };

    root.setAttribute('data-slate-editor', 'true');
    block.setAttribute('data-slate-node', 'element');
    block.setAttribute('data-slate-path', '0');
    textHost.setAttribute('data-slate-node', 'text');
    textHost.setAttribute('data-slate-path', '0,0');
    textHost.append(text);
    block.append(textHost);
    root.append(block);
    document.body.append(root);

    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value(this: Range) {
        return this.startContainer.nodeType === Node.TEXT_NODE
          ? [domRect({ bottom: 10, top: 0 })]
          : [domRect({ bottom: 10, top: 0 }), domRect({ bottom: 30, top: 20 })];
      },
    });
    Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
      configurable: true,
      value(this: Range) {
        return this.startContainer.nodeType === Node.TEXT_NODE
          ? domRect({ bottom: 10, top: 0 })
          : domRect({ bottom: 30, top: 0 });
      },
    });

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: {
          mountedTopLevelRuntimeIds: new Set(),
          type: 'staged',
        },
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(editor.read((state) => state.selection.get())).not.toEqual({
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      });
    } finally {
      root.remove();
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();

      if (rangeClientRects) {
        Object.defineProperty(
          Range.prototype,
          'getClientRects',
          rangeClientRects
        );
      } else {
        delete (Range.prototype as Partial<Range>).getClientRects;
      }

      if (rangeBoundingRect) {
        Object.defineProperty(
          Range.prototype,
          'getBoundingClientRect',
          rangeBoundingRect
        );
      } else {
        delete (Range.prototype as Partial<Range>).getBoundingClientRect;
      }
    }
  });

  it('does not route undo hotkeys while read-only', () => {
    const editor = createEditor() as ReactEditorType;
    const undo = vi.fn();
    const forceRender = vi.fn();
    const event = reactKeyEvent({
      ...keyEvent('z'),
      metaKey: true,
    } as KeyboardEvent);

    (editor as any).undo = undo;
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender,
        inputController: {} as any,
        readOnly: true,
        domStrategyRuntime: null,
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(result.repair).toEqual({
        forceRender: true,
        kind: 'force-render',
      });
      expect(event.preventDefault).toHaveBeenCalled();
      expect(undo).not.toHaveBeenCalled();
      expect(forceRender).not.toHaveBeenCalled();
    } finally {
      hasEditableTarget.mockRestore();
    }
  });

  it('prevents printable native key defaults while read-only', () => {
    const editor = createEditor() as ReactEditorType;
    const forceRender = vi.fn();
    const event = reactKeyEvent(keyEvent('a'));
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender,
        inputController: {} as any,
        readOnly: true,
        domStrategyRuntime: null,
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(result.repair).toEqual({
        forceRender: true,
        kind: 'force-render',
      });
      expect(event.preventDefault).toHaveBeenCalled();
      expect(forceRender).not.toHaveBeenCalled();
    } finally {
      hasEditableTarget.mockRestore();
    }
  });

  it('does not apply projected destructive commands while read-only', () => {
    const editor = createEditor({
      initialSelection: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 3 },
      },
      initialValue: [paragraph('test')],
    }) as ReactEditorType;
    const root = document.createElement('div');
    const nested = document.createElement('div');
    const graph = createSlateProjectionGraph([{ path: [0], root: 'main' }]);
    const event = reactKeyEvent(keyEvent('Backspace'));
    const assertDOMNode = vi
      .spyOn(ReactEditor, 'assertDOMNode')
      .mockReturnValue(root);
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(false);

    root.dataset.slateEditor = 'true';
    nested.dataset.slateEditor = 'true';
    root.append(nested);
    document.body.append(root);
    event.target = nested;
    writeSlateViewSelection(
      editor,
      createSlateViewSelection(graph, {
        anchor: { point: { path: [0, 0], offset: 1 } },
        focus: { point: { path: [0, 0], offset: 3 } },
      })
    );

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: true,
        domStrategyRuntime: null,
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(editor.read((state) => state.value.root())).toEqual([
        paragraph('test'),
      ]);
    } finally {
      root.remove();
      assertDOMNode.mockRestore();
      hasEditableTarget.mockRestore();
    }
  });

  it('uses the nested editable selection when promoting a child-root Shift+Arrow move', () => {
    const runtime = createEditorRuntime({
      extensions: [contentRootExtension],
      initialValue: {
        children: [paragraph('p1'), contentCard(), paragraph('p2')],
        roots: { 'card:body': [paragraph('Shared mission statement')] },
      },
    });
    const mainEditor = createEditorView(runtime) as ReactEditorType;
    const bodyEditor = createEditorView(runtime, {
      root: 'card:body',
    }) as ReactEditorType;
    const owner = {
      childRoot: 'card:body',
      ownerPath: [1],
      ownerRoot: 'main',
    };
    const root = document.createElement('div');
    const nested = document.createElement('div');
    const event = reactKeyEvent(keyEvent('ArrowLeft', { shiftKey: true }));
    const assertDOMNode = vi
      .spyOn(ReactEditor, 'assertDOMNode')
      .mockReturnValue(root);
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(false);
    const getMountedViewEditor = vi.fn((root: string) =>
      root === 'card:body' ? bodyEditor : null
    );

    root.dataset.slateEditor = 'true';
    root.dataset.slateRoot = 'main';
    nested.dataset.slateEditor = 'true';
    nested.dataset.slateRoot = 'card:body';
    root.append(nested);
    document.body.append(root);
    event.target = nested;

    mainEditor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 1, root: 'card:body' },
        focus: { path: [0, 0], offset: 1, root: 'card:body' },
      });
    });
    bodyEditor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 0 },
      });
    });

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor: mainEditor,
        event,
        forceRender: vi.fn(),
        getActiveContentRootOwner: (root) =>
          root === 'card:body' ? owner : null,
        getContentRootOwnerViewEditor: (candidate) =>
          candidate.childRoot === 'card:body' ? bodyEditor : null,
        getMountedViewEditor,
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: null,
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(readSlateViewSelection(mainEditor)).toMatchObject({
        anchor: {
          owner,
          point: { path: [0, 0], root: 'card:body', offset: 1 },
        },
        focus: { point: { path: [0, 0], offset: 'p1'.length - 1 } },
        segments: { backward: true },
      });
      expect(event.preventDefault).toHaveBeenCalled();
    } finally {
      root.remove();
      assertDOMNode.mockRestore();
      hasEditableTarget.mockRestore();
    }
  });

  it('uses the nested DOM selection when child-root selection import is stale', () => {
    const runtime = createEditorRuntime({
      extensions: [contentRootExtension],
      initialValue: {
        children: [paragraph('p1'), contentCard(), paragraph('p2')],
        roots: { 'card:body': [paragraph('Shared mission statement')] },
      },
    });
    const mainEditor = createEditorView(runtime) as ReactEditorType;
    const bodyEditor = createEditorView(runtime, {
      root: 'card:body',
    }) as ReactEditorType;
    const owner = {
      childRoot: 'card:body',
      ownerPath: [1],
      ownerRoot: 'main',
    };
    const root = document.createElement('div');
    const nested = document.createElement('div');
    const nativeText = document.createTextNode('Shared mission statement');
    const event = reactKeyEvent(keyEvent('ArrowLeft', { shiftKey: true }));
    const assertDOMNode = vi
      .spyOn(ReactEditor, 'assertDOMNode')
      .mockReturnValue(root);
    const findDocumentOrShadowRoot = vi
      .spyOn(ReactEditor, 'findDocumentOrShadowRoot')
      .mockReturnValue(document);
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(false);
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    const resolveSlateRange = vi
      .spyOn(ReactEditor, 'resolveSlateRange')
      .mockReturnValue({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 0 },
      });
    const getMountedViewEditor = vi.fn((root: string) =>
      root === 'card:body' ? bodyEditor : null
    );

    root.dataset.slateEditor = 'true';
    root.dataset.slateRoot = 'main';
    nested.dataset.slateEditor = 'true';
    nested.dataset.slateRoot = 'card:body';
    nested.append(nativeText);
    root.append(nested);
    document.body.append(root);
    event.target = nativeText;

    mainEditor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 1, root: 'card:body' },
        focus: { path: [0, 0], offset: 1, root: 'card:body' },
      });
    });
    bodyEditor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      });
    });
    document.getSelection()?.setBaseAndExtent(nativeText, 1, nativeText, 0);

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor: mainEditor,
        event,
        forceRender: vi.fn(),
        getActiveContentRootOwner: (root) =>
          root === 'card:body' ? owner : null,
        getContentRootOwnerViewEditor: (candidate) =>
          candidate.childRoot === 'card:body' ? bodyEditor : null,
        getMountedViewEditor,
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: null,
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(readSlateViewSelection(mainEditor)).toMatchObject({
        anchor: {
          owner,
          point: { path: [0, 0], root: 'card:body', offset: 1 },
        },
        focus: { point: { path: [0, 0], offset: 'p1'.length - 1 } },
        segments: { backward: true },
      });
      expect(event.preventDefault).toHaveBeenCalled();
    } finally {
      document.getSelection()?.removeAllRanges();
      root.remove();
      assertDOMNode.mockRestore();
      findDocumentOrShadowRoot.mockRestore();
      hasEditableTarget.mockRestore();
      hasSelectableTarget.mockRestore();
      resolveSlateRange.mockRestore();
    }
  });

  it('applies model-owned keydown commands without a public onCommand hook', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'test' }] }],
    }) as ReactEditorType;
    const event = reactKeyEvent(keyEvent('Enter'));
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);

    const result = applyEditableKeyDown({
      androidInputManagerRef: { current: null },
      editor,
      event,
      forceRender: vi.fn(),
      inputController: {} as any,
      readOnly: false,
      domStrategyRuntime: null,
      setComposing: vi.fn(),
      setExplicitPartialDOMBackedSelection: vi.fn(),
      partialDOMBackedSelection: false,
    });

    expect(result.handled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();

    hasEditableTarget.mockRestore();
    isComposing.mockRestore();
  });

  it('keeps Enter during active composition browser-owned', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'test' }] }],
    }) as ReactEditorType;
    const event = reactKeyEvent({
      ...keyEvent('Enter'),
      isComposing: true,
    } as KeyboardEvent);
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(true);

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: null,
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(editor.read((state) => state.value.root())).toEqual([
        { children: [{ text: 'test' }] },
      ]);
    } finally {
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it("repairs history focus to the preserved selection root when undoing another root's batch", () => {
    const runtime = createEditorRuntime({
      extensions: [history()],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);
    const getMountedViewEditor = vi.fn(() => null);
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);

    headerEditor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 'header'.length },
        focus: { path: [0, 0], offset: 'header'.length },
      });
      tx.text.insert('!');
    });
    mainEditor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 'body'.length },
        focus: { path: [0, 0], offset: 'body'.length },
      });
      tx.text.insert('?');
    });

    try {
      for (let index = 0; index < 2; index++) {
        const event = reactKeyEvent(keyEvent('z', { ctrlKey: true }));

        applyEditableKeyDown({
          androidInputManagerRef: { current: null },
          editor: mainEditor as ReactEditorType,
          event,
          forceRender: vi.fn(),
          getMountedViewEditor,
          inputController: {} as any,
          readOnly: false,
          domStrategyRuntime: null,
          setComposing: vi.fn(),
          setExplicitPartialDOMBackedSelection: vi.fn(),
          partialDOMBackedSelection: false,
        });
      }

      expect(getMountedViewEditor).toHaveBeenLastCalledWith('main');
      expect(mainEditor.read((state) => state.selection.get())).toEqual({
        anchor: { path: [0, 0], offset: 'body'.length },
        focus: { path: [0, 0], offset: 'body'.length },
      });
      expect(headerEditor.read((state) => state.selection.get())).toBe(null);
    } finally {
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('skips caret DOM repair when history restores an expanded view selection', () => {
    const runtime = createEditorRuntime({
      extensions: [history()],
      initialValue: [paragraph('Before'), paragraph('After')],
    });
    const editor = createEditorView(runtime) as ReactEditorType;
    const graph = createSlateProjectionGraph([
      { path: [0], root: 'main' },
      { path: [1], root: 'main' },
    ]);
    const projectedSelection = createSlateViewSelection(graph, {
      anchor: { point: { offset: 0, path: [0, 0] } },
      focus: { point: { offset: 'After'.length, path: [1, 0] } },
    });
    const event = reactKeyEvent(keyEvent('z', { ctrlKey: true }));
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);

    writeSlateViewSelection(editor, projectedSelection);
    expect(
      applyEditableCommand({
        command: { inputType: 'insertText', kind: 'insert-text', text: 'X' },
        editor,
      })
    ).toBe(true);
    expect(readSlateViewSelection(editor)).toBe(null);

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: null,
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(result.repair).toEqual({
        forceRender: true,
        kind: 'force-render',
      });
      expect(readSlateViewSelection(editor)).toEqual(projectedSelection);
    } finally {
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('repairs history focus to the history root when undo leaves no selection', () => {
    const currentEditor = {} as any;
    const historyEditor = {} as any;
    const getMountedViewEditor = vi.fn((root: string) =>
      root === 'header' ? historyEditor : currentEditor
    );

    expect(
      resolveHistoryFocusEditor({
        currentRoot: 'main',
        editor: currentEditor,
        getMountedViewEditor,
        historyRoot: 'header',
        selectionRoot: null,
      })
    ).toBe(historyEditor);
    expect(getMountedViewEditor).toHaveBeenLastCalledWith('header');
  });

  it('runs raw keydown before model fallback', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'test' }] }],
    }) as ReactEditorType;
    const event = reactKeyEvent(keyEvent('Tab'));
    const onKeyDown = vi.fn(() => true);
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);

    const result = applyEditableKeyDown({
      androidInputManagerRef: { current: null },
      editor,
      event,
      forceRender: vi.fn(),
      inputController: {} as any,
      onKeyDown,
      readOnly: false,
      domStrategyRuntime: null,
      setComposing: vi.fn(),
      setExplicitPartialDOMBackedSelection: vi.fn(),
      partialDOMBackedSelection: false,
    });

    expect(result.handled).toBe(true);
    expect(onKeyDown).toHaveBeenCalledWith(event, { editor });
    expect(event.preventDefault).toHaveBeenCalled();

    hasEditableTarget.mockRestore();
    isComposing.mockRestore();
  });

  it('does not swallow printable keys for an unmounted selected root', () => {
    const editor = createEditor({
      initialSelection: {
        anchor: { path: [0, 0], offset: 0, root: 'caption' },
        focus: { path: [0, 0], offset: 0, root: 'caption' },
      },
      initialValue: [{ children: [{ text: 'main' }] }],
    }) as ReactEditorType;
    const event = reactKeyEvent(keyEvent('a'));
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);

    const result = applyEditableKeyDown({
      androidInputManagerRef: { current: null },
      editor,
      event,
      forceRender: vi.fn(),
      getMountedViewEditor: () => null,
      inputController: {} as any,
      readOnly: false,
      domStrategyRuntime: null,
      setComposing: vi.fn(),
      setExplicitPartialDOMBackedSelection: vi.fn(),
      partialDOMBackedSelection: false,
    });

    expect(result.handled).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();

    hasEditableTarget.mockRestore();
    isComposing.mockRestore();
  });

  it('lets mounted virtualized collapsed text use native printable input', () => {
    const editor = createEditor({
      initialSelection: {
        anchor: { path: [2500, 0], offset: 1 },
        focus: { path: [2500, 0], offset: 1 },
      },
      initialValue: Array.from({ length: 2501 }, (_, index) =>
        paragraph(index === 2500 ? 'Condico' : 'filler')
      ),
    }) as ReactEditorType;
    const root = document.createElement('div');
    const textHost = document.createElement('span');
    const text = document.createTextNode('Condico');
    const range = document.createRange();
    const domSelection = document.getSelection();
    const event = reactKeyEvent(keyEvent('X'));
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    const findDocumentOrShadowRoot = vi
      .spyOn(ReactEditor, 'findDocumentOrShadowRoot')
      .mockReturnValue(document);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);

    root.setAttribute('data-slate-editor', 'true');
    textHost.setAttribute('data-slate-node', 'text');
    textHost.setAttribute('data-slate-path', '2500,0');
    textHost.append(text);
    root.append(textHost);
    document.body.append(root);
    event.target = root;
    range.setStart(text, 1);
    range.collapse(true);
    domSelection?.removeAllRanges();
    domSelection?.addRange(range);

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: {
          mountedTopLevelRuntimeIds: new Set(),
          type: 'virtualized',
        },
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: true,
      });

      expect(result.handled).toBe(false);
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(editor.read((state) => state.text.string([2500]))).toBe('Condico');
    } finally {
      root.remove();
      hasEditableTarget.mockRestore();
      hasSelectableTarget.mockRestore();
      findDocumentOrShadowRoot.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('lets pending virtualized native text bursts keep using native printable input while the model offset lags', () => {
    const editor = createEditor({
      initialSelection: {
        anchor: { path: [2500, 0], offset: 1 },
        focus: { path: [2500, 0], offset: 1 },
      },
      initialValue: Array.from({ length: 2501 }, (_, index) =>
        paragraph(index === 2500 ? 'Condico' : 'filler')
      ),
    }) as ReactEditorType;
    const root = document.createElement('div');
    const textHost = document.createElement('span');
    const text = document.createTextNode('CXondico');
    const range = document.createRange();
    const domSelection = document.getSelection();
    const event = reactKeyEvent(keyEvent('X'));
    const inputController = {
      preferModelSelectionForInputRef: { current: false },
      state: {
        pendingNativeTextInputRepairPathKey: '2500,0',
      },
    } as any;
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    const findDocumentOrShadowRoot = vi
      .spyOn(ReactEditor, 'findDocumentOrShadowRoot')
      .mockReturnValue(document);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);

    root.setAttribute('data-slate-editor', 'true');
    textHost.setAttribute('data-slate-node', 'text');
    textHost.setAttribute('data-slate-path', '2500,0');
    textHost.append(text);
    root.append(textHost);
    document.body.append(root);
    event.target = root;
    range.setStart(text, 2);
    range.collapse(true);
    domSelection?.removeAllRanges();
    domSelection?.addRange(range);

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController,
        readOnly: false,
        domStrategyRuntime: {
          mountedTopLevelRuntimeIds: new Set(),
          type: 'virtualized',
        },
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: true,
      });

      expect(result.handled).toBe(false);
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(editor.read((state) => state.text.string([2500]))).toBe('Condico');
    } finally {
      root.remove();
      hasEditableTarget.mockRestore();
      hasSelectableTarget.mockRestore();
      findDocumentOrShadowRoot.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('keeps virtualized printable input model-owned when the DOM caret offset is stale', () => {
    const editor = createEditor({
      initialSelection: {
        anchor: { path: [2500, 0], offset: 2 },
        focus: { path: [2500, 0], offset: 2 },
      },
      initialValue: Array.from({ length: 2501 }, (_, index) =>
        paragraph(index === 2500 ? 'Condico' : 'filler')
      ),
    }) as ReactEditorType;
    const root = document.createElement('div');
    const textHost = document.createElement('span');
    const text = document.createTextNode('Condico');
    const range = document.createRange();
    const domSelection = document.getSelection();
    const event = reactKeyEvent(keyEvent('X'));
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const hasSelectableTarget = vi
      .spyOn(ReactEditor, 'hasSelectableTarget')
      .mockReturnValue(true);
    const findDocumentOrShadowRoot = vi
      .spyOn(ReactEditor, 'findDocumentOrShadowRoot')
      .mockReturnValue(document);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);

    root.setAttribute('data-slate-editor', 'true');
    textHost.setAttribute('data-slate-node', 'text');
    textHost.setAttribute('data-slate-path', '2500,0');
    textHost.append(text);
    root.append(textHost);
    document.body.append(root);
    event.target = root;
    range.setStart(text, 1);
    range.collapse(true);
    domSelection?.removeAllRanges();
    domSelection?.addRange(range);

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: {
          mountedTopLevelRuntimeIds: new Set(),
          type: 'virtualized',
        },
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: true,
      });

      expect(result.handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(editor.read((state) => state.text.string([2500]))).toBe(
        'CoXndico'
      );
    } finally {
      root.remove();
      hasEditableTarget.mockRestore();
      hasSelectableTarget.mockRestore();
      findDocumentOrShadowRoot.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('keeps ArrowRight at a skip-policy hidden range edge', () => {
    const editor = createEditor({
      initialSelection: {
        anchor: { path: [0, 0, 0], offset: 'Overview tab visible text'.length },
        focus: { path: [0, 0, 0], offset: 'Overview tab visible text'.length },
      },
      initialValue: [
        {
          type: 'tabs-block',
          children: [
            {
              type: 'tab-panel',
              children: [{ text: 'Overview tab visible text' }],
            },
            {
              type: 'tab-panel',
              children: [{ text: 'Details tab hidden text' }],
            },
          ],
        },
      ],
    }) as ReactEditorType;
    const event = reactKeyEvent(keyEvent('ArrowRight'));
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);

    DOMCoverage.registerBoundary(editor, {
      anchor: { type: 'placeholder' },
      boundaryId: 'inactive-tab',
      copyPolicy: 'model',
      coveredPathRanges: [{ anchor: [0, 1], focus: [0, 1] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerRuntimeId: null,
      reason: 'app-hidden',
      selectionPolicy: 'skip',
      state: 'intentionally-hidden',
      version: 1,
    });

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: null,
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(editor.read((state) => state.selection.get())).toEqual({
        anchor: {
          offset: 'Overview tab visible text'.length,
          path: [0, 0, 0],
        },
        focus: {
          offset: 'Overview tab visible text'.length,
          path: [0, 0, 0],
        },
      });
    } finally {
      DOMCoverage.clear(editor);
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('skips skip-policy hidden ranges when moving forward from preceding visible text', () => {
    const intro = 'Intro visible before hidden blocks.';
    const editor = createEditor({
      initialSelection: {
        anchor: { path: [0, 0], offset: intro.length },
        focus: { path: [0, 0], offset: intro.length },
      },
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: intro }],
        },
        {
          type: 'accordion-block',
          children: [
            {
              type: 'paragraph',
              children: [{ text: 'Accordion secret alpha' }],
            },
            {
              type: 'paragraph',
              children: [{ text: 'Accordion secret beta' }],
            },
          ],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Next visible paragraph.' }],
        },
      ],
    }) as ReactEditorType;
    const event = reactKeyEvent(keyEvent('ArrowRight'));
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);

    DOMCoverage.registerBoundary(editor, {
      anchor: { type: 'placeholder' },
      boundaryId: 'closed-accordion',
      copyPolicy: 'model',
      coveredPathRanges: [{ anchor: [1, 0], focus: [1, 1] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerRuntimeId: null,
      reason: 'app-hidden',
      selectionPolicy: 'skip',
      state: 'intentionally-hidden',
      version: 1,
    });

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: null,
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(editor.read((state) => state.selection.get())).toEqual({
        anchor: { offset: 0, path: [2, 0] },
        focus: { offset: 0, path: [2, 0] },
      });
    } finally {
      DOMCoverage.clear(editor);
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('extends to the next visible character when extending forward across skip-policy hidden ranges', () => {
    const intro = 'Intro visible before hidden blocks.';
    const editor = createEditor({
      initialSelection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: intro.length },
      },
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: intro }],
        },
        {
          type: 'accordion-block',
          children: [
            {
              type: 'paragraph',
              children: [{ text: 'Accordion secret alpha' }],
            },
          ],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Next visible paragraph.' }],
        },
      ],
    }) as ReactEditorType;
    const event = reactKeyEvent(keyEvent('ArrowRight', { shiftKey: true }));
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);

    DOMCoverage.registerBoundary(editor, {
      anchor: { type: 'placeholder' },
      boundaryId: 'closed-accordion',
      copyPolicy: 'model',
      coveredPathRanges: [{ anchor: [1, 0], focus: [1, 0] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerRuntimeId: null,
      reason: 'app-hidden',
      selectionPolicy: 'skip',
      state: 'intentionally-hidden',
      version: 1,
    });

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: null,
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(editor.read((state) => state.selection.get())).toEqual({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [2, 0] },
      });
    } finally {
      DOMCoverage.clear(editor);
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('keeps word selection extension model-owned across skip-policy hidden ranges', () => {
    const intro = 'Intro visible before hidden blocks.';
    const editor = createEditor({
      initialSelection: {
        anchor: { path: [0, 0], offset: intro.length },
        focus: { path: [0, 0], offset: intro.length },
      },
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: intro }],
        },
        {
          type: 'hidden-block',
          children: [{ text: 'Hidden word.' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Next visible paragraph.' }],
        },
      ],
    }) as ReactEditorType;
    const event = reactKeyEvent(
      keyEvent('ArrowRight', { ctrlKey: true, shiftKey: true })
    );
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);

    DOMCoverage.registerBoundary(editor, {
      anchor: { type: 'placeholder' },
      boundaryId: 'hidden-word',
      copyPolicy: 'model',
      coveredPathRanges: [{ anchor: [1, 0], focus: [1, 0] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerRuntimeId: null,
      reason: 'app-hidden',
      selectionPolicy: 'skip',
      state: 'intentionally-hidden',
      version: 1,
    });

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: null,
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(editor.read((state) => state.selection.get())).toEqual({
        anchor: { offset: intro.length, path: [0, 0] },
        focus: { offset: 'Next'.length, path: [2, 0] },
      });
    } finally {
      DOMCoverage.clear(editor);
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('keeps reverse word selection extension out of already-spanned hidden ranges', () => {
    const intro = 'Intro visible before hidden blocks.';
    const editor = createEditor({
      initialSelection: {
        anchor: { path: [0, 0], offset: intro.length },
        focus: { path: [2, 0], offset: 0 },
      },
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: intro }],
        },
        {
          type: 'hidden-block',
          children: [{ text: 'Hidden word.' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Next visible paragraph.' }],
        },
      ],
    }) as ReactEditorType;
    const event = reactKeyEvent(
      keyEvent('ArrowLeft', { ctrlKey: true, shiftKey: true })
    );
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);

    DOMCoverage.registerBoundary(editor, {
      anchor: { type: 'placeholder' },
      boundaryId: 'hidden-word',
      copyPolicy: 'model',
      coveredPathRanges: [{ anchor: [1, 0], focus: [1, 0] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerRuntimeId: null,
      reason: 'app-hidden',
      selectionPolicy: 'skip',
      state: 'intentionally-hidden',
      version: 1,
    });

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: null,
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(editor.read((state) => state.selection.get())).toEqual({
        anchor: { offset: intro.length, path: [0, 0] },
        focus: { offset: 'Intro visible before hidden '.length, path: [0, 0] },
      });
    } finally {
      DOMCoverage.clear(editor);
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('skips multiple hidden ranges owned by the same boundary', () => {
    const intro = 'Intro visible before hidden blocks.';
    const editor = createEditor({
      initialSelection: {
        anchor: { path: [0, 0], offset: intro.length },
        focus: { path: [0, 0], offset: intro.length },
      },
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: intro }],
        },
        {
          type: 'hidden-block',
          children: [{ text: 'First hidden text.' }],
        },
        {
          type: 'hidden-block',
          children: [{ text: 'Second hidden text.' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Next visible paragraph.' }],
        },
      ],
    }) as ReactEditorType;
    const event = reactKeyEvent(keyEvent('ArrowRight'));
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);

    DOMCoverage.registerBoundary(editor, {
      anchor: { type: 'placeholder' },
      boundaryId: 'same-owner-hidden-ranges',
      copyPolicy: 'model',
      coveredPathRanges: [
        { anchor: [1, 0], focus: [1, 0] },
        { anchor: [2, 0], focus: [2, 0] },
      ],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerRuntimeId: null,
      reason: 'app-hidden',
      selectionPolicy: 'skip',
      state: 'intentionally-hidden',
      version: 1,
    });

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: null,
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(editor.read((state) => state.selection.get())).toEqual({
        anchor: { offset: 0, path: [3, 0] },
        focus: { offset: 0, path: [3, 0] },
      });
    } finally {
      DOMCoverage.clear(editor);
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('collapses plain line movement when skipping skip-policy hidden ranges', () => {
    const intro = 'Intro visible before hidden blocks.';
    const editor = createEditor({
      initialSelection: {
        anchor: { path: [0, 0], offset: intro.length },
        focus: { path: [0, 0], offset: intro.length },
      },
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: intro }],
        },
        {
          type: 'hidden-block',
          children: [{ text: 'Hidden line.' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Next visible paragraph.' }],
        },
      ],
    }) as ReactEditorType;
    const event = reactKeyEvent(keyEvent('LineForward'));
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);
    const isMoveLineForward = vi
      .spyOn(Hotkeys, 'isMoveLineForward')
      .mockReturnValue(true);

    DOMCoverage.registerBoundary(editor, {
      anchor: { type: 'placeholder' },
      boundaryId: 'hidden-line',
      copyPolicy: 'model',
      coveredPathRanges: [{ anchor: [1, 0], focus: [1, 0] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerRuntimeId: null,
      reason: 'app-hidden',
      selectionPolicy: 'skip',
      state: 'intentionally-hidden',
      version: 1,
    });

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: null,
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(editor.read((state) => state.selection.get())).toEqual({
        anchor: { offset: 0, path: [2, 0] },
        focus: { offset: 0, path: [2, 0] },
      });
    } finally {
      DOMCoverage.clear(editor);
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
      isMoveLineForward.mockRestore();
    }
  });

  it('model-owns plain vertical shift extension into materialize hidden ranges', () => {
    const intro = 'Intro visible before hidden blocks.';
    const editor = createEditor({
      initialSelection: {
        anchor: { path: [0, 0], offset: intro.length },
        focus: { path: [0, 0], offset: intro.length },
      },
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: intro }],
        },
        {
          type: 'hidden-block',
          children: [{ text: 'Hidden line.' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Next visible paragraph.' }],
        },
      ],
    }) as ReactEditorType;
    const event = reactKeyEvent(keyEvent('ArrowDown', { shiftKey: true }));
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);

    DOMCoverage.registerBoundary(editor, {
      anchor: { type: 'placeholder' },
      boundaryId: 'hidden-line',
      copyPolicy: 'model',
      coveredPathRanges: [{ anchor: [1, 0], focus: [1, 0] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerRuntimeId: null,
      reason: 'app-hidden',
      selectionPolicy: 'materialize',
      state: 'intentionally-hidden',
      version: 1,
    });

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: null,
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(editor.read((state) => state.selection.get())).toEqual({
        anchor: { offset: intro.length, path: [0, 0] },
        focus: { offset: 0, path: [1, 0] },
      });
    } finally {
      DOMCoverage.clear(editor);
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('model-owns plain vertical shift extension from mid-line visible text into materialize hidden ranges', () => {
    const intro = 'Intro visible before hidden blocks.';
    const startOffset = 'Intro visible before '.length;
    const editor = createEditor({
      initialSelection: {
        anchor: { path: [0, 0], offset: startOffset },
        focus: { path: [0, 0], offset: startOffset },
      },
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: intro }],
        },
        {
          type: 'hidden-block',
          children: [{ text: 'Hidden line.' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Next visible paragraph.' }],
        },
      ],
    }) as ReactEditorType;
    const event = reactKeyEvent(keyEvent('ArrowDown', { shiftKey: true }));
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);

    DOMCoverage.registerBoundary(editor, {
      anchor: { type: 'placeholder' },
      boundaryId: 'hidden-line',
      copyPolicy: 'model',
      coveredPathRanges: [{ anchor: [1, 0], focus: [1, 0] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerRuntimeId: null,
      reason: 'app-hidden',
      selectionPolicy: 'materialize',
      state: 'intentionally-hidden',
      version: 1,
    });

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: null,
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(editor.read((state) => state.selection.get())).toEqual({
        anchor: { offset: startOffset, path: [0, 0] },
        focus: { offset: 0, path: [1, 0] },
      });
    } finally {
      DOMCoverage.clear(editor);
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('model-owns plain vertical shift extension from split visible text into materialize hidden ranges', () => {
    const introStart = 'Intro visible before ';
    const introEnd = 'hidden blocks.';
    const editor = createEditor({
      initialSelection: {
        anchor: { path: [0, 0], offset: introStart.length },
        focus: { path: [0, 0], offset: introStart.length },
      },
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: introStart }, { bold: true, text: introEnd }],
        },
        {
          type: 'hidden-block',
          children: [{ text: 'Hidden line.' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Next visible paragraph.' }],
        },
      ],
    }) as ReactEditorType;
    const event = reactKeyEvent(keyEvent('ArrowDown', { shiftKey: true }));
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);

    DOMCoverage.registerBoundary(editor, {
      anchor: { type: 'placeholder' },
      boundaryId: 'hidden-line',
      copyPolicy: 'model',
      coveredPathRanges: [{ anchor: [1, 0], focus: [1, 0] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerRuntimeId: null,
      reason: 'app-hidden',
      selectionPolicy: 'materialize',
      state: 'intentionally-hidden',
      version: 1,
    });

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: null,
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(editor.read((state) => state.selection.get())).toEqual({
        anchor: { offset: introStart.length, path: [0, 0] },
        focus: { offset: 0, path: [1, 0] },
      });
    } finally {
      DOMCoverage.clear(editor);
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('leaves plain vertical shift extension native after materialized ranges are selected', () => {
    const intro = 'Intro visible before hidden blocks.';
    const editor = createEditor({
      initialSelection: {
        anchor: { path: [0, 0], offset: intro.length },
        focus: { path: [1, 0], offset: 0 },
      },
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: intro }],
        },
        {
          type: 'hidden-block',
          children: [{ text: 'Hidden line.' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Next visible paragraph.' }],
        },
      ],
    }) as ReactEditorType;
    const event = reactKeyEvent(keyEvent('ArrowDown', { shiftKey: true }));
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(false);

    DOMCoverage.registerBoundary(editor, {
      anchor: { type: 'placeholder' },
      boundaryId: 'hidden-line',
      copyPolicy: 'model',
      coveredPathRanges: [{ anchor: [1, 0], focus: [1, 0] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerRuntimeId: null,
      reason: 'app-hidden',
      selectionPolicy: 'materialize',
      state: 'mounted',
      version: 1,
    });

    try {
      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: null,
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(false);
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(editor.read((state) => state.selection.get())).toEqual({
        anchor: { offset: intro.length, path: [0, 0] },
        focus: { offset: 0, path: [1, 0] },
      });
    } finally {
      DOMCoverage.clear(editor);
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('routes printable expanded-selection fallback input through the model without beforeinput support', async () => {
    vi.resetModules();

    const applyEditableCommand = vi.fn(() => true);

    vi.doMock('@platejs/slate-dom', async (importOriginal) => {
      const actual =
        await importOriginal<typeof import('@platejs/slate-dom')>();

      return {
        ...actual,
        HAS_BEFORE_INPUT_SUPPORT: false,
      };
    });
    vi.doMock('../src/editable/mutation-controller', async (importOriginal) => {
      const actual =
        await importOriginal<
          typeof import('../src/editable/mutation-controller')
        >();

      return {
        ...actual,
        applyEditableCommand,
      };
    });

    try {
      const [{ createEditor }, { ReactEditor }, { applyEditableKeyDown }] =
        await Promise.all([
          import('@platejs/slate'),
          import('../src/plugin/react-editor'),
          import('../src/editable/keyboard-input-strategy'),
        ]);
      const editor = createEditor({
        initialSelection: {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [1, 0], offset: 2 },
        },
        initialValue: [paragraph('one'), paragraph('two')],
      }) as ReactEditorType;
      const event = reactKeyEvent(keyEvent('a'));
      const hasEditableTarget = vi
        .spyOn(ReactEditor, 'hasEditableTarget')
        .mockReturnValue(true);
      const isComposing = vi
        .spyOn(ReactEditor, 'isComposing')
        .mockReturnValue(false);

      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: null,
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(applyEditableCommand).toHaveBeenCalledWith({
        command: { inputType: 'insertText', kind: 'insert-text', text: 'a' },
        editor,
      });

      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    } finally {
      vi.doUnmock('@platejs/slate-dom');
      vi.doUnmock('../src/editable/mutation-controller');
      vi.resetModules();
    }
  });

  it('routes printable expanded inline-void replacement through the model with beforeinput support', async () => {
    vi.resetModules();

    const applyEditableCommand = vi.fn(() => true);

    vi.doMock('@platejs/slate-dom', async (importOriginal) => {
      const actual =
        await importOriginal<typeof import('@platejs/slate-dom')>();

      return {
        ...actual,
        HAS_BEFORE_INPUT_SUPPORT: true,
      };
    });
    vi.doMock('../src/editable/mutation-controller', async (importOriginal) => {
      const actual =
        await importOriginal<
          typeof import('../src/editable/mutation-controller')
        >();

      return {
        ...actual,
        applyEditableCommand,
      };
    });

    try {
      const [
        { createEditor, defineEditorExtension },
        { ReactEditor },
        { applyEditableKeyDown },
      ] = await Promise.all([
        import('@platejs/slate'),
        import('../src/plugin/react-editor'),
        import('../src/editable/keyboard-input-strategy'),
      ]);
      const editor = createEditor({
        extensions: [
          defineEditorExtension({
            elements: [{ type: 'mention', void: 'markable-inline' }],
            name: 'keyboard-input-strategy-inline-void-test',
          }),
        ],
        initialSelection: {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 2], offset: 1 },
        },
        initialValue: [
          {
            type: 'paragraph',
            children: [
              { text: 'a' },
              { character: 'R2-D2', type: 'mention', children: [{ text: '' }] },
              { text: 'b' },
            ],
          },
        ],
      }) as ReactEditorType;
      const event = reactKeyEvent(keyEvent('Z'));
      const hasEditableTarget = vi
        .spyOn(ReactEditor, 'hasEditableTarget')
        .mockReturnValue(true);
      const isComposing = vi
        .spyOn(ReactEditor, 'isComposing')
        .mockReturnValue(false);

      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: null,
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(applyEditableCommand).toHaveBeenCalledWith({
        command: { inputType: 'insertText', kind: 'insert-text', text: 'Z' },
        editor,
      });

      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    } finally {
      vi.doUnmock('@platejs/slate-dom');
      vi.doUnmock('../src/editable/mutation-controller');
      vi.resetModules();
    }
  });

  it('keeps DeleteForward direction in the Chrome/WebKit void-node fallback', async () => {
    vi.resetModules();

    const applyEditableCommand = vi.fn(() => true);

    vi.doMock('@platejs/slate-dom', async (importOriginal) => {
      const actual =
        await importOriginal<typeof import('@platejs/slate-dom')>();

      return {
        ...actual,
        HAS_BEFORE_INPUT_SUPPORT: true,
        IS_CHROME: true,
        IS_WEBKIT: false,
      };
    });
    vi.doMock('../src/editable/editing-kernel', async (importOriginal) => {
      const actual =
        await importOriginal<typeof import('../src/editable/editing-kernel')>();

      return {
        ...actual,
        getEditableCommandFromKeyDown: vi.fn(() => null),
      };
    });
    vi.doMock('../src/editable/mutation-controller', async (importOriginal) => {
      const actual =
        await importOriginal<
          typeof import('../src/editable/mutation-controller')
        >();

      return {
        ...actual,
        applyEditableCommand,
      };
    });

    try {
      const [
        { createEditor, defineEditorExtension },
        { ReactEditor },
        { applyEditableKeyDown },
      ] = await Promise.all([
        import('@platejs/slate'),
        import('../src/plugin/react-editor'),
        import('../src/editable/keyboard-input-strategy'),
      ]);
      const editor = createEditor({
        extensions: [
          defineEditorExtension({
            elements: [{ type: 'image', void: 'block' }],
            name: 'keyboard-input-strategy-void-test',
          }),
        ],
        initialSelection: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
        initialValue: [{ type: 'image', children: [{ text: '' }] }],
      }) as ReactEditorType;
      const event = reactKeyEvent(keyEvent('Delete'));
      const hasEditableTarget = vi
        .spyOn(ReactEditor, 'hasEditableTarget')
        .mockReturnValue(true);
      const isComposing = vi
        .spyOn(ReactEditor, 'isComposing')
        .mockReturnValue(false);

      const result = applyEditableKeyDown({
        androidInputManagerRef: { current: null },
        editor,
        event,
        forceRender: vi.fn(),
        inputController: {} as any,
        readOnly: false,
        domStrategyRuntime: null,
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(applyEditableCommand).toHaveBeenCalledWith({
        command: { direction: 'forward', kind: 'delete', unit: 'block' },
        editor,
      });

      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    } finally {
      vi.doUnmock('@platejs/slate-dom');
      vi.doUnmock('../src/editable/editing-kernel');
      vi.doUnmock('../src/editable/mutation-controller');
      vi.resetModules();
    }
  });
});
