import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { createSlatePlugin } from '../lib';
import { createStaticEditor } from './editor/withStatic';
import { pluginRenderElementStatic } from './pluginRenderElementStatic';

describe('pluginRenderElementStatic', () => {
  it('applies above/below wrappers and below-root renderers around the element output', () => {
    const ParagraphPlugin = createSlatePlugin({
      key: 'p',
      node: { isElement: true, type: 'p' },
      render: { as: 'article' },
    });
    const AbovePlugin = createSlatePlugin({
      key: 'above',
      render: {
        aboveNodes:
          () =>
          ({ children }: any) => (
            <section data-role="above">{children}</section>
          ),
      },
    });
    const BelowPlugin = createSlatePlugin({
      key: 'below',
      render: {
        belowNodes:
          () =>
          ({ children }: any) => <div data-role="below">{children}</div>,
      },
    });
    const RootPlugin = createSlatePlugin({
      key: 'root-extra',
      render: {
        belowRootNodes: ({ element }: any) => (
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
        attributes: {},
        children: 'Body',
        element: {
          children: [{ text: 'Body' }],
          id: 'block-1',
          type: 'p',
        },
      } as any)!
    );

    expect(markup).toContain('data-role="above"');
    expect(markup).toContain('data-role="below"');
    expect(markup).toContain('data-role="root"');
    expect(markup).toContain('data-id="block-1"');
    expect(markup).toContain('data-block-id="block-1"');
    expect(markup).toContain('class="slate-p"');
  });
});
