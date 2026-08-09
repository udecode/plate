/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { property, schema, target } from '@platejs/plite';
import { render } from '@testing-library/react';

import {
  BaseParagraphPlugin,
  defineBasePlugin,
  ElementIdPlugin,
} from '../../lib';
import {
  attachPlateModelPublication,
  getPlateModelPublication,
} from '../../internal/plugin/compilePlateModel';
import { TestPlate as Plate } from '../__tests__/TestPlate';
import {
  PlateElement,
  type PlateElementProps,
} from '../components/plate-nodes';
import { PlateRoot } from '../components/PlateRoot';
import type { PlateEditor } from '../editor/PlateEditor';
import { createPlateEditor } from '../editor/withPlate';
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
      listStyleType: schema.elementProperty(property.string(), {
        target: target.element(BaseParagraphPlugin),
      }),
    },
  }),
});

const renderPipe = (editor: PlateEditor) => {
  const renderElement = pipeRenderElement(editor)!;
  const element = editor.read.children()[0] as any;

  const RenderProbe = () =>
    renderElement({
      attributes: {} as any,
      children: 'Body',
      element,
    } as any);

  return render(
    <Plate editor={editor}>
      <PlateRoot>
        <RenderProbe />
      </PlateRoot>
    </Plate>
  );
};

const renderPipeBare = (editor: PlateEditor) => {
  const renderElement = pipeRenderElement(editor)!;
  const element = editor.read.children()[0] as any;

  const RenderProbe = () =>
    renderElement({
      attributes: {} as any,
      children: 'Body',
      element,
    } as any);

  return render(
    <Plate editor={editor}>
      <PlateRoot>
        <RenderProbe />
      </PlateRoot>
    </Plate>
  );
};

describe('pipeRenderElement', () => {
  it('renders the default paragraph element with the paragraph plugin class', () => {
    const editor = createPlateEditor({
      navigationFeedback: false,
      plugins: [],
      initialValue: createValue(),
    } as any);

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-plite-node="element"]');

    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('plite-paragraph');
    expect(element?.tagName).toBe('DIV');
  });

  it('renders an unregistered element through the default renderer', () => {
    const editor = createPlateEditor({
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
    const editor = createPlateEditor({
      navigationFeedback: false,
      plugins: [],
      initialValue: createValue(),
    } as any);

    expect(() => renderPipeBare(editor)).not.toThrow();
  });

  it('resolves the node path when elements carry application metadata', () => {
    const editor = createPlateEditor({
      navigationFeedback: false,
      plugins: [ElementIdPlugin],
      initialValue: createValue('block-1'),
    } as any);

    expect(() => renderPipeBare(editor)).not.toThrow();
  });

  it('does not publish application metadata as DOM identity', () => {
    const editor = createPlateEditor({
      navigationFeedback: false,
      plugins: [ElementIdPlugin],
      initialValue: [
        {
          children: [{ text: 'Body' }],
          id: 'block-1',
          type: 'paragraph',
        },
      ] as any,
    } as any);

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-plite-node="element"]');

    expect(element).not.toHaveAttribute('data-block-id');
  });

  it('keeps plugin render.as behavior', () => {
    const editor = createPlateEditor({
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
    const CustomElement = (props: PlateElementProps) => {
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
    const editor = createPlateEditor({
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
    const editor = createPlateEditor({
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
      } as any);

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
    const editor = createPlateEditor({
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
    const editor = createPlateEditor({
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
    const editor = createPlateEditor({
      navigationFeedback: false,
      plugins: [
        defineBasePlugin('inactiveBelow', {
          render: {
            belowNodes: ({ element }: any) => {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              usePath();

              return element.type === 'quote'
                ? ({ children }: any) => <section>{children}</section>
                : undefined;
            },
          },
        }),
      ],
      initialValue: createValue(),
    } as any);

    const { container } = renderPipe(editor);

    expect(container.querySelector('[data-plite-node="element"]')).toBeTruthy();
  });

  it('keeps plain fast-path markup for inject.nodeProps', () => {
    const editor = createPlateEditor({
      navigationFeedback: false,
      plugins: [
        ListStylePropertyPlugin,
        defineBasePlugin('list', {
          targetPlugins: [BaseParagraphPlugin],
          inject: {
            nodeProps: {
              nodeKey: 'listStyleType',
              query: ({ nodeProps }) => !!nodeProps.element?.listStyleType,
              styleKey: 'listStyleType',
            },
          },
        }),
      ],
      initialValue: [
        {
          children: [{ text: 'Body' }],
          listStyleType: 'disc',
          type: 'paragraph',
        },
      ] as any,
    } as any);

    const { container } = renderPipeBare(editor);
    const element = container.querySelector('[data-plite-node="element"]');

    expect((element as HTMLElement).style.listStyleType).toBe('disc');
  });

  it('keeps element context for inject.nodeProps transform hooks', () => {
    const editor = createPlateEditor({
      plugins: [
        ListStylePropertyPlugin,
        defineBasePlugin('hookInject', {
          targetPlugins: [BaseParagraphPlugin],
          inject: {
            nodeProps: {
              nodeKey: 'listStyleType',
              query: ({ nodeProps }) => !!nodeProps.element?.listStyleType,
              transformProps: ({ props }) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const element = useElement();
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const path = usePath();

                return {
                  ...props,
                  'data-context-path': path?.join(','),
                  'data-context-type': element.type,
                };
              },
            },
          },
        }),
      ],
      initialValue: [
        {
          children: [{ text: 'Body' }],
          listStyleType: 'disc',
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
    const editor = createPlateEditor({
      plugins: [
        ListStylePropertyPlugin,
        defineBasePlugin('selectorInject', {
          targetPlugins: [BaseParagraphPlugin],
          inject: {
            nodeProps: {
              nodeKey: 'listStyleType',
              query: ({ nodeProps }) => !!nodeProps.element?.listStyleType,
              transformProps: ({ props }) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const type = useElementSelector(([element]) => element.type);

                return {
                  ...props,
                  'data-selected-type': type,
                };
              },
            },
          },
        }),
      ],
      initialValue: [
        {
          children: [{ text: 'Body' }],
          listStyleType: 'disc',
          type: 'paragraph',
        },
      ] as any,
    });

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-plite-node="element"]');

    expect(element).toHaveAttribute('data-selected-type', 'paragraph');
  });

  it('keeps pathless inject.nodeProps on the wrapped directional path', () => {
    const editor = createPlateEditor({
      plugins: [
        ListStylePropertyPlugin,
        defineBasePlugin('list', {
          targetPlugins: [BaseParagraphPlugin],
          inject: {
            nodeProps: {
              nodeKey: 'listStyleType',
              query: ({ nodeProps }) => !!nodeProps.element?.listStyleType,
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
          listStyleType: 'disc',
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
    const editor = createPlateEditor({
      plugins: [
        ListStylePropertyPlugin,
        defineBasePlugin('list', {
          targetPlugins: [BaseParagraphPlugin],
          inject: {
            nodeProps: {
              nodeKey: 'listStyleType',
              query: ({ nodeProps }) => !!nodeProps.element?.listStyleType,
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
            belowNodes: ({ element }: any) => {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const path = usePath();

              return element.type === 'paragraph'
                ? ({ children }: any) => (
                    <section
                      data-path={path.join(',')}
                      data-testid="active-below"
                    >
                      {children}
                    </section>
                  )
                : undefined;
            },
          },
        }),
      ],
      initialValue: [
        {
          children: [{ text: 'Body' }],
          listStyleType: 'disc',
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
    const editor = createPlateEditor({
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
    const editor = createPlateEditor({
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
