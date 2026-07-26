/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { property, schema, target } from '@platejs/plite';
import { render } from '@testing-library/react';

import { createBasePlugin } from '../../lib';
import { TestPlate as Plate } from '../__tests__/TestPlate';
import {
  PlateElement,
  type PlateElementProps,
} from '../components/plate-nodes';
import { PlateRoot } from '../components/PlateRoot';
import type { PlateEditor } from '../editor/PlateEditor';
import { createPlateEditor } from '../editor/withPlate';
import { createPlatePlugin } from '../plugin/createPlatePlugin';
import { useElement, useElementSelector, usePath } from '../stores';
import { pipeRenderElement } from './pipeRenderElement';

const createValue = (id?: string) =>
  [
    {
      ...(id ? { id } : {}),
      children: [{ text: 'Body' }],
      type: 'p',
    },
  ] as any;

const ListStylePropertyPlugin = createBasePlugin({
  key: 'listStyleProperty',
  schema: {
    properties: [
      schema.elementProperty('listStyleType', property.string(), {
        target: target.type('p'),
      }),
    ],
  },
});

const renderPipe = (editor: PlateEditor<any, any>) => {
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

const renderPipeBare = (editor: PlateEditor<any, any>) => {
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
    expect(element).toHaveClass('plite-p');
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

  it('resolves the node path on the block-id fast path', () => {
    const editor = createPlateEditor({
      navigationFeedback: false,
      nodeId: true,
      plugins: [],
      initialValue: createValue('block-1'),
    } as any);

    expect(() => renderPipeBare(editor)).not.toThrow();
  });

  it('preserves non-string block ids on the block-id fast path', () => {
    const editor = createPlateEditor({
      navigationFeedback: false,
      nodeId: true,
      plugins: [],
      initialValue: [
        {
          children: [{ text: 'Body' }],
          id: 123,
          type: 'p',
        },
      ] as any,
    } as any);

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-plite-node="element"]');

    expect(element).toHaveAttribute('data-block-id', '123');
  });

  it('keeps plugin render.as behavior', () => {
    const editor = createPlateEditor({
      plugins: [
        createBasePlugin({
          key: 'p',
          type: 'p',
          schema: {
            element: {
              content: schema.content.open({ default: 'text', min: 1 }),
            },
          },
          render: {
            as: 'article',
          },
        }),
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
        createPlatePlugin({
          component: CustomElement,
          key: 'p',
          type: 'p',
          schema: {
            element: {
              content: schema.content.open({ default: 'text', min: 1 }),
            },
          },
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
        createBasePlugin({
          key: 'hr',
          type: 'hr',
          schema: { element: { void: 'block' } },
          render: {
            as: 'hr',
          },
        }),
      ],
      initialValue: [
        {
          children: [{ text: '' }],
          type: 'hr',
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
        createBasePlugin({
          key: 'above',
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
        createBasePlugin({
          key: 'p',
          type: 'p',
          schema: {
            element: {
              content: schema.content.open({ default: 'text', min: 1 }),
            },
          },
          render: {
            nodeProps: {
              'data-probe': 'yes',
            },
          },
        }),
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
        createBasePlugin({
          key: 'inactive-below',
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
        createBasePlugin({
          targetPluginKeys: ['p'],
          key: 'list',
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
          type: 'p',
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
        createBasePlugin({
          targetPluginKeys: ['p'],
          key: 'hook-inject',
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
          type: 'p',
        },
      ] as any,
    });

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-plite-node="element"]');

    expect(element).toHaveAttribute('data-context-path', '0');
    expect(element).toHaveAttribute('data-context-type', 'p');
  });

  it('keeps element store context for inject.nodeProps transform hooks', () => {
    const editor = createPlateEditor({
      plugins: [
        ListStylePropertyPlugin,
        createBasePlugin({
          targetPluginKeys: ['p'],
          key: 'selector-inject',
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
          type: 'p',
        },
      ] as any,
    });

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-plite-node="element"]');

    expect(element).toHaveAttribute('data-selected-type', 'p');
  });

  it('keeps pathless inject.nodeProps on the wrapped directional path', () => {
    const editor = createPlateEditor({
      plugins: [
        ListStylePropertyPlugin,
        createBasePlugin({
          targetPluginKeys: ['p'],
          key: 'list',
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
        createBasePlugin({
          key: 'p',
          type: 'p',
          schema: {
            element: {
              content: schema.content.open({ default: 'text', min: 1 }),
            },
          },
          rules: {
            selection: {
              affinity: 'directional',
            },
          },
        }),
      ],
      initialValue: [
        {
          children: [{ text: 'Body' }],
          listStyleType: 'disc',
          type: 'p',
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
        createBasePlugin({
          targetPluginKeys: ['p'],
          key: 'list',
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
        createBasePlugin({
          key: 'active-below',
          render: {
            belowNodes: ({ element }: any) => {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const path = usePath();

              return element.type === 'p'
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
          type: 'p',
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
        createBasePlugin({
          key: 'p',
          type: 'p',
          schema: {
            element: {
              content: schema.content.open({ default: 'text', min: 1 }),
            },
          },
          rules: {
            selection: {
              affinity: 'directional',
            },
          },
        }),
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
        createBasePlugin({
          key: 'p',
          type: 'p',
          schema: {
            element: {
              content: schema.content.open({ default: 'text', min: 1 }),
            },
          },
          editOnly: true,
        }),
      ],
      readOnly: true,
      initialValue: createValue(),
    });

    const { container } = renderPipe(editor);

    expect(container.querySelector('[data-plite-node="element"]')).toBeNull();
  });
});
