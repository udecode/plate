import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { schema } from '../core';
import {
  BaseParagraphPlugin,
  type RenderElementProps,
  defineBasePlugin,
} from '../lib';
import { createStaticEditor } from './editor/withStatic';
import { pipeRenderElementStatic } from './pipeRenderElementStatic';

describe('pipeRenderElementStatic', () => {
  afterEach(() => {
    mock.restore();
  });

  it('uses the element plugin renderer before the fallback renderElement prop', () => {
    const ParagraphPlugin = BaseParagraphPlugin.extend(() => ({
      render: { as: 'article' },
    }));
    const renderElement = mock(() => <mark data-kind="fallback" />);
    const editor = createStaticEditor({
      plugins: [ParagraphPlugin],
    });
    const markup = ReactDOMServer.renderToStaticMarkup(
      pipeRenderElementStatic(editor, {
        renderElement,
      })({
        attributes: { 'data-plite-node': 'element' },
        children: 'Body',
        element: {
          children: [{ text: 'Body' }],
          type: 'paragraph',
        },
        slots: {
          children: () => null,
          contentBoundary: ({ children }) => children,
          contentRoot: () => null,
        },
      } satisfies RenderElementProps)
    );

    expect(renderElement).not.toHaveBeenCalled();
    expect(markup).toContain('<article');
  });

  it('indexes element renderers by persisted type rather than plugin name', () => {
    const ElementPlugin = defineBasePlugin('elementCapability', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          type: 'persistedElement',
        },
      },
      render: { as: 'article' },
    });
    const editor = createStaticEditor({ plugins: [ElementPlugin] });
    const markup = ReactDOMServer.renderToStaticMarkup(
      pipeRenderElementStatic(editor)({
        attributes: { 'data-plite-node': 'element' },
        children: 'Body',
        element: {
          children: [{ text: 'Body' }],
          type: 'persistedElement',
        },
        slots: {
          children: () => null,
          contentBoundary: ({ children }) => children,
          contentRoot: () => null,
        },
      } satisfies RenderElementProps)
    );

    expect(ElementPlugin.name).toBe('elementCapability');
    expect(editor.plugin(ElementPlugin).schema.type).toBe('persistedElement');
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
      attributes: { 'data-plite-node': 'element' },
      children: 'Body',
      element: {
        children: [{ text: 'Body' }],
        type: 'quote',
      },
      slots: {
        children: () => null,
        contentBoundary: ({ children }) => children,
        contentRoot: () => null,
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
    const RootPlugin = defineBasePlugin('rootExtra', {
      render: {
        belowRootNodes: () => <aside data-role="root" />,
      },
    });
    const editor = createStaticEditor({
      plugins: [RootPlugin],
    });
    const markup = ReactDOMServer.renderToStaticMarkup(
      pipeRenderElementStatic(editor)({
        attributes: { 'data-plite-node': 'element' },
        children: 'Body',
        element: {
          children: [{ text: 'Body' }],
          id: 'block-1',
          type: 'quote',
        },
        slots: {
          children: () => null,
          contentBoundary: ({ children }) => children,
          contentRoot: () => null,
        },
      } satisfies RenderElementProps)
    );

    expect(markup).toContain('Body');
    expect(markup).toContain('data-role="root"');
  });
});
