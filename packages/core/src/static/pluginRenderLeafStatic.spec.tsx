import React from 'react';

import { createSlatePlugin } from '../lib';
import { createStaticEditor } from './editor/withStatic';
import {
  pipeRenderLeafStatic,
  pluginRenderLeafStatic,
} from './pluginRenderLeafStatic';

describe('pluginRenderLeafStatic', () => {
  const HighlightPlugin = createSlatePlugin({
    key: 'highlight',
    node: {
      isLeaf: true,
      leafProps: {
        className: 'highlight-leaf',
        'data-tone': 'warm',
      } as any,
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
        children: 'plain',
        leaf: { text: 'plain' },
      } as any)
    ).toBe('plain');
  });

  it('uses render.leaf when the leaf matches the plugin', () => {
    const CustomLeafPlugin = HighlightPlugin.extend({
      render: {
        leaf: ({ children }: any) => (
          <mark data-kind="custom-leaf">{children}</mark>
        ),
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
    } as any) as any;

    expect(result.type).toBe(editor.getPlugin(CustomLeafPlugin).render.leaf);
    expect(result.props.children).toBe('hi');
  });

  it('merges plugin leaf props before delegating to renderLeaf', () => {
    const editor = createStaticEditor({
      plugins: [HighlightPlugin],
    });
    const renderLeaf = mock(({ attributes, children }) => (
      <span
        data-class={attributes.className}
        data-tone={attributes['data-tone']}
      >
        {children}
      </span>
    ));
    const result = pipeRenderLeafStatic(editor, {
      renderLeaf: renderLeaf as any,
    })({
      attributes: { className: 'base' },
      children: 'hi',
      leaf: { highlight: true, text: 'hi' },
      text: { highlight: true, text: 'hi' },
    } as any) as any;

    expect(renderLeaf).toHaveBeenCalled();
    expect(result.props['data-class']).toBe('highlight-leaf');
    expect(result.props['data-tone']).toBe('warm');
  });
});
