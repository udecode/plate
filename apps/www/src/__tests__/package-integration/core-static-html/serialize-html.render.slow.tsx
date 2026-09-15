import { property, createEditor, definePlugin } from 'platejs';
import { renderStaticHtml } from 'platejs/static';
import React from 'react';

import { BaseEditorKit } from '@/registry/components/editor/plugins-static';

import { createStaticEditor } from './create-static-editor';

describe('core static renderStaticHtml custom render hooks', () => {
  it('wraps node children through slots', async () => {
    const renderBelowPlugin = definePlugin('testList', {
      slots: {
        wrapNodeChildren: (_injectProps: any) =>
          function Component({ children }: { children: React.ReactNode }) {
            return (
              <ul>
                <li>{children}</li>
              </ul>
            );
          },
      },
    });

    const editor = createEditor({
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
      stripDataAttributes: true,
    });

    expect(html).toContain('<span>None encoded string 100%</span>');
    expect(html).toContain('<span>Encoded string 100%25</span>');
  });

  it('applies both node and leaf renderers', async () => {
    const testPlugin = definePlugin('test', {
      component: ({ children }) => (
        <span data-editor-test="node-wrapper">{children}</span>
      ),
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      render: {
        mark: {
          leafComponent: ({ children }) => (
            <span data-editor-test="leaf-wrapper">{children}</span>
          ),
          placement: 'text',
        },
      },
    });

    const editor = createEditor({
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
      stripDataAttributes: true,
    });

    expect(html).toContain(
      '<span><span data-editor-test="node-wrapper"><span><span data-editor-test="leaf-wrapper"><span>test content</span></span></span></span></span>'
    );
  });

  it('applies a component renderer to decoration leaves', async () => {
    const testPlugin = definePlugin('test', {
      component: ({ children }) => (
        <span data-editor-test="node-wrapper">{children}</span>
      ),
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      render: {
        mark: { placement: 'leaf' },
      },
    });

    const editor = createEditor({
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
      stripDataAttributes: true,
    });

    expect(html).toContain(
      '<span><span><span data-editor-test="node-wrapper"><span>test content</span></span></span></span>'
    );
  });

  it('applies a component renderer to non-decoration leaves', async () => {
    const testPlugin = definePlugin('test', {
      component: ({ children }) => (
        <span data-editor-test="node-wrapper">{children}</span>
      ),
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      render: {
        mark: { placement: 'text' },
      },
    });

    const editor = createEditor({
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
      stripDataAttributes: true,
    });

    expect(html).toContain(
      '<span><span data-editor-test="node-wrapper"><span><span>test content</span></span></span></span>'
    );
  });
});
