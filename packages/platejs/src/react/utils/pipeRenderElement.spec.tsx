/// <reference types="@testing-library/jest-dom" />

import { render } from '@testing-library/react';
import React from 'react';

import { property, schema, target } from '../../core';
import {
  attachPlateModelPublication,
  getPlateModelPublication,
} from '../../internal/plugin/compilePlateModel';
import {
  BaseParagraphPlugin,
  defineBasePlugin,
  ElementIdPlugin,
} from '../../lib';
import { TestPlate as Plate } from '../__tests__/TestPlate';
import {
  PlateElement,
  type PlateElementProps,
} from '../components/plate-nodes';
import { PlateRoot } from '../components/PlateRoot';
import type { Editor } from '../editor/Editor';
import { createEditor } from '../editor/withPlate';
import { ParagraphPlugin } from '../plugins/paragraph/ParagraphPlugin';
import { useElement, useElementSelector, usePath } from '../stores';
import { pipeRenderElement } from './pipeRenderElement';

const createValue = (id?: string) =>
  [
    {
      ...(id ? { id } : {}),
      children: [{ text: 'Body' }],
      type: 'paragraph',
    },
  ] as any;

const ListStylePropertyPlugin = defineBasePlugin('listStyleProperty', {
  schema: () => ({
    properties: {
      markerStyle: schema.elementProperty(property.string(), {
        target: target.element(BaseParagraphPlugin),
      }),
    },
  }),
});

const renderPipe = (editor: Editor) => {
  const renderElement = pipeRenderElement(editor)!;
  const element = editor.read.children()[0];

  const RenderProbe = () =>
    renderElement({
      attributes: {} as any,
      children: 'Body',
      element,
      slots: {
        children: () => null,
        contentBoundary: ({ children }) => children,
        contentRoot: () => null,
      },
    });

  return render(
    <Plate editor={editor}>
      <PlateRoot>
        <RenderProbe />
      </PlateRoot>
    </Plate>
  );
};

const renderPipeBare = (editor: Editor) => {
  const renderElement = pipeRenderElement(editor)!;
  const element = editor.read.children()[0];

  const RenderProbe = () =>
    renderElement({
      attributes: {} as any,
      children: 'Body',
      element,
      slots: {
        children: () => null,
        contentBoundary: ({ children }) => children,
        contentRoot: () => null,
      },
    });

  return render(
    <Plate editor={editor}>
      <PlateRoot>
        <RenderProbe />
      </PlateRoot>
    </Plate>
  );
};

describe('pipeRenderElement', () => {
  it('lets an explicit renderElement own installed plugin types', () => {
    const editor = createEditor({
      navigationFeedback: false,
      plugins: [],
      initialValue: createValue(),
    });
    const renderElement = pipeRenderElement(
      editor,
      ({ attributes, children }) => <p {...attributes}>{children}</p>
    )!;
    const element = editor.read.children()[0];
    const RenderProbe = () =>
      renderElement({
        attributes: {} as any,
        children: 'Body',
        element,
        slots: {
          children: () => null,
          contentBoundary: ({ children }) => children,
          contentRoot: () => null,
        },
      });

    const { container } = render(
      <Plate editor={editor}>
        <PlateRoot>
          <RenderProbe />
        </PlateRoot>
      </Plate>
    );

    expect(container.querySelector('p')).toHaveTextContent('Body');
    expect(container.querySelector('.plite-paragraph')).toBeNull();
  });

  it('delegates nullish renderElement results to installed plugins', () => {
    const editor = createEditor({
      navigationFeedback: false,
      plugins: [],
      initialValue: createValue(),
    });
    const renderElement = pipeRenderElement(editor, () => undefined)!;
    const element = editor.read.children()[0];
    const RenderProbe = () =>
      renderElement({
        attributes: {} as any,
        children: 'Body',
        element,
        slots: {
          children: () => null,
          contentBoundary: ({ children }) => children,
          contentRoot: () => null,
        },
      });

    const { container } = render(
      <Plate editor={editor}>
        <PlateRoot>
          <RenderProbe />
        </PlateRoot>
      </Plate>
    );

    expect(container.querySelector('.plite-paragraph')).toHaveTextContent(
      'Body'
    );
  });

  it('renders the default paragraph element with the paragraph plugin class', () => {
    const editor = createEditor({
      navigationFeedback: false,
      plugins: [],
      initialValue: createValue(),
    });

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-plite-node="element"]');

    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('plite-paragraph');
    expect(element?.tagName).toBe('DIV');
  });

  it('uses the renderer-owned path for elements outside the primary root snapshot', () => {
    const editor = createEditor({
      navigationFeedback: false,
      plugins: [],
      initialValue: createValue(),
    });
    const renderElement = pipeRenderElement(editor)!;
    const element = {
      ...editor.read.children()[0],
      children: [{ text: 'Child root body' }],
    } as any;

    const RenderProbe = () =>
      renderElement({
        attributes: { 'data-plite-path': '0' } as any,
        children: 'Child root body',
        element,
        slots: {
          children: () => null,
          contentBoundary: ({ children }) => children,
          contentRoot: () => null,
        },
      });

    const { getByText } = render(
      <Plate editor={editor}>
        <PlateRoot>
          <RenderProbe />
        </PlateRoot>
      </Plate>
    );

    expect(getByText('Child root body')).toBeInTheDocument();
  });

  it('renders an unregistered element through the default renderer', () => {
    const editor = createEditor({
      navigationFeedback: false,
      plugins: [],
      initialValue: createValue(),
    });
    const publication = getPlateModelPublication(editor)!;
    const { p: _paragraphPlugin, ...plugins } = publication.plugins;

    attachPlateModelPublication(editor, { ...publication, plugins });

    const { container } = renderPipe(editor);

    attachPlateModelPublication(editor, publication);
    const element = container.querySelector('[data-plite-node="element"]');

    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Body');
    expect(element?.tagName).toBe('DIV');
  });

  it('resolves the node path on the plain fast path', () => {
    const editor = createEditor({
      navigationFeedback: false,
      plugins: [],
      initialValue: createValue(),
    });

    expect(() => renderPipeBare(editor)).not.toThrow();
  });

  it('resolves the node path when elements carry application metadata', () => {
    const editor = createEditor({
      navigationFeedback: false,
      plugins: [ElementIdPlugin],
      initialValue: createValue('block-1'),
    });

    expect(() => renderPipeBare(editor)).not.toThrow();
  });

  it('does not publish application metadata as DOM identity', () => {
    const editor = createEditor({
      navigationFeedback: false,
      plugins: [ElementIdPlugin],
      initialValue: [
        {
          children: [{ text: 'Body' }],
          id: 'block-1',
          type: 'paragraph',
        },
      ] as any,
    });

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-plite-node="element"]');

    expect(element).not.toHaveAttribute('data-block-id');
  });

  it('keeps plugin render.as behavior', () => {
    const editor = createEditor({
      plugins: [
        ParagraphPlugin.extend(() => ({
          render: {
            as: 'article',
          },
        })),
      ],
      initialValue: createValue(),
    });

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-plite-node="element"]');

    expect(element?.tagName).toBe('ARTICLE');
  });

  it('keeps element context for custom node components', () => {
    const CustomElement = (
      props: PlateElementProps<typeof ParagraphPlugin>
    ) => {
      const path = usePath();

      return (
        <PlateElement
          {...props}
          as="section"
          attributes={{
            ...props.attributes,
            'data-context-path': path.join(','),
          }}
        />
      );
    };
    const editor = createEditor({
      plugins: [
        ParagraphPlugin.configure({
          component: CustomElement,
        }),
      ],
      initialValue: createValue(),
    });

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-plite-node="element"]');

    expect(element?.tagName).toBe('SECTION');
    expect(element?.getAttribute('data-context-path')).toBe('0');
  });

  it('preserves Plite children for void render.as tags on the fast path', () => {
    const editor = createEditor({
      plugins: [
        defineBasePlugin('horizontalRule', {
          schema: { element: { void: 'block' } },
          render: {
            as: 'hr',
          },
        }),
      ],
      initialValue: [
        {
          children: [{ text: '' }],
          type: 'horizontalRule',
        },
      ] as any,
    });

    const renderElement = pipeRenderElement(editor)!;
    const element = editor.read.children()[0] as any;

    const RenderProbe = () =>
      renderElement({
        attributes: {} as any,
        children: 'Body',
        element,
        slots: {
          children: () => null,
          contentBoundary: ({ children }) => children,
          contentRoot: () => null,
        },
      });

    const { container } = render(
      <Plate editor={editor}>
        <PlateRoot>
          <RenderProbe />
        </PlateRoot>
      </Plate>
    );
    const rendered = container.querySelector('[data-plite-node="element"]');

    expect(rendered).toBeInTheDocument();
    expect(rendered?.tagName).toBe('DIV');
    expect(
      rendered?.querySelector('hr[contenteditable="false"]')
    ).toBeInTheDocument();
    expect(rendered).toHaveTextContent('Body');
  });

  it('keeps global aboveNodes wrappers', () => {
    const editor = createEditor({
      plugins: [
        defineBasePlugin('above', {
          render: {
            aboveNodes:
              () =>
              ({ children }: any) => (
                <section data-testid="above">{children}</section>
              ),
          },
        }),
      ],
      initialValue: createValue(),
    });

    const { getByTestId } = renderPipe(editor);

    expect(getByTestId('above')).toBeInTheDocument();
  });

  it('keeps plugin node.props behavior', () => {
    const editor = createEditor({
      plugins: [
        ParagraphPlugin.extend(() => ({
          render: {
            nodeProps: {
              'data-probe': 'yes',
            },
          },
        })),
      ],
      initialValue: createValue(),
    });

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-plite-node="element"]');

    expect(element).toHaveAttribute('data-probe', 'yes');
  });

  it('runs inactive belowNodes wrappers under element context', () => {
    const useInactiveBelowNodes = ({ element }: any) => {
      usePath();

      return element.type === 'quote'
        ? ({ children }: any) => <section>{children}</section>
        : undefined;
    };
    const editor = createEditor({
      navigationFeedback: false,
      plugins: [
        defineBasePlugin('inactiveBelow', {
          render: {
            belowNodes: useInactiveBelowNodes,
          },
        }),
      ],
      initialValue: createValue(),
    });

    const { container } = renderPipe(editor);

    expect(container.querySelector('[data-plite-node="element"]')).toBeTruthy();
  });

  it('keeps plain fast-path markup for inject.nodeProps', () => {
    const editor = createEditor({
      navigationFeedback: false,
      plugins: [
        ListStylePropertyPlugin,
        defineBasePlugin('list', {
          targetPlugins: [BaseParagraphPlugin],
          inject: {
            nodeProps: {
              nodeKey: 'markerStyle',
              query: ({ nodeProps }) => !!nodeProps.element?.markerStyle,
              styleKey: 'listStyleType',
            },
          },
        }),
      ],
      initialValue: [
        {
          children: [{ text: 'Body' }],
          markerStyle: 'disc',
          type: 'paragraph',
        },
      ] as any,
    });

    const { container } = renderPipeBare(editor);
    const element = container.querySelector('[data-plite-node="element"]');

    expect((element as HTMLElement).style.listStyleType).toBe('disc');
  });

  it('keeps element context for inject.nodeProps transform hooks', () => {
    const useHookInjectProps = ({ props }: any) => {
      const element = useElement();
      const path = usePath();

      return {
        ...props,
        'data-context-path': path?.join(','),
        'data-context-type': element.type,
      };
    };
    const editor = createEditor({
      plugins: [
        ListStylePropertyPlugin,
        defineBasePlugin('hookInject', {
          targetPlugins: [BaseParagraphPlugin],
          inject: {
            nodeProps: {
              nodeKey: 'markerStyle',
              query: ({ nodeProps }) => !!nodeProps.element?.markerStyle,
              transformProps: useHookInjectProps,
            },
          },
        }),
      ],
      initialValue: [
        {
          children: [{ text: 'Body' }],
          markerStyle: 'disc',
          type: 'paragraph',
        },
      ] as any,
    });

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-plite-node="element"]');

    expect(element).toHaveAttribute('data-context-path', '0');
    expect(element).toHaveAttribute('data-context-type', 'paragraph');
  });

  it('keeps element store context for inject.nodeProps transform hooks', () => {
    const useSelectorInjectProps = ({ props }: any) => {
      const type = useElementSelector(([element]) => element.type);

      return {
        ...props,
        'data-selected-type': type,
      };
    };
    const editor = createEditor({
      plugins: [
        ListStylePropertyPlugin,
        defineBasePlugin('selectorInject', {
          targetPlugins: [BaseParagraphPlugin],
          inject: {
            nodeProps: {
              nodeKey: 'markerStyle',
              query: ({ nodeProps }) => !!nodeProps.element?.markerStyle,
              transformProps: useSelectorInjectProps,
            },
          },
        }),
      ],
      initialValue: [
        {
          children: [{ text: 'Body' }],
          markerStyle: 'disc',
          type: 'paragraph',
        },
      ] as any,
    });

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-plite-node="element"]');

    expect(element).toHaveAttribute('data-selected-type', 'paragraph');
  });

  it('keeps pathless inject.nodeProps on the wrapped directional path', () => {
    const editor = createEditor({
      plugins: [
        ListStylePropertyPlugin,
        defineBasePlugin('list', {
          targetPlugins: [BaseParagraphPlugin],
          inject: {
            nodeProps: {
              nodeKey: 'markerStyle',
              query: ({ nodeProps }) => !!nodeProps.element?.markerStyle,
              transformProps: ({ props, value }) => ({
                ...props,
                role: 'listitem',
                style: {
                  ...props.style,
                  display: 'list-item',
                  listStyleType: value,
                },
              }),
            },
          },
        }),
        ParagraphPlugin.extend(() => ({
          rules: {
            selection: {
              affinity: 'directional',
            },
          },
        })),
      ],
      initialValue: [
        {
          children: [{ text: 'Body' }],
          markerStyle: 'disc',
          type: 'paragraph',
        },
      ] as any,
    });

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-plite-node="element"]');

    expect(element).toHaveAttribute('role', 'listitem');
    expect((element as HTMLElement).style.display).toBe('list-item');
    expect((element as HTMLElement).style.listStyleType).toBe('disc');
  });

  it('keeps pathless inject.nodeProps when active belowNodes wrappers are present', () => {
    const useActiveBelowNodes = ({ element }: any) => {
      const path = usePath();

      return element.type === 'paragraph'
        ? ({ children }: any) => (
            <section data-path={path.join(',')} data-testid="active-below">
              {children}
            </section>
          )
        : undefined;
    };
    const editor = createEditor({
      plugins: [
        ListStylePropertyPlugin,
        defineBasePlugin('list', {
          targetPlugins: [BaseParagraphPlugin],
          inject: {
            nodeProps: {
              nodeKey: 'markerStyle',
              query: ({ nodeProps }) => !!nodeProps.element?.markerStyle,
              transformProps: ({ props, value }) => ({
                ...props,
                role: 'listitem',
                style: {
                  ...props.style,
                  display: 'list-item',
                  listStyleType: value,
                },
              }),
            },
          },
        }),
        defineBasePlugin('activeBelow', {
          render: {
            belowNodes: useActiveBelowNodes,
          },
        }),
      ],
      initialValue: [
        {
          children: [{ text: 'Body' }],
          markerStyle: 'disc',
          type: 'paragraph',
        },
      ] as any,
    });

    const { container, getByTestId } = renderPipe(editor);
    const element = container.querySelector('[data-plite-node="element"]');

    expect(getByTestId('active-below')).toBeInTheDocument();
    expect(getByTestId('active-below')).toHaveAttribute('data-path', '0');
    expect(element).toHaveAttribute('role', 'listitem');
    expect((element as HTMLElement).style.display).toBe('list-item');
    expect((element as HTMLElement).style.listStyleType).toBe('disc');
  });

  it('keeps plugin selection affinity behavior on the plain fast path', () => {
    const editor = createEditor({
      plugins: [
        ParagraphPlugin.extend(() => ({
          rules: {
            selection: {
              affinity: 'directional',
            },
          },
        })),
      ],
      initialValue: createValue(),
    });

    const { container } = renderPipe(editor);

    expect(
      container.querySelectorAll('span[contenteditable="false"]')
    ).toHaveLength(2);
  });

  it('keeps editOnly behavior on the plain fast path in read-only mode', () => {
    const editor = createEditor({
      plugins: [
        ParagraphPlugin.extend(() => ({
          editOnly: true,
        })),
      ],
      readOnly: true,
      initialValue: createValue(),
    });

    const { container } = renderPipe(editor);

    expect(container.querySelector('[data-plite-node="element"]')).toBeNull();
  });
});
