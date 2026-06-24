import React from 'react';

import { createBasePlateEditor, createEditorPlugin } from 'platejs';
import { serializeHtml } from 'platejs/static';

import { BaseEditorKit } from '@/registry/components/editor/editor-base-kit';

import { createStaticEditor } from './create-static-editor';

describe('core static serializeHtml custom render hooks', () => {
  it('renders belowNodes output around children', async () => {
    const renderBelowPlugin = createEditorPlugin({
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

    const editor = createBasePlateEditor({
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
      '<span data-plite-string="true">None encoded string 100%</span>'
    );
    expect(html).toContain(
      '<span data-plite-string="true">Encoded string 100%25</span>'
    );
  });

  it('applies both node and leaf renderers', async () => {
    const testPlugin = createEditorPlugin({
      key: 'test',
      node: {
        isDecoration: false,
        isLeaf: true,
      },
      render: {
        node: ({ children }) => (
          <span data-plite-test="node-wrapper">{children}</span>
        ),
        leaf: ({ children }) => (
          <span data-plite-test="leaf-wrapper">{children}</span>
        ),
      },
    });

    const editor = createBasePlateEditor({
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
      '<span data-plite-node="text" data-plite-test="true"><span data-plite-test="node-wrapper"><span data-plite-leaf="true"><span data-plite-test="leaf-wrapper"><span data-plite-string="true">test content</span></span></span></span></span>'
    );
  });

  it('applies a component renderer to decoration leaves', async () => {
    const testPlugin = createEditorPlugin({
      key: 'test',
      node: {
        isDecoration: true,
        isLeaf: true,
      },
    });

    const editor = createBasePlateEditor({
      plugins: [
        testPlugin.withComponent(({ children }) => (
          <span data-plite-test="node-wrapper">{children}</span>
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
      '<span data-plite-node="text"><span data-plite-leaf="true" data-plite-test="true"><span data-plite-test="node-wrapper"><span data-plite-string="true">test content</span></span></span></span>'
    );
  });

  it('applies a component renderer to non-decoration leaves', async () => {
    const testPlugin = createEditorPlugin({
      key: 'test',
      node: {
        isDecoration: false,
        isLeaf: true,
      },
    });

    const editor = createBasePlateEditor({
      plugins: [
        testPlugin.withComponent(({ children }) => (
          <span data-plite-test="node-wrapper">{children}</span>
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
      '<span data-plite-node="text" data-plite-test="true"><span data-plite-test="node-wrapper"><span data-plite-leaf="true"><span data-plite-string="true">test content</span></span></span></span>'
    );
  });
});
