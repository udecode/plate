// Test-local source assertion.
import { act, render, waitFor } from '@testing-library/react';
import { type Value, NodeApi } from 'plitejs';
import React from 'react';

import {
  replace as editorReplace,
  string as editorString,
} from '../../src/internal';
import { createEditor, Editable, PliteElement, Plite } from '../../src/react';
import {
  DOMCoverageBoundaryRange,
  DOMCoverageSelfBoundary,
} from '../../src/react/components/dom-coverage-boundary';
import { isPliteReactDevelopmentEnvironment } from '../../src/react/components/editable-text-blocks';
import { getMountedEditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';
import { createLargeBoundarySurface } from './render-probes/dom-coverage-render-probe';

const createNestedChildren = (): Value => [
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
];

const createHeaderFooterChildren = (): Value => [
  {
    type: 'header',
    children: [{ text: 'Hidden header' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Visible body' }],
  },
  {
    type: 'footer',
    children: [{ text: 'Hidden footer' }],
  },
];

const createLargeHiddenBoundaryChildren = (hiddenCount = 1000): Value => [
  {
    type: 'section',
    children: [
      {
        type: 'summary',
        children: [{ text: 'Large summary' }],
      },
      ...Array.from({ length: hiddenCount }, (_, index) => ({
        type: 'paragraph',
        children: [{ text: `Hidden item ${index}` }],
      })),
    ],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Outside sibling' }],
  },
];

const BoundaryVisibilityContext = React.createContext(false);

describe('DOM coverage private boundary harness', () => {
  test.each(['left', 'right'])(
    'keeps coverage independent when the %s view unmounts first',
    async (removed) => {
      const editor = createEditor({ initialValue: createNestedChildren() });
      const view = (id: string) => (
        <Editable
          key={id}
          id={id}
          renderElement={({ children, element }) => {
            if (element.type !== 'section') {
              return (
                <PliteElement style={{ position: 'relative' }}>
                  {children}
                </PliteElement>
              );
            }
            const nodes = React.Children.toArray(children);
            return (
              <PliteElement style={{ position: 'relative' }}>
                {nodes[0]}
                <DOMCoverageBoundaryRange
                  boundaryId="local-body"
                  content={nodes.slice(1)}
                  copyPolicy={id === 'left' ? 'model' : 'exclude'}
                  from={1}
                >
                  Collapsed body
                </DOMCoverageBoundaryRange>
              </PliteElement>
            );
          }}
        />
      );
      const rendered = render(
        <Plite editor={editor}>
          {view('left')}
          {view('right')}
        </Plite>
      );
      const left = getMountedEditableDOMRuntime(
        editor,
        rendered.container.querySelector('#left')!
      )!;
      const right = getMountedEditableDOMRuntime(
        editor,
        rendered.container.querySelector('#right')!
      )!;
      await waitFor(() => {
        expect(left.domCoverage.getBoundary('local-body')?.copyPolicy).toBe(
          'model'
        );
        expect(right.domCoverage.getBoundary('local-body')?.copyPolicy).toBe(
          'exclude'
        );
      });
      expect(left.domCoverage).not.toBe(right.domCoverage);
      for (const runtime of [left, right]) {
        const point = runtime.domCoverage.resolveDOMPointOrBoundary({
          path: [1, 0],
          offset: 2,
        });
        expect(point.type).toBe('dom-point');
        if (point.type === 'dom-point') {
          expect(runtime.rootElement?.contains(point.domPoint[0])).toBe(true);
        }
        const sibling = runtime === left ? right : left;
        const placeholder = sibling.rootElement!.querySelector(
          '[data-plite-dom-coverage-boundary]'
        )!;
        expect(
          runtime.domCoverage.resolvePlitePointFromBoundary([placeholder, 0])
        ).toBeNull();
      }
      const remaining = removed === 'left' ? 'right' : 'left';
      rendered.rerender(<Plite editor={editor}>{view(remaining)}</Plite>);
      expect(
        (removed === 'left' ? left : right).domCoverage.getBoundaries()
      ).toEqual([]);
      expect(
        (remaining === 'left' ? left : right).domCoverage.getBoundaries()
      ).toHaveLength(1);
      rendered.unmount();
      expect(left.domCoverage.getBoundaries()).toEqual([]);
      expect(right.domCoverage.getBoundaries()).toEqual([]);
    }
  );

  test('renderElement dev coverage guard treats missing process env as production-safe', () => {
    const originalProcess = Object.getOwnPropertyDescriptor(
      globalThis,
      'process'
    );

    try {
      Object.defineProperty(globalThis, 'process', {
        configurable: true,
        value: undefined,
      });

      expect(isPliteReactDevelopmentEnvironment()).toBe(false);
      expect(isPliteReactDevelopmentEnvironment({})).toBe(false);
      expect(isPliteReactDevelopmentEnvironment({ env: {} })).toBe(false);
      expect(
        isPliteReactDevelopmentEnvironment({ env: { NODE_ENV: 'production' } })
      ).toBe(false);
      expect(
        isPliteReactDevelopmentEnvironment({ env: { NODE_ENV: 'development' } })
      ).toBe(true);
    } finally {
      if (originalProcess) {
        Object.defineProperty(globalThis, 'process', originalProcess);
      }
    }
  });

  test('BoundaryRange registers a hidden child range and omits its stale DOM', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    const rendered = render(
      <Plite editor={editor}>
        <Editable
          id="dom-coverage-boundary-range"
          renderElement={({ children, element }) => {
            if (element.type === 'section') {
              const childNodes = React.Children.toArray(children);

              return (
                <PliteElement style={{ position: 'relative' }}>
                  {childNodes[0]}
                  <DOMCoverageBoundaryRange
                    boundaryId="section-body"
                    content={childNodes.slice(1)}
                    from={1}
                  >
                    Collapsed body
                  </DOMCoverageBoundaryRange>
                </PliteElement>
              );
            }

            return (
              <PliteElement style={{ position: 'relative' }}>
                {children}
              </PliteElement>
            );
          }}
        />
      </Plite>
    );

    await waitFor(() => {
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'section-body'
        ) ?? null
      ).toMatchObject({
        boundaryId: 'section-body',
        copyPolicy: 'model',
        coveredPathRanges: [{ anchor: [0, 1], focus: [0, 1] }],
      });
    });

    expect(rendered.getByText('Collapsed body')).toBeTruthy();
    expect(rendered.container.textContent).toContain('Summary');
    expect(rendered.container.textContent).toContain('Visible beta');
    expect(rendered.container.textContent).not.toContain('Hidden alpha');
    expect(
      (
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundaryForPoint({
          path: [0, 1, 0],
          offset: 0,
        }) ?? null
      )?.boundaryId
    ).toBe('section-body');
  });

  test('BoundaryRange registers before dev safety reports omitted children', async () => {
    const editor = createEditor();
    const errors: string[] = [];
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation((message: unknown) => {
        errors.push(String(message));
      });

    editorReplace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    try {
      render(
        <Plite editor={editor}>
          <Editable
            id="dom-coverage-boundary-range-lifecycle"
            renderElement={({ children, element }) => {
              if (element.type === 'section') {
                const childNodes = React.Children.toArray(children);

                return (
                  <PliteElement style={{ position: 'relative' }}>
                    {childNodes[0]}
                    <DOMCoverageBoundaryRange
                      boundaryId="section-body"
                      content={childNodes.slice(1)}
                      from={1}
                    >
                      Collapsed body
                    </DOMCoverageBoundaryRange>
                  </PliteElement>
                );
              }

              return (
                <PliteElement style={{ position: 'relative' }}>
                  {children}
                </PliteElement>
              );
            }}
          />
        </Plite>
      );

      await waitFor(() => {
        expect(
          getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
            'section-body'
          ) ?? null
        ).not.toBeNull();
      });

      await act(async () => {
        await Promise.resolve();
      });

      expect(
        errors.filter((message) =>
          message.includes('without a DOM coverage boundary')
        )
      ).toEqual([]);
    } finally {
      errorSpy.mockRestore();
    }
  });

  test('BoundaryRange unregisters and renders current model content when expanded', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    const Surface = ({ hidden }: { hidden: boolean }) => (
      <Plite editor={editor}>
        <Editable
          id="dom-coverage-boundary-range-toggle"
          renderElement={({ children, element }) => {
            if (element.type === 'section') {
              const childNodes = React.Children.toArray(children);

              return (
                <PliteElement style={{ position: 'relative' }}>
                  {childNodes[0]}
                  <DOMCoverageBoundaryRange
                    boundaryId="section-body"
                    content={childNodes.slice(1)}
                    from={1}
                    hidden={hidden}
                  >
                    Collapsed body
                  </DOMCoverageBoundaryRange>
                </PliteElement>
              );
            }

            return (
              <PliteElement style={{ position: 'relative' }}>
                {children}
              </PliteElement>
            );
          }}
        />
      </Plite>
    );

    const rendered = render(<Surface hidden />);

    await waitFor(() => {
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'section-body'
        ) ?? null
      ).not.toBeNull();
    });

    rendered.rerender(<Surface hidden={false} />);

    await waitFor(() => {
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'section-body'
        ) ?? null
      ).toBeNull();
      expect(rendered.container.textContent).toContain('Hidden alpha');
    });
  });

  test('SelfBoundary covers hidden first and last root nodes', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createHeaderFooterChildren(),
      selection: null,
    });

    const rendered = render(
      <Plite editor={editor}>
        <Editable
          id="dom-coverage-self-boundary"
          renderElement={({ children, element }) => {
            if (element.type === 'header') {
              return (
                <DOMCoverageSelfBoundary
                  boundaryId="hidden-header"
                  content={children}
                >
                  Header hidden
                </DOMCoverageSelfBoundary>
              );
            }

            if (element.type === 'footer') {
              return (
                <DOMCoverageSelfBoundary
                  boundaryId="hidden-footer"
                  content={children}
                >
                  Footer hidden
                </DOMCoverageSelfBoundary>
              );
            }

            return (
              <PliteElement style={{ position: 'relative' }}>
                {children}
              </PliteElement>
            );
          }}
        />
      </Plite>
    );

    await waitFor(() => {
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'hidden-header'
        ) ?? null
      ).toMatchObject({
        coveredPathRanges: [{ anchor: [0], focus: [0] }],
      });
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'hidden-footer'
        ) ?? null
      ).toMatchObject({
        coveredPathRanges: [{ anchor: [2], focus: [2] }],
      });
    });

    expect(rendered.container.textContent).toContain('Header hidden');
    expect(rendered.container.textContent).toContain('Visible body');
    expect(rendered.container.textContent).toContain('Footer hidden');
    expect(rendered.container.textContent).not.toContain('Hidden header');
    expect(rendered.container.textContent).not.toContain('Hidden footer');

    const headerPlaceholder = rendered.container.querySelector(
      '[data-plite-dom-coverage-boundary="hidden-header"]'
    );
    const footerPlaceholder = rendered.container.querySelector(
      '[data-plite-dom-coverage-boundary="hidden-footer"]'
    );

    expect(headerPlaceholder).toBeTruthy();
    expect(footerPlaceholder).toBeTruthy();
    expect(
      editor.api.dom.assertPlitePoint([headerPlaceholder!, 0], {
        exactMatch: false,
      })
    ).toEqual({ offset: 0, path: [0, 0] });
    expect(
      editor.api.dom.assertPlitePoint([footerPlaceholder!, 0], {
        exactMatch: false,
      })
    ).toEqual({ offset: 0, path: [2, 0] });
  });

  test('renderElement slots expose contentBoundary with optional ids and object materialization payload', async () => {
    const editor = createEditor();
    const materialized: string[] = [];

    editorReplace(editor, {
      children: createHeaderFooterChildren(),
      selection: null,
    });

    render(
      <Plite editor={editor}>
        <Editable
          id="dom-coverage-content-boundary-slot"
          renderElement={({ children, element, slots }) => {
            if (element.type === 'header') {
              return (
                <slots.contentBoundary
                  mounted={false}
                  onMaterialize={({ boundary, range, reason }) => {
                    materialized.push(
                      `${boundary.boundaryId}:${reason}:${range ? editorString(editor, range) : 'no-range'}`
                    );
                  }}
                  scope={{ type: 'self' }}
                >
                  Header hidden by slot
                </slots.contentBoundary>
              );
            }

            return (
              <PliteElement style={{ position: 'relative' }}>
                {children}
              </PliteElement>
            );
          }}
        />
      </Plite>
    );

    let boundaryId = '';

    await waitFor(() => {
      const boundary = (
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundaries() ?? []
      ).find(
        (candidate) =>
          candidate.ownerPath.length === 1 && candidate.ownerPath[0] === 0
      );

      expect(boundary).toMatchObject({
        coveredPathRanges: [{ anchor: [0], focus: [0] }],
      });
      ({ boundaryId } = boundary!);
    });

    expect(boundaryId).toMatch(/^content-boundary:/);

    const range = {
      kind: 'text' as const,
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 'Hidden header'.length, path: [0, 0] },
    };

    expect(
      getMountedEditableDOMRuntime(editor)!.domCoverage.materializeBoundary(
        boundaryId,
        'selection',
        {
          range,
        }
      )
    ).toMatchObject({ status: 'handled' });
    expect(materialized).toEqual([`${boundaryId}:selection:Hidden header`]);
  });

  test('renderElement slots expose contentBoundary for child ranges and self coverage', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createHeaderFooterChildren(),
      selection: null,
    });

    const rendered = render(
      <Plite editor={editor}>
        <Editable
          id="dom-coverage-content-boundary-slot"
          renderElement={({ children, element, slots }) => {
            if (element.type === 'header') {
              return (
                <slots.contentBoundary
                  boundaryId="slot-hidden-header"
                  mounted={false}
                  scope={{ type: 'self' }}
                >
                  Header hidden by slot
                </slots.contentBoundary>
              );
            }

            if (element.type === 'footer') {
              return (
                <slots.contentBoundary
                  boundaryId="slot-hidden-footer"
                  mounted={false}
                  scope={{ type: 'self' }}
                >
                  Footer hidden by slot
                </slots.contentBoundary>
              );
            }

            return (
              <PliteElement style={{ position: 'relative' }}>
                {children}
              </PliteElement>
            );
          }}
        />
      </Plite>
    );

    await waitFor(() => {
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'slot-hidden-header'
        ) ?? null
      ).toMatchObject({
        coveredPathRanges: [{ anchor: [0], focus: [0] }],
      });
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'slot-hidden-footer'
        ) ?? null
      ).toMatchObject({
        coveredPathRanges: [{ anchor: [2], focus: [2] }],
      });
    });

    expect(rendered.container.textContent).toContain('Header hidden by slot');
    expect(rendered.container.textContent).toContain('Visible body');
    expect(rendered.container.textContent).toContain('Footer hidden by slot');
    expect(rendered.container.textContent).not.toContain('Hidden header');
    expect(rendered.container.textContent).not.toContain('Hidden footer');
  });

  test('renderElement slot visibility follows external React context', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    const RenderElement = ({
      children,
      element,
      slots,
    }: Parameters<
      NonNullable<React.ComponentProps<typeof Editable>['renderElement']>
    >[0]) => {
      const mounted = React.useContext(BoundaryVisibilityContext);

      if (element.type === 'section') {
        return (
          <PliteElement style={{ position: 'relative' }}>
            {slots.contentBoundary({
              boundaryId: 'context-section-body',
              mounted,
              scope: {
                from: 0,
                to: element.children.length - 1,
                type: 'children',
              },
            })}
          </PliteElement>
        );
      }

      return (
        <PliteElement style={{ position: 'relative' }}>{children}</PliteElement>
      );
    };
    const Surface = ({ mounted }: { mounted: boolean }) => (
      <BoundaryVisibilityContext value={mounted}>
        <Plite editor={editor}>
          <Editable
            id="dom-coverage-context-boundary-toggle"
            renderElement={RenderElement}
          />
        </Plite>
      </BoundaryVisibilityContext>
    );
    const rendered = render(<Surface mounted={false} />);

    await waitFor(() => {
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'context-section-body'
        ) ?? null
      ).not.toBeNull();
      expect(rendered.container.textContent).not.toContain('Hidden alpha');
    });

    rendered.rerender(<Surface mounted />);

    await waitFor(() => {
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'context-section-body'
        ) ?? null
      ).toBeNull();
      expect(rendered.container.textContent).toContain('Hidden alpha');
    });
  });

  test('renderElement slots cover child ranges without exposing node keys', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    const rendered = render(
      <Plite editor={editor}>
        <Editable
          id="dom-coverage-content-boundary-slot-range"
          renderElement={({ children, element, slots }) => {
            if (element.type === 'section') {
              const childNodes = React.Children.toArray(children);

              return (
                <PliteElement style={{ position: 'relative' }}>
                  {childNodes[0]}
                  <slots.contentBoundary
                    boundaryId="slot-section-body"
                    mounted={false}
                    scope={{ from: 1, type: 'children' }}
                  >
                    Body hidden by slot
                  </slots.contentBoundary>
                </PliteElement>
              );
            }

            return (
              <PliteElement style={{ position: 'relative' }}>
                {children}
              </PliteElement>
            );
          }}
        />
      </Plite>
    );

    await waitFor(() => {
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'slot-section-body'
        ) ?? null
      ).toMatchObject({
        copyPolicy: 'model',
        coveredPathRanges: [{ anchor: [0, 1], focus: [0, 1] }],
      });
    });

    expect(rendered.container.textContent).toContain('Summary');
    expect(rendered.container.textContent).toContain('Body hidden by slot');
    expect(rendered.container.textContent).toContain('Visible beta');
    expect(rendered.container.textContent).not.toContain('Hidden alpha');
  });

  test('renderElement slots render child ranges without materializing all children', () => {
    const editor = createEditor();
    const children = Array.from({ length: 500 }, (_, index) => ({
      type: 'item',
      children: [{ text: `Row ${index + 1}` }],
    }));
    let renderedItemCount = 0;

    editorReplace(editor, {
      children: [
        {
          type: 'section',
          children,
        },
      ],
      selection: null,
    });

    const rendered = render(
      <Plite editor={editor}>
        <Editable
          id="dom-coverage-lazy-child-range-slot"
          renderElement={(props) => {
            if (props.element.type === 'section') {
              return (
                <PliteElement style={{ position: 'relative' }}>
                  <props.slots.contentBoundary
                    boundaryId="lazy-child-range-before"
                    mounted={false}
                    renderPlaceholder={() => null}
                    scope={{ from: 0, to: 249, type: 'children' }}
                  />
                  {props.slots.children({ from: 250, to: 251 })}
                  <props.slots.contentBoundary
                    boundaryId="lazy-child-range-after"
                    mounted={false}
                    renderPlaceholder={() => null}
                    scope={{ from: 252, to: 499, type: 'children' }}
                  />
                </PliteElement>
              );
            }

            if (props.element.type === 'item') {
              renderedItemCount += 1;
            }

            return (
              <PliteElement style={{ position: 'relative' }}>
                {props.children}
              </PliteElement>
            );
          }}
        />
      </Plite>
    );

    expect(renderedItemCount).toBe(2);
    expect(rendered.container.textContent).toContain('Row 251');
    expect(rendered.container.textContent).toContain('Row 252');
    expect(rendered.container.textContent).not.toContain('Row 1');
    expect(rendered.container.textContent).not.toContain('Row 500');
  });

  test('BoundaryRange does not leak duplicate boundaries in StrictMode', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    const Surface = () => (
      <React.StrictMode>
        <Plite editor={editor}>
          <Editable
            id="dom-coverage-boundary-strict-mode"
            renderElement={({ children, element }) => {
              if (element.type === 'section') {
                const childNodes = React.Children.toArray(children);

                return (
                  <PliteElement style={{ position: 'relative' }}>
                    {childNodes[0]}
                    <DOMCoverageBoundaryRange
                      boundaryId="section-body"
                      content={childNodes.slice(1)}
                      from={1}
                    >
                      Collapsed body
                    </DOMCoverageBoundaryRange>
                  </PliteElement>
                );
              }

              return (
                <PliteElement style={{ position: 'relative' }}>
                  {children}
                </PliteElement>
              );
            }}
          />
        </Plite>
      </React.StrictMode>
    );

    const rendered = render(<Surface />);

    await waitFor(() => {
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'section-body'
        ) ?? null
      ).not.toBeNull();
      expect(
        (
          getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundaries() ??
          []
        ).filter((boundary) => boundary.boundaryId === 'section-body')
      ).toHaveLength(1);
    });

    rendered.unmount();

    await waitFor(() => {
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'section-body'
        ) ?? null
      ).toBeNull();
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundaries() ?? []
      ).toHaveLength(0);
    });
  });

  test('BoundaryRange replaces stale boundary ids across rerenders', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    const Surface = ({ boundaryId }: { boundaryId: string }) => (
      <Plite editor={editor}>
        <Editable
          id="dom-coverage-boundary-id-stability"
          renderElement={({ children, element }) => {
            if (element.type === 'section') {
              const childNodes = React.Children.toArray(children);

              return (
                <PliteElement style={{ position: 'relative' }}>
                  {childNodes[0]}
                  <DOMCoverageBoundaryRange
                    boundaryId={boundaryId}
                    content={childNodes.slice(1)}
                    from={1}
                  >
                    Collapsed body
                  </DOMCoverageBoundaryRange>
                </PliteElement>
              );
            }

            return (
              <PliteElement style={{ position: 'relative' }}>
                {children}
              </PliteElement>
            );
          }}
        />
      </Plite>
    );

    const rendered = render(<Surface boundaryId="section-body" />);

    await waitFor(() => {
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'section-body'
        ) ?? null
      ).not.toBeNull();
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundaries() ?? []
      ).toHaveLength(1);
    });

    rendered.rerender(<Surface boundaryId="section-body-next" />);

    await waitFor(() => {
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'section-body'
        ) ?? null
      ).toBeNull();
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'section-body-next'
        ) ?? null
      ).toMatchObject({
        boundaryId: 'section-body-next',
        coveredPathRanges: [{ anchor: [0, 1], focus: [0, 1] }],
      });
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundaries() ?? []
      ).toHaveLength(1);
    });
  });

  test('BoundaryRange follows owner path after structural insert before owner', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    render(
      <Plite editor={editor}>
        <Editable
          id="dom-coverage-boundary-structural-insert"
          renderElement={({ children, element }) => {
            if (element.type === 'section') {
              const childNodes = React.Children.toArray(children);

              return (
                <PliteElement style={{ position: 'relative' }}>
                  {childNodes[0]}
                  <DOMCoverageBoundaryRange
                    boundaryId="section-body"
                    content={childNodes.slice(1)}
                    from={1}
                  >
                    Collapsed body
                  </DOMCoverageBoundaryRange>
                </PliteElement>
              );
            }

            return (
              <PliteElement style={{ position: 'relative' }}>
                {children}
              </PliteElement>
            );
          }}
        />
      </Plite>
    );

    await waitFor(() => {
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'section-body'
        ) ?? null
      ).toMatchObject({
        coveredPathRanges: [{ anchor: [0, 1], focus: [0, 1] }],
      });
    });

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.insert(
          {
            type: 'paragraph',
            children: [{ text: 'Inserted before' }],
          },
          { at: [0] }
        );
      });
    });

    await waitFor(() => {
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'section-body'
        ) ?? null
      ).toMatchObject({
        coveredPathRanges: [{ anchor: [1, 1], focus: [1, 1] }],
        ownerPath: [1],
      });
      expect(
        (
          getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundaryForPoint(
            {
              path: [1, 1, 0],
              offset: 0,
            }
          ) ?? null
        )?.boundaryId
      ).toBe('section-body');
    });
  });

  test('BoundaryRange follows owner path after structural move', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    render(
      <Plite editor={editor}>
        <Editable
          id="dom-coverage-boundary-structural-move"
          renderElement={({ children, element }) => {
            if (element.type === 'section') {
              const childNodes = React.Children.toArray(children);

              return (
                <PliteElement style={{ position: 'relative' }}>
                  {childNodes[0]}
                  <DOMCoverageBoundaryRange
                    boundaryId="section-body"
                    content={childNodes.slice(1)}
                    from={1}
                  >
                    Collapsed body
                  </DOMCoverageBoundaryRange>
                </PliteElement>
              );
            }

            return (
              <PliteElement style={{ position: 'relative' }}>
                {children}
              </PliteElement>
            );
          }}
        />
      </Plite>
    );

    await waitFor(() => {
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'section-body'
        ) ?? null
      ).toMatchObject({
        coveredPathRanges: [{ anchor: [0, 1], focus: [0, 1] }],
      });
    });

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.move({ at: [0], to: [1] });
      });
    });

    await waitFor(() => {
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'section-body'
        ) ?? null
      ).toMatchObject({
        coveredPathRanges: [{ anchor: [1, 1], focus: [1, 1] }],
        ownerPath: [1],
      });
      expect(
        (
          getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundaryForPoint(
            {
              path: [1, 1, 0],
              offset: 0,
            }
          ) ?? null
        )?.boundaryId
      ).toBe('section-body');
    });
  });

  test('BoundaryRange unregisters when its owner is structurally removed', async () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    render(
      <Plite editor={editor}>
        <Editable
          id="dom-coverage-boundary-structural-remove"
          renderElement={({ children, element }) => {
            if (element.type === 'section') {
              const childNodes = React.Children.toArray(children);

              return (
                <PliteElement style={{ position: 'relative' }}>
                  {childNodes[0]}
                  <DOMCoverageBoundaryRange
                    boundaryId="section-body"
                    content={childNodes.slice(1)}
                    from={1}
                  >
                    Collapsed body
                  </DOMCoverageBoundaryRange>
                </PliteElement>
              );
            }

            return (
              <PliteElement style={{ position: 'relative' }}>
                {children}
              </PliteElement>
            );
          }}
        />
      </Plite>
    );

    await waitFor(() => {
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'section-body'
        ) ?? null
      ).not.toBeNull();
    });

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.remove({ at: [0] });
      });
    });

    await waitFor(() => {
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'section-body'
        ) ?? null
      ).toBeNull();
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundaries() ?? []
      ).toHaveLength(0);
    });
  });

  test('BoundaryRange expands a 1000-descendant hidden boundary without waking document-scale siblings', async () => {
    const editor = createEditor();
    const hiddenCount = 1000;
    const renderCounts = {
      hiddenItems: 0,
      outsideSibling: 0,
    };

    editorReplace(editor, {
      children: createLargeHiddenBoundaryChildren(hiddenCount),
      selection: null,
    });

    const Surface = createLargeBoundarySurface({
      editor,
      hiddenCount,
      renderCounts,
    });

    const rendered = render(<Surface hidden />);

    await waitFor(() => {
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundaries() ?? []
      ).toHaveLength(1);
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'large-section-body'
        ) ?? null
      ).toMatchObject({
        coveredPathRanges: [{ anchor: [0, 1], focus: [0, hiddenCount] }],
      });
    });

    expect(rendered.container.textContent).toContain('Large body collapsed');
    expect(rendered.container.textContent).not.toContain('Hidden item 999');
    expect(renderCounts.hiddenItems).toBe(0);

    rendered.rerender(<Surface hidden={false} />);

    await waitFor(() => {
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'large-section-body'
        ) ?? null
      ).toBeNull();
      expect(rendered.container.textContent).toContain('Hidden item 999');
    });

    expect(renderCounts.hiddenItems).toBeGreaterThanOrEqual(hiddenCount);
    expect(renderCounts.hiddenItems).toBeLessThanOrEqual(hiddenCount + 5);
    expect(renderCounts.outsideSibling).toBeLessThanOrEqual(2);
  }, 15_000);

  test('BoundaryRange keeps hidden model updates out of visible sibling rendering', async () => {
    const editor = createEditor();
    const renderCounts = {
      hiddenBody: 0,
      visibleSibling: 0,
    };

    editorReplace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    const rendered = render(
      <Plite editor={editor}>
        <Editable
          id="dom-coverage-hidden-update-dirtiness"
          renderElement={({ children, element }) => {
            const text = NodeApi.string(element);

            if (text.startsWith('Hidden alpha')) {
              renderCounts.hiddenBody += 1;
            }

            if (text === 'Visible beta') {
              renderCounts.visibleSibling += 1;
            }

            if (element.type === 'section') {
              const childNodes = React.Children.toArray(children);

              return (
                <PliteElement style={{ position: 'relative' }}>
                  {childNodes[0]}
                  <DOMCoverageBoundaryRange
                    boundaryId="section-body"
                    content={childNodes.slice(1)}
                    from={1}
                  >
                    Collapsed body
                  </DOMCoverageBoundaryRange>
                </PliteElement>
              );
            }

            return (
              <PliteElement style={{ position: 'relative' }}>
                {children}
              </PliteElement>
            );
          }}
        />
      </Plite>
    );

    await waitFor(() => {
      expect(
        getMountedEditableDOMRuntime(editor)?.domCoverage.getBoundary(
          'section-body'
        ) ?? null
      ).not.toBeNull();
    });

    renderCounts.visibleSibling = 0;

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert(' update', {
          at: { path: [0, 1, 0], offset: 'Hidden alpha'.length },
        });
      });
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(rendered.container.textContent).toContain('Collapsed body');
    expect(rendered.container.textContent).not.toContain('Hidden alpha update');
    expect(renderCounts.hiddenBody).toBe(0);
    expect(renderCounts.visibleSibling).toBe(0);
  });

  test('renderElement dropping editable children without a boundary reports a dev safety error', async () => {
    const editor = createEditor();
    const errors: string[] = [];
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation((message: unknown) => {
        errors.push(String(message));
      });

    editorReplace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    try {
      render(
        <Plite editor={editor}>
          <Editable
            id="dom-coverage-boundary-dev-safety"
            renderElement={({ element }) => {
              if (element.type === 'section') {
                return (
                  <PliteElement style={{ position: 'relative' }}>
                    Section shell only
                  </PliteElement>
                );
              }

              return (
                <PliteElement style={{ position: 'relative' }}>
                  Leaf shell only
                </PliteElement>
              );
            }}
          />
        </Plite>
      );

      await waitFor(() => {
        expect(
          errors.some((message) =>
            message.includes('without a DOM coverage boundary')
          )
        ).toBe(true);
      });
    } finally {
      errorSpy.mockRestore();
    }
  });
});
