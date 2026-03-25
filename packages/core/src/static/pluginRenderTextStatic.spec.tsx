import React from 'react';

import { createSlatePlugin } from '../lib';
import { createStaticEditor } from './editor/withStatic';
import {
  pipeRenderTextStatic,
  pluginRenderTextStatic,
} from './pluginRenderTextStatic';

describe('pluginRenderTextStatic', () => {
  const CommentPlugin = createSlatePlugin({
    key: 'comment',
    node: {
      isDecoration: false,
      isLeaf: true,
      textProps: {
        className: 'comment-text',
        'data-tone': 'warm',
      } as any,
      type: 'comment',
    },
  });

  it('returns children when the text does not match the plugin', () => {
    const editor = createStaticEditor({
      plugins: [CommentPlugin],
    });

    expect(
      pluginRenderTextStatic(
        editor,
        editor.getPlugin(CommentPlugin)
      )({
        children: 'plain',
        text: { text: 'plain' },
      } as any)
    ).toBe('plain');
  });

  it('uses component overrides for matching text nodes', () => {
    const CustomText = ({ children }: any) => (
      <mark data-kind="custom">{children}</mark>
    );
    const editor = createStaticEditor({
      components: {
        comment: CustomText,
      } as any,
      plugins: [CommentPlugin],
    });
    const result = pluginRenderTextStatic(
      editor,
      editor.getPlugin(CommentPlugin)
    )({
      attributes: {},
      children: 'hi',
      text: { comment: true, text: 'hi' },
    } as any) as any;

    expect(result.type).toBe(CustomText);
    expect(result.props.children).toBe('hi');
  });

  it('merges plugin text props before delegating to renderText', () => {
    const editor = createStaticEditor({
      plugins: [CommentPlugin],
    });
    const renderText = mock(({ attributes, children }) => (
      <span
        data-class={attributes.className}
        data-tone={attributes['data-tone']}
      >
        {children}
      </span>
    ));
    const result = pipeRenderTextStatic(editor, {
      renderText: renderText as any,
    })({
      attributes: { className: 'base' },
      children: 'hi',
      text: { comment: true, text: 'hi' },
    } as any) as any;

    expect(renderText).toHaveBeenCalled();
    expect(result.props['data-class']).toBe('comment-text');
    expect(result.props['data-tone']).toBe('warm');
  });
});
