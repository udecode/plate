import {
  defineEditorSchema,
  type Descendant,
  type Element as EditorElement,
  schema,
} from 'plitejs';

import {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
} from '../../src/dom/internal';
import {
  getNodeKey as editorGetNodeKey,
  replace as editorReplace,
} from '../../src/internal';
import { createEditor } from '../../src/react';
import { EditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';
import type { ReactRuntimeEditor } from '../../src/react/plugin/react-editor';

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

const mount = (layout = LAYOUT) => {
  const editor = createEditor({ plugins: [quoteSchema] }) as ReactRuntimeEditor;

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

  return { drop, dropFiles, editor, keyAt, runtime };
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
    // The handle's gutter sits outside the block's host, so it hits the
    // container's host at the block's height.
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
