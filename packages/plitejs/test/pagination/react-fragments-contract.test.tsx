import { afterAll, afterEach, describe, expect, it } from 'bun:test';

import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import {
  createEditor,
  EditorRoot,
  type RenderElementProps,
} from 'plitejs/react';
import React, { createRef, useRef } from 'react';

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

    expect(element.getAttribute('data-fragment-pages')).toBe('0');
    expect(element.style.position).toBe('absolute');
    expect(element.style.left).toBe('72px');
    expect(element.style.top).toBe('72px');
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
    expect(table.style.position).toBe('absolute');
    expect(firstRow.style.position).toBe('absolute');
    expect(firstRow.style.top).toBe('0px');
    expect(Number.parseFloat(secondRow.style.top)).toBeGreaterThan(40);
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
});
