import { JSDOM } from 'jsdom';
import { createEditor, type Descendant, type Range } from 'plitejs';

import { dom } from '../../src/dom/index';
import {
  DOMCoverage,
  type DOMPhaseScheduler,
  EDITOR_TO_ELEMENT,
  EDITOR_TO_KEY_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  IS_COMPOSING,
  IS_FOCUSED,
  IS_NODE_MAP_DIRTY,
  installEditorDOMPhaseScheduler,
  NODE_TO_ELEMENT,
  replaceDOMSelectionRange,
} from '../../src/dom/internal';
import {
  getNodeKey as editorGetNodeKey,
  getSnapshot as editorGetSnapshot,
  hasPath as editorHasPath,
  replace as editorReplace,
} from '../../src/internal';

type DOMTestEditor = ReturnType<typeof createNestedEditor>;

const CANNOT_RESOLVE_DOM_NODE_FROM_PLITE_NODE =
  /Cannot resolve a DOM node from Plite node/;

const createNestedEditor = () => {
  const editor = createEditor({ extensions: [dom()] });

  editorReplace(editor, {
    children: [
      {
        type: 'section',
        children: [
          {
            type: 'summary',
            children: [{ text: 'Summary' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'Hidden alpha' }],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Visible beta' }],
      },
      {
        type: 'footer',
        children: [{ text: 'Hidden omega' }],
      },
    ] satisfies Descendant[],
  });

  return editor;
};

const createLargeEditor = (blocks: number) => {
  const editor = createEditor({ extensions: [dom()] });

  editorReplace(editor, {
    children: Array.from({ length: blocks }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `Block ${index}` }],
    })) satisfies Descendant[],
  });

  return editor;
};

const withDom = (run: (document: Document) => void) => {
  const innerDom = new JSDOM('<!doctype html><html><body></body></html>');

  try {
    run(innerDom.window.document);
  } finally {
    innerDom.window.close();
  }
};

const createRecordingScheduler = ({ run = false } = {}) => {
  const callbacksByKey = new Map<
    string,
    {
      callback: (frameTime?: number) => void;
      cancelled: boolean;
      label: string;
    }
  >();
  const callbacks: Array<{
    callback: (frameTime?: number) => void;
    cancelled: boolean;
    label: string;
  }> = [];
  const tasks: Array<{
    label: string;
    options: Parameters<DOMPhaseScheduler['schedule']>[3];
    phase: Parameters<DOMPhaseScheduler['schedule']>[0];
  }> = [];
  const scheduler: DOMPhaseScheduler = {
    destroy: () => {},
    diagnostics: () => ({
      flushes: 0,
      lastFlushPhases: [],
      loopLimitHits: 0,
      loopRestarts: 0,
      maxObservedPasses: 0,
    }),
    flush: () => {},
    pending: () => tasks.length,
    schedule: (phase, label, callback, options) => {
      tasks.push({ label, options, phase });
      const scheduled = { callback, cancelled: false, label };

      if (options?.key) {
        const existing = callbacksByKey.get(options.key);

        if (existing) existing.cancelled = true;
        callbacksByKey.set(options.key, scheduled);
      }
      callbacks.push(scheduled);
      if (run) callback();

      return () => {
        scheduled.cancelled = true;
        if (options?.key && callbacksByKey.get(options.key) === scheduled) {
          callbacksByKey.delete(options.key);
        }
      };
    },
  };

  return { callbacks, scheduler, tasks };
};

const mountEditorRoot = (
  editor: DOMTestEditor,
  document: Document,
  root = document.createElement('div')
) => {
  root.setAttribute('data-plite-editor', 'true');
  root.setAttribute('contenteditable', 'true');
  if (!root.parentNode) {
    document.body.appendChild(root);
  }

  EDITOR_TO_ELEMENT.set(editor, root);
  EDITOR_TO_WINDOW.set(editor, document.defaultView!);
  ELEMENT_TO_NODE.set(root, editor);
  NODE_TO_ELEMENT.set(editor, root);
  EDITOR_TO_KEY_TO_ELEMENT.set(
    editor,
    EDITOR_TO_KEY_TO_ELEMENT.get(editor) ?? new WeakMap()
  );

  return root;
};

const bindDOMNode = (
  editor: DOMTestEditor,
  node: Descendant,
  element: HTMLElement
) => {
  const key = editor.api.dom.findKey(node);

  EDITOR_TO_KEY_TO_ELEMENT.get(editor)!.set(key, element);
  ELEMENT_TO_NODE.set(element, node);
  NODE_TO_ELEMENT.set(node, element);
};

const createTextDOM = (document: Document, text: string) => {
  const owner = document.createElement('span');
  const leaf = document.createElement('span');
  const string = document.createElement('span');

  owner.setAttribute('data-plite-node', 'text');
  leaf.setAttribute('data-plite-leaf', 'true');
  string.setAttribute('data-plite-string', 'true');
  string.appendChild(document.createTextNode(text));
  leaf.appendChild(string);
  owner.appendChild(leaf);

  return owner;
};

const getNodeKey = (editor: DOMTestEditor, path: number[]) => {
  const nodeKey = editorGetNodeKey(editor, path);

  if (!nodeKey) {
    throw new Error(`Missing node key at ${path.join('.')}`);
  }

  return nodeKey;
};

class FakeDataTransfer {
  private readonly data = new Map<string, string>();

  getData(type: string) {
    return this.data.get(type) ?? '';
  }

  setData(type: string, value: string) {
    this.data.set(type, value);
  }
}

const registerSectionBodyBoundary = (editor: DOMTestEditor) =>
  DOMCoverage.registerBoundary(editor, {
    boundaryId: 'section-body',
    anchor: { type: 'summary-slot', nodeKey: getNodeKey(editor, [0, 0]) },
    copyPolicy: 'model',
    coveredPathRanges: [{ kind: 'text', anchor: [0, 1], focus: [0, 1] }],
    coveredRuntimeRanges: [
      {
        kind: 'text',
        anchor: getNodeKey(editor, [0, 1]),
        focus: getNodeKey(editor, [0, 1]),
      },
    ],
    findPolicy: 'native',
    ownerPath: [0],
    ownerNodeKey: getNodeKey(editor, [0]),
    reason: 'app-collapse',
    selectionPolicy: 'skip',
    state: 'intentionally-hidden',
    version: 1,
  });

const registerNestedParagraphBoundary = (editor: DOMTestEditor) =>
  DOMCoverage.registerBoundary(editor, {
    boundaryId: 'nested-paragraph',
    anchor: { type: 'placeholder', nodeKey: getNodeKey(editor, [0, 1]) },
    copyPolicy: 'summary',
    coveredPathRanges: [{ kind: 'text', anchor: [0, 1, 0], focus: [0, 1, 0] }],
    coveredRuntimeRanges: [],
    findPolicy: 'native',
    ownerPath: [0, 1],
    ownerNodeKey: getNodeKey(editor, [0, 1]),
    reason: 'app-collapse',
    selectionPolicy: 'materialize',
    state: 'intentionally-hidden',
    version: 1,
  });

const median = (values: number[]) => {
  const sorted = [...values].sort((left, right) => left - right);

  return sorted[Math.floor(sorted.length / 2)] ?? 0;
};

const measureRepeated = (run: () => void) => {
  const startedAt = performance.now();

  for (let index = 0; index < 100; index++) {
    run();
  }

  return performance.now() - startedAt;
};

describe('DOM coverage boundaries', () => {
  test('resolves a nested hidden child point to a boundary instead of a DOM point', () => {
    withDom((document) => {
      const editor = createNestedEditor();

      mountEditorRoot(editor, document);

      registerSectionBodyBoundary(editor);

      const hiddenPoint = { path: [0, 1, 0], offset: 3 };

      expect(() => editor.api.dom.assertDOMPoint(hiddenPoint)).toThrow(
        CANNOT_RESOLVE_DOM_NODE_FROM_PLITE_NODE
      );
      expect(
        DOMCoverage.resolveDOMPointOrBoundary(editor, hiddenPoint)
      ).toMatchObject({
        boundary: {
          boundaryId: 'section-body',
          reason: 'app-collapse',
          state: 'intentionally-hidden',
        },
        type: 'boundary',
      });
    });
  });

  test('tracks first and last root self boundaries without covering siblings', () => {
    const editor = createNestedEditor();

    DOMCoverage.registerBoundary(editor, {
      boundaryId: 'hidden-header',
      anchor: { type: 'placeholder', nodeKey: getNodeKey(editor, [0]) },
      copyPolicy: 'exclude',
      coveredPathRanges: [{ kind: 'text', anchor: [0], focus: [0] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [0],
      ownerNodeKey: getNodeKey(editor, [0]),
      reason: 'app-hidden',
      selectionPolicy: 'skip',
      state: 'intentionally-hidden',
      version: 1,
    });
    DOMCoverage.registerBoundary(editor, {
      boundaryId: 'hidden-footer',
      anchor: { type: 'placeholder', nodeKey: getNodeKey(editor, [2]) },
      copyPolicy: 'exclude',
      coveredPathRanges: [{ kind: 'text', anchor: [2], focus: [2] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [2],
      ownerNodeKey: getNodeKey(editor, [2]),
      reason: 'app-hidden',
      selectionPolicy: 'skip',
      state: 'intentionally-hidden',
      version: 1,
    });

    expect(
      DOMCoverage.getBoundaryForPoint(editor, { path: [0, 0, 0], offset: 0 })
        ?.boundaryId
    ).toBe('hidden-header');
    expect(
      DOMCoverage.getBoundaryForPoint(editor, { path: [2, 0], offset: 0 })
        ?.boundaryId
    ).toBe('hidden-footer');
    expect(
      DOMCoverage.getBoundaryForPoint(editor, { path: [1, 0], offset: 0 })
    ).toBeNull();
  });

  test('resolves a range crossing hidden content to boundary policy', () => {
    const editor = createNestedEditor();
    const range: Range = {
      kind: 'text',
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 7 },
    };

    registerSectionBodyBoundary(editor);

    expect(DOMCoverage.resolveDOMRangeOrBoundary(editor, range)).toMatchObject({
      boundaries: [{ boundaryId: 'section-body' }],
      range,
      type: 'boundary-range',
    });
  });

  test.each([
    [false, false],
    [true, false],
    [false, true],
  ])(
    'installs exact selection direction (backward: %s, collapsed: %s)',
    (backward, collapsed) => {
      withDom((document) => {
        const text = document.createTextNode('abc');
        const range = document.createRange();
        const calls: string[] = [];
        let addedRange: globalThis.Range | null = null;
        let baseAndExtentCall: unknown[] | null = null;
        const selection = {
          addRange(nextRange: globalThis.Range) {
            calls.push('addRange');
            addedRange = nextRange;
          },
          removeAllRanges() {
            calls.push('removeAllRanges');
          },
          setBaseAndExtent(
            nextAnchorNode: Node,
            nextAnchorOffset: number,
            nextFocusNode: Node,
            nextFocusOffset: number
          ) {
            calls.push('setBaseAndExtent');
            baseAndExtentCall = [
              nextAnchorNode,
              nextAnchorOffset,
              nextFocusNode,
              nextFocusOffset,
            ];
          },
        } as unknown as Selection;

        range.setStart(text, 0);
        range.setEnd(text, collapsed ? 0 : 2);
        replaceDOMSelectionRange(selection, range, { backward });

        expect(addedRange).toBe(collapsed ? null : range);
        expect(baseAndExtentCall).toEqual(
          backward
            ? [text, range.endOffset, text, range.startOffset]
            : [text, range.startOffset, text, range.endOffset]
        );
        expect(calls).toEqual(
          collapsed
            ? ['setBaseAndExtent']
            : ['removeAllRanges', 'addRange', 'setBaseAndExtent']
        );
      });
    }
  );

  test('syncs native selection inside a shadow root when focusing', () => {
    withDom((document) => {
      const editor = createEditor({ extensions: [dom()] });
      const host = document.createElement('div');
      const shadowRoot = host.attachShadow({ mode: 'open' });
      const root = document.createElement('div');
      let getSelectionCalls = 0;
      const addedRanges: globalThis.Range[] = [];
      let removeAllRangesCalls = 0;
      const selectionCalls: unknown[][] = [];
      const fakeSelection = {
        addRange(range: globalThis.Range) {
          addedRanges.push(range);
        },
        removeAllRanges() {
          removeAllRangesCalls += 1;
        },
        setBaseAndExtent(...args: unknown[]) {
          selectionCalls.push(args);
        },
      } as unknown as Selection;

      document.body.appendChild(host);
      shadowRoot.appendChild(root);
      Object.defineProperty(shadowRoot, 'getSelection', {
        configurable: true,
        value: () => {
          getSelectionCalls += 1;
          return fakeSelection;
        },
      });

      editorReplace(editor, {
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'shadow' }],
          },
        ] satisfies Descendant[],
        selection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 2 },
          focus: { path: [0, 0], offset: 2 },
        },
      });

      mountEditorRoot(editor, document, root);
      IS_FOCUSED.delete(editor);
      IS_NODE_MAP_DIRTY.delete(editor);
      const textDOM = createTextDOM(document, 'shadow');
      root.appendChild(textDOM);
      const [textNode] = editor.read((state) => state.nodes.get([0, 0]));
      bindDOMNode(editor, textNode as Descendant, textDOM);
      const { scheduler, tasks } = createRecordingScheduler({ run: true });
      const uninstall = installEditorDOMPhaseScheduler(editor, root, scheduler);

      editor.api.dom.focus({ retries: 1 });

      expect(getSelectionCalls).toBeGreaterThan(0);
      expect(removeAllRangesCalls).toBe(0);
      expect(addedRanges).toHaveLength(0);
      expect(selectionCalls).not.toHaveLength(0);
      expect(tasks).toContainEqual({
        label: 'dom-editor-focus-selection-sync',
        options: {
          key: 'dom-editor-focus-selection-sync',
          timing: 'microtask',
        },
        phase: 'selection-repair',
      });
      uninstall();
    });
  });

  test('focus publishes a missing selection and joins an active update', () => {
    withDom((document) => {
      const editor = createEditor({ extensions: [dom()] });
      const root = mountEditorRoot(editor, document);

      editorReplace(editor, {
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'focus' }],
          },
        ] satisfies Descendant[],
        selection: null,
      });
      IS_FOCUSED.delete(editor);
      IS_NODE_MAP_DIRTY.delete(editor);
      const textDOM = createTextDOM(document, 'focus');
      root.appendChild(textDOM);
      const [textNode] = editor.read((state) => state.nodes.get([0, 0]));
      bindDOMNode(editor, textNode as Descendant, textDOM);
      const { scheduler } = createRecordingScheduler({ run: true });
      const uninstall = installEditorDOMPhaseScheduler(editor, root, scheduler);
      const commits: Array<
        NonNullable<ReturnType<typeof editor.read.lastCommit>>
      > = [];
      const unsubscribe = editor.subscribeCommit((commit) => {
        commits.push(commit);
      });

      try {
        editor.update(() => {
          editor.api.dom.focus({ retries: 1 });
          expect(commits).toHaveLength(0);
        });

        expect(commits).toHaveLength(1);
        expect(commits[0]?.selectionChanged).toBe(true);
        expect(commits[0]?.changed.has('selection')).toBe(true);

        editor.update((tx) => tx.selection.set(null));
        commits.length = 0;

        editor.api.dom.focus({ retries: 1 });

        expect(commits).toHaveLength(1);
        expect(commits[0]?.selectionChanged).toBe(true);
        expect(commits[0]?.changed.has('selection')).toBe(true);
      } finally {
        unsubscribe();
        uninstall();
      }
    });
  });

  test('focus retries dirty node maps through the root DOM scheduler', () => {
    withDom((document) => {
      const editor = createEditor({ extensions: [dom()] });

      const root = mountEditorRoot(editor, document);
      const { scheduler, tasks } = createRecordingScheduler();
      const uninstall = installEditorDOMPhaseScheduler(editor, root, scheduler);
      IS_FOCUSED.delete(editor);
      IS_NODE_MAP_DIRTY.set(editor, true);

      expect(() => editor.api.dom.focus({ retries: 1 })).not.toThrow();
      expect(IS_FOCUSED.get(editor)).toBeUndefined();
      expect(tasks).toEqual([
        {
          label: 'dom-editor-focus-retry',
          options: {
            delay: 10,
            key: 'dom-editor-focus-retry',
            timing: 'timeout',
          },
          phase: 'dom-write',
        },
      ]);
      uninstall();
    });
  });

  test('settles focus without stealing it or reviving a replaced root', () => {
    withDom((document) => {
      const editor = createEditor({ extensions: [dom()] });
      const root = mountEditorRoot(editor, document);
      const button = document.createElement('button');

      document.body.appendChild(button);
      editorReplace(editor, {
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'focus' }],
          },
        ] satisfies Descendant[],
        selection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 2 },
          focus: { path: [0, 0], offset: 2 },
        },
      });
      IS_FOCUSED.delete(editor);
      IS_NODE_MAP_DIRTY.delete(editor);
      const textDOM = createTextDOM(document, 'focus');

      root.appendChild(textDOM);
      const [textNode] = editor.read((state) => state.nodes.get([0, 0]));

      bindDOMNode(editor, textNode as Descendant, textDOM);
      const { callbacks, scheduler } = createRecordingScheduler();
      const uninstall = installEditorDOMPhaseScheduler(editor, root, scheduler);

      try {
        editor.api.dom.focus({ retries: 1 });
        const firstSettle = callbacks.find(
          ({ label }) => label === 'dom-editor-focus-settle-timeout'
        );

        expect(firstSettle).toBeDefined();
        button.focus();
        firstSettle!.callback();
        expect(document.activeElement).toBe(button);

        editor.api.dom.focus({ retries: 1 });
        const secondSettle = callbacks.findLast(
          ({ label }) => label === 'dom-editor-focus-settle-timeout'
        );

        expect(firstSettle!.cancelled).toBe(true);
        root.blur();
        expect(document.activeElement).toBe(document.body);
        secondSettle!.callback();
        expect(document.activeElement).toBe(root);

        editor.api.dom.focus({ retries: 1 });
        const replacedRootSettle = callbacks.findLast(
          ({ label }) => label === 'dom-editor-focus-settle-timeout'
        );
        const replacement = mountEditorRoot(editor, document);

        root.remove();
        replacedRootSettle!.callback();
        expect(document.activeElement).not.toBe(root);
        expect(document.activeElement).not.toBe(replacement);
      } finally {
        uninstall();
      }
    });
  });

  test('does not let an earlier editor repair reclaim shared document focus', () => {
    withDom((document) => {
      const firstEditor = createEditor({ extensions: [dom()] });
      const secondEditor = createEditor({ extensions: [dom()] });
      const firstRoot = mountEditorRoot(firstEditor, document);
      const secondRoot = mountEditorRoot(secondEditor, document);
      const mountText = (editor: DOMTestEditor, root: HTMLElement) => {
        editorReplace(editor, {
          children: [
            {
              type: 'paragraph',
              children: [{ text: 'focus' }],
            },
          ] satisfies Descendant[],
          selection: {
            kind: 'text',
            anchor: { path: [0, 0], offset: 2 },
            focus: { path: [0, 0], offset: 2 },
          },
        });
        IS_FOCUSED.delete(editor);
        IS_NODE_MAP_DIRTY.delete(editor);
        const textDOM = createTextDOM(document, 'focus');

        root.appendChild(textDOM);
        const [textNode] = editor.read((state) => state.nodes.get([0, 0]));

        bindDOMNode(editor, textNode as Descendant, textDOM);
      };

      mountText(firstEditor, firstRoot);
      mountText(secondEditor, secondRoot);
      const firstSchedule = createRecordingScheduler();
      const secondSchedule = createRecordingScheduler();
      const uninstallFirst = installEditorDOMPhaseScheduler(
        firstEditor,
        firstRoot,
        firstSchedule.scheduler
      );
      const uninstallSecond = installEditorDOMPhaseScheduler(
        secondEditor,
        secondRoot,
        secondSchedule.scheduler
      );

      try {
        firstRoot.focus();
        IS_NODE_MAP_DIRTY.set(firstEditor, true);
        firstEditor.api.dom.focus({ retries: 1 });
        const firstRetry = firstSchedule.callbacks.find(
          ({ label }) => label === 'dom-editor-focus-retry'
        );

        IS_NODE_MAP_DIRTY.delete(firstEditor);
        secondEditor.api.dom.focus({ retries: 1 });
        expect(document.activeElement).toBe(secondRoot);
        expect(firstRetry?.cancelled).toBe(false);
        firstRetry!.callback();
        expect(document.activeElement).toBe(secondRoot);

        firstEditor.api.dom.focus({ retries: 1 });
        const firstSettle = firstSchedule.callbacks.findLast(
          ({ label }) => label === 'dom-editor-focus-settle-timeout'
        );

        secondEditor.api.dom.focus({ retries: 1 });
        expect(document.activeElement).toBe(secondRoot);

        secondRoot.remove();
        expect(document.activeElement).toBe(document.body);
        expect(firstSettle?.cancelled).toBe(false);
        firstSettle!.callback();
        expect(document.activeElement).toBe(document.body);
      } finally {
        uninstallFirst();
        uninstallSecond();
      }
    });
  });

  test('settles a shadow-root host loss without stealing sibling focus', () => {
    withDom((document) => {
      const editor = createEditor({ extensions: [dom()] });
      const host = document.createElement('div');
      const shadowRoot = host.attachShadow({ mode: 'open' });
      const root = document.createElement('div');
      const button = document.createElement('button');

      host.tabIndex = 0;
      document.body.append(host, button);
      shadowRoot.appendChild(root);
      mountEditorRoot(editor, document, root);
      editorReplace(editor, {
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'shadow focus' }],
          },
        ] satisfies Descendant[],
        selection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 2 },
          focus: { path: [0, 0], offset: 2 },
        },
      });
      IS_FOCUSED.delete(editor);
      IS_NODE_MAP_DIRTY.delete(editor);
      const textDOM = createTextDOM(document, 'shadow focus');

      root.appendChild(textDOM);
      const [textNode] = editor.read((state) => state.nodes.get([0, 0]));

      bindDOMNode(editor, textNode as Descendant, textDOM);
      const { callbacks, scheduler } = createRecordingScheduler();
      const uninstall = installEditorDOMPhaseScheduler(editor, root, scheduler);

      try {
        editor.api.dom.focus({ retries: 1 });
        const hostSettle = callbacks.findLast(
          ({ label }) => label === 'dom-editor-focus-settle-timeout'
        );

        host.focus();
        expect(document.activeElement).toBe(host);
        expect(shadowRoot.activeElement).toBeNull();
        hostSettle!.callback();
        expect(shadowRoot.activeElement).toBe(root);

        editor.api.dom.focus({ retries: 1 });
        const siblingSettle = callbacks.findLast(
          ({ label }) => label === 'dom-editor-focus-settle-timeout'
        );

        button.focus();
        siblingSettle!.callback();
        expect(document.activeElement).toBe(button);
        expect(shadowRoot.activeElement).toBeNull();
      } finally {
        uninstall();
      }
    });
  });

  test('uses parent-hidden policy before nested child policy regardless of registration order', () => {
    const editor = createNestedEditor();

    registerNestedParagraphBoundary(editor);
    registerSectionBodyBoundary(editor);

    expect(
      DOMCoverage.getBoundaryForPoint(editor, { path: [0, 1, 0], offset: 0 })
    ).toMatchObject({
      boundaryId: 'section-body',
      copyPolicy: 'model',
      selectionPolicy: 'skip',
    });

    expect(
      DOMCoverage.getBoundariesForRange(editor, {
        kind: 'text',
        anchor: { path: [0, 1, 0], offset: 0 },
        focus: { path: [0, 1, 0], offset: 6 },
      }).map((boundary) => boundary.boundaryId)
    ).toEqual(['section-body', 'nested-paragraph']);
  });

  test('imports a placeholder DOM point as a boundary point', () => {
    withDom((document) => {
      const editor = createNestedEditor();
      const root = mountEditorRoot(editor, document);
      const placeholder = document.createElement('button');

      registerSectionBodyBoundary(editor);
      placeholder.setAttribute(
        DOMCoverage.boundaryElementAttribute,
        'section-body'
      );
      placeholder.setAttribute(DOMCoverage.boundaryEdgeAttribute, 'anchor');
      root.appendChild(placeholder);

      expect(
        DOMCoverage.resolvePlitePointFromBoundary(editor, [placeholder, 0])
      ).toMatchObject({
        boundary: { boundaryId: 'section-body' },
        edge: 'anchor',
        type: 'boundary-point',
      });
      expect(
        editor.api.dom.assertPlitePoint([placeholder, 0], {
          exactMatch: true,
        })
      ).toEqual({
        path: [0, 1, 0],
        offset: 0,
      });
      expect(
        DOMCoverage.resolvePlitePointFromBoundary(editor, [root, 1])
      ).toMatchObject({
        boundary: { boundaryId: 'section-body' },
        edge: 'anchor',
        type: 'boundary-point',
      });
      expect(
        editor.api.dom.assertPlitePoint([root, 1], {
          exactMatch: true,
        })
      ).toEqual({
        path: [0, 1, 0],
        offset: 0,
      });
    });
  });

  test('dispatches materialization through the internal boundary hook', () => {
    const editor = createNestedEditor();
    const materialized: string[] = [];

    registerSectionBodyBoundary(editor);
    DOMCoverage.setMaterializeHandler(editor, (boundary, reason) => {
      materialized.push(`${boundary.boundaryId}:${reason}`);
      return true;
    });

    expect(
      DOMCoverage.materializeBoundary(editor, 'section-body', 'selection')
    ).toEqual({
      boundaryId: 'section-body',
      reason: 'selection',
      status: 'handled',
    });
    expect(materialized).toEqual(['section-body:selection']);
  });

  test('composes materialization handlers without clobbering staged and app boundaries', () => {
    const editor = createNestedEditor();
    const materialized: string[] = [];

    registerSectionBodyBoundary(editor);
    registerNestedParagraphBoundary(editor);

    const cleanupNested = DOMCoverage.registerMaterializeHandler(
      editor,
      (boundary, reason) => {
        materialized.push(`nested-saw:${boundary.boundaryId}:${reason}`);

        return boundary.boundaryId === 'nested-paragraph';
      }
    );
    const cleanupSection = DOMCoverage.registerMaterializeHandler(
      editor,
      (boundary, reason) => {
        materialized.push(`section-saw:${boundary.boundaryId}:${reason}`);

        return boundary.boundaryId === 'section-body';
      }
    );

    expect(
      DOMCoverage.materializeBoundary(editor, 'section-body', 'selection')
    ).toMatchObject({ status: 'handled' });
    expect(materialized).toEqual([
      'nested-saw:section-body:selection',
      'section-saw:section-body:selection',
    ]);

    cleanupSection();
    materialized.length = 0;

    expect(
      DOMCoverage.materializeBoundary(editor, 'section-body', 'selection')
    ).toMatchObject({ status: 'unhandled' });
    expect(materialized).toEqual(['nested-saw:section-body:selection']);

    cleanupNested();
  });

  test('does not materialize boundaries while composition is active', () => {
    const editor = createNestedEditor();
    const materialized: string[] = [];

    registerSectionBodyBoundary(editor);
    DOMCoverage.setMaterializeHandler(editor, (boundary, reason) => {
      materialized.push(`${boundary.boundaryId}:${reason}`);
      return true;
    });
    IS_COMPOSING.set(editor, true);

    try {
      expect(
        DOMCoverage.materializeBoundary(editor, 'section-body', 'selection')
      ).toEqual({
        boundaryId: 'section-body',
        reason: 'selection',
        status: 'unhandled',
      });
      expect(materialized).toEqual([]);
    } finally {
      IS_COMPOSING.delete(editor);
    }
  });

  test('writes model-backed clipboard data when selection crosses hidden content', () => {
    withDom((document) => {
      const editor = createNestedEditor();
      const clipboard = new FakeDataTransfer();
      const staleDom = document.createElement('span');

      mountEditorRoot(editor, document);
      registerSectionBodyBoundary(editor);
      staleDom.textContent = 'STALE HIDDEN DOM';
      document.body.appendChild(staleDom);

      editor.update((tx) => {
        tx.selection.set({
          kind: 'text',
          anchor: { path: [0, 1, 0], offset: 0 },
          focus: { path: [0, 1, 0], offset: 12 },
        });
      });

      editor.api.dom.clipboard.writeSelection(clipboard);

      expect(clipboard.getData('text/plain')).toBe('Hidden alpha');
      expect(clipboard.getData('text/html')).toContain('Hidden alpha');
      expect(clipboard.getData('text/html')).not.toContain('STALE');
      expect(clipboard.getData('application/x-plite-fragment')).not.toBe('');
    });
  });

  test('pastes over a hidden selection through the model without stale DOM', () => {
    withDom((document) => {
      const editor = createNestedEditor();
      const clipboard = new FakeDataTransfer();
      const staleDom = document.createElement('span');

      mountEditorRoot(editor, document);
      registerSectionBodyBoundary(editor);
      staleDom.textContent = 'STALE HIDDEN DOM';
      document.body.appendChild(staleDom);
      clipboard.setData('text/plain', 'Pasted alpha');

      editor.update((tx) => {
        tx.selection.set({
          kind: 'text',
          anchor: { path: [0, 1, 0], offset: 0 },
          focus: { path: [0, 1, 0], offset: 12 },
        });
        editor.api.dom.clipboard.insertData(
          clipboard as unknown as DataTransfer
        );
      });

      expect(editorGetSnapshot(editor).children).toEqual([
        {
          type: 'section',
          children: [
            {
              type: 'summary',
              children: [{ text: 'Summary' }],
            },
            {
              type: 'paragraph',
              children: [{ text: 'Pasted alpha' }],
            },
          ],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Visible beta' }],
        },
        {
          type: 'footer',
          children: [{ text: 'Hidden omega' }],
        },
      ]);
      expect(staleDom.textContent).toBe('STALE HIDDEN DOM');
    });
  });

  test('programmatic selection inside a materialize boundary uses the hook instead of raw DOM lookup', () => {
    const editor = createNestedEditor();
    const materialized: string[] = [];
    const hiddenPoint = { path: [0, 1, 0], offset: 0 };

    registerNestedParagraphBoundary(editor);
    DOMCoverage.setMaterializeHandler(editor, (boundary, reason) => {
      materialized.push(`${boundary.boundaryId}:${reason}`);
      return true;
    });

    expect(() => editor.api.dom.assertDOMPoint(hiddenPoint)).toThrow(
      CANNOT_RESOLVE_DOM_NODE_FROM_PLITE_NODE
    );
    expect(
      DOMCoverage.resolveDOMPointOrBoundary(editor, hiddenPoint)
    ).toMatchObject({
      boundary: {
        boundaryId: 'nested-paragraph',
        selectionPolicy: 'materialize',
      },
      type: 'boundary',
    });
    expect(
      DOMCoverage.materializeBoundary(
        editor,
        'nested-paragraph',
        'programmatic'
      )
    ).toEqual({
      boundaryId: 'nested-paragraph',
      reason: 'programmatic',
      status: 'handled',
    });
    expect(materialized).toEqual(['nested-paragraph:programmatic']);
  });

  test('invalidates a boundary when split moves covered runtime outside its owner', () => {
    const editor = createNestedEditor();

    registerSectionBodyBoundary(editor);

    editor.update((tx) => {
      tx.nodes.split({ at: [0, 1] });
    });

    expect(DOMCoverage.getBoundary(editor, 'section-body')).toBeNull();
    expect(
      DOMCoverage.getBoundaryForPoint(editor, { path: [1, 0, 0], offset: 0 })
    ).toBeNull();
  });

  test('invalidates a boundary when merge removes its owner runtime', () => {
    const editor = createEditor({ extensions: [dom()] });

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Before' }],
        },
        {
          type: 'section',
          children: [
            {
              type: 'summary',
              children: [{ text: 'Summary' }],
            },
            {
              type: 'paragraph',
              children: [{ text: 'Hidden alpha' }],
            },
          ],
        },
      ] satisfies Descendant[],
    });

    DOMCoverage.registerBoundary(editor, {
      boundaryId: 'merged-section-body',
      anchor: { type: 'placeholder', nodeKey: getNodeKey(editor, [1, 1]) },
      copyPolicy: 'model',
      coveredPathRanges: [{ kind: 'text', anchor: [1, 1], focus: [1, 1] }],
      coveredRuntimeRanges: [
        {
          kind: 'text',
          anchor: getNodeKey(editor, [1, 1]),
          focus: getNodeKey(editor, [1, 1]),
        },
      ],
      findPolicy: 'native',
      ownerPath: [1],
      ownerNodeKey: getNodeKey(editor, [1]),
      reason: 'app-collapse',
      selectionPolicy: 'skip',
      state: 'intentionally-hidden',
      version: 1,
    });

    editor.update((tx) => {
      tx.nodes.merge({ at: [1] });
    });

    expect(DOMCoverage.getBoundary(editor, 'merged-section-body')).toBeNull();
    expect(
      DOMCoverage.getBoundaryForPoint(editor, { path: [0, 2, 0], offset: 0 })
    ).toBeNull();
  });

  test(
    'looks up points outside 100 boundaries in a 5000-block document within the stress budget',
    { timeout: 30_000 },
    () => {
      const editor = createLargeEditor(5000);
      const outsidePoint = { path: [4999, 0], offset: 0 };
      const baselineSamples = Array.from({ length: 25 }, () =>
        measureRepeated(() => {
          editorHasPath(editor, outsidePoint.path);
        })
      );

      for (let index = 0; index < 100; index++) {
        const path = [index * 40];

        DOMCoverage.registerBoundary(editor, {
          boundaryId: `hidden-${index}`,
          anchor: { type: 'placeholder', nodeKey: getNodeKey(editor, path) },
          copyPolicy: 'model',
          coveredPathRanges: [{ kind: 'text', anchor: path, focus: path }],
          coveredRuntimeRanges: [],
          findPolicy: 'native',
          ownerPath: path,
          ownerNodeKey: getNodeKey(editor, path),
          reason: 'app-collapse',
          selectionPolicy: 'skip',
          state: 'intentionally-hidden',
          version: 1,
        });
      }

      const coverageSamples = Array.from({ length: 25 }, () =>
        measureRepeated(() => {
          DOMCoverage.getBoundaryForPoint(editor, outsidePoint);
        })
      );

      expect(
        median(coverageSamples) - median(baselineSamples)
      ).toBeLessThanOrEqual(5);
    }
  );

  test('includes specifically indexed boundaries when querying a large root range', () => {
    const editor = createLargeEditor(500);

    DOMCoverage.registerBoundary(editor, {
      boundaryId: 'hidden-200',
      anchor: { type: 'placeholder', nodeKey: getNodeKey(editor, [200]) },
      copyPolicy: 'model',
      coveredPathRanges: [{ kind: 'text', anchor: [200, 0], focus: [200, 0] }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [200],
      ownerNodeKey: getNodeKey(editor, [200]),
      reason: 'viewport-virtualization',
      selectionPolicy: 'skip',
      state: 'virtualized',
      version: 1,
    });

    expect(
      DOMCoverage.getBoundariesForRange(editor, {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [300, 0], offset: 0 },
      }).map((boundary) => boundary.boundaryId)
    ).toEqual(['hidden-200']);
  });

  test('keeps exact DOM coordinate APIs separate from virtualized boundaries', () => {
    withDom((document) => {
      const editor = createLargeEditor(500);
      const hiddenPoint = { path: [200, 0], offset: 3 };
      const hiddenRange: Range = {
        kind: 'text',
        anchor: hiddenPoint,
        focus: hiddenPoint,
      };

      mountEditorRoot(editor, document);
      DOMCoverage.registerBoundary(editor, {
        boundaryId: 'virtualized-200',
        anchor: { type: 'placeholder', nodeKey: getNodeKey(editor, [200]) },
        copyPolicy: 'model',
        coveredPathRanges: [
          { kind: 'text', anchor: [200, 0], focus: [200, 0] },
        ],
        coveredRuntimeRanges: [],
        findPolicy: 'native',
        ownerPath: [200],
        ownerNodeKey: getNodeKey(editor, [200]),
        reason: 'viewport-virtualization',
        selectionPolicy: 'materialize',
        state: 'virtualized',
        version: 1,
      });

      expect(editor.api.dom.resolveDOMPoint(hiddenPoint)).toBeNull();
      expect(editor.api.dom.resolveDOMRange(hiddenRange)).toBeNull();
      expect(editor.api.dom.resolveRangeRect(hiddenRange)).toBeNull();
      expect(() => editor.api.dom.assertDOMPoint(hiddenPoint)).toThrow(
        CANNOT_RESOLVE_DOM_NODE_FROM_PLITE_NODE
      );
      expect(
        DOMCoverage.resolveDOMPointOrBoundary(editor, hiddenPoint)
      ).toMatchObject({
        boundary: {
          boundaryId: 'virtualized-200',
          reason: 'viewport-virtualization',
          state: 'virtualized',
        },
        type: 'boundary',
      });
      expect(
        DOMCoverage.resolveDOMRangeOrBoundary(editor, hiddenRange)
      ).toMatchObject({
        boundaries: [
          {
            boundaryId: 'virtualized-200',
            reason: 'viewport-virtualization',
            state: 'virtualized',
          },
        ],
        type: 'boundary-range',
      });
    });
  });
});
