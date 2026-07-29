import type { ClipboardEvent } from 'react';
import {
  createEditorRuntime,
  createEditorView,
  defineEditorSchema,
  property,
  schema,
  type Point,
  type RootKey,
} from '@platejs/plite';
import { hostCodecs } from '@platejs/plite-dom';
import {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
  setDOMClipboardFormatKey,
} from '@platejs/plite-dom/internal';
import { describe, expect, it, vi } from 'vitest';

import { applyEditableCut } from '../src/editable/clipboard-input-strategy';
import {
  decodeProjectedClipboardFragment,
  getProjectedViewSelectionSlice,
  writeProjectedViewSelectionClipboardData,
} from '../src/editable/projected-clipboard';
import type { ReactRuntimeEditor } from '../src/plugin/react-editor';
import {
  createPliteProjectionGraph,
  type PliteProjectionOwner,
} from '../src/projection-graph';
import {
  createPliteViewSelection,
  readPliteViewSelection,
  writePliteViewSelection,
} from '../src/view-selection';

const SHARED_ROOT = 'synced-block:shared:body' as RootKey;

const contentRootExtension = defineEditorSchema({
  elements: {
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: {
        blockTone: property.string({ significant: true }),
      },
    },
    section: {
      content: schema.content.not(schema.content.text()),
    },
    'content-card': {
      content: schema.content.open(),
      contentRoots: {
        body: {
          content: schema.content.not(schema.content.text()),
          ownership: 'shared',
        },
      },
      void: 'editable-island',
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
  properties: [
    schema.textProperty('emphasis', property.boolean({ significant: true })),
  ],
  root: { content: schema.content.not(schema.content.text()) },
  unknown: 'preserve',
  version: 1,
});
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
} satisfies PliteProjectionOwner;

const secondSharedOwner = {
  childRoot: SHARED_ROOT,
  ownerPath: [3],
  ownerRoot: 'main',
} satisfies PliteProjectionOwner;

const point = (
  root: RootKey | undefined,
  path: readonly number[],
  offset: number
): Point => ({
  ...(root ? { root } : {}),
  path: [...path],
  offset,
});

const createFixture = (withSignificantProperties = false) => {
  const mainParagraph = withSignificantProperties
    ? paragraph('Before', { blockTone: 'warm', emphasis: true })
    : paragraph('Before');
  const rootParagraph = withSignificantProperties
    ? paragraph('Inside', { blockTone: 'cool', emphasis: true })
    : paragraph('Inside');
  const runtime = createEditorRuntime({
    extensions: [contentRootExtension, projectedHostCodecs],
    initialValue: {
      children: [mainParagraph, contentCard(), paragraph('After')],
      roots: { [SHARED_ROOT]: [rootParagraph, paragraph('More')] },
    },
  });
  const editor = createEditorView(runtime) as unknown as ReactRuntimeEditor;
  const graph = createPliteProjectionGraph([
    { path: [0], root: 'main' },
    { owner: sharedOwner, path: [0], root: SHARED_ROOT },
  ]);

  writePliteViewSelection(
    editor,
    createPliteViewSelection(graph, {
      kind: 'text',
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
  const runtime = createEditorRuntime({
    extensions: [contentRootExtension],
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
  const graph = createPliteProjectionGraph([
    { path: [0], root: 'main' },
    { owner: sharedOwner, path: [0], root: SHARED_ROOT },
    { path: [2], root: 'main' },
    { owner: secondSharedOwner, path: [0], root: SHARED_ROOT },
    { path: [4], root: 'main' },
  ]);

  writePliteViewSelection(
    editor,
    createPliteViewSelection(graph, {
      kind: 'text',
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
  root.setAttribute('data-plite-editor', 'true');
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
  it('serializes projected selection fragments in visible order across roots', () => {
    const { editor } = createFixture();

    expect(getProjectedViewSelectionSlice(editor)).toEqual({
      content: [paragraph('ore'), paragraph('In')],
      openEnd: 1,
      openStart: 1,
    });
  });

  it('serializes projected selections from a root-scoped editor view', () => {
    const runtime = createEditorRuntime({
      extensions: [contentRootExtension],
      initialValue: {
        children: [contentCard()],
        roots: { [SHARED_ROOT]: [paragraph('Inside')] },
      },
    });
    const editor = createEditorView(runtime, {
      root: SHARED_ROOT,
    }) as unknown as ReactRuntimeEditor;
    const graph = createPliteProjectionGraph([
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
      'data-plite-fragment='
    );
    expect(clipboardData.data.get('text/html')).toContain(
      'data-projected-host="true"'
    );
    expect(
      decodePliteFragment(
        clipboardData.data.get('application/x-plite-fragment')!
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

  it('preserves significant element and text properties in projected fragments', () => {
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
        clipboardData.data.get('application/x-plite-fragment')!
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
    expect(clipboardData.data.get('application/x-plite-fragment')).toBe(
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
      'data-plite-fragment-format="x-custom-plite-fragment"'
    );
  });

  it('uses the runtime clipboard format key when projected copy runs from a view editor', () => {
    const { editor } = createFixture();
    const clipboardData = createClipboardData();
    const runtimeEditor = (
      editor as { runtime: { editor: ReactRuntimeEditor } }
    ).runtime.editor;

    setDOMClipboardFormatKey(runtimeEditor, 'x-custom-plite-fragment');

    expect(
      writeProjectedViewSelectionClipboardData(editor, clipboardData)
    ).toBe(true);
    expect(clipboardData.data.get('application/x-plite-fragment')).toBe(
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
      'data-plite-fragment-format="x-custom-plite-fragment"'
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
        clipboardData.data.get('application/x-plite-fragment')!
      )
    ).toEqual({
      content: [paragraph('side'), paragraph('Between'), paragraph('Insi')],
      openEnd: 1,
      openStart: 1,
    });
  });

  it('keeps nested owned roots attached to projected slice segments', () => {
    const nestedRoot = 'card:nested' as RootKey;
    const runtime = createEditorRuntime({
      extensions: [contentRootExtension],
      initialValue: {
        children: [contentCard()],
        roots: {
          [SHARED_ROOT]: [contentOwner(nestedRoot), paragraph('Tail')],
          [nestedRoot]: [paragraph('Nested')],
        },
      },
    });
    const editor = createEditorView(runtime) as unknown as ReactRuntimeEditor;
    const graph = createPliteProjectionGraph([
      { owner: sharedOwner, path: [0], root: SHARED_ROOT },
      { owner: sharedOwner, path: [1], root: SHARED_ROOT },
    ]);

    writePliteViewSelection(
      editor,
      createPliteViewSelection(graph, {
        kind: 'text',
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
    const runtime = createEditorRuntime({
      extensions: [contentRootExtension],
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
    const graph = createPliteProjectionGraph([{ path: [0], root: 'main' }]);

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
    const target = createEditorRuntime({
      extensions: [contentRootExtension],
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
