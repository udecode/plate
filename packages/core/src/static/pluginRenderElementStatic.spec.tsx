import React from 'react';
import ReactDOMServer from 'react-dom/server';

import {
  BaseParagraphPlugin,
  type RenderElementProps,
  defineBasePlugin,
} from '../lib';
import { createStaticEditor } from './editor/withStatic';
import { pluginRenderElementStatic } from './pluginRenderElementStatic';

describe('pluginRenderElementStatic', () => {
  it('applies above/below wrappers and below-root renderers around the element output', () => {
    const ParagraphPlugin = BaseParagraphPlugin.extend(() => ({
      render: { as: 'article' },
    }));
    const AbovePlugin = defineBasePlugin('above', {
      render: {
        aboveNodes:
          () =>
          ({ children }) => <section data-role="above">{children}</section>,
      },
    });
    const BelowPlugin = defineBasePlugin('below', {
      render: {
        belowNodes:
          () =>
          ({ children }) => <div data-role="below">{children}</div>,
      },
    });
    const RootPlugin = defineBasePlugin('rootExtra', {
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
        editor.plugin(ParagraphPlugin)
      )({
        attributes: { 'data-plite-node': 'element' },
        children: 'Body',
        element: {
          children: [{ text: 'Body' }],
          id: 'block-1',
          type: 'paragraph',
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
    expect(markup).not.toContain('data-block-id');
    expect(markup).toContain('class="plite-paragraph"');
  });
});
