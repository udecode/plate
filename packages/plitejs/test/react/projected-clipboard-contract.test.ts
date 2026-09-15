import {
  ContentSlice,
  createEditor,
  createEditorView,
  defineEditorSchema,
  property,
  schema,
  type Point,
  type RootKey,
} from 'plitejs';
import { hostCodecs } from 'plitejs/dom';
import type { ClipboardEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
  setDOMClipboardFormatKey,
} from '../../src/dom/internal';
import { getEditorRuntimeOwner } from '../../src/internal';
import { applyEditableCut } from '../../src/react/editable/clipboard-input-strategy';
import {
  decodeProjectedClipboardFragment,
  getProjectedViewSelectionSlice,
  remapProjectedSourceSlice,
  writeProjectedViewSelectionClipboardData,
} from '../../src/react/editable/projected-clipboard';
import type { ReactRuntimeEditor } from '../../src/react/plugin/react-editor';
import {
  createPliteViewBoundaryGraph,
  type PliteViewBoundaryOwner,
} from '../../src/react/view-boundary-graph';
import {
  createPliteViewSelection,
  readPliteViewSelection,
  writePliteViewSelection,
} from '../../src/react/view-selection';

const SHARED_ROOT = 'synced-block:shared:body' as RootKey;

const contentRootPlugin = defineEditorSchema(
  'schema:projected-clipboard-test',
  {
    elements: {
      paragraph: schema.element.textBlock({
        properties: {
          blockTone: property.string(),
        },
      }),
      section: {
        content: schema.content.not(schema.content.text()),
      },
      'content-card': {
        contentRoots: {
          body: {
            content: schema.content.not(schema.content.text()),
            ownership: 'shared',
          },
        },
        void: 'block',
      },
      'content-owner': {
        content: schema.content.text({ default: 'text', min: 1 }),
        contentRoots: {
          body: {
            content: schema.content.not(schema.content.text()),
            ownership: 'shared',
          },
        },
      },
    },
    id: 'projected-clipboard-test',
    properties: [schema.textProperty('emphasis', property.boolean())],
    root: schema.content.not(schema.content.text()),
    unknown: 'preserve',
    version: 1,
  }
);
const projectedHostCodecs = hostCodecs('projected-clipboard-host', [
  {
    format: 'text/html',
    key: 'projected-html',
    serialize: () => '<article data-projected-host="true">host</article>',
  },
]);

const paragraph = (
  text: string,
  properties: Readonly<{ blockTone?: string; emphasis?: boolean }> = {}
) => ({
  ...(properties.blockTone ? { blockTone: properties.blockTone } : {}),
  type: 'paragraph',
  children: [
    {
      ...(properties.emphasis ? { emphasis: true } : {}),
      text,
    },
  ],
});

const contentCard = (bodyRoot = SHARED_ROOT) => ({
  type: 'content-card',
  childRoots: { body: bodyRoot },
  children: [{ text: '' }],
});

const contentOwner = (bodyRoot: RootKey) => ({
  type: 'content-owner',
  childRoots: { body: bodyRoot },
  children: [{ text: 'Owner' }],
});

const sharedOwner = {
  childRoot: SHARED_ROOT,
  ownerPath: [1],
  ownerRoot: 'main',
} satisfies PliteViewBoundaryOwner;

const secondSharedOwner = {
  childRoot: SHARED_ROOT,
  ownerPath: [3],
  ownerRoot: 'main',
} satisfies PliteViewBoundaryOwner;

const point = (
  root: RootKey | undefined,
  path: readonly number[],
  offset: number
): Point => ({
  ...(root ? { root } : {}),
  path: [...path],
  offset,
});

const createFixture = (
  withSignificantProperties = false,
  unrelatedBlocks = 0
) => {
  const mainParagraph = withSignificantProperties
    ? paragraph('Before', { blockTone: 'warm', emphasis: true })
    : paragraph('Before');
  const rootParagraph = withSignificantProperties
    ? paragraph('Inside', { blockTone: 'cool', emphasis: true })
    : paragraph('Inside');
  const runtime = createEditor({
    plugins: [contentRootPlugin, projectedHostCodecs],
    initialValue: {
      children: [
        mainParagraph,
        contentCard(),
        paragraph('After'),
        ...Array.from({ length: unrelatedBlocks }, () =>
          paragraph('Unrelated')
        ),
      ],
      roots: { [SHARED_ROOT]: [rootParagraph, paragraph('More')] },
    },
  });
  const editor = createEditorView(runtime) as unknown as ReactRuntimeEditor;
  const graph = createPliteViewBoundaryGraph([
    { path: [0], root: 'main' },
    { owner: sharedOwner, path: [0], root: SHARED_ROOT },
  ]);

  writePliteViewSelection(
    editor,
    createPliteViewSelection(graph, {
      anchor: { point: point(undefined, [0, 0], 'Bef'.length) },
      focus: {
        owner: sharedOwner,
        point: point(SHARED_ROOT, [0, 0], 'In'.length),
      },
    })
  );

  return { editor };
};

const createRepeatedFixture = () => {
  const runtime = createEditor({
    plugins: [contentRootPlugin],
    initialValue: {
      children: [
        paragraph('First'),
        contentCard(),
        paragraph('Between'),
        contentCard(),
        paragraph('Last'),
      ],
      roots: { [SHARED_ROOT]: [paragraph('Inside')] },
    },
  });
  const editor = createEditorView(runtime) as unknown as ReactRuntimeEditor;
  const graph = createPliteViewBoundaryGraph([
    { path: [0], root: 'main' },
    { owner: sharedOwner, path: [0], root: SHARED_ROOT },
    { path: [2], root: 'main' },
    { owner: secondSharedOwner, path: [0], root: SHARED_ROOT },
    { path: [4], root: 'main' },
  ]);

  writePliteViewSelection(
    editor,
    createPliteViewSelection(graph, {
      anchor: {
        owner: sharedOwner,
        point: point(SHARED_ROOT, [0, 0], 'In'.length),
      },
      focus: {
        owner: secondSharedOwner,
        point: point(SHARED_ROOT, [0, 0], 'Insi'.length),
      },
    })
  );

  return { editor };
};

const createClipboardData = () => {
  const data = new Map<string, string>();

  return {
    data,
    getData: (type: string) => data.get(type) ?? '',
    setData: (type: string, value: string) => {
      data.set(type, value);
    },
  };
};

const mountEditorRoot = (editor: ReactRuntimeEditor) => {
  const root = document.createElement('div');

  root.setAttribute('contenteditable', 'true');
  root.setAttribute('data-editor', 'true');
  Object.defineProperty(root, 'isContentEditable', {
    configurable: true,
    value: true,
  });
  document.body.append(root);

  EDITOR_TO_ELEMENT.set(editor, root);
  EDITOR_TO_WINDOW.set(editor, window);
  ELEMENT_TO_NODE.set(root, editor);
  NODE_TO_ELEMENT.set(editor, root);

  return root;
};

const cleanupEditorRoot = (editor: ReactRuntimeEditor, root: HTMLElement) => {
  EDITOR_TO_ELEMENT.delete(editor);
  EDITOR_TO_WINDOW.delete(editor);
  ELEMENT_TO_NODE.delete(root);
  NODE_TO_ELEMENT.delete(editor);
  root.remove();
};

const createClipboardEvent = (
  target: EventTarget,
  clipboardData: ReturnType<typeof createClipboardData>
) =>
  ({
    clipboardData,
    nativeEvent: { clipboardData },
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    target,
  }) as unknown as ClipboardEvent<HTMLDivElement>;

const decodePliteFragment = (encoded: string) => {
  const envelope = JSON.parse(decodeURIComponent(globalThis.atob(encoded)));

  expect(envelope.version).toBe(1);

  return envelope.slice;
};

describe('projected clipboard', () => {
  it('namespaces colliding root graphs by exact source and keeps aliases shared', () => {
    const runtime = createEditor({
      plugins: [contentRootPlugin],
      initialValue: { children: [paragraph('Current')] },
    });
    const editor = createEditorView(runtime) as unknown as ReactRuntimeEditor;
    const reserved = new Set<string>();
    const firstNames = new Map<string, string>();
    const secondNames = new Map<string, string>();
    const first = ContentSlice.fromJSON({
      content: [contentOwner(SHARED_ROOT), contentOwner(SHARED_ROOT)],
      openEnd: 0,
      openStart: 0,
      roots: {
        [SHARED_ROOT]: [contentOwner(SHARED_ROOT), paragraph('First')],
      },
    });
    const second = ContentSlice.fromJSON({
      content: [contentOwner(SHARED_ROOT)],
      openEnd: 0,
      openStart: 0,
      roots: { [SHARED_ROOT]: [paragraph('Second')] },
    });
    const firstResult = remapProjectedSourceSlice(
      editor,
      first,
      firstNames,
      reserved
    );
    const repeatedFirst = remapProjectedSourceSlice(
      editor,
      first,
      firstNames,
      reserved
    );
    const secondResult = remapProjectedSourceSlice(
      editor,
      second,
      secondNames,
      reserved
    );

    expect(firstResult?.content).toMatchObject([
      { childRoots: { body: SHARED_ROOT } },
      { childRoots: { body: SHARED_ROOT } },
    ]);
    expect(firstResult?.roots[SHARED_ROOT]?.[0]).toMatchObject({
      childRoots: { body: SHARED_ROOT },
    });
    expect(repeatedFirst?.roots).toEqual(firstResult?.roots);
    expect(secondResult?.content).toMatchObject([
      { childRoots: { body: `${SHARED_ROOT}:projection` } },
    ]);
    expect(secondResult?.roots[`${SHARED_ROOT}:projection`]).toEqual([
      paragraph('Second'),
    ]);
    expect(
      remapProjectedSourceSlice(
        editor,
        ContentSlice.closed([contentOwner(SHARED_ROOT)]),
        new Map(),
        new Set()
      )
    ).toBeNull();
  });

  it('reads a projected slice without revalidating immutable document arrays', () => {
    const { editor } = createFixture(false, 128);
    const before = editor.read.value();
    const roots = new Map<object, object>();
    let propertyReads = 0;
    for (const children of [
      before.children,
      ...Object.values(before.roots ?? {}),
    ]) {
      roots.set(
        children,
        new Proxy(children, {
          getOwnPropertyDescriptor(target, key) {
            propertyReads += 1;
            return Reflect.getOwnPropertyDescriptor(target, key);
          },
        })
      );
    }
    const { isFrozen } = Object;
    Object.isFrozen = (value) => isFrozen(roots.get(value) ?? value);
    let slice;
    try {
      slice = getProjectedViewSelectionSlice(editor);
      expect(editor.read.value()).toEqual(before);
    } finally {
      Object.isFrozen = isFrozen;
    }
    expect(slice).toEqual({
      content: [paragraph('ore'), paragraph('In')],
      openEnd: 1,
      openStart: 1,
    });
    editor.update((tx) =>
      tx.text.insert('!', { at: { path: [0, 0], offset: 4 } })
    );
    expect(getProjectedViewSelectionSlice(editor)?.content).toEqual([
      paragraph('o!re'),
      paragraph('In'),
    ]);
    expect(before.children[0]).toEqual(paragraph('Before'));
    expect(slice?.content).toEqual([paragraph('ore'), paragraph('In')]);
    expect(propertyReads).toBe(0);
  });

  it('serializes projected selection fragments in visible order across roots', () => {
    const { editor } = createFixture();

    expect(getProjectedViewSelectionSlice(editor)).toEqual({
      content: [paragraph('ore'), paragraph('In')],
      openEnd: 1,
      openStart: 1,
    });
  });

  it('serializes projected selections from a root-scoped editor view', () => {
    const runtime = createEditor({
      plugins: [contentRootPlugin],
      initialValue: {
        children: [contentCard()],
        roots: { [SHARED_ROOT]: [paragraph('Inside')] },
      },
    });
    const editor = createEditorView(runtime, {
      root: SHARED_ROOT,
    }) as unknown as ReactRuntimeEditor;
    const graph = createPliteViewBoundaryGraph([
      { path: [0], root: SHARED_ROOT },
    ]);

    writePliteViewSelection(
      editor,
      createPliteViewSelection(graph, {
        anchor: { point: point(SHARED_ROOT, [0, 0], 0) },
        focus: { point: point(SHARED_ROOT, [0, 0], 'Inside'.length) },
      })
    );

    expect(getProjectedViewSelectionSlice(editor)).toEqual({
      content: [paragraph('Inside')],
      openEnd: 1,
      openStart: 1,
    });
    const clipboardData = createClipboardData();

    expect(
      writeProjectedViewSelectionClipboardData(editor, clipboardData)
    ).toBe(true);
    expect(clipboardData.data.get('text/plain')).toBe('Inside');
  });

  it('writes plain text, html, and Plite fragment data from the projected model selection', () => {
    const { editor } = createFixture();
    const clipboardData = createClipboardData();

    expect(
      writeProjectedViewSelectionClipboardData(editor, clipboardData)
    ).toBe(true);
    expect(clipboardData.data.get('text/plain')).toBe('ore\nIn');
    expect(clipboardData.data.get('text/html')).toContain(
      'data-editor-fragment='
    );
    expect(clipboardData.data.get('text/html')).toContain(
      'data-projected-host="true"'
    );
    expect(
      decodePliteFragment(
        clipboardData.data.get('application/x-editor-fragment')!
      )
    ).toEqual({
      content: [paragraph('ore'), paragraph('In')],
      openEnd: 1,
      openStart: 1,
    });
    const root = mountEditorRoot(editor);

    try {
      expect(decodeProjectedClipboardFragment(editor, clipboardData)).toEqual({
        content: [paragraph('ore'), paragraph('In')],
        openEnd: 1,
        openStart: 1,
      });
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  it('preserves content element and text properties in projected fragments', () => {
    const { editor } = createFixture(true);
    const clipboardData = createClipboardData();
    const expected = {
      content: [
        paragraph('ore', { blockTone: 'warm', emphasis: true }),
        paragraph('In', { blockTone: 'cool', emphasis: true }),
      ],
      openEnd: 1,
      openStart: 1,
    };

    expect(
      writeProjectedViewSelectionClipboardData(editor, clipboardData)
    ).toBe(true);
    expect(
      decodePliteFragment(
        clipboardData.data.get('application/x-editor-fragment')!
      )
    ).toEqual(expected);
  });

  it('uses the editor clipboard format key for projected Plite fragment data', () => {
    const { editor } = createFixture();
    const clipboardData = createClipboardData();

    setDOMClipboardFormatKey(editor, 'x-custom-plite-fragment');

    expect(
      writeProjectedViewSelectionClipboardData(editor, clipboardData)
    ).toBe(true);
    expect(clipboardData.data.get('application/x-editor-fragment')).toBe(
      undefined
    );
    expect(
      decodePliteFragment(
        clipboardData.data.get('application/x-custom-plite-fragment')!
      )
    ).toEqual({
      content: [paragraph('ore'), paragraph('In')],
      openEnd: 1,
      openStart: 1,
    });
    expect(clipboardData.data.get('text/html')).toContain(
      'data-editor-fragment-format="x-custom-plite-fragment"'
    );
  });

  it('uses the runtime clipboard format key when projected copy runs from a view editor', () => {
    const { editor } = createFixture();
    const clipboardData = createClipboardData();
    const runtimeEditor = getEditorRuntimeOwner(editor) as ReactRuntimeEditor;

    setDOMClipboardFormatKey(runtimeEditor, 'x-custom-plite-fragment');

    expect(
      writeProjectedViewSelectionClipboardData(editor, clipboardData)
    ).toBe(true);
    expect(clipboardData.data.get('application/x-editor-fragment')).toBe(
      undefined
    );
    expect(
      decodePliteFragment(
        clipboardData.data.get('application/x-custom-plite-fragment')!
      )
    ).toEqual({
      content: [paragraph('ore'), paragraph('In')],
      openEnd: 1,
      openStart: 1,
    });
    expect(clipboardData.data.get('text/html')).toContain(
      'data-editor-fragment-format="x-custom-plite-fragment"'
    );
  });

  it('serializes repeated content-root owners as visible clipboard fragments', () => {
    const { editor } = createRepeatedFixture();
    const clipboardData = createClipboardData();

    expect(getProjectedViewSelectionSlice(editor)).toEqual({
      content: [paragraph('side'), paragraph('Between'), paragraph('Insi')],
      openEnd: 1,
      openStart: 1,
    });
    expect(
      writeProjectedViewSelectionClipboardData(editor, clipboardData)
    ).toBe(true);
    expect(clipboardData.data.get('text/plain')).toBe('side\nBetween\nInsi');
    expect(
      decodePliteFragment(
        clipboardData.data.get('application/x-editor-fragment')!
      )
    ).toEqual({
      content: [paragraph('side'), paragraph('Between'), paragraph('Insi')],
      openEnd: 1,
      openStart: 1,
    });
  });

  it('keeps nested owned roots attached to projected slice segments', () => {
    const nestedRoot = 'card:nested' as RootKey;
    const runtime = createEditor({
      plugins: [contentRootPlugin],
      initialValue: {
        children: [contentCard()],
        roots: {
          [SHARED_ROOT]: [contentOwner(nestedRoot), paragraph('Tail')],
          [nestedRoot]: [paragraph('Nested')],
        },
      },
    });
    const editor = createEditorView(runtime) as unknown as ReactRuntimeEditor;
    const graph = createPliteViewBoundaryGraph([
      { owner: sharedOwner, path: [0], root: SHARED_ROOT },
      { owner: sharedOwner, path: [1], root: SHARED_ROOT },
    ]);

    writePliteViewSelection(
      editor,
      createPliteViewSelection(graph, {
        anchor: {
          owner: sharedOwner,
          point: point(SHARED_ROOT, [0, 0], 0),
        },
        focus: {
          owner: sharedOwner,
          point: point(SHARED_ROOT, [1, 0], 1),
        },
      })
    );

    expect(getProjectedViewSelectionSlice(editor)?.roots).toEqual({
      [nestedRoot]: [paragraph('Nested')],
    });
  });

  it('preserves nested open edges through projected copy and paste', () => {
    const runtime = createEditor({
      plugins: [contentRootPlugin],
      initialValue: {
        children: [
          {
            type: 'section',
            children: [paragraph('abc')],
          },
        ],
      },
    });
    const editor = createEditorView(runtime) as unknown as ReactRuntimeEditor;
    const graph = createPliteViewBoundaryGraph([{ path: [0], root: 'main' }]);

    writePliteViewSelection(
      editor,
      createPliteViewSelection(graph, {
        anchor: { point: point(undefined, [0, 0, 0], 1) },
        focus: { point: point(undefined, [0, 0, 0], 2) },
      })
    );
    const clipboardData = createClipboardData();

    expect(
      writeProjectedViewSelectionClipboardData(editor, clipboardData)
    ).toBe(true);
    const slice = decodeProjectedClipboardFragment(editor, clipboardData);

    expect(slice).toEqual({
      content: [
        {
          type: 'section',
          children: [paragraph('b')],
        },
      ],
      openEnd: 2,
      openStart: 2,
    });
    const target = createEditor({
      plugins: [contentRootPlugin],
      initialValue: { children: [paragraph('x')] },
    });
    let applied = false;

    target.update((tx) => {
      applied = tx.slice.replace(slice!, {
        at: { offset: 1, path: [0, 0] },
      });
    });

    expect(applied).toBe(true);
    expect(target.read((state) => state.children())).toEqual([paragraph('xb')]);
  });

  it('does not cut repeated content-root owners that cannot be deleted as one model mutation', () => {
    const { editor } = createRepeatedFixture();
    const clipboardData = createClipboardData();
    const root = mountEditorRoot(editor);
    const event = createClipboardEvent(root, clipboardData);

    try {
      const beforeValue = structuredClone(
        editor.read((state) => state.value())
      );
      const beforeSelection = readPliteViewSelection(editor);

      expect(beforeSelection).not.toBe(null);

      const result = applyEditableCut({
        editor,
        event,
        readOnly: false,
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(result.command).toBe(null);
      expect(clipboardData.data.size).toBe(0);
      expect(editor.read((state) => state.value())).toEqual(beforeValue);
      expect(readPliteViewSelection(editor)).toEqual(beforeSelection);
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });
});
