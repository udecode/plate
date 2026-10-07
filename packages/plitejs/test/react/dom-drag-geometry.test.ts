import {
  defineEditorSchema,
  definePlugin,
  type Descendant,
  type Element as EditorElement,
  editorReads,
  schema,
  transferVeto,
} from 'plitejs';

import {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
} from '../../src/dom/internal';
import { readDropIndicator } from '../../src/dom/utils/drop-indicator';
import { getNodeKey as editorGetNodeKey } from '../../src/internal';
import { createEditor } from '../../src/react';
import { EditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';
import type { ReactRuntimeEditor } from '../../src/react/plugin/react-editor';
import { replace as editorReplace } from '../../src/testing';

const quoteSchema = defineEditorSchema('schema:dom-drag-geometry', {
  elements: {
    paragraph: { content: schema.content.text() },
    quote: {
      content: schema.content.types(['paragraph'], { max: 3, min: 1 }),
    },
  },
  id: 'dom-drag-geometry',
  root: schema.content.not(schema.content.text()),
  unknown: 'preserve',
  version: 1,
});

const paragraph = (text: string): EditorElement => ({
  type: 'paragraph',
  children: [{ text }],
});

const LAYOUT: Record<string, Readonly<{ bottom: number; top: number }>> = {
  '0': { bottom: 20, top: 0 },
  '1': { bottom: 90, top: 30 },
  '1.0': { bottom: 60, top: 40 },
  '1.1': { bottom: 80, top: 60 },
  '2': { bottom: 120, top: 100 },
};

const rect = ({ bottom, top }: Readonly<{ bottom: number; top: number }>) =>
  ({
    bottom,
    height: bottom - top,
    left: 0,
    right: 400,
    top,
    width: 400,
    x: 0,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

const toPath = (path: string) => path.split('.').map(Number);

const mounted: Array<() => void> = [];

const mount = (layout = LAYOUT, plugins: readonly unknown[] = []) => {
  const editor = createEditor({
    plugins: [quoteSchema, ...plugins],
  }) as ReactRuntimeEditor;

  editorReplace(editor, {
    children: [
      paragraph('a'),
      { type: 'quote', children: [paragraph('q1'), paragraph('q2')] },
      paragraph('b'),
    ],
    selection: null,
  });

  const root = document.createElement('div');

  root.setAttribute('contenteditable', 'true');
  root.setAttribute('data-editor', 'true');
  root.getBoundingClientRect = () => rect({ bottom: 300, top: 0 });
  document.body.append(root);

  const runtime = new EditableDOMRuntime({ editor });

  runtime.setRoot(root);
  runtime.connect();
  EDITOR_TO_ELEMENT.set(editor, root);
  EDITOR_TO_WINDOW.set(editor, window);
  ELEMENT_TO_NODE.set(root, editor);
  NODE_TO_ELEMENT.set(editor, root);

  const hosts = new Map<string, HTMLElement>();
  const mountChildren = (
    parent: HTMLElement,
    children: readonly Descendant[],
    path: readonly number[]
  ) => {
    children.forEach((node, index) => {
      if (!('type' in node)) return;

      const id = [...path, index].join('.');
      const host = document.createElement('div');

      host.setAttribute('data-editor-node', 'element');
      host.setAttribute('data-editor-path', [...path, index].join(','));
      host.getBoundingClientRect = () => rect(layout[id]);
      NODE_TO_ELEMENT.set(node, host);
      ELEMENT_TO_NODE.set(host, node);
      hosts.set(id, host);
      parent.append(host);
      mountChildren(host, node.children as readonly Descendant[], [
        ...path,
        index,
      ]);
    });
  };

  mountChildren(root, editor.read.children(), []);

  // A browser hit test over the mocked layout: the deepest host at the point.
  document.elementFromPoint = (x: number, y: number) => {
    let hit: Element | null = null;

    for (const [id, host] of hosts) {
      const { bottom, top } = layout[id];

      if (x >= 0 && x <= 400 && y >= top && y <= bottom) hit = host;
    }

    return hit;
  };
  mounted.push(() => {
    runtime.destroy();
    EDITOR_TO_ELEMENT.delete(editor);
    EDITOR_TO_WINDOW.delete(editor);
    ELEMENT_TO_NODE.delete(root);
    NODE_TO_ELEMENT.delete(editor);
    root.remove();
  });

  const keyAt = (path: string) => editorGetNodeKey(editor, toPath(path));
  const drop = (
    at: string | null,
    clientY: number,
    payload: string,
    { clientX = 200, copy = false }: { clientX?: number; copy?: boolean } = {}
  ) =>
    editor.api.dom.resolveDropTarget(
      { clientX, clientY, target: at === null ? root : hosts.get(at) },
      { copy, nodes: [keyAt(payload)!] }
    );
  const dropFiles = (at: string, clientY: number, count: number) =>
    editor.api.dom.resolveDropTarget(
      {
        clientX: 200,
        clientY,
        dataTransfer: {
          items: Array.from({ length: count }, () => ({ kind: 'file' })),
          types: ['Files'],
        } as unknown as DataTransfer,
        target: hosts.get(at),
      },
      { files: paragraph('') }
    );

  return { drop, dropFiles, editor, hosts, keyAt, runtime };
};

afterEach(() => {
  for (const cleanup of mounted.splice(0)) cleanup();
});

describe('DOM drop target geometry', () => {
  test('lands inside the container under the pointer', () => {
    const { drop, keyAt } = mount();

    expect(drop('1.0', 55, '2')).toMatchObject({
      edge: 'after',
      key: keyAt('1.0'),
    });
  });

  test('anchors a pointer in the root gutter to the block at its height', () => {
    const { drop, keyAt } = mount();

    expect(drop(null, 104, '0', { clientX: -10 })).toMatchObject({
      edge: 'before',
      key: keyAt('2'),
    });
  });

  test('anchors a gutter pointer beside a nested block to the root block holding it', () => {
    const { drop, keyAt } = mount();

    expect(drop(null, 50, '2', { clientX: -10 })).toMatchObject({
      edge: 'before',
      key: keyAt('1'),
    });
  });

  test('maps a pointer below every block to after the last block', () => {
    const { drop, keyAt } = mount();

    expect(drop(null, 250, '0')).toMatchObject({
      edge: 'after',
      key: keyAt('2'),
    });
  });

  test('stops on the dragged block for a move and keeps its edge for a copy', () => {
    const { drop, keyAt } = mount();

    expect(drop('1.0', 45, '1.0')).toBeNull();
    expect(drop('1.0', 45, '1.0', { copy: true })).toMatchObject({
      edge: 'before',
      key: keyAt('1.0'),
    });
  });

  test('admits a files drop only where every dropped file fits', () => {
    const { dropFiles, keyAt } = mount();

    expect(dropFiles('1.0', 55, 1)).toMatchObject({
      edge: 'after',
      key: keyAt('1.0'),
    });
    expect(dropFiles('1.0', 55, 2)).toMatchObject({
      edge: 'before',
      key: keyAt('1'),
    });
  });

  test("stops on the dragged block where its container's band overlaps it", () => {
    const { drop, keyAt } = mount({
      ...LAYOUT,
      '1.0': { bottom: 60, top: 30 },
    });

    expect(drop('1.0', 33, '1.0')).toBeNull();
    // The pointer over the handle's gutter, outside the block's host, hits
    // the container's host at the block's height.
    expect(drop('1', 33, '1.0')).toBeNull();
    expect(drop('1', 88, '1.1')).toMatchObject({
      edge: 'after',
      key: keyAt('1'),
    });
  });

  test("offers a container's outer edge from its bottom band", () => {
    const { drop, keyAt } = mount();

    expect(drop('1', 88, '0')).toMatchObject({
      edge: 'after',
      key: keyAt('1'),
    });
  });

  test('refuses edges inside collapsed content and offers its container', () => {
    const { drop, keyAt, runtime } = mount();

    runtime.domCoverage.registerBoundary({
      anchor: { nodeKey: keyAt('1.0')!, type: 'summary-slot' },
      boundaryId: 'quote-body',
      copyPolicy: 'model',
      coveredPathRanges: [{ anchor: [1, 0], focus: [1, 1] }],
      coveredRuntimeRanges: [{ anchor: keyAt('1.0')!, focus: keyAt('1.1')! }],
      ownerNodeKey: keyAt('1')!,
      ownerPath: [1],
      reason: 'app-collapse',
      selectionPolicy: 'skip',
      state: 'intentionally-hidden',
      version: 1,
    });

    expect(drop('1.0', 45, '2')).toMatchObject({
      edge: 'before',
      key: keyAt('1'),
    });
  });
});

describe('DOM side strips', () => {
  // Builds a quote beside the root block that holds the target.
  const besideRoot = definePlugin('beside-root', {
    readMiddleware: ({ around }) => [
      around(editorReads.transfer.side, ({ input }) => ({
        ancestor: input.target[1].length - 1,
        edge: input.side === 'end' ? ('after' as const) : ('before' as const),
        payload: [],
        shell: { children: [], type: 'quote' },
      })),
    ],
  });
  const rootOnly = definePlugin('root-only', {
    readMiddleware: ({ around }) => [
      around(editorReads.transfer.side, ({ input, next }) =>
        input.target[1].length === 1
          ? {
              ancestor: 0,
              edge: 'after' as const,
              payload: [],
              shell: { children: [], type: 'quote' },
            }
          : next()
      ),
    ],
  });

  test('resolves only the end strip of a block to a side', () => {
    const { drop, keyAt } = mount(LAYOUT, [besideRoot]);

    expect([
      drop('0', 10, '2', { clientX: 390 }),
      drop('0', 8, '2', { clientX: 10 }),
    ]).toEqual([
      { key: keyAt('0'), side: 'end' },
      { axis: 'y', edge: 'before', key: keyAt('0') },
    ]);
  });

  test('keeps the top and bottom quarters of a block for edges', () => {
    const { drop, keyAt } = mount(LAYOUT, [besideRoot]);

    expect(drop('0', 2, '2', { clientX: 390 })).toMatchObject({
      edge: 'before',
      key: keyAt('0'),
    });
  });

  test('falls back to the edge under a strip the feature refuses', () => {
    const { drop, keyAt } = mount(LAYOUT, [rootOnly]);

    expect(drop('1.0', 50, '2', { clientX: 390 })).toEqual({
      axis: 'y',
      edge: 'after',
      key: keyAt('1.0'),
    });
  });

  test("gives a container's band the corner where it overlaps a strip", () => {
    const { drop, keyAt } = mount(
      {
        ...LAYOUT,
        '1.0': { bottom: 50, top: 30 },
        '1.1': { bottom: 80, top: 50 },
      },
      [besideRoot]
    );

    expect(drop('1.0', 36, '2', { clientX: 390 })).toMatchObject({
      edge: 'before',
      key: keyAt('1'),
    });
  });

  test('gives a shared side to the innermost block', () => {
    const { drop, keyAt } = mount(LAYOUT, [besideRoot]);

    expect(drop('1.0', 50, '2', { clientX: 390 })).toEqual({
      key: keyAt('1.0'),
      side: 'end',
    });
  });

  test('maps the left strip to the end side in a right-to-left block, and paints it on the left', () => {
    const { drop, editor, hosts, keyAt } = mount(LAYOUT, [besideRoot]);

    hosts.get('0')!.style.direction = 'rtl';

    const target = drop('0', 10, '2', { clientX: 10 });

    editor.api.dom.drag.indicate(target);

    expect([target, readDropIndicator(editor)?.line.x]).toEqual([
      { key: keyAt('0'), side: 'end' },
      0,
    ]);
  });

  describe('beside a top-level block, in the root padding', () => {
    // A 100px padding on each side of a 400px content column.
    const padded = (plugins: readonly unknown[] = [besideRoot]) => {
      const view = mount(LAYOUT, plugins);
      const root = view.editor.api.dom.root()!;

      root.style.paddingLeft = '100px';
      root.style.paddingRight = '100px';
      root.getBoundingClientRect = () => ({
        ...rect({ bottom: 300, top: 0 }),
        left: -100,
        right: 500,
        width: 600,
        x: -100,
      });

      return view;
    };

    test('resolves the end side right of the content over the full height', () => {
      const { drop, keyAt } = padded();

      expect([
        drop(null, 6, '2', { clientX: 450 }),
        drop(null, 2, '2', { clientX: 450 }),
      ]).toEqual([
        { key: keyAt('0'), side: 'end' },
        { key: keyAt('0'), side: 'end' },
      ]);
    });

    test('resolves the start side in the left padding', () => {
      const { drop, keyAt } = padded();

      expect(drop(null, 6, '2', { clientX: -5 })).toEqual({
        key: keyAt('0'),
        side: 'start',
      });
    });

    test('gives the side beside a nested block to its top-level block', () => {
      const { drop, keyAt } = padded();

      expect(drop(null, 50, '2', { clientX: 450 })).toEqual({
        key: keyAt('1'),
        side: 'end',
      });
    });

    test('falls back to the edge when nothing builds a side', () => {
      const { drop, keyAt } = padded([]);

      expect(drop(null, 6, '2', { clientX: 450 })).toEqual({
        axis: 'y',
        edge: 'before',
        key: keyAt('0'),
      });
    });

    test('measures the clearance from where the drag started', () => {
      const { drop, editor, hosts, keyAt } = padded();
      const data = new Map<string, string>();

      editor.api.dom.drag.start(
        {
          clientX: -60,
          clientY: 105,
          dataTransfer: {
            effectAllowed: 'all',
            getData: (type: string) => data.get(type) ?? '',
            setData: (type: string, value: string) => data.set(type, value),
            setDragImage: () => {},
            get types() {
              return [...data.keys()];
            },
          } as unknown as DataTransfer,
        },
        { node: editor.read.children()[2] }
      );

      try {
        expect([
          drop(null, 6, '2', { clientX: -40 }),
          drop(null, 6, '2', { clientX: -90 }),
        ]).toEqual([
          { axis: 'y', edge: 'before', key: keyAt('0') },
          { key: keyAt('0'), side: 'start' },
        ]);
      } finally {
        hosts.get('2')!.ownerDocument.dispatchEvent(new Event('dragend'));
      }
    });

    test('maps the left padding to the end side in a right-to-left block', () => {
      const { drop, hosts, keyAt } = padded();

      hosts.get('0')!.style.direction = 'rtl';

      expect(drop(null, 6, '2', { clientX: -40 })).toEqual({
        key: keyAt('0'),
        side: 'end',
      });
    });
  });

  test('never resolves a side for a copy or a files drop', () => {
    const { drop, editor, hosts, keyAt } = mount(LAYOUT, [besideRoot]);
    const files = editor.api.dom.resolveDropTarget(
      {
        clientX: 390,
        clientY: 8,
        dataTransfer: {
          items: [{ kind: 'file' }],
          types: ['Files'],
        } as unknown as DataTransfer,
        target: hosts.get('0'),
      },
      { files: paragraph('') }
    );

    expect([drop('0', 8, '2', { clientX: 390, copy: true }), files]).toEqual([
      { axis: 'y', edge: 'before', key: keyAt('0') },
      { axis: 'y', edge: 'before', key: keyAt('0') },
    ]);
  });

  test('admits a resting pointer in a refused strip once, not on every dragover', () => {
    let admissions = 0;
    const counting = definePlugin('counting', {
      contributions: [
        transferVeto.of(() => {
          admissions += 1;

          return false;
        }),
      ],
    });
    const { drop } = mount(LAYOUT, [rootOnly, counting]);

    drop('1.0', 50, '2', { clientX: 390 });
    const first = admissions;
    drop('1.0', 50, '2', { clientX: 390 });

    expect(admissions).toBe(first);
  });
});
