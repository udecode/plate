import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { BaseHeadingPlugin } from '../features/basic-nodes/lib';
import {
  BaseParagraphPlugin,
  type RenderElementProps,
  defineBasePlugin,
} from '../lib';
import { createStaticEditor } from './editor/withStatic';
import { pluginRenderElementStatic } from './pluginRenderElementStatic.internal';

describe('pluginRenderElementStatic', () => {
  it('renders a configured dynamic heading component', () => {
    const HeadingPlugin = BaseHeadingPlugin.configure({
      component: ({ attributes, children, element }) => {
        const Tag = `h${element.level}` as const;

        return <Tag {...attributes}>{children}</Tag>;
      },
    });
    const editor = createStaticEditor({ plugins: [HeadingPlugin] });
    const markup = ReactDOMServer.renderToStaticMarkup(
      pluginRenderElementStatic(
        editor,
        editor.plugin(HeadingPlugin)
      )({
        attributes: { 'data-plite-node': 'element' },
        children: 'Heading',
        element: {
          children: [{ text: 'Heading' }],
          level: 2,
          type: 'heading',
        },
        slots: {
          children: () => null,
          contentBoundary: ({ children }) => children,
          contentRoot: () => null,
        },
      } satisfies RenderElementProps)
    );

    expect(markup).toContain('<h2');
    expect(markup).toContain('>Heading</h2>');
    expect(markup).not.toContain(' as=');
  });

  it('applies above/below wrappers and below-root renderers around the element output', () => {
    const ParagraphPlugin = BaseParagraphPlugin.configure({
      component: 'article',
    });
    const AbovePlugin = defineBasePlugin('above', {
      slots: {
        wrapNode:
          () =>
          ({ children }) => <section data-role="above">{children}</section>,
      },
    });
    const BelowPlugin = defineBasePlugin('below', {
      slots: {
        wrapNodeChildren:
          () =>
          ({ children }) => <div data-role="below">{children}</div>,
      },
    });
    const RootPlugin = defineBasePlugin('rootExtra', {
      slots: {
        afterNodeChildren: ({ element }) => (
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
