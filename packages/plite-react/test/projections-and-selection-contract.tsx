import {
  createEditorView,
  createEditor as createBaseEditor,
  type Descendant,
  defineEditorSchema,
  NodeApi,
  type Path,
  schema,
  TextApi,
} from '@platejs/plite';
import {
  getPathByNodeKey as editorGetPathByNodeKey,
  getNodeKey as editorGetNodeKey,
  getSnapshot as editorGetSnapshot,
  replace as editorReplace,
} from '@platejs/plite/internal';
import { act, type RenderResult, render } from '@testing-library/react';
import { createContext, type ReactNode, useContext } from 'react';

import {
  createReactEditor,
  Editable,
  type ReactEditor,
  Plite,
  type PliteDecorationSource,
  type PliteProjection,
  type PliteProjectionSource,
  useDecorationSelector,
  usePliteProjectionEntries,
} from '../src';
import {
  toPliteRangeDecorations,
  createDecorationSource,
  createRangeDecorationSource,
} from '../src/decoration-source';
import {
  createEditableInputController,
  createEditableInputControllerState,
  type EditableRepairRequest,
} from '../src/editable/input-controller';
import { useProjectionDOMRepairBridge } from '../src/editable/projection-repair-bridge';
import { ProjectionContext } from '../src/projection-context';
import {
  createPliteProjectionStore,
  type PliteProjectionRefreshListener,
} from '../src/projection-store';

type SegmentLike = {
  end: number;
  slices: readonly { data?: Record<string, unknown> }[];
  start: number;
  text: string;
};

type RenderedProjectionEditor = RenderResult & {
  store: PliteDecorationSource<Record<string, unknown>>;
};

const LeafRenderContext = createContext('leaf');

const inlineLinkSchema = defineEditorSchema(
  'schema:inline-decoration-boundary',
  {
    elements: {
      link: {
        content: schema.content.text({ default: 'text', min: 1 }),
        inline: true,
      },
    },
    id: 'inline-decoration-boundary',
    root: schema.content.not(schema.content.text()),
    unknown: 'preserve',
    version: 1,
  }
);

const HookedLeaf = ({
  attributes,
  children,
}: {
  attributes: Record<string, unknown>;
  children: ReactNode;
}) => {
  const label = useContext(LeafRenderContext);

  return (
    <span {...attributes} data-hooked-leaf={label}>
      {children}
    </span>
  );
};

const createEditor = () => createReactEditor(createBaseEditor());

const renderSegment = (segment: SegmentLike, children: ReactNode) => {
  const decorations = segment.slices
    .flatMap((slice) => Object.keys(slice.data ?? {}))
    .sort();

  return (
    <span
      data-decorations={JSON.stringify(decorations)}
      data-segment={JSON.stringify({
        end: segment.end,
        start: segment.start,
        text: segment.text,
      })}
    >
      {children}
    </span>
  );
};

const getProjectedSegments = (
  container: HTMLElement
): { text: string; decorations: string[] }[] =>
  Array.from(container.querySelectorAll('[data-decorations]')).map(
    (segment) => ({
      decorations: JSON.parse(
        (segment as HTMLElement).dataset.decorations ?? '[]'
      ),
      text: segment.textContent ?? '',
    })
  );

const getProjectedSegmentMetadata = (
  container: HTMLElement
): { end: number; start: number; text: string; decorations: string[] }[] =>
  Array.from(container.querySelectorAll('[data-decorations]')).map(
    (segment) => ({
      ...JSON.parse((segment as HTMLElement).dataset.segment ?? '{}'),
      decorations: JSON.parse(
        (segment as HTMLElement).dataset.decorations ?? '[]'
      ),
    })
  );

const renderProjectedEditor = (
  editor: ReactEditor,
  children: Descendant[],
  source: PliteProjectionSource<Record<string, unknown>>
): RenderedProjectionEditor => {
  editorReplace(editor, {
    children,
    selection: null,
  });

  const store = createDecorationSource(editor, {
    id: 'test-source',
    read: ({ snapshot }) => source(snapshot),
  });
  const rendered = render(
    <Plite decorationSources={[store]} editor={editor}>
      <Editable renderSegment={renderSegment} />
    </Plite>
  );

  return { ...rendered, store };
};

const findTextRangesByText = (
  nodes: readonly Descendant[],
  text: string,
  parentPath: Path = []
): PliteProjection<Record<string, unknown>>[] =>
  nodes.flatMap((node, index) => {
    const path = [...parentPath, index] as Path;

    if (TextApi.isText(node)) {
      return node.text === text
        ? [
            {
              data: { bold: true },
              key: `text:${path.join('.')}`,
              range: {
                kind: 'text',
                anchor: { path, offset: 0 },
                focus: { path, offset: node.text.length },
              },
            },
          ]
        : [];
    }

    return findTextRangesByText(node.children, text, path);
  });

describe('plite-react projections and selection contract', () => {
  test('preserves legacy decorated-range data in projection slices', () => {
    const range = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
      search_highlight: true,
    };

    expect(
      toPliteRangeDecorations([range], { id: 'legacy-decoration' })
    ).toEqual([
      {
        data: { search_highlight: true },
        key: 'legacy-decoration:0.0:0:0.0:4:0',
        range: {
          anchor: range.anchor,
          focus: range.focus,
        },
      },
    ]);
  });

  test('projection refresh bridge forces a render before exporting projection selection', () => {
    const inputController = createEditableInputController({
      preferModelSelectionForInputRef: { current: false },
      state: createEditableInputControllerState(),
    });
    const requests: EditableRepairRequest[] = [];
    let refreshListener: PliteProjectionRefreshListener | null = null;
    const store = {
      getSnapshot: () => ({}),
      subscribe: () => () => {},
      subscribeProjectionRefresh: (
        listener: PliteProjectionRefreshListener
      ) => {
        refreshListener = listener;
        return () => {
          refreshListener = null;
        };
      },
    };
    const Harness = () => {
      useProjectionDOMRepairBridge({
        inputController,
        requestEditableRepair: (request) => {
          requests.push(request);
        },
      });

      return null;
    };

    render(
      <ProjectionContext value={store}>
        <Harness />
      </ProjectionContext>
    );

    act(() => {
      refreshListener?.({
        changedNodeKeys: ['runtime:a'],
        didChange: true,
        reason: 'external',
        requiresDOMSelectionExport: true,
      });
    });

    expect(requests).toEqual([
      {
        forceRender: true,
        kind: 'force-render',
        selectionSourceTransition: {
          preferModelSelection: true,
          reason: 'projection-refresh',
          selectionSource: 'model-owned',
        },
      },
    ]);
  });

  test('registers product-noun decoration sources without a projectionStore prop', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          children: [
            { fixtureLeaf: 'hello', text: 'Hello' },
            { fixtureLeaf: 'world', text: 'world' },
          ],
        },
      ],
      selection: null,
    });

    const search = createDecorationSource(editor, {
      id: 'search',
      read: ({ snapshot }) =>
        findTextRangesByText(snapshot.children, 'Hello').map((projection) => ({
          ...projection,
          data: { search: true },
          key: `search:${projection.key}`,
        })),
    });
    const spelling = createDecorationSource(editor, {
      id: 'spelling',
      read: ({ snapshot }) =>
        findTextRangesByText(snapshot.children, 'world').map((projection) => ({
          ...projection,
          data: { spelling: true },
          key: `spelling:${projection.key}`,
        })),
    });

    const rendered = render(
      <Plite decorationSources={[search, spelling]} editor={editor}>
        <Editable renderSegment={renderSegment} />
      </Plite>
    );

    expect(getProjectedSegments(rendered.container)).toEqual([
      { text: 'Hello', decorations: ['search'] },
      { text: 'world', decorations: ['spelling'] },
    ]);

    search.destroy();
    spelling.destroy();
  });

  test('creates decoration sources from plain ranges', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          children: [{ text: 'Hello world' }],
        },
      ],
      selection: null,
    });

    const source = createRangeDecorationSource(editor, {
      data: { search: true },
      id: 'range-search',
      read: ({ snapshot }) =>
        NodeApi.findTextRanges({ children: snapshot.children }, 'world'),
    });

    const rendered = render(
      <Plite decorationSources={[source]} editor={editor}>
        <Editable renderSegment={renderSegment} />
      </Plite>
    );

    expect(getProjectedSegments(rendered.container)).toEqual([
      { text: 'Hello ', decorations: [] },
      { text: 'world', decorations: ['search'] },
    ]);

    source.destroy();
  });

  test('supports simple Editable decorate ranges without a decoration source', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [{ children: [{ text: 'Hello world!' }] }],
      selection: null,
    });

    const rendered = render(
      <Plite editor={editor}>
        <Editable
          decorate={([node, path]) =>
            TextApi.isText(node) && node.text.startsWith('Hello')
              ? [
                  {
                    data: { search: true },
                    range: {
                      kind: 'text',
                      anchor: { path, offset: 0 },
                      focus: { path, offset: 5 },
                    },
                  },
                ]
              : []
          }
          renderSegment={renderSegment}
        />
      </Plite>
    );

    expect(getProjectedSegments(rendered.container)).toEqual([
      { text: 'Hello', decorations: ['search'] },
      { text: ' world!', decorations: [] },
    ]);
  });

  test('refreshDecorations refreshes stable Editable decorate output', async () => {
    const editor = createEditor();
    let highlighted = false;

    editorReplace(editor, {
      children: [{ children: [{ text: 'Hello world!' }] }],
      selection: null,
    });

    const rendered = render(
      <Plite editor={editor}>
        <Editable
          decorate={([node, path]) =>
            highlighted && TextApi.isText(node)
              ? [
                  {
                    data: { external: true },
                    range: {
                      kind: 'text',
                      anchor: { path, offset: 0 },
                      focus: { path, offset: 5 },
                    },
                  },
                ]
              : []
          }
          renderSegment={renderSegment}
        />
      </Plite>
    );

    expect(getProjectedSegments(rendered.container)).toEqual([
      { text: 'Hello world!', decorations: [] },
    ]);

    highlighted = true;

    await act(async () => {
      editor.api.react.refreshDecorations();
    });

    expect(getProjectedSegments(rendered.container)).toEqual([
      { text: 'Hello', decorations: ['external'] },
      { text: ' world!', decorations: [] },
    ]);
  });

  test('isolates renderLeaf hooks when decoration segments change', async () => {
    const editor = createEditor();
    let highlighted = false;

    editorReplace(editor, {
      children: [{ children: [{ text: 'Hello world!' }] }],
      selection: null,
    });

    const rendered = render(
      <Plite editor={editor}>
        <Editable
          decorate={([node, path]) =>
            highlighted && TextApi.isText(node)
              ? [
                  {
                    data: { search: true },
                    range: {
                      kind: 'text',
                      anchor: { path, offset: 0 },
                      focus: { path, offset: 5 },
                    },
                  },
                ]
              : []
          }
          renderLeaf={HookedLeaf}
        />
      </Plite>
    );

    expect(
      rendered.container.querySelectorAll('[data-hooked-leaf]')
    ).toHaveLength(1);

    highlighted = true;

    await act(async () => {
      editor.api.react.refreshDecorations();
    });

    expect(
      rendered.container.querySelectorAll('[data-hooked-leaf]')
    ).toHaveLength(2);
  });

  test('projects decorations across inline element boundaries', () => {
    const editor = createEditor();

    editor.install(inlineLinkSchema);
    editorReplace(editor, {
      children: [
        {
          children: [
            {
              type: 'link',
              url: '#',
              children: [{ text: 'abc' }],
            },
            { text: 'def' },
          ],
        },
      ],
      selection: null,
    });

    const rendered = render(
      <Plite editor={editor}>
        <Editable
          decorate={([node, path]) => {
            if (!TextApi.isText(node)) {
              return [];
            }

            if (node.text === 'abc') {
              return [
                {
                  data: { search: true },
                  range: {
                    kind: 'text',
                    anchor: { path, offset: 2 },
                    focus: { path, offset: 3 },
                  },
                },
              ];
            }

            if (node.text === 'def') {
              return [
                {
                  data: { search: true },
                  range: {
                    kind: 'text',
                    anchor: { path, offset: 0 },
                    focus: { path, offset: 2 },
                  },
                },
              ];
            }

            return [];
          }}
          renderElement={({ attributes, children, element }) =>
            'type' in element && element.type === 'link' ? (
              <a {...attributes}>{children}</a>
            ) : (
              <p {...attributes}>{children}</p>
            )
          }
          renderSegment={renderSegment}
        />
      </Plite>
    );

    expect(getProjectedSegmentMetadata(rendered.container)).toEqual([
      { text: 'ab', start: 0, end: 2, decorations: [] },
      { text: 'c', start: 2, end: 3, decorations: ['search'] },
      { text: 'de', start: 0, end: 2, decorations: ['search'] },
      { text: 'f', start: 2, end: 3, decorations: [] },
    ]);
    expect(
      Array.from(
        rendered.container.querySelectorAll('a [data-decorations]')
      ).filter(
        (segment) =>
          (segment as HTMLElement).dataset.decorations === '["search"]'
      )
    ).toHaveLength(1);
  });

  test('keeps overlapping inline payloads multiplicity-safe in one text node', () => {
    const editor = createEditor();
    const rendered = renderProjectedEditor(
      editor,
      [{ children: [{ text: 'Hello world!' }] }],
      () => [
        {
          data: { bold: true },
          key: 'bold',
          range: {
            kind: 'text',
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 11 },
          },
        },
        {
          data: { italic: true },
          key: 'italic',
          range: {
            kind: 'text',
            anchor: { path: [0, 0], offset: 6 },
            focus: { path: [0, 0], offset: 12 },
          },
        },
      ]
    );

    expect(getProjectedSegments(rendered.container)).toEqual([
      { text: 'Hello ', decorations: ['bold'] },
      { text: 'world', decorations: ['bold', 'italic'] },
      { text: '!', decorations: ['italic'] },
    ]);

    rendered.store.destroy();
  });

  test('renders collapsed projection slices at interior text offsets', () => {
    const editor = createEditor();
    const rendered = renderProjectedEditor(
      editor,
      [{ children: [{ text: 'abcdef' }] }],
      () => [
        {
          data: { widget: true },
          key: 'widget',
          range: {
            kind: 'text',
            anchor: { path: [0, 0], offset: 3 },
            focus: { path: [0, 0], offset: 3 },
          },
        },
      ]
    );

    expect(getProjectedSegmentMetadata(rendered.container)).toEqual([
      { decorations: [], end: 3, start: 0, text: 'abc' },
      { decorations: ['widget'], end: 3, start: 3, text: '' },
      { decorations: [], end: 6, start: 3, text: 'def' },
    ]);

    rendered.store.destroy();
  });

  test('renderLeaf receives text marks and overlapping projection metadata without flattening', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [{ children: [{ bold: true, text: 'Hello world!' }] }],
      selection: null,
    });

    const store = createDecorationSource(editor, {
      id: 'leaf-metadata',
      read: () => [
        {
          data: { comment: true },
          key: 'comment',
          range: {
            kind: 'text',
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 11 },
          },
        },
        {
          data: { spelling: true },
          key: 'spelling',
          range: {
            kind: 'text',
            anchor: { path: [0, 0], offset: 6 },
            focus: { path: [0, 0], offset: 12 },
          },
        },
      ],
    });

    const rendered = render(
      <Plite decorationSources={[store]} editor={editor}>
        <Editable
          renderLeaf={({ children, leaf, leafPosition, segment }) => {
            if (!leafPosition) {
              throw new Error('Projected leaves require a leaf position.');
            }
            const payloads = segment.slices
              .flatMap((slice) =>
                Object.keys(
                  (slice.data as Record<string, unknown> | undefined) ?? {}
                )
              )
              .sort();

            return (
              <span
                data-leaf={JSON.stringify({
                  bold: Boolean((leaf as { bold?: boolean }).bold),
                  end: leafPosition.end,
                  payloads,
                  start: leafPosition.start,
                })}
              >
                {children}
              </span>
            );
          }}
        />
      </Plite>
    );

    expect(
      Array.from(rendered.container.querySelectorAll('[data-leaf]')).map(
        (leaf) => JSON.parse((leaf as HTMLElement).dataset.leaf ?? '{}')
      )
    ).toEqual([
      {
        bold: true,
        end: 6,
        payloads: ['comment'],
        start: 0,
      },
      {
        bold: true,
        end: 11,
        payloads: ['comment', 'spelling'],
        start: 6,
      },
      {
        bold: true,
        end: 12,
        payloads: ['spelling'],
        start: 11,
      },
    ]);

    store.destroy();
  });

  test('projects editor-owned ranges across adjacent text nodes', () => {
    const editor = createEditor();
    const rendered = renderProjectedEditor(
      editor,
      [
        {
          children: [
            { fixtureLeaf: '0', text: '0.0' },
            { fixtureLeaf: '1', text: '0.1' },
            { fixtureLeaf: '2', text: '0.2' },
          ],
        },
        {
          children: [{ text: '1.0' }],
        },
        {
          children: [{ text: '2.0' }],
        },
      ],
      () => [
        {
          data: { bold: true },
          key: 'bold',
          range: {
            kind: 'text',
            anchor: { path: [0, 1], offset: 0 },
            focus: { path: [1, 0], offset: 3 },
          },
        },
        {
          data: { italic: true },
          key: 'italic',
          range: {
            kind: 'text',
            anchor: { path: [0, 2], offset: 0 },
            focus: { path: [0, 2], offset: 3 },
          },
        },
        {
          data: { underline: true },
          key: 'underline',
          range: {
            kind: 'text',
            anchor: { path: [1, 0], offset: 0 },
            focus: { path: [1, 0], offset: 3 },
          },
        },
      ]
    );

    expect(getProjectedSegments(rendered.container)).toEqual([
      { text: '0.0', decorations: [] },
      { text: '0.1', decorations: ['bold'] },
      { text: '0.2', decorations: ['bold', 'italic'] },
      { text: '1.0', decorations: ['bold', 'underline'] },
      { text: '2.0', decorations: [] },
    ]);

    rendered.store.destroy();
  });

  test('reprojects changed text and changed ancestors from typed projection sources', async () => {
    const editor = createEditor();
    const rendered = renderProjectedEditor(
      editor,
      [
        {
          children: [
            {
              children: [{ text: 'Hello world!' }],
            },
          ],
        },
      ],
      (snapshot) => {
        const root = snapshot.children[0] as
          | (Descendant & { bold?: true })
          | undefined;
        const text = NodeApi.get(
          { children: snapshot.children } as never,
          [0, 0, 0]
        ) as { text: string };
        const projections: PliteProjection<Record<string, unknown>>[] = [];

        if (root && 'bold' in root) {
          projections.push({
            data: { bold: true },
            key: 'bold',
            range: {
              kind: 'text',
              anchor: { path: [0, 0, 0], offset: 0 },
              focus: { path: [0, 0, 0], offset: text.text.length },
            },
          });
        }

        if (text.text.includes('box')) {
          projections.push({
            data: { italic: true },
            key: 'italic',
            range: {
              kind: 'text',
              anchor: { path: [0, 0, 0], offset: 0 },
              focus: { path: [0, 0, 0], offset: text.text.length },
            },
          });
        }

        return projections;
      }
    );

    expect(getProjectedSegments(rendered.container)).toEqual([
      { text: 'Hello world!', decorations: [] },
    ]);

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.set({ bold: true } as never, { at: [0] });
      });
    });

    expect(getProjectedSegments(rendered.container)).toEqual([
      { text: 'Hello world!', decorations: ['bold'] },
    ]);

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('b', {
          at: {
            kind: 'text',
            anchor: { path: [0, 0, 0], offset: 8 },
            focus: { path: [0, 0, 0], offset: 9 },
          },
        });
      });
    });

    expect(getProjectedSegments(rendered.container)).toEqual([
      { text: 'Hello wobld!', decorations: ['bold'] },
    ]);

    rendered.store.destroy();
  });

  test('keeps projection identity stable when paths shift after structural edits', async () => {
    const editor = createEditor();
    const rendered = renderProjectedEditor(
      editor,
      [{ children: [{ text: 'A' }] }, { children: [{ text: 'B' }] }],
      (snapshot) => findTextRangesByText(snapshot.children, 'B')
    );

    expect(getProjectedSegments(rendered.container)).toEqual([
      { text: 'A', decorations: [] },
      { text: 'B', decorations: ['bold'] },
    ]);

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.insert({ children: [{ text: '0' }] } as never, {
          at: [0],
        });
      });
    });

    expect(getProjectedSegments(rendered.container)).toEqual([
      { text: '0', decorations: [] },
      { text: 'A', decorations: [] },
      { text: 'B', decorations: ['bold'] },
    ]);

    rendered.store.destroy();
  });

  test('mapped projection runtime buckets follow structural path changes through the source bus', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [{ children: [{ text: 'A' }] }, { children: [{ text: 'B' }] }],
      selection: null,
    });

    const snapshot = editorGetSnapshot(editor);
    const firstNodeKey = snapshot.index.keyAt([0, 0]);
    const secondNodeKey = snapshot.index.keyAt([1, 0]);

    if (!firstNodeKey || !secondNodeKey) {
      throw new Error('Expected node keys for mapped projection proof');
    }

    let sourceCalls = 0;
    let firstRuntimeNotifications = 0;
    let secondRuntimeNotifications = 0;
    const store = createPliteProjectionStore(
      editor,
      (nextSnapshot) => {
        sourceCalls += 1;

        return nextSnapshot.children.flatMap((node, blockIndex) =>
          TextApi.isText(node)
            ? []
            : node.children.flatMap((child, textIndex) => {
                if (!TextApi.isText(child) || child.text !== 'B') {
                  return [];
                }

                const path = [blockIndex, textIndex] as Path;

                return [
                  {
                    data: { blockIndex },
                    key: `mapped:${child.text}`,
                    range: {
                      kind: 'text',
                      anchor: { path, offset: 0 },
                      focus: { path, offset: child.text.length },
                    },
                  },
                ];
              })
        );
      },
      {
        dirtiness: 'node',
        sourceId: 'mapped-node-source',
      }
    );

    store.subscribeNodeKey(firstNodeKey, () => {
      firstRuntimeNotifications += 1;
    });
    store.subscribeNodeKey(secondNodeKey, () => {
      secondRuntimeNotifications += 1;
    });

    expect(store.getRuntimeSnapshot(secondNodeKey)).toEqual([
      {
        data: { blockIndex: 1 },
        end: 1,
        key: 'mapped:B',
        start: 0,
      },
    ]);

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.move({ at: [1], to: [0] });
      });
    });

    expect(editorGetPathByNodeKey(editor, secondNodeKey)).toEqual([0, 0]);
    expect(store.getRuntimeSnapshot(secondNodeKey)).toEqual([
      {
        data: { blockIndex: 0 },
        end: 1,
        key: 'mapped:B',
        start: 0,
      },
    ]);
    expect(sourceCalls).toBe(2);
    expect(firstRuntimeNotifications).toBe(0);
    expect(secondRuntimeNotifications).toBe(1);
    expect(store.getMetrics()).toMatchObject({
      changedRuntimeBucketCount: 1,
      recomputeCount: 1,
      runtimeSubscriberWakeCount: 1,
      sourceReadCount: 2,
    });

    store.destroy();
  });

  test('mapped projection runtime buckets follow nested nodes moved across levels', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'section',
          children: [
            { children: [{ text: 'A' }] },
            { children: [{ text: 'B' }] },
          ],
        },
        { children: [{ text: 'C' }] },
      ],
      selection: null,
    });

    const snapshot = editorGetSnapshot(editor);
    const firstNodeKey = snapshot.index.keyAt([0, 0, 0]);
    const movedNodeKey = snapshot.index.keyAt([0, 1, 0]);
    const trailingNodeKey = snapshot.index.keyAt([1, 0]);

    if (!firstNodeKey || !movedNodeKey || !trailingNodeKey) {
      throw new Error('Expected node keys for nested move projection proof');
    }

    let movedRuntimeNotifications = 0;
    let firstRuntimeNotifications = 0;
    let trailingRuntimeNotifications = 0;
    const store = createPliteProjectionStore(
      editor,
      (nextSnapshot) => findTextRangesByText(nextSnapshot.children, 'B'),
      {
        dirtiness: 'node',
        sourceId: 'nested-move-source',
      }
    );

    store.subscribeNodeKey(movedNodeKey, () => {
      movedRuntimeNotifications += 1;
    });
    store.subscribeNodeKey(firstNodeKey, () => {
      firstRuntimeNotifications += 1;
    });
    store.subscribeNodeKey(trailingNodeKey, () => {
      trailingRuntimeNotifications += 1;
    });

    expect(store.getRuntimeSnapshot(movedNodeKey)).toEqual([
      {
        data: { bold: true },
        end: 1,
        key: 'text:0.1.0',
        start: 0,
      },
    ]);

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.move({ at: [0, 1], to: [1] });
      });
    });

    expect(editorGetPathByNodeKey(editor, movedNodeKey)).toEqual([1, 0]);
    expect(store.getRuntimeSnapshot(movedNodeKey)).toEqual([
      {
        data: { bold: true },
        end: 1,
        key: 'text:1.0',
        start: 0,
      },
    ]);
    expect(movedRuntimeNotifications).toBe(1);
    expect(firstRuntimeNotifications).toBe(0);
    expect(trailingRuntimeNotifications).toBe(0);
    expect(store.getMetrics()).toMatchObject({
      changedRuntimeBucketCount: 1,
      recomputeCount: 1,
      runtimeSubscriberWakeCount: 1,
      sourceReadCount: 2,
    });

    store.destroy();
  });

  test('notifies only subscribers for node keys whose projection slices changed', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [{ children: [{ text: 'A' }] }, { children: [{ text: 'B' }] }],
      selection: null,
    });

    const snapshot = editorGetSnapshot(editor);
    const firstNodeKey = snapshot.index.keyAt([0, 0]);
    const secondNodeKey = snapshot.index.keyAt([1, 0]);

    if (!firstNodeKey || !secondNodeKey) {
      throw new Error('Expected node keys for projection subscription proof');
    }

    const store = createPliteProjectionStore(editor, (nextSnapshot) =>
      nextSnapshot.children.flatMap((node, blockIndex) =>
        TextApi.isText(node)
          ? []
          : node.children.flatMap((child, textIndex) => {
              if (!TextApi.isText(child) || !child.text.startsWith('B')) {
                return [];
              }

              const path = [blockIndex, textIndex] as Path;

              return [
                {
                  data: { highlight: true },
                  key: `starts-with-b:${path.join('.')}`,
                  range: {
                    kind: 'text',
                    anchor: { path, offset: 0 },
                    focus: { path, offset: child.text.length },
                  },
                },
              ];
            })
      )
    );

    const renders = {
      first: 0,
      second: 0,
    };

    const ProjectionProbe = ({
      label,
      nodeKey,
    }: {
      label: keyof typeof renders;
      nodeKey: string;
    }) => {
      const projections = usePliteProjectionEntries(nodeKey);

      renders[label] += 1;

      return <span data-testid={label}>{projections.length}</span>;
    };

    const rendered = render(
      <ProjectionContext value={store}>
        <ProjectionProbe label="first" nodeKey={firstNodeKey} />
        <ProjectionProbe label="second" nodeKey={secondNodeKey} />
      </ProjectionContext>
    );

    expect(rendered.getByTestId('first').textContent).toBe('0');
    expect(rendered.getByTestId('second').textContent).toBe('1');
    expect(renders).toEqual({ first: 1, second: 1 });

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', {
          at: {
            kind: 'text',
            anchor: { path: [1, 0], offset: 1 },
            focus: { path: [1, 0], offset: 1 },
          },
        });
      });
    });

    expect(rendered.getByTestId('first').textContent).toBe('0');
    expect(rendered.getByTestId('second').textContent).toBe('1');
    expect(renders).toEqual({ first: 1, second: 2 });

    store.destroy();
  });

  test('useDecorationSelector derives one node key without rerendering for sibling projections', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [{ children: [{ text: 'A' }] }, { children: [{ text: 'B' }] }],
      selection: null,
    });

    const snapshot = editorGetSnapshot(editor);
    const firstNodeKey = snapshot.index.keyAt([0, 0]);
    const secondNodeKey = snapshot.index.keyAt([1, 0]);

    if (!firstNodeKey || !secondNodeKey) {
      throw new Error('Expected node keys for decoration selector proof');
    }

    const store = createPliteProjectionStore(editor, (nextSnapshot) =>
      nextSnapshot.children.flatMap((node, blockIndex) =>
        TextApi.isText(node)
          ? []
          : node.children.flatMap((child, textIndex) => {
              if (!TextApi.isText(child)) {
                return [];
              }

              const path = [blockIndex, textIndex] as Path;

              return [
                {
                  data: { label: child.text },
                  key: `label:${path.join('.')}`,
                  range: {
                    kind: 'text',
                    anchor: { path, offset: 0 },
                    focus: { path, offset: child.text.length },
                  },
                },
              ];
            })
      )
    );
    const renders = {
      first: 0,
    };
    const decorationSelector = vi.fn(({ projections }) =>
      projections.map((projection) => projection.data?.label).join(',')
    );

    const ProjectionProbe = () => {
      const label = useDecorationSelector(decorationSelector, undefined, {
        nodeKey: firstNodeKey,
      });

      renders.first += 1;

      return <span data-testid="first-decoration">{label}</span>;
    };

    const rendered = render(
      <ProjectionContext value={store}>
        <ProjectionProbe />
      </ProjectionContext>
    );

    expect(rendered.getByTestId('first-decoration').textContent).toBe('A');
    expect(renders.first).toBe(1);
    expect(decorationSelector).toBeCalledTimes(2);

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', {
          at: {
            kind: 'text',
            anchor: { path: [1, 0], offset: 1 },
            focus: { path: [1, 0], offset: 1 },
          },
        });
      });
    });

    expect(rendered.getByTestId('first-decoration').textContent).toBe('A');
    expect(renders.first).toBe(1);
    expect(decorationSelector).toBeCalledTimes(2);

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', {
          at: {
            kind: 'text',
            anchor: { path: [0, 0], offset: 1 },
            focus: { path: [0, 0], offset: 1 },
          },
        });
      });
    });

    expect(rendered.getByTestId('first-decoration').textContent).toBe('A!');
    expect(renders.first).toBe(2);
    expect(decorationSelector).toBeCalledTimes(3);

    expect(store.getRuntimeSnapshot(secondNodeKey)).toHaveLength(1);

    store.destroy();
  });

  test('skips source recompute when decoration impact misses the source runtime scope', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [{ children: [{ text: 'A' }] }, { children: [{ text: 'B' }] }],
      selection: null,
    });

    const snapshot = editorGetSnapshot(editor);
    const firstNodeKey = snapshot.index.keyAt([0, 0]);

    if (!firstNodeKey) {
      throw new Error('Expected node key for source recompute proof');
    }

    let sourceCalls = 0;
    const store = createPliteProjectionStore(
      editor,
      (nextSnapshot) => {
        sourceCalls += 1;
        const firstText = NodeApi.get(
          { children: nextSnapshot.children } as never,
          [0, 0]
        ) as { text: string };

        return [
          {
            data: { scoped: true },
            key: 'first-text',
            range: {
              kind: 'text',
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [0, 0], offset: firstText.text.length },
            },
          },
        ];
      },
      {
        dirtiness: 'text',
        runtimeScope: () => [firstNodeKey],
      }
    );

    expect(sourceCalls).toBe(1);
    expect(store.getMetrics().recomputeCount).toBe(0);

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', {
          at: {
            kind: 'text',
            anchor: { path: [1, 0], offset: 1 },
            focus: { path: [1, 0], offset: 1 },
          },
        });
      });
    });

    expect(sourceCalls).toBe(1);
    expect(store.getMetrics().recomputeCount).toBe(0);

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', {
          at: {
            kind: 'text',
            anchor: { path: [0, 0], offset: 1 },
            focus: { path: [0, 0], offset: 1 },
          },
        });
      });
    });

    expect(sourceCalls).toBe(2);
    expect(store.getMetrics().recomputeCount).toBe(1);

    store.destroy();
  });

  test('passes resolved runtime scope into projection source reads', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [{ children: [{ text: 'A' }] }, { children: [{ text: 'B' }] }],
      selection: null,
    });

    const snapshot = editorGetSnapshot(editor);
    const firstNodeKey = snapshot.index.keyAt([0, 0]);
    const secondNodeKey = snapshot.index.keyAt([1, 0]);

    if (!firstNodeKey || !secondNodeKey) {
      throw new Error('Expected node keys for scoped projection read proof');
    }

    let runtimeScope = [firstNodeKey] as readonly string[];
    const sourceScopes: (readonly string[] | null)[] = [];
    const store = createDecorationSource(editor, {
      id: 'scoped-source',
      read: ({ runtimeScope: readRuntimeScope, snapshot: nextSnapshot }) => {
        sourceScopes.push(readRuntimeScope);

        return (readRuntimeScope ?? []).map((nodeKey) => {
          const path = nextSnapshot.index.pathOf(nodeKey);
          const text = NodeApi.get(
            { children: nextSnapshot.children } as never,
            path
          ) as { text: string };

          return {
            key: nodeKey,
            range: {
              kind: 'text',
              anchor: { path, offset: 0 },
              focus: { path, offset: text.text.length },
            },
          };
        });
      },
      runtimeScope: () => runtimeScope,
    });

    expect(sourceScopes).toEqual([[firstNodeKey]]);
    expect(store.getSnapshot()[firstNodeKey]).toHaveLength(1);
    expect(store.getSnapshot()[secondNodeKey]).toBeUndefined();

    runtimeScope = [secondNodeKey];
    store.refresh({ reason: 'external' });

    expect(sourceScopes).toEqual([[firstNodeKey], [secondNodeKey]]);
    expect(store.getSnapshot()[firstNodeKey]).toBeUndefined();
    expect(store.getSnapshot()[secondNodeKey]).toHaveLength(1);

    store.destroy();
  });

  test('Editable decorate walks only the scoped runtime subtree', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [{ children: [{ text: 'A' }] }, { children: [{ text: 'B' }] }],
      selection: null,
    });

    const firstBlockNodeKey = editorGetSnapshot(editor).index.keyAt([0]);

    if (!firstBlockNodeKey) {
      throw new Error('Expected block node key for scoped decorate proof');
    }

    const decoratedPaths = new Set<string>();

    render(
      <Plite editor={editor}>
        <Editable
          decorate={([, path]) => {
            decoratedPaths.add(path.join('.'));

            return [];
          }}
          decorateRuntimeScope={() => [firstBlockNodeKey]}
        />
      </Plite>
    );

    expect([...decoratedPaths].sort()).toEqual(['0', '0.0']);
  });

  test('projection stores receive editor changes through the source bus', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [{ children: [{ text: 'A' }] }],
      selection: null,
    });

    const originalSubscribe = editor.subscribe;
    editor.subscribe = (() => {
      throw new Error('Unexpected broad editor.subscribe fan-in');
    }) as typeof editor.subscribe;

    let sourceCalls = 0;
    const store = createPliteProjectionStore(
      editor,
      (nextSnapshot) => {
        sourceCalls += 1;
        const text = NodeApi.get(
          { children: nextSnapshot.children } as never,
          [0, 0]
        ) as { text: string };

        return [
          {
            data: { text: true },
            key: 'text-source',
            range: {
              kind: 'text',
              anchor: { path: [0, 0], offset: 0 },
              focus: {
                path: [0, 0],
                offset: text.text.length,
              },
            },
          },
        ];
      },
      {
        dirtiness: 'text',
        sourceId: 'text-source',
      }
    );

    try {
      await act(async () => {
        editor.update((tx) => {
          tx.text.insert('!', {
            at: {
              kind: 'text',
              anchor: { path: [0, 0], offset: 1 },
              focus: { path: [0, 0], offset: 1 },
            },
          });
        });
      });

      expect(sourceCalls).toBe(2);
      expect(store.getMetrics().recomputeCount).toBe(1);
    } finally {
      store.destroy();
      editor.subscribe = originalSubscribe;
    }
  });

  test('runtime-scoped projection stores avoid projecting full-document ranges into every bucket', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: Array.from({ length: 5 }, (_, index) => ({
        children: [{ text: `block-${index}` }],
      })),
      selection: null,
    });

    const snapshot = editorGetSnapshot(editor);
    const anchorTextNodeKey = snapshot.index.keyAt([0, 0]);
    const focusTextNodeKey = snapshot.index.keyAt([4, 0]);
    const mountedBlockNodeKey = snapshot.index.keyAt([2]);
    const mountedTextNodeKey = snapshot.index.keyAt([2, 0]);
    const unmountedTextNodeKey = snapshot.index.keyAt([1, 0]);

    if (
      !anchorTextNodeKey ||
      !focusTextNodeKey ||
      !mountedBlockNodeKey ||
      !mountedTextNodeKey ||
      !unmountedTextNodeKey
    ) {
      throw new Error('Expected node keys for scoped projection proof');
    }

    const store = createPliteProjectionStore(
      editor,
      () => [
        {
          data: { selected: true },
          key: 'wide-selection',
          range: {
            kind: 'text',
            anchor: { path: [0, 0], offset: 1 },
            focus: { path: [4, 0], offset: 2 },
          },
        },
      ],
      {
        runtimeScope: () => [mountedBlockNodeKey],
        sourceId: 'wide-selection',
      }
    );

    expect(Object.keys(store.getSnapshot()).sort()).toEqual(
      [anchorTextNodeKey, focusTextNodeKey, mountedTextNodeKey].sort()
    );
    expect(store.getRuntimeSnapshot(unmountedTextNodeKey)).toEqual([]);
    expect(store.getRuntimeSnapshot(anchorTextNodeKey)).toEqual([
      expect.objectContaining({
        end: 'block-0'.length,
        start: 1,
      }),
    ]);
    expect(store.getRuntimeSnapshot(mountedTextNodeKey)).toEqual([
      expect.objectContaining({
        end: 'block-2'.length,
        start: 0,
      }),
    ]);
    expect(store.getRuntimeSnapshot(focusTextNodeKey)).toEqual([
      expect.objectContaining({
        end: 2,
        start: 0,
      }),
    ]);
    expect(store.getMetrics().projectedRangeCount).toBe(3);

    store.destroy();
  });

  test('projection stores created from roots receive runtime source changes', async () => {
    const runtime = createReactEditor({
      initialValue: {
        children: [{ children: [{ text: 'Body' }] }],
        roots: { header: [{ children: [{ text: 'Header' }] }] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const nodeKey = editorGetNodeKey(headerEditor as never, [0, 0]);

    if (!nodeKey) {
      throw new Error('Expected node key for header root projection proof');
    }

    let sourceCalls = 0;
    let runtimeNotifications = 0;
    const store = createDecorationSource(headerEditor as never, {
      dirtiness: 'text',
      id: 'header-view-source',
      read: ({ snapshot }) => {
        sourceCalls += 1;
        const text = NodeApi.get(
          { children: snapshot.children } as never,
          [0, 0]
        ) as { text: string };

        return text.text.includes('!')
          ? [
              {
                data: { header: true },
                key: 'header-view-source',
                range: {
                  kind: 'text',
                  anchor: { path: [0, 0], offset: 0 },
                  focus: { path: [0, 0], offset: text.text.length },
                },
              },
            ]
          : [];
      },
    });

    store.subscribeNodeKey(nodeKey, () => {
      runtimeNotifications += 1;
    });

    expect(sourceCalls).toBe(1);
    expect(store.getRuntimeSnapshot(nodeKey)).toEqual([]);

    await act(async () => {
      headerEditor.update((tx) => {
        tx.text.insert('!', {
          at: {
            kind: 'text',
            anchor: { path: [0, 0], offset: 6 },
            focus: { path: [0, 0], offset: 6 },
          },
        });
      });
    });

    expect(sourceCalls).toBe(2);
    expect(runtimeNotifications).toBe(1);
    expect(store.getRuntimeSnapshot(nodeKey)).toEqual([
      {
        data: { header: true },
        end: 7,
        key: 'header-view-source',
        start: 0,
      },
    ]);

    store.destroy();
  });

  test('targeted source refresh only recomputes and notifies the matching source id', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [{ children: [{ text: 'A' }] }],
      selection: null,
    });

    const nodeKey = editorGetNodeKey(editor, [0, 0]);

    if (!nodeKey) {
      throw new Error('Expected node key for source subscription proof');
    }

    let active = false;
    let sourceCalls = 0;
    let globalNotifications = 0;
    let runtimeNotifications = 0;
    let refreshNotifications = 0;
    let sourceNotifications = 0;
    const store = createPliteProjectionStore(
      editor,
      () => {
        sourceCalls += 1;

        return active
          ? [
              {
                data: { scoped: true },
                key: 'targeted-source',
                range: {
                  kind: 'text',
                  anchor: { path: [0, 0], offset: 0 },
                  focus: { path: [0, 0], offset: 1 },
                },
              },
            ]
          : [];
      },
      {
        dirtiness: 'external',
        sourceId: 'targeted-source',
      }
    );

    store.subscribe(() => {
      globalNotifications += 1;
    });
    store.subscribeNodeKey(nodeKey, () => {
      runtimeNotifications += 1;
    });
    store.subscribeProjectionRefresh((result) => {
      refreshNotifications += 1;
      expect(result).toMatchObject({
        changedNodeKeys: [nodeKey],
        changedSourceId: 'targeted-source',
        didChange: true,
        reason: 'external',
        requiresDOMSelectionExport: false,
      });
    });
    store.subscribeSourceId('targeted-source', () => {
      sourceNotifications += 1;
    });
    store.subscribeSourceId('other-source', () => {
      throw new Error('Unexpected source notification');
    });

    expect(sourceCalls).toBe(1);
    expect(store.getRuntimeSnapshot(nodeKey)).toEqual([]);

    active = true;
    store.refresh({ reason: 'external', sourceId: 'other-source' });

    expect(sourceCalls).toBe(1);
    expect(globalNotifications).toBe(0);
    expect(runtimeNotifications).toBe(0);
    expect(refreshNotifications).toBe(0);
    expect(sourceNotifications).toBe(0);
    expect(store.getRuntimeSnapshot(nodeKey)).toEqual([]);

    const refreshResult = store.refresh({
      reason: 'external',
      sourceId: 'targeted-source',
    });

    expect(refreshResult).toMatchObject({
      changedNodeKeys: [nodeKey],
      changedSourceId: 'targeted-source',
      didChange: true,
      reason: 'external',
      requiresDOMSelectionExport: false,
    });
    expect(sourceCalls).toBe(2);
    expect(globalNotifications).toBe(1);
    expect(runtimeNotifications).toBe(1);
    expect(refreshNotifications).toBe(1);
    expect(sourceNotifications).toBe(1);
    expect(store.getMetrics()).toMatchObject({
      changedRuntimeBucketCount: 1,
      globalSubscriberWakeCount: 1,
      projectedRangeCount: 1,
      recomputeCount: 1,
      runtimeSubscriberWakeCount: 1,
      sourceReadCount: 2,
      sourceSubscriberWakeCount: 1,
    });
    expect(store.getRuntimeSnapshot(nodeKey)).toEqual([
      {
        data: { scoped: true },
        end: 1,
        key: 'targeted-source',
        start: 0,
      },
    ]);

    const unchangedRefreshResult = store.refresh({
      reason: 'external',
      sourceId: 'targeted-source',
    });

    expect(unchangedRefreshResult).toMatchObject({
      changedNodeKeys: [],
      changedSourceId: 'targeted-source',
      didChange: false,
      reason: 'external',
      requiresDOMSelectionExport: false,
    });
    expect(refreshNotifications).toBe(1);

    store.destroy();
  });

  test('external projection refresh requests DOM selection export only when explicit', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [{ children: [{ text: 'A' }] }],
      selection: null,
    });

    const nodeKey = editorGetNodeKey(editor, [0, 0]);

    if (!nodeKey) {
      throw new Error('Expected node key for selection export proof');
    }

    let active = false;
    const store = createPliteProjectionStore(
      editor,
      () =>
        active
          ? [
              {
                key: 'selection-sensitive',
                range: {
                  kind: 'text',
                  anchor: { path: [0, 0], offset: 0 },
                  focus: { path: [0, 0], offset: 1 },
                },
              },
            ]
          : [],
      { dirtiness: 'external' }
    );

    active = true;
    const refreshResult = store.refresh({
      reason: 'external',
      requiresDOMSelectionExport: true,
    });

    expect(refreshResult).toMatchObject({
      changedNodeKeys: [nodeKey],
      didChange: true,
      reason: 'external',
      requiresDOMSelectionExport: true,
    });

    const unchangedRefreshResult = store.refresh({
      reason: 'external',
      requiresDOMSelectionExport: true,
    });

    expect(unchangedRefreshResult).toMatchObject({
      changedNodeKeys: [],
      didChange: false,
      reason: 'external',
      requiresDOMSelectionExport: false,
    });

    store.destroy();
  });

  test('projection metadata uses reference equality for non-JSON data', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [{ children: [{ text: 'A' }] }],
      selection: null,
    });

    const nodeKey = editorGetNodeKey(editor, [0, 0]);

    if (!nodeKey) {
      throw new Error('Expected node key for projection metadata proof');
    }

    const circularData: Record<string, unknown> = {};
    circularData.self = circularData;

    let metadata: unknown = circularData;
    let notifications = 0;
    const store = createPliteProjectionStore<unknown>(editor, () => [
      {
        data: metadata,
        key: 'non-json-metadata',
        range: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 1 },
        },
      },
    ]);

    store.subscribeNodeKey(nodeKey, () => {
      notifications += 1;
    });

    expect(() => {
      store.refresh({ reason: 'external' });
    }).not.toThrow();
    expect(notifications).toBe(0);

    metadata = new Map([['value', 1]]);
    store.refresh({ reason: 'external' });

    expect(notifications).toBe(1);

    metadata = new Map([['value', 2]]);
    store.refresh({ reason: 'external' });

    expect(notifications).toBe(2);

    store.destroy();
  });

  test('force refresh invalidates mounted runtime subscribers even when slices are unchanged', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [{ children: [{ text: 'A' }] }],
      selection: null,
    });

    const nodeKey = editorGetNodeKey(editor, [0, 0]);

    if (!nodeKey) {
      throw new Error('Expected node key for forced projection refresh proof');
    }

    let notifications = 0;
    const store = createPliteProjectionStore(editor, () => [], {
      dirtiness: 'external',
    });

    store.subscribeNodeKey(nodeKey, () => {
      notifications += 1;
    });

    store.refresh({ forceInvalidate: true, reason: 'external' });

    expect(notifications).toBe(1);
    expect(store.getRuntimeSnapshot(nodeKey)).toEqual([]);

    store.destroy();
  });
});
