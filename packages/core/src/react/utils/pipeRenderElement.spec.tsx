/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { render } from '@testing-library/react';

import { createSlatePlugin } from '../../lib';
import { TestPlate as Plate } from '../__tests__/TestPlate';
import { PlateSlate } from '../components/PlateSlate';
import { createPlateEditor } from '../editor/withPlate';
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

describe('pipeRenderElement', () => {
  it('renders the default paragraph element with the paragraph plugin class', () => {
    const editor = createPlateEditor({
      plugins: [],
      value: createValue(),
    });

    const { container } = renderPipe(editor);
    const element = container.querySelector('[data-slate-node="element"]');

    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('slate-p');
    expect(element?.tagName).toBe('DIV');
  });

  it('does not resolve a node path on the plain fast path', () => {
    const editor = createPlateEditor({
      plugins: [],
      value: createValue(),
    });
    const findPath = editor.api.findPath;
    const spy = mock(findPath);

    editor.api.findPath = spy as any;

    renderPipe(editor);

    expect(spy).not.toHaveBeenCalled();
  });

  it('does not resolve a node path on the block-id fast path', () => {
    const editor = createPlateEditor({
      plugins: [],
      value: createValue('block-1'),
    });
    const findPath = editor.api.findPath;
    const spy = mock(findPath);

    editor.api.findPath = spy as any;

    renderPipe(editor);

    expect(spy).not.toHaveBeenCalled();
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

  it('does not pass children into void render.as tags on the fast path', () => {
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
    const rendered = container.querySelector('hr[data-slate-node="element"]');

    expect(rendered).toBeInTheDocument();
    expect(rendered).toBeEmptyDOMElement();
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

  it('does not resolve a node path for renderElement fallback props', () => {
    const editor = createPlateEditor({
      plugins: [],
      value: createFallbackValue(),
    });
    const findPath = editor.api.findPath;
    const spy = mock(findPath);
    let receivedPath: any = 'unset';

    editor.api.findPath = spy as any;

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

    expect(spy).not.toHaveBeenCalled();
    expect(receivedPath).toBeUndefined();
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
