import { act, render, waitFor } from '@testing-library/react';
import React from 'react';
import { type Descendant, NodeApi } from '@platejs/slate';
import { Editor } from '@platejs/slate/internal';
import { DOMCoverage } from '@platejs/slate-dom/internal';
import { createReactEditor, Editable, EditableElement, Slate } from '../src';
import {
  DOMCoverageBoundaryRange,
  DOMCoverageSelfBoundary,
} from '../src/components/dom-coverage-boundary';
import { isSlateReactDevelopmentEnvironment } from '../src/components/editable-text-blocks';

const createNestedChildren = (): Descendant[] => [
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

const createHeaderFooterChildren = (): Descendant[] => [
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

const createLargeHiddenBoundaryChildren = (
  hiddenCount = 1000
): Descendant[] => [
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

describe('DOM coverage private boundary harness', () => {
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

      expect(isSlateReactDevelopmentEnvironment()).toBe(false);
      expect(isSlateReactDevelopmentEnvironment({})).toBe(false);
      expect(isSlateReactDevelopmentEnvironment({ env: {} })).toBe(false);
      expect(
        isSlateReactDevelopmentEnvironment({ env: { NODE_ENV: 'production' } })
      ).toBe(false);
      expect(
        isSlateReactDevelopmentEnvironment({ env: { NODE_ENV: 'development' } })
      ).toBe(true);
    } finally {
      if (originalProcess) {
        Object.defineProperty(globalThis, 'process', originalProcess);
      }
    }
  });

  test('BoundaryRange registers a hidden child range and omits its stale DOM', async () => {
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    const rendered = render(
      <Slate editor={editor}>
        <Editable
          id="dom-coverage-boundary-range"
          renderElement={({ children, element }) => {
            if (element.type === 'section') {
              const childNodes = React.Children.toArray(children);

              return (
                <EditableElement>
                  {childNodes[0]}
                  <DOMCoverageBoundaryRange
                    boundaryId="section-body"
                    content={childNodes.slice(1)}
                    from={1}
                  >
                    Collapsed body
                  </DOMCoverageBoundaryRange>
                </EditableElement>
              );
            }

            return <EditableElement>{children}</EditableElement>;
          }}
        />
      </Slate>
    );

    await waitFor(() => {
      expect(DOMCoverage.getBoundary(editor, 'section-body')).toMatchObject({
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
      DOMCoverage.getBoundaryForPoint(editor, {
        path: [0, 1, 0],
        offset: 0,
      })?.boundaryId
    ).toBe('section-body');
  });

  test('BoundaryRange registers before dev safety reports omitted children', async () => {
    const editor = createReactEditor();
    const errors: string[] = [];
    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((message: unknown) => {
        errors.push(String(message));
      });

    Editor.replace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    try {
      render(
        <Slate editor={editor}>
          <Editable
            id="dom-coverage-boundary-range-lifecycle"
            renderElement={({ children, element }) => {
              if (element.type === 'section') {
                const childNodes = React.Children.toArray(children);

                return (
                  <EditableElement>
                    {childNodes[0]}
                    <DOMCoverageBoundaryRange
                      boundaryId="section-body"
                      content={childNodes.slice(1)}
                      from={1}
                    >
                      Collapsed body
                    </DOMCoverageBoundaryRange>
                  </EditableElement>
                );
              }

              return <EditableElement>{children}</EditableElement>;
            }}
          />
        </Slate>
      );

      await waitFor(() => {
        expect(DOMCoverage.getBoundary(editor, 'section-body')).not.toBeNull();
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
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    const Surface = ({ hidden }: { hidden: boolean }) => (
      <Slate editor={editor}>
        <Editable
          id="dom-coverage-boundary-range-toggle"
          renderElement={({ children, element }) => {
            if (element.type === 'section') {
              const childNodes = React.Children.toArray(children);

              return (
                <EditableElement>
                  {childNodes[0]}
                  <DOMCoverageBoundaryRange
                    boundaryId="section-body"
                    content={childNodes.slice(1)}
                    from={1}
                    hidden={hidden}
                  >
                    Collapsed body
                  </DOMCoverageBoundaryRange>
                </EditableElement>
              );
            }

            return <EditableElement>{children}</EditableElement>;
          }}
        />
      </Slate>
    );

    const rendered = render(<Surface hidden />);

    await waitFor(() => {
      expect(DOMCoverage.getBoundary(editor, 'section-body')).not.toBeNull();
    });

    rendered.rerender(<Surface hidden={false} />);

    await waitFor(() => {
      expect(DOMCoverage.getBoundary(editor, 'section-body')).toBeNull();
      expect(rendered.container.textContent).toContain('Hidden alpha');
    });
  });

  test('SelfBoundary covers hidden first and last root nodes', async () => {
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: createHeaderFooterChildren(),
      selection: null,
    });

    const rendered = render(
      <Slate editor={editor}>
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

            return <EditableElement>{children}</EditableElement>;
          }}
        />
      </Slate>
    );

    await waitFor(() => {
      expect(DOMCoverage.getBoundary(editor, 'hidden-header')).toMatchObject({
        coveredPathRanges: [{ anchor: [0], focus: [0] }],
      });
      expect(DOMCoverage.getBoundary(editor, 'hidden-footer')).toMatchObject({
        coveredPathRanges: [{ anchor: [2], focus: [2] }],
      });
    });

    expect(rendered.container.textContent).toContain('Header hidden');
    expect(rendered.container.textContent).toContain('Visible body');
    expect(rendered.container.textContent).toContain('Footer hidden');
    expect(rendered.container.textContent).not.toContain('Hidden header');
    expect(rendered.container.textContent).not.toContain('Hidden footer');

    const headerPlaceholder = rendered.container.querySelector(
      '[data-slate-dom-coverage-boundary="hidden-header"]'
    );
    const footerPlaceholder = rendered.container.querySelector(
      '[data-slate-dom-coverage-boundary="hidden-footer"]'
    );

    expect(headerPlaceholder).toBeTruthy();
    expect(footerPlaceholder).toBeTruthy();
    expect(
      editor.api.dom.assertSlatePoint([headerPlaceholder!, 0], {
        exactMatch: false,
      })
    ).toEqual({ offset: 0, path: [0, 0] });
    expect(
      editor.api.dom.assertSlatePoint([footerPlaceholder!, 0], {
        exactMatch: false,
      })
    ).toEqual({ offset: 0, path: [2, 0] });
  });

  test('renderElement slots expose contentBoundary with optional ids and object materialization payload', async () => {
    const editor = createReactEditor();
    const materialized: string[] = [];

    Editor.replace(editor, {
      children: createHeaderFooterChildren(),
      selection: null,
    });

    render(
      <Slate editor={editor}>
        <Editable
          id="dom-coverage-content-boundary-slot"
          renderElement={({ children, element, slots }) => {
            if (element.type === 'header') {
              return (
                <slots.contentBoundary
                  mounted={false}
                  onMaterialize={({ boundary, range, reason }) => {
                    materialized.push(
                      `${boundary.boundaryId}:${reason}:${range ? Editor.string(editor, range) : 'no-range'}`
                    );
                  }}
                  scope={{ type: 'self' }}
                >
                  Header hidden by slot
                </slots.contentBoundary>
              );
            }

            return <EditableElement>{children}</EditableElement>;
          }}
        />
      </Slate>
    );

    let boundaryId = '';

    await waitFor(() => {
      const [boundary] = DOMCoverage.getBoundaries(editor).filter(
        (candidate) =>
          candidate.ownerPath.length === 1 && candidate.ownerPath[0] === 0
      );

      expect(boundary).toMatchObject({
        coveredPathRanges: [{ anchor: [0], focus: [0] }],
      });
      boundaryId = boundary!.boundaryId;
    });

    expect(boundaryId).toMatch(/^content-boundary:/);

    const range = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 'Hidden header'.length, path: [0, 0] },
    };

    expect(
      DOMCoverage.materializeBoundary(editor, boundaryId, 'selection', {
        range,
      })
    ).toMatchObject({ status: 'handled' });
    expect(materialized).toEqual([`${boundaryId}:selection:Hidden header`]);
  });

  test('renderElement slots expose contentBoundary for child ranges and self coverage', async () => {
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: createHeaderFooterChildren(),
      selection: null,
    });

    const rendered = render(
      <Slate editor={editor}>
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

            return <EditableElement>{children}</EditableElement>;
          }}
        />
      </Slate>
    );

    await waitFor(() => {
      expect(
        DOMCoverage.getBoundary(editor, 'slot-hidden-header')
      ).toMatchObject({
        coveredPathRanges: [{ anchor: [0], focus: [0] }],
      });
      expect(
        DOMCoverage.getBoundary(editor, 'slot-hidden-footer')
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

  test('renderElement slots cover child ranges without exposing runtime ids', async () => {
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    const rendered = render(
      <Slate editor={editor}>
        <Editable
          id="dom-coverage-content-boundary-slot-range"
          renderElement={({ children, element, slots }) => {
            if (element.type === 'section') {
              const childNodes = React.Children.toArray(children);

              return (
                <EditableElement>
                  {childNodes[0]}
                  <slots.contentBoundary
                    boundaryId="slot-section-body"
                    mounted={false}
                    scope={{ from: 1, type: 'children' }}
                  >
                    Body hidden by slot
                  </slots.contentBoundary>
                </EditableElement>
              );
            }

            return <EditableElement>{children}</EditableElement>;
          }}
        />
      </Slate>
    );

    await waitFor(() => {
      expect(
        DOMCoverage.getBoundary(editor, 'slot-section-body')
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
    const editor = createReactEditor();
    const children = Array.from({ length: 500 }, (_, index) => ({
      type: 'item',
      children: [{ text: `Row ${index + 1}` }],
    }));
    let renderedItemCount = 0;

    Editor.replace(editor, {
      children: [
        {
          type: 'section',
          children,
        },
      ],
      selection: null,
    });

    const rendered = render(
      <Slate editor={editor}>
        <Editable
          id="dom-coverage-lazy-child-range-slot"
          renderElement={(props) => {
            if (props.element.type === 'section') {
              return (
                <EditableElement>
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
                </EditableElement>
              );
            }

            if (props.element.type === 'item') {
              renderedItemCount++;
            }

            return <EditableElement>{props.children}</EditableElement>;
          }}
        />
      </Slate>
    );

    expect(renderedItemCount).toBe(2);
    expect(rendered.container.textContent).toContain('Row 251');
    expect(rendered.container.textContent).toContain('Row 252');
    expect(rendered.container.textContent).not.toContain('Row 1');
    expect(rendered.container.textContent).not.toContain('Row 500');
  });

  test('BoundaryRange does not leak duplicate boundaries in StrictMode', async () => {
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    const Surface = () => (
      <React.StrictMode>
        <Slate editor={editor}>
          <Editable
            id="dom-coverage-boundary-strict-mode"
            renderElement={({ children, element }) => {
              if (element.type === 'section') {
                const childNodes = React.Children.toArray(children);

                return (
                  <EditableElement>
                    {childNodes[0]}
                    <DOMCoverageBoundaryRange
                      boundaryId="section-body"
                      content={childNodes.slice(1)}
                      from={1}
                    >
                      Collapsed body
                    </DOMCoverageBoundaryRange>
                  </EditableElement>
                );
              }

              return <EditableElement>{children}</EditableElement>;
            }}
          />
        </Slate>
      </React.StrictMode>
    );

    const rendered = render(<Surface />);

    await waitFor(() => {
      expect(DOMCoverage.getBoundary(editor, 'section-body')).not.toBeNull();
      expect(
        DOMCoverage.getBoundaries(editor).filter(
          (boundary) => boundary.boundaryId === 'section-body'
        )
      ).toHaveLength(1);
    });

    rendered.unmount();

    await waitFor(() => {
      expect(DOMCoverage.getBoundary(editor, 'section-body')).toBeNull();
      expect(DOMCoverage.getBoundaries(editor)).toHaveLength(0);
    });
  });

  test('BoundaryRange replaces stale boundary ids across rerenders', async () => {
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    const Surface = ({ boundaryId }: { boundaryId: string }) => (
      <Slate editor={editor}>
        <Editable
          id="dom-coverage-boundary-id-stability"
          renderElement={({ children, element }) => {
            if (element.type === 'section') {
              const childNodes = React.Children.toArray(children);

              return (
                <EditableElement>
                  {childNodes[0]}
                  <DOMCoverageBoundaryRange
                    boundaryId={boundaryId}
                    content={childNodes.slice(1)}
                    from={1}
                  >
                    Collapsed body
                  </DOMCoverageBoundaryRange>
                </EditableElement>
              );
            }

            return <EditableElement>{children}</EditableElement>;
          }}
        />
      </Slate>
    );

    const rendered = render(<Surface boundaryId="section-body" />);

    await waitFor(() => {
      expect(DOMCoverage.getBoundary(editor, 'section-body')).not.toBeNull();
      expect(DOMCoverage.getBoundaries(editor)).toHaveLength(1);
    });

    rendered.rerender(<Surface boundaryId="section-body-next" />);

    await waitFor(() => {
      expect(DOMCoverage.getBoundary(editor, 'section-body')).toBeNull();
      expect(
        DOMCoverage.getBoundary(editor, 'section-body-next')
      ).toMatchObject({
        boundaryId: 'section-body-next',
        coveredPathRanges: [{ anchor: [0, 1], focus: [0, 1] }],
      });
      expect(DOMCoverage.getBoundaries(editor)).toHaveLength(1);
    });
  });

  test('BoundaryRange follows owner path after structural insert before owner', async () => {
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    render(
      <Slate editor={editor}>
        <Editable
          id="dom-coverage-boundary-structural-insert"
          renderElement={({ children, element }) => {
            if (element.type === 'section') {
              const childNodes = React.Children.toArray(children);

              return (
                <EditableElement>
                  {childNodes[0]}
                  <DOMCoverageBoundaryRange
                    boundaryId="section-body"
                    content={childNodes.slice(1)}
                    from={1}
                  >
                    Collapsed body
                  </DOMCoverageBoundaryRange>
                </EditableElement>
              );
            }

            return <EditableElement>{children}</EditableElement>;
          }}
        />
      </Slate>
    );

    await waitFor(() => {
      expect(DOMCoverage.getBoundary(editor, 'section-body')).toMatchObject({
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
      expect(DOMCoverage.getBoundary(editor, 'section-body')).toMatchObject({
        coveredPathRanges: [{ anchor: [1, 1], focus: [1, 1] }],
        ownerPath: [1],
      });
      expect(
        DOMCoverage.getBoundaryForPoint(editor, {
          path: [1, 1, 0],
          offset: 0,
        })?.boundaryId
      ).toBe('section-body');
    });
  });

  test('BoundaryRange follows owner path after structural move', async () => {
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    render(
      <Slate editor={editor}>
        <Editable
          id="dom-coverage-boundary-structural-move"
          renderElement={({ children, element }) => {
            if (element.type === 'section') {
              const childNodes = React.Children.toArray(children);

              return (
                <EditableElement>
                  {childNodes[0]}
                  <DOMCoverageBoundaryRange
                    boundaryId="section-body"
                    content={childNodes.slice(1)}
                    from={1}
                  >
                    Collapsed body
                  </DOMCoverageBoundaryRange>
                </EditableElement>
              );
            }

            return <EditableElement>{children}</EditableElement>;
          }}
        />
      </Slate>
    );

    await waitFor(() => {
      expect(DOMCoverage.getBoundary(editor, 'section-body')).toMatchObject({
        coveredPathRanges: [{ anchor: [0, 1], focus: [0, 1] }],
      });
    });

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.move({ at: [0], to: [1] });
      });
    });

    await waitFor(() => {
      expect(DOMCoverage.getBoundary(editor, 'section-body')).toMatchObject({
        coveredPathRanges: [{ anchor: [1, 1], focus: [1, 1] }],
        ownerPath: [1],
      });
      expect(
        DOMCoverage.getBoundaryForPoint(editor, {
          path: [1, 1, 0],
          offset: 0,
        })?.boundaryId
      ).toBe('section-body');
    });
  });

  test('BoundaryRange unregisters when its owner is structurally removed', async () => {
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    render(
      <Slate editor={editor}>
        <Editable
          id="dom-coverage-boundary-structural-remove"
          renderElement={({ children, element }) => {
            if (element.type === 'section') {
              const childNodes = React.Children.toArray(children);

              return (
                <EditableElement>
                  {childNodes[0]}
                  <DOMCoverageBoundaryRange
                    boundaryId="section-body"
                    content={childNodes.slice(1)}
                    from={1}
                  >
                    Collapsed body
                  </DOMCoverageBoundaryRange>
                </EditableElement>
              );
            }

            return <EditableElement>{children}</EditableElement>;
          }}
        />
      </Slate>
    );

    await waitFor(() => {
      expect(DOMCoverage.getBoundary(editor, 'section-body')).not.toBeNull();
    });

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.remove({ at: [0] });
      });
    });

    await waitFor(() => {
      expect(DOMCoverage.getBoundary(editor, 'section-body')).toBeNull();
      expect(DOMCoverage.getBoundaries(editor)).toHaveLength(0);
    });
  });

  test('BoundaryRange expands a 1000-descendant hidden boundary without waking document-scale siblings', async () => {
    const editor = createReactEditor();
    const hiddenCount = 1000;
    const renderCounts = {
      hiddenItems: 0,
      outsideSibling: 0,
    };

    Editor.replace(editor, {
      children: createLargeHiddenBoundaryChildren(hiddenCount),
      selection: null,
    });

    const Surface = ({ hidden }: { hidden: boolean }) => (
      <Slate editor={editor}>
        <Editable
          id="dom-coverage-large-boundary-expand"
          renderElement={({ children, element }) => {
            const text = NodeApi.string(element);

            if (text.startsWith('Hidden item ')) {
              renderCounts.hiddenItems += 1;
            }

            if (text === 'Outside sibling') {
              renderCounts.outsideSibling += 1;
            }

            if (element.type === 'section') {
              const childNodes = React.Children.toArray(children);

              return (
                <EditableElement>
                  {childNodes[0]}
                  <DOMCoverageBoundaryRange
                    boundaryId="large-section-body"
                    content={childNodes.slice(1)}
                    from={1}
                    hidden={hidden}
                    to={hiddenCount}
                  >
                    Large body collapsed
                  </DOMCoverageBoundaryRange>
                </EditableElement>
              );
            }

            return <EditableElement>{children}</EditableElement>;
          }}
        />
      </Slate>
    );

    const rendered = render(<Surface hidden />);

    await waitFor(() => {
      expect(DOMCoverage.getBoundaries(editor)).toHaveLength(1);
      expect(
        DOMCoverage.getBoundary(editor, 'large-section-body')
      ).toMatchObject({
        coveredPathRanges: [{ anchor: [0, 1], focus: [0, hiddenCount] }],
      });
    });

    expect(rendered.container.textContent).toContain('Large body collapsed');
    expect(rendered.container.textContent).not.toContain('Hidden item 999');
    expect(renderCounts.hiddenItems).toBe(0);

    rendered.rerender(<Surface hidden={false} />);

    await waitFor(() => {
      expect(DOMCoverage.getBoundary(editor, 'large-section-body')).toBeNull();
      expect(rendered.container.textContent).toContain('Hidden item 999');
    });

    expect(renderCounts.hiddenItems).toBeGreaterThanOrEqual(hiddenCount);
    expect(renderCounts.hiddenItems).toBeLessThanOrEqual(hiddenCount + 5);
    expect(renderCounts.outsideSibling).toBeLessThanOrEqual(2);
  });

  test('BoundaryRange keeps hidden model updates out of visible sibling rendering', async () => {
    const editor = createReactEditor();
    const renderCounts = {
      hiddenBody: 0,
      visibleSibling: 0,
    };

    Editor.replace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    const rendered = render(
      <Slate editor={editor}>
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
                <EditableElement>
                  {childNodes[0]}
                  <DOMCoverageBoundaryRange
                    boundaryId="section-body"
                    content={childNodes.slice(1)}
                    from={1}
                  >
                    Collapsed body
                  </DOMCoverageBoundaryRange>
                </EditableElement>
              );
            }

            return <EditableElement>{children}</EditableElement>;
          }}
        />
      </Slate>
    );

    await waitFor(() => {
      expect(DOMCoverage.getBoundary(editor, 'section-body')).not.toBeNull();
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
    const editor = createReactEditor();
    const errors: string[] = [];
    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((message: unknown) => {
        errors.push(String(message));
      });

    Editor.replace(editor, {
      children: createNestedChildren(),
      selection: null,
    });

    try {
      render(
        <Slate editor={editor}>
          <Editable
            id="dom-coverage-boundary-dev-safety"
            renderElement={({ element }) => {
              if (element.type === 'section') {
                return <EditableElement>Section shell only</EditableElement>;
              }

              return <EditableElement>Leaf shell only</EditableElement>;
            }}
          />
        </Slate>
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
