import React from 'react';
import { serializeHtml } from '../serializeHtml';
import { createStaticEditor } from './create-static-editor';
import { createTSlatePlugin, createSlateEditor } from '../../lib';
import { BaseEditorKit } from '../../../../../apps/www/src/registry/components/editor/editor-base-kit';

describe('serializePlateStatic nodes', () => {
  it('should serialize render below nodes', async () => {
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

  it('should serialize string with %', async () => {
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
      // stripDataAttributes: true,
    });

    expect(html).toContain(
      '<span data-slate-string="true">None encoded string 100%</span>'
    );
    expect(html).toContain(
      '<span data-slate-string="true">Encoded string 100%25</span>'
    );
  });

  it('should serialize with both render.node and render.leaf', async () => {
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

  it('should serialize with both render.node', async () => {
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

  it('should serialize with both render.node', async () => {
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
