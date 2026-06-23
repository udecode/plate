import { act, type RenderResult, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  createEditorRuntime,
  createEditorView,
  createEditor as createBaseEditor,
  type Descendant,
  NodeApi,
  type Path,
  TextApi,
} from '@platejs/plite';
import { Editor } from '@platejs/plite/internal';
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
  Editor.replace(editor, {
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
      <ProjectionContext.Provider value={store}>
        <Harness />
      </ProjectionContext.Provider>
    );

    act(() => {
      refreshListener?.({
        changedRuntimeIds: ['runtime:a'],
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

    Editor.replace(editor, {
      children: [
        {
          children: [{ text: 'Hello' }, { text: 'world' }],
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

    Editor.replace(editor, {
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

    Editor.replace(editor, {
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

  test('projects decorations across inline element boundaries', () => {
    const editor = createEditor();

    editor.extend({
      elements: [{ inline: true, type: 'link' }],
      name: 'inline-decoration-boundary',
    });
    Editor.replace(editor, {
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
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 11 },
          },
        },
        {
          data: { italic: true },
          key: 'italic',
          range: {
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

    Editor.replace(editor, {
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
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 11 },
          },
        },
        {
          data: { spelling: true },
          key: 'spelling',
          range: {
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
                  end: leafPosition?.end ?? segment.end,
                  payloads,
                  start: leafPosition?.start ?? segment.start,
                  text: leaf.text,
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
        text: 'Hello ',
      },
      {
        bold: true,
        end: 11,
        payloads: ['comment', 'spelling'],
        start: 6,
        text: 'world',
      },
      {
        bold: true,
        end: 12,
        payloads: ['spelling'],
        start: 11,
        text: '!',
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
          children: [{ text: '0.0' }, { text: '0.1' }, { text: '0.2' }],
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
            anchor: { path: [0, 1], offset: 0 },
            focus: { path: [1, 0], offset: 3 },
          },
        },
        {
          data: { italic: true },
          key: 'italic',
          range: {
            anchor: { path: [0, 2], offset: 0 },
            focus: { path: [0, 2], offset: 3 },
          },
        },
        {
          data: { underline: true },
          key: 'underline',
          range: {
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

    Editor.replace(editor, {
      children: [{ children: [{ text: 'A' }] }, { children: [{ text: 'B' }] }],
      selection: null,
    });

    const snapshot = Editor.getSnapshot(editor);
    const firstRuntimeId = snapshot.index.pathToId['0.0'];
    const secondRuntimeId = snapshot.index.pathToId['1.0'];

    if (!firstRuntimeId || !secondRuntimeId) {
      throw new Error('Expected runtime ids for mapped projection proof');
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

    store.subscribeRuntimeId(firstRuntimeId, () => {
      firstRuntimeNotifications += 1;
    });
    store.subscribeRuntimeId(secondRuntimeId, () => {
      secondRuntimeNotifications += 1;
    });

    expect(store.getRuntimeSnapshot(secondRuntimeId)).toEqual([
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

    expect(Editor.getPathByRuntimeId(editor, secondRuntimeId)).toEqual([0, 0]);
    expect(store.getRuntimeSnapshot(secondRuntimeId)).toEqual([
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

    Editor.replace(editor, {
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

    const snapshot = Editor.getSnapshot(editor);
    const firstRuntimeId = snapshot.index.pathToId['0.0.0'];
    const movedRuntimeId = snapshot.index.pathToId['0.1.0'];
    const trailingRuntimeId = snapshot.index.pathToId['1.0'];

    if (!firstRuntimeId || !movedRuntimeId || !trailingRuntimeId) {
      throw new Error('Expected runtime ids for nested move projection proof');
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

    store.subscribeRuntimeId(movedRuntimeId, () => {
      movedRuntimeNotifications += 1;
    });
    store.subscribeRuntimeId(firstRuntimeId, () => {
      firstRuntimeNotifications += 1;
    });
    store.subscribeRuntimeId(trailingRuntimeId, () => {
      trailingRuntimeNotifications += 1;
    });

    expect(store.getRuntimeSnapshot(movedRuntimeId)).toEqual([
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

    expect(Editor.getPathByRuntimeId(editor, movedRuntimeId)).toEqual([1, 0]);
    expect(store.getRuntimeSnapshot(movedRuntimeId)).toEqual([
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

  test('notifies only subscribers for runtime ids whose projection slices changed', async () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [{ children: [{ text: 'A' }] }, { children: [{ text: 'B' }] }],
      selection: null,
    });

    const snapshot = Editor.getSnapshot(editor);
    const firstRuntimeId = snapshot.index.pathToId['0.0'];
    const secondRuntimeId = snapshot.index.pathToId['1.0'];

    if (!firstRuntimeId || !secondRuntimeId) {
      throw new Error('Expected runtime ids for projection subscription proof');
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
      runtimeId,
    }: {
      label: keyof typeof renders;
      runtimeId: string;
    }) => {
      const projections = usePliteProjectionEntries(runtimeId);

      renders[label] += 1;

      return <span data-testid={label}>{projections.length}</span>;
    };

    const rendered = render(
      <ProjectionContext.Provider value={store}>
        <ProjectionProbe label="first" runtimeId={firstRuntimeId} />
        <ProjectionProbe label="second" runtimeId={secondRuntimeId} />
      </ProjectionContext.Provider>
    );

    expect(rendered.getByTestId('first').textContent).toBe('0');
    expect(rendered.getByTestId('second').textContent).toBe('1');
    expect(renders).toEqual({ first: 1, second: 1 });

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', {
          at: {
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

  test('useDecorationSelector derives one runtime id without rerendering for sibling projections', async () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [{ children: [{ text: 'A' }] }, { children: [{ text: 'B' }] }],
      selection: null,
    });

    const snapshot = Editor.getSnapshot(editor);
    const firstRuntimeId = snapshot.index.pathToId['0.0'];
    const secondRuntimeId = snapshot.index.pathToId['1.0'];

    if (!firstRuntimeId || !secondRuntimeId) {
      throw new Error('Expected runtime ids for decoration selector proof');
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
        runtimeId: firstRuntimeId,
      });

      renders.first += 1;

      return <span data-testid="first-decoration">{label}</span>;
    };

    const rendered = render(
      <ProjectionContext.Provider value={store}>
        <ProjectionProbe />
      </ProjectionContext.Provider>
    );

    expect(rendered.getByTestId('first-decoration').textContent).toBe('A');
    expect(renders.first).toBe(1);
    expect(decorationSelector).toBeCalledTimes(2);

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', {
          at: {
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
            anchor: { path: [0, 0], offset: 1 },
            focus: { path: [0, 0], offset: 1 },
          },
        });
      });
    });

    expect(rendered.getByTestId('first-decoration').textContent).toBe('A!');
    expect(renders.first).toBe(2);
    expect(decorationSelector).toBeCalledTimes(3);

    expect(store.getRuntimeSnapshot(secondRuntimeId)).toHaveLength(1);

    store.destroy();
  });

  test('skips source recompute when decoration impact misses the source runtime scope', async () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [{ children: [{ text: 'A' }] }, { children: [{ text: 'B' }] }],
      selection: null,
    });

    const snapshot = Editor.getSnapshot(editor);
    const firstRuntimeId = snapshot.index.pathToId['0.0'];

    if (!firstRuntimeId) {
      throw new Error('Expected runtime id for source recompute proof');
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
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [0, 0], offset: firstText.text.length },
            },
          },
        ];
      },
      {
        dirtiness: 'text',
        runtimeScope: () => [firstRuntimeId],
      }
    );

    expect(sourceCalls).toBe(1);
    expect(store.getMetrics().recomputeCount).toBe(0);

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', {
          at: {
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

    Editor.replace(editor, {
      children: [{ children: [{ text: 'A' }] }, { children: [{ text: 'B' }] }],
      selection: null,
    });

    const snapshot = Editor.getSnapshot(editor);
    const firstRuntimeId = snapshot.index.pathToId['0.0'];
    const secondRuntimeId = snapshot.index.pathToId['1.0'];

    if (!firstRuntimeId || !secondRuntimeId) {
      throw new Error('Expected runtime ids for scoped projection read proof');
    }

    let runtimeScope = [firstRuntimeId] as readonly string[];
    const sourceScopes: (readonly string[] | null)[] = [];
    const store = createDecorationSource(editor, {
      id: 'scoped-source',
      read: ({ runtimeScope: readRuntimeScope, snapshot: nextSnapshot }) => {
        sourceScopes.push(readRuntimeScope);

        return (readRuntimeScope ?? []).map((runtimeId) => {
          const path = nextSnapshot.index.idToPath[runtimeId];
          const text = NodeApi.get(
            { children: nextSnapshot.children } as never,
            path
          ) as { text: string };

          return {
            key: runtimeId,
            range: {
              anchor: { path, offset: 0 },
              focus: { path, offset: text.text.length },
            },
          };
        });
      },
      runtimeScope: () => runtimeScope,
    });

    expect(sourceScopes).toEqual([[firstRuntimeId]]);
    expect(store.getSnapshot()[firstRuntimeId]).toHaveLength(1);
    expect(store.getSnapshot()[secondRuntimeId]).toBeUndefined();

    runtimeScope = [secondRuntimeId];
    store.refresh({ reason: 'external' });

    expect(sourceScopes).toEqual([[firstRuntimeId], [secondRuntimeId]]);
    expect(store.getSnapshot()[firstRuntimeId]).toBeUndefined();
    expect(store.getSnapshot()[secondRuntimeId]).toHaveLength(1);

    store.destroy();
  });

  test('Editable decorate walks only the scoped runtime subtree', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [{ children: [{ text: 'A' }] }, { children: [{ text: 'B' }] }],
      selection: null,
    });

    const firstBlockRuntimeId = Editor.getSnapshot(editor).index.pathToId['0'];

    if (!firstBlockRuntimeId) {
      throw new Error('Expected block runtime id for scoped decorate proof');
    }

    const decoratedPaths = new Set<string>();

    render(
      <Plite editor={editor}>
        <Editable
          decorate={([, path]) => {
            decoratedPaths.add(path.join('.'));

            return [];
          }}
          decorateRuntimeScope={() => [firstBlockRuntimeId]}
        />
      </Plite>
    );

    expect([...decoratedPaths].sort()).toEqual(['0', '0.0']);
  });

  test('projection stores receive editor changes through the source bus', async () => {
    const editor = createEditor();

    Editor.replace(editor, {
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

    Editor.replace(editor, {
      children: Array.from({ length: 5 }, (_, index) => ({
        children: [{ text: `block-${index}` }],
      })),
      selection: null,
    });

    const snapshot = Editor.getSnapshot(editor);
    const anchorTextRuntimeId = snapshot.index.pathToId['0.0'];
    const focusTextRuntimeId = snapshot.index.pathToId['4.0'];
    const mountedBlockRuntimeId = snapshot.index.pathToId['2'];
    const mountedTextRuntimeId = snapshot.index.pathToId['2.0'];
    const unmountedTextRuntimeId = snapshot.index.pathToId['1.0'];

    if (
      !anchorTextRuntimeId ||
      !focusTextRuntimeId ||
      !mountedBlockRuntimeId ||
      !mountedTextRuntimeId ||
      !unmountedTextRuntimeId
    ) {
      throw new Error('Expected runtime ids for scoped projection proof');
    }

    const store = createPliteProjectionStore(
      editor,
      () => [
        {
          data: { selected: true },
          key: 'wide-selection',
          range: {
            anchor: { path: [0, 0], offset: 1 },
            focus: { path: [4, 0], offset: 2 },
          },
        },
      ],
      {
        runtimeScope: () => [mountedBlockRuntimeId],
        sourceId: 'wide-selection',
      }
    );

    expect(Object.keys(store.getSnapshot()).sort()).toEqual(
      [anchorTextRuntimeId, focusTextRuntimeId, mountedTextRuntimeId].sort()
    );
    expect(store.getRuntimeSnapshot(unmountedTextRuntimeId)).toEqual([]);
    expect(store.getRuntimeSnapshot(anchorTextRuntimeId)).toEqual([
      expect.objectContaining({
        end: 'block-0'.length,
        start: 1,
      }),
    ]);
    expect(store.getRuntimeSnapshot(mountedTextRuntimeId)).toEqual([
      expect.objectContaining({
        end: 'block-2'.length,
        start: 0,
      }),
    ]);
    expect(store.getRuntimeSnapshot(focusTextRuntimeId)).toEqual([
      expect.objectContaining({
        end: 2,
        start: 0,
      }),
    ]);
    expect(store.getMetrics().projectedRangeCount).toBe(3);

    store.destroy();
  });

  test('projection stores created from roots receive runtime source changes', async () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [{ children: [{ text: 'Body' }] }],
        roots: { header: [{ children: [{ text: 'Header' }] }] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const runtimeId = Editor.getRuntimeId(headerEditor as never, [0, 0]);

    if (!runtimeId) {
      throw new Error('Expected runtime id for header root projection proof');
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
                  anchor: { path: [0, 0], offset: 0 },
                  focus: { path: [0, 0], offset: text.text.length },
                },
              },
            ]
          : [];
      },
    });

    store.subscribeRuntimeId(runtimeId, () => {
      runtimeNotifications += 1;
    });

    expect(sourceCalls).toBe(1);
    expect(store.getRuntimeSnapshot(runtimeId)).toEqual([]);

    await act(async () => {
      headerEditor.update((tx) => {
        tx.text.insert('!', {
          at: {
            anchor: { path: [0, 0], offset: 6 },
            focus: { path: [0, 0], offset: 6 },
          },
        });
      });
    });

    expect(sourceCalls).toBe(2);
    expect(runtimeNotifications).toBe(1);
    expect(store.getRuntimeSnapshot(runtimeId)).toEqual([
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

    Editor.replace(editor, {
      children: [{ children: [{ text: 'A' }] }],
      selection: null,
    });

    const runtimeId = Editor.getRuntimeId(editor, [0, 0]);

    if (!runtimeId) {
      throw new Error('Expected runtime id for source subscription proof');
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
    store.subscribeRuntimeId(runtimeId, () => {
      runtimeNotifications += 1;
    });
    store.subscribeProjectionRefresh((result) => {
      refreshNotifications += 1;
      expect(result).toMatchObject({
        changedRuntimeIds: [runtimeId],
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
    expect(store.getRuntimeSnapshot(runtimeId)).toEqual([]);

    active = true;
    store.refresh({ reason: 'external', sourceId: 'other-source' });

    expect(sourceCalls).toBe(1);
    expect(globalNotifications).toBe(0);
    expect(runtimeNotifications).toBe(0);
    expect(refreshNotifications).toBe(0);
    expect(sourceNotifications).toBe(0);
    expect(store.getRuntimeSnapshot(runtimeId)).toEqual([]);

    const refreshResult = store.refresh({
      reason: 'external',
      sourceId: 'targeted-source',
    });

    expect(refreshResult).toMatchObject({
      changedRuntimeIds: [runtimeId],
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
    expect(store.getRuntimeSnapshot(runtimeId)).toEqual([
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
      changedRuntimeIds: [],
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

    Editor.replace(editor, {
      children: [{ children: [{ text: 'A' }] }],
      selection: null,
    });

    const runtimeId = Editor.getRuntimeId(editor, [0, 0]);

    if (!runtimeId) {
      throw new Error('Expected runtime id for selection export proof');
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
      changedRuntimeIds: [runtimeId],
      didChange: true,
      reason: 'external',
      requiresDOMSelectionExport: true,
    });

    const unchangedRefreshResult = store.refresh({
      reason: 'external',
      requiresDOMSelectionExport: true,
    });

    expect(unchangedRefreshResult).toMatchObject({
      changedRuntimeIds: [],
      didChange: false,
      reason: 'external',
      requiresDOMSelectionExport: false,
    });

    store.destroy();
  });

  test('projection metadata uses reference equality for non-JSON data', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [{ children: [{ text: 'A' }] }],
      selection: null,
    });

    const runtimeId = Editor.getRuntimeId(editor, [0, 0]);

    if (!runtimeId) {
      throw new Error('Expected runtime id for projection metadata proof');
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
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 1 },
        },
      },
    ]);

    store.subscribeRuntimeId(runtimeId, () => {
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

    Editor.replace(editor, {
      children: [{ children: [{ text: 'A' }] }],
      selection: null,
    });

    const runtimeId = Editor.getRuntimeId(editor, [0, 0]);

    if (!runtimeId) {
      throw new Error(
        'Expected runtime id for forced projection refresh proof'
      );
    }

    let notifications = 0;
    const store = createPliteProjectionStore(editor, () => [], {
      dirtiness: 'external',
    });

    store.subscribeRuntimeId(runtimeId, () => {
      notifications += 1;
    });

    store.refresh({ forceInvalidate: true, reason: 'external' });

    expect(notifications).toBe(1);
    expect(store.getRuntimeSnapshot(runtimeId)).toEqual([]);

    store.destroy();
  });
});
