import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { createSlatePlugin } from '../lib';
import { createStaticEditor } from './editor/withStatic';
import { pipeRenderElementStatic } from './pipeRenderElementStatic';

describe('pipeRenderElementStatic', () => {
  afterEach(() => {
    mock.restore();
  });

  it('uses the element plugin renderer before the fallback renderElement prop', () => {
    const ParagraphPlugin = createSlatePlugin({
      key: 'p',
      node: { isElement: true, type: 'p' },
      render: { as: 'article' },
    });
    const renderElement = mock(() => <mark data-kind="fallback" />);
    const editor = createStaticEditor({
      plugins: [ParagraphPlugin],
    });
    const markup = ReactDOMServer.renderToStaticMarkup(
      pipeRenderElementStatic(editor, {
        renderElement: renderElement as any,
      })({
        attributes: {},
        children: 'Body',
        element: {
          children: [{ text: 'Body' }],
          type: 'p',
        },
      } as any)!
    );

    expect(renderElement).not.toHaveBeenCalled();
    expect(markup).toContain('<article');
  });

  it('uses the fallback renderElement prop when there is no matching element plugin', () => {
    const renderElement = mock(({ children }: any) => (
      <mark data-kind="fallback">{children}</mark>
    ));
    const editor = createStaticEditor();
    const result = pipeRenderElementStatic(editor, {
      renderElement: renderElement as any,
    })({
      attributes: {},
      children: 'Body',
      element: {
        children: [{ text: 'Body' }],
        type: 'quote',
      },
    } as any) as any;

    expect(renderElement).toHaveBeenCalled();
    expect(result.type).toBe('mark');
    expect(result.props['data-kind']).toBe('fallback');
  });

  it('renders belowRootNodes around the default SlateElement output', () => {
    const RootPlugin = createSlatePlugin({
      key: 'root-extra',
      render: {
        belowRootNodes: () => <aside data-role="root" />,
      },
    });
    const editor = createStaticEditor({
      plugins: [RootPlugin],
    });
    const markup = ReactDOMServer.renderToStaticMarkup(
      pipeRenderElementStatic(editor)({
        attributes: {},
        children: 'Body',
        element: {
          children: [{ text: 'Body' }],
          id: 'block-1',
          type: 'quote',
        },
      } as any)!
    );

    expect(markup).toContain('Body');
    expect(markup).toContain('data-role="root"');
  });
});
