import React from 'react';

import { createSlateEditor, createTSlatePlugin } from 'platejs';
import { serializeHtml } from 'platejs/static';

import { BaseEditorKit } from '@/registry/components/editor/editor-base-kit';

import { createStaticEditor } from './create-static-editor';

describe('core static serializeHtml custom render hooks', () => {
  it('renders belowNodes output around children', async () => {
    const renderBelowPlugin = createTSlatePlugin({
      key: 'test-list',
      render: {
        belowNodes: (_injectProps: any) =>
          function Component({ children }: { children: React.ReactNode }) {
            return (
              <ul>
                <li>{children}</li>
              </ul>
            );
          },
      },
    });

    const editor = createSlateEditor({
      plugins: [...BaseEditorKit, renderBelowPlugin],
      value: [
        {
          children: [{ text: 'test render below' }],
          type: 'p',
        },
      ],
    });

    const html = await serializeHtml(editor, {
      preserveClassNames: [],
      stripClassNames: true,
      stripDataAttributes: true,
    });

    expect(html).toContain(
      '<ul><li><span><span><span>test render below</span></span></span></li></ul>'
    );
  });

  it('preserves literal percent signs', async () => {
    const editor = createStaticEditor([
      {
        children: [
          {
            text: 'None encoded string 100%',
          },
        ],
        type: 'p',
      },
      {
        children: [{ text: 'Encoded string 100%25' }],
        type: 'p',
      },
    ]);

    const html = await serializeHtml(editor, {
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(html).toContain(
      '<span data-slate-string="true">None encoded string 100%</span>'
    );
    expect(html).toContain(
      '<span data-slate-string="true">Encoded string 100%25</span>'
    );
  });

  it('applies both node and leaf renderers', async () => {
    const testPlugin = createTSlatePlugin({
      key: 'test',
      node: {
        isDecoration: false,
        isLeaf: true,
      },
      render: {
        node: ({ children }) => (
          <span data-slate-test="node-wrapper">{children}</span>
        ),
        leaf: ({ children }) => (
          <span data-slate-test="leaf-wrapper">{children}</span>
        ),
      },
    });

    const editor = createSlateEditor({
      plugins: [...BaseEditorKit, testPlugin],
      value: [
        {
          children: [
            {
              test: true,
              text: 'test content',
            },
          ],
          type: 'p',
        },
      ],
    });

    const html = await serializeHtml(editor, {
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(html).toContain(
      '<span data-slate-node="text" data-slate-test="true"><span data-slate-test="node-wrapper"><span data-slate-leaf="true"><span data-slate-test="leaf-wrapper"><span data-slate-string="true">test content</span></span></span></span></span>'
    );
  });

  it('applies a component renderer to decoration leaves', async () => {
    const testPlugin = createTSlatePlugin({
      key: 'test',
      node: {
        isDecoration: true,
        isLeaf: true,
      },
    });

    const editor = createSlateEditor({
      plugins: [
        testPlugin.withComponent(({ children }) => (
          <span data-slate-test="node-wrapper">{children}</span>
        )),
      ],
      value: [
        {
          children: [
            {
              test: true,
              text: 'test content',
            },
          ],
          type: 'p',
        },
      ],
    });

    const html = await serializeHtml(editor, {
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(html).toContain(
      '<span data-slate-node="text"><span data-slate-leaf="true" data-slate-test="true"><span data-slate-test="node-wrapper"><span data-slate-string="true">test content</span></span></span></span>'
    );
  });

  it('applies a component renderer to non-decoration leaves', async () => {
    const testPlugin = createTSlatePlugin({
      key: 'test',
      node: {
        isDecoration: false,
        isLeaf: true,
      },
    });

    const editor = createSlateEditor({
      plugins: [
        testPlugin.withComponent(({ children }) => (
          <span data-slate-test="node-wrapper">{children}</span>
        )),
      ],
      value: [
        {
          children: [
            {
              test: true,
              text: 'test content',
            },
          ],
          type: 'p',
        },
      ],
    });

    const html = await serializeHtml(editor, {
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(html).toContain(
      '<span data-slate-node="text" data-slate-test="true"><span data-slate-test="node-wrapper"><span data-slate-leaf="true"><span data-slate-string="true">test content</span></span></span></span>'
    );
  });
});
