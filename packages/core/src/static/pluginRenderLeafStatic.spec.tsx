import React from 'react';

import { type RenderLeafProps, createBasePlugin } from '../lib';
import { createStaticEditor } from './editor/withStatic';
import {
  pipeRenderLeafStatic,
  pluginRenderLeafStatic,
} from './pluginRenderLeafStatic';

describe('pluginRenderLeafStatic', () => {
  const HighlightPlugin = createBasePlugin({
    key: 'highlight',
    node: {
      mark: true,
      leafProps: {
        className: 'highlight-leaf',
        'data-tone': 'warm',
      },
      type: 'highlight',
    },
  });

  it('returns children when the leaf does not match the plugin', () => {
    const editor = createStaticEditor({
      plugins: [HighlightPlugin],
    });

    expect(
      pluginRenderLeafStatic(
        editor,
        editor.getPlugin(HighlightPlugin)
      )({
        attributes: {},
        children: 'plain',
        leaf: { text: 'plain' },
        text: { text: 'plain' },
      } satisfies RenderLeafProps)
    ).toBe('plain');
  });

  it('uses render.leaf when the leaf matches the plugin', () => {
    const CustomLeafPlugin = HighlightPlugin.extend({
      render: {
        leaf: ({ children }) => <mark data-kind="custom-leaf">{children}</mark>,
      },
    });
    const editor = createStaticEditor({
      plugins: [CustomLeafPlugin],
    });
    const result = pluginRenderLeafStatic(
      editor,
      editor.getPlugin(CustomLeafPlugin)
    )({
      attributes: {},
      children: 'hi',
      leaf: { highlight: true, text: 'hi' },
      text: { highlight: true, text: 'hi' },
    } satisfies RenderLeafProps);

    expect(result).toEqual(
      expect.objectContaining({
        props: expect.objectContaining({ children: 'hi' }),
        type: editor.getPlugin(CustomLeafPlugin).render.leaf,
      })
    );
  });

  it('merges plugin leaf props before delegating to renderLeaf', () => {
    const editor = createStaticEditor({
      plugins: [HighlightPlugin],
    });
    let renderLeafCalled = false;
    const result = pipeRenderLeafStatic(editor, {
      renderLeaf: ({ attributes, children }) => {
        renderLeafCalled = true;

        return (
          <span
            data-class={attributes.className}
            data-tone={attributes['data-tone']}
          >
            {children}
          </span>
        );
      },
    })({
      attributes: { className: 'base' },
      children: 'hi',
      leaf: { highlight: true, text: 'hi' },
      text: { highlight: true, text: 'hi' },
    } satisfies RenderLeafProps);

    expect(renderLeafCalled).toBe(true);
    expect(result).toEqual(
      expect.objectContaining({
        props: expect.objectContaining({
          'data-class': 'highlight-leaf',
          'data-tone': 'warm',
        }),
      })
    );
  });
});
