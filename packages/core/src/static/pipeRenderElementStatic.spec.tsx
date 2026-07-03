import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { type RenderElementProps, createBasePlugin } from '../lib';
import { createStaticEditor } from './editor/withStatic';
import { pipeRenderElementStatic } from './pipeRenderElementStatic';

describe('pipeRenderElementStatic', () => {
  afterEach(() => {
    mock.restore();
  });

  it('uses the element plugin renderer before the fallback renderElement prop', () => {
    const ParagraphPlugin = createBasePlugin({
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
        renderElement,
      })({
        attributes: { 'data-plite-node': 'element', ref: null },
        children: 'Body',
        element: {
          children: [{ text: 'Body' }],
          type: 'p',
        },
      } satisfies RenderElementProps)
    );

    expect(renderElement).not.toHaveBeenCalled();
    expect(markup).toContain('<article');
  });

  it('uses the fallback renderElement prop when there is no matching element plugin', () => {
    let fallbackCalled = false;
    const editor = createStaticEditor();
    const result = pipeRenderElementStatic(editor, {
      renderElement: ({ children }) => {
        fallbackCalled = true;

        return <mark data-kind="fallback">{children}</mark>;
      },
    })({
      attributes: { 'data-plite-node': 'element', ref: null },
      children: 'Body',
      element: {
        children: [{ text: 'Body' }],
        type: 'quote',
      },
    } satisfies RenderElementProps);

    expect(fallbackCalled).toBe(true);
    expect(result).toEqual(
      expect.objectContaining({
        props: expect.objectContaining({ 'data-kind': 'fallback' }),
        type: 'mark',
      })
    );
  });

  it('renders belowRootNodes around the default PliteElement output', () => {
    const RootPlugin = createBasePlugin({
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
        attributes: { 'data-plite-node': 'element', ref: null },
        children: 'Body',
        element: {
          children: [{ text: 'Body' }],
          id: 'block-1',
          type: 'quote',
        },
      } satisfies RenderElementProps)
    );

    expect(markup).toContain('Body');
    expect(markup).toContain('data-role="root"');
  });
});
