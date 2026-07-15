import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { type RenderElementProps, createBasePlugin } from '../lib';
import { createStaticEditor } from './editor/withStatic';
import { pluginRenderElementStatic } from './pluginRenderElementStatic';

describe('pluginRenderElementStatic', () => {
  it('applies above/below wrappers and below-root renderers around the element output', () => {
    const ParagraphPlugin = createBasePlugin({
      key: 'p',
      node: { isElement: true, type: 'p' },
      render: { as: 'article' },
    });
    const AbovePlugin = createBasePlugin({
      key: 'above',
      render: {
        aboveNodes:
          () =>
          ({ children }) => <section data-role="above">{children}</section>,
      },
    });
    const BelowPlugin = createBasePlugin({
      key: 'below',
      render: {
        belowNodes:
          () =>
          ({ children }) => <div data-role="below">{children}</div>,
      },
    });
    const RootPlugin = createBasePlugin({
      key: 'root-extra',
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
        editor.getPlugin(ParagraphPlugin)
      )({
        attributes: { 'data-plite-node': 'element' },
        children: 'Body',
        element: {
          children: [{ text: 'Body' }],
          id: 'block-1',
          type: 'p',
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
