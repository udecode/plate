import React from 'react';

import { property } from 'platejs';
import { createBaseEditor, defineBasePlugin } from 'platejs';
import { renderStaticHtml } from 'platejs/static';

import { BaseEditorKit } from '@/registry/components/editor/editor-base-kit';

import { createStaticEditor } from './create-static-editor';

describe('core static renderStaticHtml custom render hooks', () => {
  it('renders belowNodes output around children', async () => {
    const renderBelowPlugin = defineBasePlugin('testList', {
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

    const editor = createBaseEditor({
      plugins: [...BaseEditorKit, renderBelowPlugin],
      initialValue: [
        {
          children: [{ text: 'test render below' }],
          type: 'paragraph',
        },
      ],
    });

    const html = await renderStaticHtml(editor, {
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
        type: 'paragraph',
      },
      {
        children: [{ text: 'Encoded string 100%25' }],
        type: 'paragraph',
      },
    ]);

    const html = await renderStaticHtml(editor, {
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
    const testPlugin = defineBasePlugin('test', {
      component: ({ children }) => (
        <span data-plite-test="node-wrapper">{children}</span>
      ),
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      render: {
        isDecoration: false,
        leaf: ({ children }) => (
          <span data-plite-test="leaf-wrapper">{children}</span>
        ),
      },
    });

    const editor = createBaseEditor({
      plugins: [...BaseEditorKit, testPlugin],
      initialValue: [
        {
          children: [
            {
              test: true,
              text: 'test content',
            },
          ],
          type: 'paragraph',
        },
      ],
    });

    const html = await renderStaticHtml(editor, {
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(html).toContain(
      '<span data-plite-node="text"><span data-plite-test="node-wrapper"><span data-plite-leaf="true"><span data-plite-test="leaf-wrapper"><span data-plite-string="true">test content</span></span></span></span></span>'
    );
  });

  it('applies a component renderer to decoration leaves', async () => {
    const testPlugin = defineBasePlugin('test', {
      component: ({ children }) => (
        <span data-plite-test="node-wrapper">{children}</span>
      ),
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      render: {
        isDecoration: true,
      },
    });

    const editor = createBaseEditor({
      plugins: [testPlugin],
      initialValue: [
        {
          children: [
            {
              test: true,
              text: 'test content',
            },
          ],
          type: 'paragraph',
        },
      ],
    });

    const html = await renderStaticHtml(editor, {
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(html).toContain(
      '<span data-plite-node="text"><span data-plite-leaf="true"><span data-plite-test="node-wrapper"><span data-plite-string="true">test content</span></span></span></span>'
    );
  });

  it('applies a component renderer to non-decoration leaves', async () => {
    const testPlugin = defineBasePlugin('test', {
      component: ({ children }) => (
        <span data-plite-test="node-wrapper">{children}</span>
      ),
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      render: {
        isDecoration: false,
      },
    });

    const editor = createBaseEditor({
      plugins: [testPlugin],
      initialValue: [
        {
          children: [
            {
              test: true,
              text: 'test content',
            },
          ],
          type: 'paragraph',
        },
      ],
    });

    const html = await renderStaticHtml(editor, {
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(html).toContain(
      '<span data-plite-node="text"><span data-plite-test="node-wrapper"><span data-plite-leaf="true"><span data-plite-string="true">test content</span></span></span></span>'
    );
  });
});
