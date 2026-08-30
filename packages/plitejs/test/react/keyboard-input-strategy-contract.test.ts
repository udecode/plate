import {
  createEditor,
  createEditorView,
  type Descendant,
  defineEditorSchema,
  schema,
} from 'plitejs';
import { Hotkeys } from 'plitejs/dom';
import { history } from 'plitejs/history';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DOMCoverage } from '../../src/dom/internal';
import { isSelectAllHotkey } from '../../src/react/dom-strategy/dom-strategy-commands';
import { getTextDirection } from '../../src/react/editable/caret-engine';
import { EditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';
import {
  getModelOwnedHistoryFocusRepair,
  resolveHistoryFocusEditor,
} from '../../src/react/editable/history-focus';
import {
  applyEditableKeyDown as applyRuntimeEditableKeyDown,
  shouldDeferBackspaceToNativeInput,
} from '../../src/react/editable/keyboard-input-strategy';
import {
  applyEditableCommand,
  applyModelOwnedNativeHistoryEvent,
} from '../../src/react/editable/mutation-controller';
import { isNativeVerticalKeyFastPathFullyMounted } from '../../src/react/editable/runtime-keyboard-events';
import { unregisterContentRootOwnerViewEditor } from '../../src/react/hooks/use-plite-runtime';
import { ReactEditor } from '../../src/react/plugin/react-editor';
import { createPliteProjectionGraph } from '../../src/react/projection-graph';
import {
  createPliteViewSelection,
  readPliteViewSelection,
  writePliteViewSelection,
} from '../../src/react/view-selection';

type ApplyEditableKeyDownOptions = Parameters<
  typeof applyRuntimeEditableKeyDown
>[0];
const testRuntimes = new Set<EditableDOMRuntime>();
const applyEditableKeyDown = (
  options: Omit<ApplyEditableKeyDownOptions, 'domPhaseScheduler'> &
    Partial<Pick<ApplyEditableKeyDownOptions, 'domPhaseScheduler'>>
) => {
  const runtime = new EditableDOMRuntime({ editor: options.editor });

  testRuntimes.add(runtime);

  return applyRuntimeEditableKeyDown({
    ...options,
    domPhaseScheduler: options.domPhaseScheduler ?? runtime.domPhaseScheduler,
  });
};

afterEach(() => {
  for (const runtime of testRuntimes) runtime.destroy();
  testRuntimes.clear();
});

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

const createRealmKeyEvent = ({
  beforeInput,
  key,
}: {
  beforeInput: boolean;
  key: string;
}) => {
  const frame = document.createElement('iframe');

  document.body.append(frame);
  const frameDocument = frame.contentDocument!;
  const frameWindow = frame.contentWindow!;
  const target = frameDocument.createElement('div');

  Object.defineProperty(frameWindow.navigator, 'userAgent', {
    configurable: true,
    value:
      'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36',
  });
  Object.defineProperty(frameWindow, 'InputEvent', {
    configurable: true,
    value: beforeInput
      ? class InputEvent {
          getTargetRanges() {
            return [];
          }
        }
      : class InputEvent {},
  });
  frameDocument.body.append(target);
  const nativeEvent = new frameWindow.KeyboardEvent('keydown', {
    bubbles: true,
    key,
  });

  target.dispatchEvent(nativeEvent);

  return {
    event: reactKeyEvent(nativeEvent),
    remove: () => frame.remove(),
  };
};

const paragraph = (text: string) =>
  ({
    type: 'paragraph',
    children: [{ text }],
  }) satisfies Descendant;

const contentRootExtension = defineEditorSchema(
  'schema:keyboard-content-root-test',
  {
    elements: {
      paragraph: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
      'content-card': {
        content: schema.content.open(),
        contentRoots: {
          body: schema.content.not(schema.content.text()),
        },
        void: 'editable-island',
      },
    },
    id: 'keyboard-content-root-test',
    root: schema.content.not(schema.content.text()),
    unknown: 'preserve',
    version: 1,
  }
);

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
  expect(getTextDirection('abc \u05D0')).toBe('ltr');
  expect(getTextDirection('123 \u05D0')).toBe('rtl');
  expect(getTextDirection('123 456')).toBe('neutral');
  expect(getTextDirection('\u0661\u0662\u0663')).toBe('neutral');
  expect(getTextDirection('\u06F1\u06F2\u06F3 abc')).toBe('ltr');
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

  it('does not read a process-global navigator for an unowned event', () => {
    vi.stubGlobal('navigator', {
      platform: 'MacIntel',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    });

    try {
      expect(
        isSelectAllHotkey({
          altKey: false,
          ctrlKey: false,
          key: 'a',
          metaKey: true,
          shiftKey: false,
        })
      ).toBe(false);
      expect(
        isSelectAllHotkey({
          altKey: false,
          ctrlKey: true,
          key: 'a',
          metaKey: false,
          shiftKey: false,
        })
      ).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
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
          mountedTopLevelNodeKeys: new Set(['a', 'b']),
          mountedTopLevelRanges: [{ endIndex: 1, startIndex: 0 }],
        },
        editor,
      })
    ).toBe(false);
    expect(
      isNativeVerticalKeyFastPathFullyMounted({
        domStrategyRuntime: {
          mountedTopLevelNodeKeys: new Set(['a', 'b', 'c']),
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
        kind: 'text',
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
          mountedTopLevelNodeKeys: new Set(),
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
      expect(editor.read((state) => state.selection())).toEqual({
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
        kind: 'text',
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
          mountedTopLevelNodeKeys: new Set(['0', '1', '2', '3', '4', '5', '6']),
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
      expect(editor.read((state) => state.selection())).toEqual({
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [1, 0] },
      });
      expect(readPliteViewSelection(editor)).not.toBe(null);
    } finally {
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('leaves plain vertical shift extension native in small DOM-strategy documents', () => {
    const editor = createEditor({
      initialSelection: {
        kind: 'text',
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
          mountedTopLevelNodeKeys: new Set(),
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
        kind: 'text',
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
          mountedTopLevelNodeKeys: new Set(),
          type: 'staged',
        },
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(editor.read((state) => state.selection())).not.toEqual({
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
        kind: 'text',
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

    root.setAttribute('data-plite-editor', 'true');
    block.setAttribute('data-plite-node', 'element');
    block.setAttribute('data-plite-path', '0');
    textHost.setAttribute('data-plite-node', 'text');
    textHost.setAttribute('data-plite-path', '0,0');
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
          mountedTopLevelNodeKeys: new Set(),
          type: 'staged',
        },
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(editor.read((state) => state.selection())).not.toEqual({
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
    });

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
        kind: 'text',
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 3 },
      },
      initialValue: [paragraph('test')],
    }) as ReactEditorType;
    const root = document.createElement('div');
    const nested = document.createElement('div');
    const graph = createPliteProjectionGraph([{ path: [0], root: 'main' }]);
    const event = reactKeyEvent(keyEvent('Backspace'));
    const assertDOMNode = vi
      .spyOn(ReactEditor, 'assertDOMNode')
      .mockReturnValue(root);
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(false);

    root.dataset.pliteEditor = 'true';
    nested.dataset.pliteEditor = 'true';
    root.append(nested);
    document.body.append(root);
    event.target = nested;
    writePliteViewSelection(
      editor,
      createPliteViewSelection(graph, {
        kind: 'text',
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
      expect(editor.read((state) => state.children())).toEqual([
        paragraph('test'),
      ]);
    } finally {
      root.remove();
      assertDOMNode.mockRestore();
      hasEditableTarget.mockRestore();
    }
  });

  it('uses the nested editable selection when promoting a child-root Shift+Arrow move', () => {
    const runtime = createEditor({
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
    const getMountedViewEditor = vi.fn((innerRoot: string) =>
      innerRoot === 'card:body' ? bodyEditor : null
    );

    root.dataset.pliteEditor = 'true';
    root.dataset.pliteRoot = 'main';
    nested.dataset.pliteEditor = 'true';
    nested.dataset.pliteRoot = 'card:body';
    root.append(nested);
    document.body.append(root);
    event.target = nested;

    mainEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 1, root: 'card:body' },
        focus: { path: [0, 0], offset: 1, root: 'card:body' },
      });
    });
    bodyEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
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
        getActiveContentRootOwner: (innerRoot2) =>
          innerRoot2 === 'card:body' ? owner : null,
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
      expect(readPliteViewSelection(mainEditor)).toMatchObject({
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
    const runtime = createEditor({
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
    const resolvePliteRange = vi
      .spyOn(ReactEditor, 'resolvePliteRange')
      .mockReturnValue({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 0 },
      });
    const getMountedViewEditor = vi.fn((innerRoot3: string) =>
      innerRoot3 === 'card:body' ? bodyEditor : null
    );

    root.dataset.pliteEditor = 'true';
    root.dataset.pliteRoot = 'main';
    nested.dataset.pliteEditor = 'true';
    nested.dataset.pliteRoot = 'card:body';
    nested.append(nativeText);
    root.append(nested);
    document.body.append(root);
    event.target = nativeText;

    mainEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 1, root: 'card:body' },
        focus: { path: [0, 0], offset: 1, root: 'card:body' },
      });
    });
    bodyEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
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
        getActiveContentRootOwner: (innerRoot4) =>
          innerRoot4 === 'card:body' ? owner : null,
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
      expect(readPliteViewSelection(mainEditor)).toMatchObject({
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
      resolvePliteRange.mockRestore();
    }
  });

  it('applies model-owned keydown commands without a public onCommand hook', () => {
    const editor = createEditor({
      initialValue: [paragraph('test')],
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

  it('lets the public keydown handler override model-owned history', () => {
    const editor = createEditor({
      extensions: [history()],
      initialSelection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      },
      initialValue: [paragraph('test')],
    }) as ReactEditorType;

    editor.update.text.insert('!');

    const event = reactKeyEvent(keyEvent('z', { metaKey: true }));
    const onKeyDown: NonNullable<ApplyEditableKeyDownOptions['onKeyDown']> =
      vi.fn((keyboardEvent) => {
        keyboardEvent.preventDefault();

        return true;
      });
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
        onKeyDown,
        readOnly: false,
        domStrategyRuntime: null,
        setComposing: vi.fn(),
        setExplicitPartialDOMBackedSelection: vi.fn(),
        partialDOMBackedSelection: false,
      });

      expect(result.handled).toBe(true);
      expect(onKeyDown).toHaveBeenCalledOnce();
      expect(editor.read.text.string([])).toBe('test!');
    } finally {
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('keeps Enter during active composition browser-owned', () => {
    const editor = createEditor({
      initialValue: [paragraph('test')],
    }) as ReactEditorType;
    const event = reactKeyEvent({
      ...keyEvent('Enter'),
      isComposing: true,
    });
    const hasEditableTarget = vi
      .spyOn(ReactEditor, 'hasEditableTarget')
      .mockReturnValue(true);
    const isComposing = vi
      .spyOn(ReactEditor, 'isComposing')
      .mockReturnValue(true);
    const onKeyDown = vi.fn(() => true);

    try {
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
      expect(onKeyDown).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(editor.read((state) => state.children())).toEqual([
        paragraph('test'),
      ]);
    } finally {
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it("repairs history focus to the preserved selection root when undoing another root's batch", () => {
    const runtime = createEditor({
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
        kind: 'text',
        anchor: { path: [0, 0], offset: 'header'.length },
        focus: { path: [0, 0], offset: 'header'.length },
      });
      tx.text.insert('!');
    });
    mainEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 'body'.length },
        focus: { path: [0, 0], offset: 'body'.length },
      });
      tx.text.insert('?');
    });

    try {
      const results = [];

      for (let index = 0; index < 2; index++) {
        const event = reactKeyEvent(keyEvent('z', { ctrlKey: true }));

        results.push(
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
          })
        );
      }

      expect(
        results.map((result) =>
          result.repair && 'forceRender' in result.repair
            ? result.repair.forceRender
            : undefined
        )
      ).toEqual([true, true]);
      expect(getMountedViewEditor).toHaveBeenLastCalledWith('main');
      expect(mainEditor.read((state) => state.selection())).toEqual({
        anchor: { path: [0, 0], offset: 'body'.length },
        focus: { path: [0, 0], offset: 'body'.length },
      });
      expect(headerEditor.read((state) => state.selection())).toBe(null);
    } finally {
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    }
  });

  it('skips caret DOM repair when history restores an expanded view selection', () => {
    const runtime = createEditor({
      extensions: [history()],
      initialValue: [paragraph('Before'), paragraph('After')],
    });
    const editor = createEditorView(runtime) as ReactEditorType;
    const graph = createPliteProjectionGraph([
      { path: [0], root: 'main' },
      { path: [1], root: 'main' },
    ]);
    const projectedSelection = createPliteViewSelection(graph, {
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

    writePliteViewSelection(editor, projectedSelection);
    expect(
      applyEditableCommand({
        command: { inputType: 'insertText', kind: 'insert-text', text: 'X' },
        editor,
      })
    ).toBe(true);
    expect(readPliteViewSelection(editor)).toBe(null);

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
      expect(readPliteViewSelection(editor)).toEqual(projectedSelection);
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

  it('repairs history focus through the active content owner while the root registry transitions', () => {
    const currentEditor = {} as any;
    const ownerEditor = {} as any;
    const owner = {
      childRoot: 'shared',
      ownerPath: [1],
      ownerRoot: 'main',
    };

    expect(
      resolveHistoryFocusEditor({
        currentRoot: 'shared',
        editor: currentEditor,
        getActiveContentRootOwner: (root) => (root === 'shared' ? owner : null),
        getContentRootOwnerViewEditor: (candidate) =>
          candidate === owner ? ownerEditor : null,
        getMountedViewEditor: () => null,
        historyRoot: 'main',
        selectionRoot: 'shared',
      })
    ).toBe(ownerEditor);
  });

  it('shares resolved focus ownership with native history beforeinput', () => {
    const runtime = createEditor({
      extensions: [history()],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);
    const owner = {
      childRoot: 'header',
      ownerPath: [0],
      ownerRoot: 'main',
    };

    headerEditor.update((tx) => {
      tx.selection.set({ path: [0, 0], offset: 'header'.length });
      tx.text.insert('!');
    });
    mainEditor.update((tx) => {
      tx.selection.set({ path: [0, 0], offset: 'body'.length });
      tx.text.insert('?');
    });

    expect(
      applyModelOwnedNativeHistoryEvent({
        editor: headerEditor as ReactEditorType,
        event: { inputType: 'historyUndo' } as InputEvent,
      })
    ).toBe(true);

    expect(
      getModelOwnedHistoryFocusRepair({
        editor: headerEditor as ReactEditorType,
        getActiveContentRootOwner: (root) => (root === 'header' ? owner : null),
        getContentRootOwnerViewEditor: () => mainEditor as ReactEditorType,
        getMountedViewEditor: () => null,
      })
    ).toEqual({
      focusEditor: mainEditor,
      repair: { forceRender: true, kind: 'force-render' },
    });
  });

  it('does not let stale owner cleanup delete a newer view editor', () => {
    const owner = {
      childRoot: 'shared',
      ownerPath: [1],
      ownerRoot: 'main',
    };
    const staleEditor = {};
    const newerEditor = {};
    const ownerViewEditors = new Map([
      ['main\u00001\u0000shared', newerEditor],
    ]);

    expect(
      unregisterContentRootOwnerViewEditor(ownerViewEditors, owner, staleEditor)
    ).toBe(false);
    expect([...ownerViewEditors.values()]).toEqual([newerEditor]);
    expect(
      unregisterContentRootOwnerViewEditor(ownerViewEditors, owner, newerEditor)
    ).toBe(true);
    expect(ownerViewEditors.size).toBe(0);
  });

  it('runs raw keydown before model fallback', () => {
    const editor = createEditor({
      initialValue: [paragraph('test')],
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
        kind: 'text',
        anchor: { path: [0, 0], offset: 0, root: 'caption' },
        focus: { path: [0, 0], offset: 0, root: 'caption' },
      },
      initialValue: {
        children: [paragraph('main')],
        roots: {
          caption: [paragraph('caption')],
        },
      },
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
        kind: 'text',
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

    root.setAttribute('data-plite-editor', 'true');
    textHost.setAttribute('data-plite-node', 'text');
    textHost.setAttribute('data-plite-path', '2500,0');
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
          mountedTopLevelNodeKeys: new Set(),
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
        kind: 'text',
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

    root.setAttribute('data-plite-editor', 'true');
    textHost.setAttribute('data-plite-node', 'text');
    textHost.setAttribute('data-plite-path', '2500,0');
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
          mountedTopLevelNodeKeys: new Set(),
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
        kind: 'text',
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

    root.setAttribute('data-plite-editor', 'true');
    textHost.setAttribute('data-plite-node', 'text');
    textHost.setAttribute('data-plite-path', '2500,0');
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
          mountedTopLevelNodeKeys: new Set(),
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
        kind: 'text',
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
      coveredPathRanges: [{ kind: 'text', anchor: [0, 1], focus: [0, 1] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerNodeKey: null,
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
      expect(editor.read((state) => state.selection())).toEqual({
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
        kind: 'text',
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
      coveredPathRanges: [{ kind: 'text', anchor: [1, 0], focus: [1, 1] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerNodeKey: null,
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
      expect(editor.read((state) => state.selection())).toEqual({
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
        kind: 'text',
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
      coveredPathRanges: [{ kind: 'text', anchor: [1, 0], focus: [1, 0] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerNodeKey: null,
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
      expect(editor.read((state) => state.selection())).toEqual({
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
        kind: 'text',
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
      coveredPathRanges: [{ kind: 'text', anchor: [1, 0], focus: [1, 0] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerNodeKey: null,
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
      expect(editor.read((state) => state.selection())).toEqual({
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
        kind: 'text',
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
      coveredPathRanges: [{ kind: 'text', anchor: [1, 0], focus: [1, 0] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerNodeKey: null,
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
      expect(editor.read((state) => state.selection())).toEqual({
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
        kind: 'text',
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
        { kind: 'text', anchor: [1, 0], focus: [1, 0] },
        { kind: 'text', anchor: [2, 0], focus: [2, 0] },
      ],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerNodeKey: null,
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
      expect(editor.read((state) => state.selection())).toEqual({
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
        kind: 'text',
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
      coveredPathRanges: [{ kind: 'text', anchor: [1, 0], focus: [1, 0] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerNodeKey: null,
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
      expect(editor.read((state) => state.selection())).toEqual({
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
        kind: 'text',
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
      coveredPathRanges: [{ kind: 'text', anchor: [1, 0], focus: [1, 0] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerNodeKey: null,
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
      expect(editor.read((state) => state.selection())).toEqual({
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
        kind: 'text',
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
      coveredPathRanges: [{ kind: 'text', anchor: [1, 0], focus: [1, 0] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerNodeKey: null,
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
      expect(editor.read((state) => state.selection())).toEqual({
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
        kind: 'text',
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
      coveredPathRanges: [{ kind: 'text', anchor: [1, 0], focus: [1, 0] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerNodeKey: null,
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
      expect(editor.read((state) => state.selection())).toEqual({
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
        kind: 'text',
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
      coveredPathRanges: [{ kind: 'text', anchor: [1, 0], focus: [1, 0] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerNodeKey: null,
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
      expect(editor.read((state) => state.selection())).toEqual({
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

    const innerApplyEditableCommand = vi.fn(() => true);

    vi.doMock(
      '../../src/react/editable/mutation-controller',
      async (importOriginal) => {
        const actual =
          await importOriginal<
            typeof import('../../src/react/editable/mutation-controller')
          >();

        return {
          ...actual,
          applyEditableCommand: innerApplyEditableCommand,
        };
      }
    );

    try {
      const [
        { createEditor: innerCreateEditor },
        { ReactEditor: innerReactEditor },
        { applyEditableKeyDown: innerApplyEditableKeyDown },
      ] = await Promise.all([
        import('plitejs'),
        import('../../src/react/plugin/react-editor'),
        import('../../src/react/editable/keyboard-input-strategy'),
      ]);
      const editor = innerCreateEditor({
        initialSelection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [1, 0], offset: 2 },
        },
        initialValue: [paragraph('one'), paragraph('two')],
      }) as ReactEditorType;
      const realmEvent = createRealmKeyEvent({
        beforeInput: false,
        key: 'a',
      });
      const { event } = realmEvent;
      const hasEditableTarget = vi
        .spyOn(innerReactEditor, 'hasEditableTarget')
        .mockReturnValue(true);
      const isComposing = vi
        .spyOn(innerReactEditor, 'isComposing')
        .mockReturnValue(false);

      const result = innerApplyEditableKeyDown({
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
      expect(innerApplyEditableCommand).toHaveBeenCalledWith({
        command: { inputType: 'insertText', kind: 'insert-text', text: 'a' },
        editor,
      });

      realmEvent.remove();
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    } finally {
      vi.doUnmock('../../src/react/editable/mutation-controller');
      vi.resetModules();
    }
  });

  it('routes printable expanded inline-void replacement through the model with beforeinput support', async () => {
    vi.resetModules();

    const innerApplyEditableCommand2 = vi.fn(() => true);

    vi.doMock(
      '../../src/react/editable/mutation-controller',
      async (importOriginal) => {
        const actual =
          await importOriginal<
            typeof import('../../src/react/editable/mutation-controller')
          >();

        return {
          ...actual,
          applyEditableCommand: innerApplyEditableCommand2,
        };
      }
    );

    try {
      const [
        {
          createEditor: innerCreateEditor2,
          defineEditorSchema: innerDefineEditorSchema,
          schema: innerSchema,
        },
        { ReactEditor: innerReactEditor2 },
        { applyEditableKeyDown: innerApplyEditableKeyDown2 },
      ] = await Promise.all([
        import('plitejs'),
        import('../../src/react/plugin/react-editor'),
        import('../../src/react/editable/keyboard-input-strategy'),
      ]);
      const editor = innerCreateEditor2({
        extensions: [
          innerDefineEditorSchema(
            'schema:keyboard-input-strategy-inline-void-test',
            {
              elements: { mention: { void: 'markable-inline' } },
              id: 'keyboard-input-strategy-inline-void-test',
              root: innerSchema.content.not(innerSchema.content.text()),
              unknown: 'preserve',
              version: 1,
            }
          ),
        ],
        initialSelection: {
          kind: 'text',
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
      const realmEvent = createRealmKeyEvent({
        beforeInput: true,
        key: 'Z',
      });
      const { event } = realmEvent;
      const hasEditableTarget = vi
        .spyOn(innerReactEditor2, 'hasEditableTarget')
        .mockReturnValue(true);
      const isComposing = vi
        .spyOn(innerReactEditor2, 'isComposing')
        .mockReturnValue(false);

      const result = innerApplyEditableKeyDown2({
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
      expect(innerApplyEditableCommand2).toHaveBeenCalledWith({
        command: { inputType: 'insertText', kind: 'insert-text', text: 'Z' },
        editor,
      });

      realmEvent.remove();
      hasEditableTarget.mockRestore();
      isComposing.mockRestore();
    } finally {
      vi.doUnmock('../../src/react/editable/mutation-controller');
      vi.resetModules();
    }
  });

  it.each([
    ['Backspace', 'backward'],
    ['Delete', 'forward'],
  ] as const)(
    'keeps %s direction in the Chrome/WebKit void-node fallback before generic deletion',
    async (key, direction) => {
      vi.resetModules();

      const innerApplyEditableCommand3 = vi.fn(() => true);

      vi.doMock(
        '../../src/react/editable/editing-kernel',
        async (importOriginal) => {
          const actual =
            await importOriginal<
              typeof import('../../src/react/editable/editing-kernel')
            >();

          return {
            ...actual,
            getEditableCommandFromKeyDown: vi.fn(() => ({
              direction,
              kind: 'delete',
            })),
          };
        }
      );
      vi.doMock(
        '../../src/react/editable/mutation-controller',
        async (importOriginal) => {
          const actual =
            await importOriginal<
              typeof import('../../src/react/editable/mutation-controller')
            >();

          return {
            ...actual,
            applyEditableCommand: innerApplyEditableCommand3,
          };
        }
      );

      try {
        const [
          {
            createEditor: innerCreateEditor3,
            defineEditorSchema: innerDefineEditorSchema2,
            schema: innerSchema2,
          },
          { ReactEditor: innerReactEditor3 },
          { applyEditableKeyDown: innerApplyEditableKeyDown3 },
        ] = await Promise.all([
          import('plitejs'),
          import('../../src/react/plugin/react-editor'),
          import('../../src/react/editable/keyboard-input-strategy'),
        ]);
        const editor = innerCreateEditor3({
          extensions: [
            innerDefineEditorSchema2(
              'schema:keyboard-input-strategy-void-test',
              {
                elements: { image: { void: 'block' } },
                id: 'keyboard-input-strategy-void-test',
                root: innerSchema2.content.not(innerSchema2.content.text()),
                unknown: 'preserve',
                version: 1,
              }
            ),
          ],
          initialSelection: {
            kind: 'text',
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 0 },
          },
          initialValue: [{ type: 'image', children: [{ text: '' }] }],
        }) as ReactEditorType;
        const frame = document.createElement('iframe');

        document.body.append(frame);
        const frameDocument = frame.contentDocument!;
        const frameWindow = frame.contentWindow!;
        const target = frameDocument.createElement('div');

        Object.defineProperty(frameWindow.navigator, 'userAgent', {
          configurable: true,
          value:
            'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36',
        });
        Object.defineProperty(frameWindow, 'InputEvent', {
          configurable: true,
          value: class InputEvent {
            getTargetRanges() {
              return [];
            }
          },
        });
        frameDocument.body.append(target);
        const nativeEvent = new frameWindow.KeyboardEvent('keydown', {
          bubbles: true,
          key,
        });

        target.dispatchEvent(nativeEvent);
        const event = reactKeyEvent(nativeEvent);
        const hasEditableTarget = vi
          .spyOn(innerReactEditor3, 'hasEditableTarget')
          .mockReturnValue(true);
        const isComposing = vi
          .spyOn(innerReactEditor3, 'isComposing')
          .mockReturnValue(false);

        const result = innerApplyEditableKeyDown3({
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
        expect(innerApplyEditableCommand3).toHaveBeenCalledWith({
          command: {
            direction,
            kind: 'delete-fragment',
            selection: {
              anchorPath: [0],
              focusPath: [0],
              kind: 'node',
              paths: [[0]],
            },
          },
          editor,
        });

        frame.remove();
        hasEditableTarget.mockRestore();
        isComposing.mockRestore();
      } finally {
        vi.doUnmock('../../src/react/editable/editing-kernel');
        vi.doUnmock('../../src/react/editable/mutation-controller');
        vi.resetModules();
      }
    }
  );
});
