/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { render } from '@testing-library/react';

import { createSlatePlugin } from '../../lib';
import { TestPlate as Plate } from '../__tests__/TestPlate';
import { PlateSlate } from '../components/PlateSlate';
import { createPlateEditor } from '../editor/withPlate';
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

const createFallbackValue = () =>
  [
    {
      children: [{ text: 'Body' }],
      type: 'blockquote',
    },
  ] as any;

const renderPipe = (editor: ReturnType<typeof createPlateEditor>) => {
  const renderElement = pipeRenderElement(editor)!;
  const element = editor.children[0] as any;

  const RenderProbe = () =>
    renderElement({
      attributes: {} as any,
      children: 'Body',
      element,
    } as any);

  return render(
    <Plate editor={editor}>
      <PlateSlate>
        <RenderProbe />
      </PlateSlate>
    </Plate>
  );
};

const renderPipeBare = (editor: ReturnType<typeof createPlateEditor>) => {
  const renderElement = pipeRenderElement(editor)!;
  const element = editor.children[0] as any;

  const RenderProbe = () =>
    renderElement({
      attributes: {} as any,
      children: 'Body',
      element,
    } as any);

  return render(
    <Plate editor={editor}>
      <PlateSlate>
        <RenderProbe />
      </PlateSlate>
    </Plate>
  );
};

describe('pipeRenderElement', () => {
  it('renders the default paragraph element with the paragraph plugin class', () => {
    const editor = createPlateEditor({
      navigationFeedback: false,
      plugins: [],
      value: createValue(),
    } as any);

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-slate-node="element"]');

    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('slate-p');
    expect(element?.tagName).toBe('DIV');
  });

  it('resolves one node path on the plain fast path to preserve element context', () => {
    const editor = createPlateEditor({
      navigationFeedback: false,
      plugins: [],
      value: createValue(),
    } as any);
    const findPath = editor.api.findPath;
    const spy = mock(findPath);

    editor.api.findPath = spy as any;

    renderPipeBare(editor);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('keeps first-block composing state sync on the plain fast path', () => {
    const editor = createPlateEditor({
      navigationFeedback: false,
      plugins: [],
      value: createValue(),
    } as any);

    editor.dom.composing = true;

    renderPipe(editor);

    expect(editor.dom.composing).toBe(false);
    expect(editor.store.get('composing')).toBe(false);
  });

  it('resolves one node path on the block-id fast path to preserve element context', () => {
    const editor = createPlateEditor({
      navigationFeedback: false,
      plugins: [],
      value: createValue('block-1'),
    } as any);
    const findPath = editor.api.findPath;
    const spy = mock(findPath);

    editor.api.findPath = spy as any;

    renderPipeBare(editor);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('preserves non-string block ids on the block-id fast path', () => {
    const editor = createPlateEditor({
      navigationFeedback: false,
      plugins: [],
      value: [
        {
          children: [{ text: 'Body' }],
          id: 123,
          type: 'p',
        },
      ] as any,
    } as any);

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-slate-node="element"]');

    expect(element).toHaveAttribute('data-block-id', '123');
  });

  it('keeps plugin render.as behavior', () => {
    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'p',
          node: {
            isElement: true,
            type: 'p',
          },
          render: {
            as: 'article',
          },
        }),
      ],
      value: createValue(),
    });

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-slate-node="element"]');

    expect(element?.tagName).toBe('ARTICLE');
  });

  it('keeps element context for custom render.as components', () => {
    const CustomElement = ({ children, ...props }: any) => {
      const path = usePath();

      return (
        <section {...props} data-context-path={path.join(',')}>
          {children}
        </section>
      );
    };
    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'p',
          node: {
            isElement: true,
            type: 'p',
          },
          render: {
            as: CustomElement,
          },
        }),
      ],
      value: createValue(),
    });

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-slate-node="element"]');

    expect(element?.tagName).toBe('SECTION');
    expect(element).toHaveAttribute('data-context-path', '0');
  });

  it('preserves Slate children for void render.as tags on the fast path', () => {
    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'hr',
          node: {
            isElement: true,
            isVoid: true,
            type: 'hr',
          },
          render: {
            as: 'hr',
          },
        }),
      ],
      value: [
        {
          children: [{ text: '' }],
          type: 'hr',
        },
      ] as any,
    });

    const renderElement = pipeRenderElement(editor)!;
    const element = editor.children[0] as any;

    const RenderProbe = () =>
      renderElement({
        attributes: {} as any,
        children: 'Body',
        element,
      } as any);

    const { container } = render(
      <Plate editor={editor}>
        <PlateSlate>
          <RenderProbe />
        </PlateSlate>
      </Plate>
    );
    const rendered = container.querySelector('[data-slate-node="element"]');

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
        createSlatePlugin({
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
      value: createValue(),
    });

    const { getByTestId } = renderPipe(editor);

    expect(getByTestId('above')).toBeInTheDocument();
  });

  it('passes the node path to renderElement fallback props without editor findPath', () => {
    const editor = createPlateEditor({
      plugins: [],
      value: createFallbackValue(),
    });
    let receivedPath: any = 'unset';

    const renderElement = pipeRenderElement(editor, (props: any) => {
      receivedPath = props.path;

      return <blockquote {...props.attributes}>{props.children}</blockquote>;
    })!;
    const element = editor.children[0] as any;

    const RenderProbe = () =>
      renderElement({
        attributes: {} as any,
        children: 'Body',
        element,
      } as any);

    render(
      <Plate editor={editor}>
        <PlateSlate>
          <RenderProbe />
        </PlateSlate>
      </Plate>
    );

    expect(receivedPath).toEqual([0]);
  });

  it('keeps plugin node.props behavior', () => {
    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'p',
          node: {
            isElement: true,
            props: {
              'data-probe': 'yes',
            },
            type: 'p',
          },
        }),
      ],
      value: createValue(),
    });

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-slate-node="element"]');

    expect(element).toHaveAttribute('data-probe', 'yes');
  });

  it('runs inactive belowNodes wrappers under element context', () => {
    const editor = createPlateEditor({
      navigationFeedback: false,
      plugins: [
        createSlatePlugin({
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
      value: createValue(),
    } as any);

    const { container } = renderPipe(editor);

    expect(container.querySelector('[data-slate-node="element"]')).toBeTruthy();
  });

  it('keeps plain fast-path markup for inject.nodeProps', () => {
    const editor = createPlateEditor({
      navigationFeedback: false,
      plugins: [
        createSlatePlugin({
          inject: {
            nodeProps: {
              nodeKey: 'listStyleType',
              query: ({ nodeProps }) => !!nodeProps.element?.listStyleType,
              styleKey: 'listStyleType',
            },
            targetPlugins: ['p'],
          },
          key: 'list',
        }),
      ],
      value: [
        {
          children: [{ text: 'Body' }],
          listStyleType: 'disc',
          type: 'p',
        },
      ] as any,
    } as any);
    const findPath = editor.api.findPath;
    const spy = mock(findPath);

    editor.api.findPath = spy as any;

    const { container } = renderPipeBare(editor);
    const element = container.querySelector('[data-slate-node="element"]');

    expect(spy).toHaveBeenCalledTimes(1);
    expect((element as HTMLElement).style.listStyleType).toBe('disc');
  });

  it('keeps element context for inject.nodeProps transform hooks', () => {
    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin({
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
            targetPlugins: ['p'],
          },
          key: 'hook-inject',
        }),
      ],
      value: [
        {
          children: [{ text: 'Body' }],
          listStyleType: 'disc',
          type: 'p',
        },
      ] as any,
    });

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-slate-node="element"]');

    expect(element).toHaveAttribute('data-context-path', '0');
    expect(element).toHaveAttribute('data-context-type', 'p');
  });

  it('keeps element store context for inject.nodeProps transform hooks', () => {
    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin({
          inject: {
            nodeProps: {
              nodeKey: 'listStyleType',
              query: ({ nodeProps }) => !!nodeProps.element?.listStyleType,
              transformProps: ({ props }) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const type = useElementSelector(([element]) => element.type, []);

                return {
                  ...props,
                  'data-selected-type': type,
                };
              },
            },
            targetPlugins: ['p'],
          },
          key: 'selector-inject',
        }),
      ],
      value: [
        {
          children: [{ text: 'Body' }],
          listStyleType: 'disc',
          type: 'p',
        },
      ] as any,
    });

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-slate-node="element"]');

    expect(element).toHaveAttribute('data-selected-type', 'p');
  });

  it('keeps pathless inject.nodeProps on the wrapped directional path', () => {
    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin({
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
            targetPlugins: ['p'],
          },
          key: 'list',
        }),
        createSlatePlugin({
          key: 'p',
          node: {
            isElement: true,
            type: 'p',
          },
          rules: {
            selection: {
              affinity: 'directional',
            },
          },
        }),
      ],
      value: [
        {
          children: [{ text: 'Body' }],
          listStyleType: 'disc',
          type: 'p',
        },
      ] as any,
    });

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-slate-node="element"]');

    expect(element).toHaveAttribute('role', 'listitem');
    expect((element as HTMLElement).style.display).toBe('list-item');
    expect((element as HTMLElement).style.listStyleType).toBe('disc');
  });

  it('keeps pathless inject.nodeProps when active belowNodes wrappers are present', () => {
    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin({
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
            targetPlugins: ['p'],
          },
          key: 'list',
        }),
        createSlatePlugin({
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
      value: [
        {
          children: [{ text: 'Body' }],
          listStyleType: 'disc',
          type: 'p',
        },
      ] as any,
    });

    const { container, getByTestId } = renderPipe(editor);
    const element = container.querySelector('[data-slate-node="element"]');

    expect(getByTestId('active-below')).toBeInTheDocument();
    expect(getByTestId('active-below')).toHaveAttribute('data-path', '0');
    expect(element).toHaveAttribute('role', 'listitem');
    expect((element as HTMLElement).style.display).toBe('list-item');
    expect((element as HTMLElement).style.listStyleType).toBe('disc');
  });

  it('keeps plugin selection affinity behavior on the plain fast path', () => {
    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'p',
          node: {
            isElement: true,
            type: 'p',
          },
          rules: {
            selection: {
              affinity: 'directional',
            },
          },
        }),
      ],
      value: createValue(),
    });

    const { container } = renderPipe(editor);

    expect(
      container.querySelectorAll('span[contenteditable="false"]')
    ).toHaveLength(2);
  });

  it('keeps editOnly behavior on the plain fast path in read-only mode', () => {
    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin({
          editOnly: true,
          key: 'p',
          node: {
            isElement: true,
            type: 'p',
          },
        }),
      ],
      value: createValue(),
    });
    editor.dom.readOnly = true;

    const { container } = renderPipe(editor);

    expect(container.querySelector('[data-slate-node="element"]')).toBeNull();
  });
});
