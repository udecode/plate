import { schema } from '@platejs/plite';

import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { type RenderElementProps, createBasePlugin } from '../lib';
import { createStaticEditor } from './editor/withStatic';
import { pluginRenderElementStatic } from './pluginRenderElementStatic';

describe('pluginRenderElementStatic', () => {
  it('applies above/below wrappers and below-root renderers around the element output', () => {
    const ParagraphPlugin = createBasePlugin({
      name: 'p',
      type: 'p',
      schema: {
        element: { content: schema.content.open({ default: 'text', min: 1 }) },
      },
      render: { as: 'article' },
    });
    const AbovePlugin = createBasePlugin({
      name: 'above',
      render: {
        aboveNodes:
          () =>
          ({ children }) => <section data-role="above">{children}</section>,
      },
    });
    const BelowPlugin = createBasePlugin({
      name: 'below',
      render: {
        belowNodes:
          () =>
          ({ children }) => <div data-role="below">{children}</div>,
      },
    });
    const RootPlugin = createBasePlugin({
      name: 'root-extra',
      render: {
        belowRootNodes: ({ element }) => (
          <aside data-id={element.id} data-role="root" />
        ),
      },
    });
    const editor = createStaticEditor({
      plugins: [ParagraphPlugin, AbovePlugin, BelowPlugin, RootPlugin],
    });
    const markup = ReactDOMServer.renderToStaticMarkup(
      pluginRenderElementStatic(
        editor,
        editor.plugin(ParagraphPlugin).plugin
      )({
        attributes: { 'data-plite-node': 'element' },
        children: 'Body',
        element: {
          children: [{ text: 'Body' }],
          id: 'block-1',
          type: 'p',
        },
        slots: {
          children: () => null,
          contentBoundary: ({ children }) => children,
          contentRoot: () => null,
        },
      } satisfies RenderElementProps)
    );

    expect(markup).toContain('data-role="above"');
    expect(markup).toContain('data-role="below"');
    expect(markup).toContain('data-role="root"');
    expect(markup).toContain('data-id="block-1"');
    expect(markup).toContain('data-block-id="block-1"');
    expect(markup).toContain('class="plite-p"');
  });
});
