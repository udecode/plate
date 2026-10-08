import { afterAll, afterEach, describe, expect, it } from 'bun:test';

import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { createEditorView, TextApi } from 'plitejs';
import { authored } from 'plitejs/authored';
import {
  createEditor,
  type DecorationSource,
  Editable,
  EditorElement,
  EditorRoot,
  type RenderElementProps,
} from 'plitejs/react';
import React, { createRef, useRef } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import {
  createEstimatedPageLayoutEngine,
  type PageLayoutEngine,
} from '../../src/pagination';
import {
  invalidatePageLayoutEngines,
  registerPageLayoutEngineInvalidator,
} from '../../src/pagination/page-layout-engine-invalidation.internal';
import {
  PagedEditable,
  usePageLayout,
  usePageLayoutFragments,
} from '../../src/pagination/react';
import { PliteRuntimeView } from '../../src/react/components/plite';
import {
  createReactRuntimeViewEditor,
  PliteRuntimeProvider,
} from '../../src/react/hooks/use-plite-runtime';

const registeredDom = typeof document === 'undefined';

if (registeredDom) GlobalRegistrator.register();

afterEach(cleanup);
afterAll(() => {
  if (registeredDom) void GlobalRegistrator.unregister();
});

const page = { margins: 72, preset: 'letter' } as const;
const engine = createEstimatedPageLayoutEngine();

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph' as const,
});

const LayoutRead = ({
  editableRef,
  testId = 'layout-read',
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
  testId?: string;
}) => {
  const layout = usePageLayout(editableRef);

  return (
    <output
      data-root={layout?.root ?? 'main'}
      data-testid={testId}
      data-version={layout?.version ?? 'null'}
    >
      {layout?.pages.length ?? 0}
    </output>
  );
};

const ElementProbe = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  const fragments = usePageLayoutFragments();

  return (
    <div
      {...attributes}
      data-fragment-pages={fragments
        .map((fragment) => fragment.pageIndex)
        .join(',')}
      data-testid={`element-${String(element.type)}-${attributes['data-editor-path']}`}
    >
      {children}
    </div>
  );
};

describe('PagedEditable', () => {
  it('publishes layout through the exact editable ref', async () => {
    const editor = createEditor({ initialValue: [paragraph('Exact host')] });
    const editableRef = createRef<HTMLDivElement>();

    const mounted = render(
      <EditorRoot editor={editor}>
        <LayoutRead editableRef={editableRef} />
        <PagedEditable
          aria-label="Document"
          engine={engine}
          page={page}
          ref={editableRef}
        />
      </EditorRoot>
    );

    await waitFor(() =>
      expect(mounted.getByTestId('layout-read').textContent).toBe('1')
    );
    expect(editableRef.current).toBe(
      mounted.getByRole('textbox', { name: 'Document' })
    );
  });

  it('keeps separate layout reads for sibling paged surfaces', async () => {
    const editor = createEditor({
      initialValue: [paragraph('x'.repeat(5000))],
    });
    const firstRef = createRef<HTMLDivElement>();
    const secondRef = createRef<HTMLDivElement>();

    const mounted = render(
      <EditorRoot editor={editor}>
        <LayoutRead editableRef={firstRef} testId="first-layout" />
        <LayoutRead editableRef={secondRef} testId="second-layout" />
        <PagedEditable engine={engine} page={page} ref={firstRef} />
        <PagedEditable
          engine={engine}
          page={{ margins: 400, preset: 'letter' }}
          ref={secondRef}
        />
      </EditorRoot>
    );

    await waitFor(() =>
      expect(
        Number(mounted.getByTestId('second-layout').textContent)
      ).toBeGreaterThan(Number(mounted.getByTestId('first-layout').textContent))
    );
  });

  it('binds element fragments to the current renderer and owns placement', () => {
    const editor = createEditor({
      initialValue: [paragraph('Placed by the paged view')],
    });
    const mounted = render(
      <EditorRoot editor={editor}>
        <PagedEditable
          engine={engine}
          page={page}
          renderElement={ElementProbe}
        />
      </EditorRoot>
    );
    const element = mounted.getByTestId('element-paragraph-0');

    const placed = getComputedStyle(element);

    expect(element.getAttribute('data-fragment-pages')).toBe('0');
    expect({
      left: placed.left,
      position: placed.position,
      top: placed.top,
    }).toEqual({
      left: '72px',
      position: 'absolute',
      top: '72px',
    });
  });

  it('places the outermost wrapper that holds only the element', () => {
    const editor = createEditor({
      initialValue: [paragraph('First'), paragraph('Second')],
    });
    const mounted = render(
      <EditorRoot editor={editor}>
        <PagedEditable
          engine={engine}
          page={page}
          renderElement={({ attributes, children }) => (
            <div
              data-testid={`wrapper-${attributes['data-editor-path']}`}
              style={{ position: 'relative' }}
            >
              <span contentEditable={false}>handle</span>
              <div {...attributes}>{children}</div>
            </div>
          )}
        />
      </EditorRoot>
    );
    const wrapper = mounted.getByTestId('wrapper-1');
    const element = wrapper.querySelector<HTMLElement>(
      '[data-editor-node="element"]'
    );

    expect({
      element: element && getComputedStyle(element).position === 'absolute',
      wrapper: getComputedStyle(wrapper).position === 'absolute',
    }).toEqual({ element: false, wrapper: true });
  });

  it('derives direct-child paths and positions them relative to their owner', () => {
    const rows = [0, 1].map((index) => ({
      children: [paragraph(`Row ${index + 1}`)],
      type: 'row' as const,
    }));
    const editor = createEditor({
      initialValue: [{ children: rows, type: 'table' as const }],
    });
    const mounted = render(
      <EditorRoot editor={editor}>
        <PagedEditable
          engine={engine}
          fragmentation={({ content, element }) =>
            element.type === 'table'
              ? {
                  sizes: element.children.map(() => ({
                    height: 40,
                    width: content.width,
                  })),
                  type: 'direct-children',
                }
              : undefined
          }
          page={{
            margins: { bottom: 500, left: 72, right: 72, top: 500 },
            preset: 'letter',
          }}
          renderElement={ElementProbe}
        />
      </EditorRoot>
    );
    const table = mounted.getByTestId('element-table-0');
    const firstRow = mounted.getByTestId('element-row-0,0');
    const secondRow = mounted.getByTestId('element-row-0,1');

    expect(table.getAttribute('data-fragment-pages')).toBe('0,1');
    expect(firstRow.getAttribute('data-fragment-pages')).toBe('0');
    expect(secondRow.getAttribute('data-fragment-pages')).toBe('1');
    expect(getComputedStyle(table).position).toBe('absolute');
    expect(getComputedStyle(firstRow).position).toBe('absolute');
    expect(getComputedStyle(firstRow).top).toBe('0px');
    expect(Number.parseFloat(getComputedStyle(secondRow).top)).toBeGreaterThan(
      40
    );
  });

  it('keeps the editable host when page virtualization changes', () => {
    const editor = createEditor({
      initialValue: [paragraph('Persistent host')],
    });
    const tree = (virtualize: boolean) => (
      <EditorRoot editor={editor}>
        <PagedEditable
          aria-label="Document"
          engine={engine}
          page={page}
          virtualize={virtualize}
        />
      </EditorRoot>
    );
    const mounted = render(tree(false));
    const host = mounted.getByRole('textbox', { name: 'Document' });

    mounted.rerender(tree(true));
    expect(mounted.getByRole('textbox', { name: 'Document' })).toBe(host);
    mounted.rerender(tree(false));
    expect(mounted.getByRole('textbox', { name: 'Document' })).toBe(host);
  });

  it.each([false, true])(
    'keeps one focused host holding the DOM selection while measurement fails and recovers (virtualize: %p)',
    (virtualize) => {
      const editor = createEditor({
        initialValue: [paragraph('Persistent host')],
        lifecycleErrorSink() {},
      });
      const failing = (): PageLayoutEngine => ({
        compose() {
          throw new Error('measurement unavailable');
        },
      });
      const measuring = (): PageLayoutEngine => ({ compose: engine.compose });
      const tree = (pageEngine: PageLayoutEngine) => (
        <EditorRoot editor={editor}>
          <PagedEditable
            aria-label="Document"
            engine={pageEngine}
            page={page}
            virtualize={virtualize}
          />
        </EditorRoot>
      );
      const mounted = render(tree(failing()));
      const host = mounted.getByRole('textbox', { name: 'Document' });

      act(() => {
        host.focus();
        editor.update.selection.set({ offset: 3, path: [0, 0] });
      });
      [measuring(), failing(), measuring()].forEach((stage) =>
        mounted.rerender(tree(stage))
      );

      const current = mounted.getByRole('textbox', { name: 'Document' });

      expect({
        focused: document.activeElement === current,
        pages: mounted.container.querySelectorAll('[data-editor-page]').length,
        sameHost: current === host,
        selectionInHost: current.contains(
          document.getSelection()?.anchorNode ?? null
        ),
      }).toEqual({
        focused: true,
        pages: 1,
        sameHost: true,
        selectionInHost: true,
      });
    }
  );

  it('keeps a typed-into block placed after the commit', async () => {
    const text = 'word '.repeat(60);
    const editor = createEditor({
      initialValue: [paragraph(text), paragraph('Second')],
    });
    const mounted = render(
      <EditorRoot editor={editor}>
        <PagedEditable
          engine={engine}
          page={page}
          renderElement={ElementProbe}
        />
      </EditorRoot>
    );
    const block = mounted.getByTestId('element-paragraph-0');

    await act(async () => {
      editor.update.text.insert('abc', {
        at: { offset: text.length, path: [0, 0] },
      });
    });

    expect(getComputedStyle(block).position).toBe('absolute');
  });

  it('keeps an editor nested in a placed element out of the outer placements', () => {
    const inner = createEditor({ initialValue: [paragraph('Inner')] });
    const editor = createEditor({ initialValue: [paragraph('Outer')] });
    const mounted = render(
      <EditorRoot editor={editor}>
        <PagedEditable
          engine={engine}
          page={page}
          renderElement={({ attributes, children }) => (
            <div {...attributes}>
              {children}
              <div contentEditable={false}>
                <EditorRoot editor={inner}>
                  <Editable
                    aria-label="Inner"
                    renderElement={(props) => (
                      <div {...props.attributes}>{props.children}</div>
                    )}
                  />
                </EditorRoot>
              </div>
            </div>
          )}
        />
      </EditorRoot>
    );

    expect(
      mounted
        .getByRole('textbox', { name: 'Inner' })
        .querySelector<HTMLElement>('[data-editor-node="element"]')?.style
        .position
    ).toBe('');
  });

  it('keeps author styles on a direct child that is never placed', () => {
    const rows = [0, 1].map((index) => ({
      children: [paragraph(`Row ${index + 1}`)],
      type: 'row' as const,
    }));
    const editor = createEditor({
      initialValue: [{ children: rows, type: 'table' as const }],
    });
    const mounted = render(
      <EditorRoot editor={editor}>
        <PagedEditable
          engine={engine}
          fragmentation={({ content, element }) =>
            element.type === 'table'
              ? {
                  sizes: element.children.map(() => ({
                    height: 40,
                    width: content.width,
                  })),
                  type: 'direct-children',
                }
              : undefined
          }
          page={{
            margins: { bottom: 500, left: 72, right: 72, top: 500 },
            preset: 'letter',
          }}
          renderElement={({ attributes, children, element }) => (
            <div
              {...attributes}
              data-testid={`${String(element.type)}-${attributes['data-editor-path']}`}
              style={{ position: 'relative', width: 123 }}
            >
              {children}
            </div>
          )}
          virtualize
        />
      </EditorRoot>
    );
    const row = mounted.getByTestId('row-0,1');

    expect({
      position: getComputedStyle(row).position,
      width: getComputedStyle(row).width,
    }).toEqual({ position: 'relative', width: '123px' });
  });

  it('keeps the canvas width over a caller width and passes other caller styles', () => {
    const editor = createEditor({ initialValue: [paragraph('Styled host')] });
    const mounted = render(
      <EditorRoot editor={editor}>
        <PagedEditable
          aria-label="Document"
          engine={engine}
          page={page}
          style={{ color: 'red', width: 10 }}
        />
      </EditorRoot>
    );
    const host = mounted.getByRole('textbox', { name: 'Document' });

    expect({ color: host.style.color, width: host.style.width }).toEqual({
      color: 'red',
      width: '816px',
    });
  });

  it('lets projected runs inherit the editable text color', () => {
    const editor = createEditor({ initialValue: [paragraph('Inherited')] });
    const mounted = render(
      <EditorRoot editor={editor}>
        <PagedEditable engine={engine} page={page} />
      </EditorRoot>
    );

    expect(
      [
        ...mounted.container.querySelectorAll<HTMLElement>(
          '[data-pagination-line]'
        ),
      ].map((run) => run.style.color)
    ).toEqual(['']);
  });

  it('renders one container per measured run and one break per non-final line', async () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [
            { text: 'Projected '.repeat(12) },
            { bold: true, text: 'bold run ' },
            { text: 'tail '.repeat(30) },
          ],
          type: 'paragraph',
        },
      ],
    });
    const highlight: DecorationSource = {
      id: 'highlight',
      read: ({ entry: [node, path] }) =>
        TextApi.isText(node) && path.at(-1) === 0
          ? [
              {
                attributes: { 'data-highlight': true },
                key: 'highlight',
                range: {
                  anchor: { offset: 2, path },
                  focus: { offset: 6, path },
                },
              },
            ]
          : [],
    };
    const editableRef = createRef<HTMLDivElement>();
    const LineRead = () => {
      const lines = usePageLayout(editableRef)?.fragments.flatMap((fragment) =>
        fragment.type === 'text' ? fragment.lines : []
      );

      return (
        <output
          data-lines={lines?.length}
          data-runs={lines?.flatMap((line) => line.runs).length}
          data-testid="lines"
        />
      );
    };
    const mounted = render(
      <EditorRoot decorations={[highlight]} editor={editor}>
        <LineRead />
        <PagedEditable engine={engine} page={page} ref={editableRef} />
      </EditorRoot>
    );

    act(() => {
      editor.update.selection.set({ offset: 0, path: [0, 0] });
    });
    const published = await waitFor(() => {
      const { lines, runs } = mounted.getByTestId('lines').dataset;

      expect(lines).toBeDefined();
      return { lines: Number(lines), runs: Number(runs) };
    });

    expect({
      breaks: mounted.container.querySelectorAll(
        '[data-pagination-native-flow-break="true"]'
      ).length,
      containers: mounted.container.querySelectorAll('[data-pagination-line]')
        .length,
    }).toEqual({ breaks: published.lines - 1, containers: published.runs });
  });

  it.each([false, true])(
    're-renders no element when the caret moves to another block (virtualize: %p)',
    (virtualize) => {
      const editor = createEditor({
        initialValue: Array.from({ length: 40 }, (_, index) =>
          paragraph(`${index} ${'measured words flow here '.repeat(8)}`)
        ),
      });
      let elementRenders = 0;

      render(
        <EditorRoot editor={editor}>
          <PagedEditable
            engine={engine}
            page={page}
            renderElement={({ attributes, children }) => {
              elementRenders += 1;
              return <div {...attributes}>{children}</div>;
            }}
            virtualize={virtualize}
          />
        </EditorRoot>
      );
      act(() => {
        editor.update.selection.set({ offset: 0, path: [0, 0] });
      });
      elementRenders = 0;
      act(() => {
        editor.update.selection.set({ offset: 0, path: [1, 0] });
      });

      expect(elementRenders).toBe(0);
    }
  );

  it('puts no native-flow break after a hard line break', () => {
    const editor = createEditor({
      initialValue: [paragraph('alpha line\nbeta line')],
    });
    const mounted = render(
      <EditorRoot editor={editor}>
        <PagedEditable engine={engine} page={page} />
      </EditorRoot>
    );

    act(() => {
      editor.update.selection.set({ offset: 0, path: [0, 0] });
    });

    expect(
      [
        ...mounted.container.querySelectorAll<HTMLElement>(
          '[data-pagination-line]'
        ),
      ].map((run) => ({
        break: run.getAttribute('data-pagination-native-flow-break'),
        position: run.style.position,
      }))
    ).toEqual([
      { break: null, position: '' },
      { break: null, position: '' },
    ]);
  });

  it('renders an editor nested in a paged element as it renders outside one', () => {
    const innerHTML = (outer: 'paged' | 'plain') => {
      const inner = createEditor({ initialValue: [paragraph('Inner text')] });
      const editor = createEditor({ initialValue: [paragraph('Outer')] });
      const renderElement = ({ attributes, children }: RenderElementProps) => (
        <div {...attributes}>
          {children}
          <div contentEditable={false}>
            <EditorRoot editor={inner}>
              <Editable aria-label="Inner" />
            </EditorRoot>
          </div>
        </div>
      );
      const mounted = render(
        <EditorRoot editor={editor}>
          {outer === 'paged' ? (
            <PagedEditable
              engine={engine}
              page={page}
              renderElement={renderElement}
            />
          ) : (
            <Editable renderElement={renderElement} />
          )}
        </EditorRoot>
      );
      const html = mounted
        .getByRole('textbox', { name: 'Inner' })
        .innerHTML.replaceAll(/\s[\w-]+="[^"]*"/g, '');

      cleanup();
      return html;
    };

    expect(innerHTML('paged')).toBe(innerHTML('plain'));
  });

  it.each([
    [3, 5],
    [0, 2],
    [0, 8],
  ])(
    'keeps a retained authored fragment from %p to %p inside its run container',
    (start, end) => {
      const errors: string[] = [];
      const originalError = console.error;

      console.error = (...args: unknown[]) => {
        errors.push(args.map(String).join(' '));
      };
      try {
        const source = createEditor({
          initialValue: [paragraph('ABCDEFGH')],
          plugins: [authored({ authorId: 'alice' })],
        });
        const view = createReactRuntimeViewEditor(
          createEditorView(source, {
            authored: { intent: 'propose', projection: 'markup' },
          })
        );

        view.update.text.delete({
          at: {
            anchor: { offset: start, path: [0, 0] },
            focus: { offset: end, path: [0, 0] },
          },
        });
        const mounted = render(
          <PliteRuntimeProvider editor={view}>
            <PliteRuntimeView directEditor={view}>
              <PagedEditable
                aria-label="Document"
                engine={engine}
                page={page}
              />
            </PliteRuntimeView>
          </PliteRuntimeProvider>
        );

        const host = mounted.getByRole('textbox', { name: 'Document' });
        const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
        const outside: string[] = [];

        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const text = node.textContent?.replaceAll('\uFEFF', '') ?? '';

          if (text && !node.parentElement?.closest('[data-pagination-line]')) {
            outside.push(text);
          }
        }

        expect({
          containers: host.querySelectorAll('[data-pagination-line]').length,
          duplicateKeys: errors.filter((error) => error.includes('same key'))
            .length,
          outside,
        }).toEqual({ containers: 1, duplicateKeys: 0, outside: [] });
      } finally {
        console.error = originalError;
      }
    }
  );

  it("keeps a placement when a renderer's own style changes", () => {
    const editor = createEditor({
      initialValue: [paragraph('First'), paragraph('Second')],
    });
    const widths = new Map<
      string,
      React.Dispatch<React.SetStateAction<number>>
    >();
    const Wrapper = ({
      attributes,
      children,
    }: Pick<RenderElementProps, 'attributes' | 'children'>) => {
      const [width, setWidth] = React.useState(300);

      widths.set(attributes['data-editor-path'], setWidth);
      return (
        <div
          data-testid={`wrapper-${attributes['data-editor-path']}`}
          style={{ position: 'relative', width }}
        >
          <span contentEditable={false}>handle</span>
          <div {...attributes}>{children}</div>
        </div>
      );
    };
    const mounted = render(
      <EditorRoot editor={editor}>
        <PagedEditable
          engine={engine}
          page={page}
          renderElement={(props) => <Wrapper {...props} />}
        />
      </EditorRoot>
    );
    const wrapper = mounted.getByTestId('wrapper-1');
    const placedWidth = getComputedStyle(wrapper).width;

    act(() => widths.get('1')?.(450));

    expect({
      position: getComputedStyle(wrapper).position,
      width: getComputedStyle(wrapper).width,
    }).toEqual({ position: 'absolute', width: placedWidth });
  });

  it("returns a renderer's current style when its placement clears", async () => {
    const editor = createEditor({
      initialValue: [paragraph('First'), paragraph('Second')],
      lifecycleErrorSink() {},
    });
    const tree = (width: number) => (
      <EditorRoot editor={editor}>
        <PagedEditable
          engine={engine}
          page={page}
          renderElement={({ attributes, children }) => (
            <div
              data-testid={`wrapper-${attributes['data-editor-path']}`}
              style={{ position: 'relative', width }}
            >
              <span contentEditable={false}>handle</span>
              <div {...attributes}>{children}</div>
            </div>
          )}
        />
      </EditorRoot>
    );
    const mounted = render(tree(300));

    mounted.rerender(tree(450));
    await act(async () => {
      editor.update.nodes.insert(
        {
          children: [{ children: [{ text: 'cell' }], type: 'row' }],
          type: 'table',
        },
        { at: [0] }
      );
    });

    const wrapper = mounted.getByTestId('wrapper-2');

    expect({
      position: getComputedStyle(wrapper).position,
      width: getComputedStyle(wrapper).width,
    }).toEqual({ position: 'relative', width: '450px' });
  });

  it('clears a placed wrapper when its renderer drops the bound element', async () => {
    const editor = createEditor({
      initialValue: [paragraph('First'), paragraph('Second')],
    });
    const loaders = new Map<
      string,
      React.Dispatch<React.SetStateAction<boolean>>
    >();
    const Wrapper = ({
      attributes,
      children,
    }: Pick<RenderElementProps, 'attributes' | 'children'>) => {
      const [loading, setLoading] = React.useState(false);

      loaders.set(attributes['data-editor-path'], setLoading);
      return (
        <div
          data-testid={`wrapper-${attributes['data-editor-path']}`}
          style={{ position: 'relative' }}
        >
          {loading ? (
            <span>loading</span>
          ) : (
            <div {...attributes}>{children}</div>
          )}
        </div>
      );
    };
    const mounted = render(
      <EditorRoot editor={editor}>
        <PagedEditable
          engine={engine}
          page={page}
          renderElement={(props) => <Wrapper {...props} />}
        />
      </EditorRoot>
    );
    const wrapper = mounted.getByTestId('wrapper-1');

    expect(getComputedStyle(wrapper).position).toBe('absolute');
    await act(async () => loaders.get('1')?.(true));

    expect(getComputedStyle(wrapper).position).toBe('relative');
  });

  it('clears a placed wrapper when an EditorElement inside it detaches', async () => {
    const editor = createEditor({
      initialValue: [paragraph('First'), paragraph('Second')],
    });
    const loaders = new Map<
      string,
      React.Dispatch<React.SetStateAction<boolean>>
    >();
    const Wrapper = ({
      attributes,
      children,
    }: Pick<RenderElementProps, 'attributes' | 'children'>) => {
      const [loading, setLoading] = React.useState(false);

      loaders.set(attributes['data-editor-path'], setLoading);
      return (
        <div
          data-testid={`wrapper-${attributes['data-editor-path']}`}
          style={{ position: 'relative' }}
        >
          {loading ? (
            <span>loading</span>
          ) : (
            <EditorElement {...attributes}>{children}</EditorElement>
          )}
        </div>
      );
    };
    const renderElement = (props: RenderElementProps) => <Wrapper {...props} />;
    const mounted = render(
      <EditorRoot editor={editor}>
        <PagedEditable
          engine={engine}
          page={page}
          renderElement={renderElement}
        />
      </EditorRoot>
    );
    const wrapper = mounted.getByTestId('wrapper-1');

    expect(getComputedStyle(wrapper).position).toBe('absolute');
    await act(async () => loaders.get('1')?.(true));

    expect(getComputedStyle(wrapper).position).toBe('relative');
  });

  it('drops every placement after a failed measurement when the renderer merges its ref without forwarding cleanups', async () => {
    const editor = createEditor({
      initialValue: [
        paragraph('First'),
        paragraph('Second'),
        paragraph('Third'),
      ],
      lifecycleErrorSink() {},
    });
    const Merged = ({ attributes, children }: RenderElementProps) => {
      const own = React.useRef<HTMLDivElement | null>(null);
      const { ref: attributeRef } = attributes;
      const ref = React.useCallback(
        (node: HTMLDivElement | null) => {
          own.current = node;
          attributeRef(node);
        },
        [attributeRef]
      );

      return (
        <div {...attributes} ref={ref}>
          {children}
        </div>
      );
    };
    const mounted = render(
      <EditorRoot editor={editor}>
        <PagedEditable engine={engine} page={page} renderElement={Merged} />
      </EditorRoot>
    );

    expect(
      getComputedStyle(
        mounted.container.querySelector<HTMLElement>('[data-editor-path="0"]')!
      ).position
    ).toBe('absolute');
    await act(async () => {
      editor.update.nodes.insert(
        {
          children: [{ children: [{ text: 'cell' }], type: 'row' }],
          type: 'table',
        },
        { at: [0] }
      );
    });

    expect(
      [
        ...mounted.container.querySelectorAll<HTMLElement>(
          '[data-editor-node="element"]'
        ),
      ]
        .filter((element) => getComputedStyle(element).position === 'absolute')
        .map((element) => element.dataset.editorPath)
    ).toEqual([]);
  });

  it('renders the run of an empty text node in its container', () => {
    const editor = createEditor({
      initialValue: [paragraph('Hello'), paragraph('')],
    });
    const mounted = render(
      <EditorRoot editor={editor}>
        <PagedEditable aria-label="Document" engine={engine} page={page} />
      </EditorRoot>
    );

    expect(
      mounted
        .getByRole('textbox', { name: 'Document' })
        .querySelectorAll('[data-editor-path="1,0"] [data-pagination-line]')
        .length
    ).toBe(1);
  });

  it('drops every placement after an insert makes measurement fail', async () => {
    const editor = createEditor({
      initialValue: [
        paragraph('First'),
        paragraph('Second'),
        paragraph('Third'),
      ],
      lifecycleErrorSink() {},
    });
    const mounted = render(
      <EditorRoot editor={editor}>
        <PagedEditable
          engine={engine}
          page={page}
          renderElement={ElementProbe}
        />
      </EditorRoot>
    );

    expect(
      getComputedStyle(mounted.getByTestId('element-paragraph-0')).position
    ).toBe('absolute');
    await act(async () => {
      editor.update.nodes.insert(
        {
          children: [{ children: [{ text: 'cell' }], type: 'row' }],
          type: 'table',
        },
        { at: [0] }
      );
    });

    expect(
      [
        ...mounted.container.querySelectorAll<HTMLElement>(
          '[data-editor-node="element"]'
        ),
      ]
        .filter((element) => getComputedStyle(element).position === 'absolute')
        .map((element) => element.dataset.editorPath)
    ).toEqual([]);
  });

  it('shares one font listener owner and invalidates each distinct engine once', async () => {
    const listeners = new Map<string, Set<() => void>>();
    let added = 0;
    let removed = 0;
    const fonts = {
      addEventListener(type: string, listener: () => void) {
        added += 1;
        const typeListeners = listeners.get(type) ?? new Set();

        typeListeners.add(listener);
        listeners.set(type, typeListeners);
      },
      ready: Promise.resolve(),
      removeEventListener(type: string, listener: () => void) {
        removed += 1;
        listeners.get(type)?.delete(listener);
      },
    } as unknown as FontFaceSet;
    const fontsDescriptor = Object.getOwnPropertyDescriptor(document, 'fonts');

    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: fonts,
    });

    try {
      const editor = createEditor({ initialValue: [paragraph('Fonts')] });
      const base = createEstimatedPageLayoutEngine();
      let firstInvalidations = 0;
      let secondInvalidations = 0;
      const firstEngine: PageLayoutEngine = {
        compose: base.compose,
        invalidate: () => {
          firstInvalidations += 1;
        },
      };
      const secondEngine: PageLayoutEngine = {
        compose: base.compose,
        invalidate: () => {
          secondInvalidations += 1;
        },
      };
      const mounted = render(
        <EditorRoot editor={editor}>
          <PagedEditable engine={firstEngine} page={page} />
          <PagedEditable engine={firstEngine} page={page} />
          <PagedEditable engine={secondEngine} page={page} />
        </EditorRoot>
      );

      await waitFor(() => {
        expect(firstInvalidations).toBe(1);
        expect(secondInvalidations).toBe(1);
      });
      expect(added).toBe(2);

      await act(async () => {
        listeners.get('loadingdone')?.forEach((listener) => listener());
      });
      await waitFor(() => {
        expect(firstInvalidations).toBe(2);
        expect(secondInvalidations).toBe(2);
      });

      mounted.unmount();
      expect(removed).toBe(2);
    } finally {
      if (fontsDescriptor) {
        Object.defineProperty(document, 'fonts', fontsDescriptor);
      } else {
        Reflect.deleteProperty(document, 'fonts');
      }
    }
  });

  it('deduplicates a shared engine cache invalidator across one font epoch', () => {
    const firstEngine: PageLayoutEngine = { compose: engine.compose };
    const secondEngine: PageLayoutEngine = { compose: engine.compose };
    let firstLocal = 0;
    let secondLocal = 0;
    let shared = 0;
    const invalidateShared = () => {
      shared += 1;
    };

    registerPageLayoutEngineInvalidator(firstEngine, {
      local: () => {
        firstLocal += 1;
      },
      shared: invalidateShared,
    });
    registerPageLayoutEngineInvalidator(secondEngine, {
      local: () => {
        secondLocal += 1;
      },
      shared: invalidateShared,
    });
    invalidatePageLayoutEngines(new Set([firstEngine, secondEngine]));

    expect({ firstLocal, secondLocal, shared }).toEqual({
      firstLocal: 1,
      secondLocal: 1,
      shared: 1,
    });
  });

  it('gives page chrome exact identity and sizing without document children', () => {
    const editor = createEditor({ initialValue: [paragraph('Chrome')] });
    const calls: Array<Record<string, unknown>> = [];
    const mounted = render(
      <EditorRoot editor={editor}>
        <PagedEditable
          engine={engine}
          page={page}
          renderPage={(props) => {
            calls.push(props);
            return <section {...props.attributes} data-testid="paper" />;
          }}
        />
      </EditorRoot>
    );
    const paper = mounted.getByTestId('paper');

    expect(Object.keys(calls[0] ?? {}).sort()).toEqual(['attributes', 'page']);
    expect(paper.getAttribute('data-editor-page-index')).toBe('0');
    expect(paper.style.width).toBe('816px');
    expect(paper.style.height).toBe('1056px');
  });

  it('resolves measurement and paint inside one named-root view', async () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('Main')],
        roots: { header: [paragraph('Header')] },
      },
    });
    const editableRef = createRef<HTMLDivElement>();
    const mounted = render(
      <EditorRoot editor={editor}>
        <LayoutRead editableRef={editableRef} />
        <PagedEditable
          engine={engine}
          page={page}
          ref={editableRef}
          renderElement={ElementProbe}
          root="header"
        />
      </EditorRoot>
    );

    await waitFor(() =>
      expect(mounted.getByTestId('layout-read').dataset.root).toBe('header')
    );
    expect(mounted.getByTestId('element-paragraph-0').textContent).toContain(
      'Header'
    );
  });

  it('reports measurement failure, keeps the editable usable, and publishes null', async () => {
    const errors: unknown[] = [];
    const editor = createEditor({
      initialValue: [paragraph('Safe fallback')],
      lifecycleErrorSink(error) {
        errors.push(error);
      },
    });
    const editableRef = createRef<HTMLDivElement>();
    const failingEngine: PageLayoutEngine = {
      compose() {
        throw new Error('measurement failed');
      },
    };
    const mounted = render(
      <EditorRoot editor={editor}>
        <LayoutRead editableRef={editableRef} />
        <PagedEditable
          aria-label="Fallback"
          engine={failingEngine}
          page={page}
          ref={editableRef}
        />
      </EditorRoot>
    );

    await waitFor(() => expect(errors).toHaveLength(1));
    expect(errors[0]).toMatchObject({ phase: 'measure', source: 'pagination' });
    expect(mounted.getByTestId('layout-read').dataset.version).toBe('null');
    expect(mounted.getByRole('textbox', { name: 'Fallback' })).toBeTruthy();
  });

  it('settles with inline fragmentation and typography while it reads the published layout', async () => {
    const editor = createEditor({ initialValue: [paragraph('Converges')] });
    let renders = 0;
    const Document = ({ lineHeight }: { lineHeight: number }) => {
      renders += 1;
      const editableRef = useRef<HTMLDivElement>(null);
      const layout = usePageLayout(editableRef);

      return (
        <>
          <output
            data-height={layout?.fragments[0]?.rect.height}
            data-testid="layout"
            data-version={layout?.version}
          />
          <PagedEditable
            engine={engine}
            fragmentation={() => undefined}
            page={page}
            ref={editableRef}
            typography={{ block: () => ({ lineHeight }) }}
          />
        </>
      );
    };
    const tree = (lineHeight: number) => (
      <EditorRoot editor={editor}>
        <Document lineHeight={lineHeight} />
      </EditorRoot>
    );
    const mounted = render(tree(24));
    const read = () => mounted.getByTestId('layout').dataset;

    await waitFor(() => expect(read().height).toBe('24'));
    const settled = renders;
    const firstVersion = Number(read().version);

    await act(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 20);
      });
    });
    expect(renders).toBe(settled);

    act(() => {
      editor.update.text.insert('!', {
        at: { offset: 'Converges'.length, path: [0, 0] },
      });
    });
    await waitFor(() =>
      expect(Number(read().version)).toBeGreaterThan(firstVersion)
    );

    mounted.rerender(tree(40));
    await waitFor(() => expect(read().height).toBe('40'));
  });

  it('supports a toolbar that renders before the editable ref is assigned', async () => {
    const editor = createEditor({ initialValue: [paragraph('Late ref')] });

    const Document = () => {
      const editableRef = useRef<HTMLDivElement>(null);

      return (
        <>
          <LayoutRead editableRef={editableRef} />
          <PagedEditable engine={engine} page={page} ref={editableRef} />
        </>
      );
    };
    const mounted = render(
      <EditorRoot editor={editor}>
        <Document />
      </EditorRoot>
    );

    await waitFor(() =>
      expect(mounted.getByTestId('layout-read').textContent).toBe('1')
    );
  });
  it('hydrates server HTML rendered where text cannot be measured, then paginates', async () => {
    const editor = createEditor({ initialValue: [paragraph('Server text')] });
    let canMeasure = false;
    const serverSafeEngine: PageLayoutEngine = {
      compose(input) {
        if (!canMeasure) throw new Error('No text metrics on the server');
        return engine.compose(input);
      },
    };
    const tree = (
      <EditorRoot editor={editor}>
        <PagedEditable
          aria-label="Hydrated"
          engine={serverSafeEngine}
          page={page}
        />
      </EditorRoot>
    );
    const recoverableErrors: unknown[] = [];
    const container = document.createElement('div');
    let root: Root | undefined;

    container.innerHTML = renderToString(tree);
    document.body.append(container);
    canMeasure = true;
    try {
      await act(async () => {
        root = hydrateRoot(container, tree, {
          onRecoverableError(error) {
            recoverableErrors.push(error);
          },
        });
        await Promise.resolve();
      });

      expect(recoverableErrors).toEqual([]);
      await waitFor(() =>
        expect(container.querySelectorAll('[data-editor-page]')).toHaveLength(1)
      );
    } finally {
      await act(async () => {
        root?.unmount();
      });
      container.remove();
    }
  });
});
