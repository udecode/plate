import React from 'react';

import { type RenderTextProps, createBasePlugin } from '../lib';
import { createStaticEditor } from './editor/withStatic';
import {
  pipeRenderTextStatic,
  pluginRenderTextStatic,
} from './pluginRenderTextStatic';

describe('pluginRenderTextStatic', () => {
  const CommentPlugin = createBasePlugin({
    key: 'comment',
    node: {
      isDecoration: false,
      isLeaf: true,
      textProps: {
        className: 'comment-text',
        'data-tone': 'warm',
      },
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
        attributes: { 'data-plite-node': 'text', ref: null },
        children: 'plain',
        text: { text: 'plain' },
      } satisfies RenderTextProps)
    ).toBe('plain');
  });

  it('uses component overrides for matching text nodes', () => {
    const CustomText = ({ children }: { children: React.ReactNode }) => (
      <mark data-kind="custom">{children}</mark>
    );
    const editor = createStaticEditor({
      components: {
        comment: CustomText,
      },
      plugins: [CommentPlugin],
    });
    const result = pluginRenderTextStatic(
      editor,
      editor.getPlugin(CommentPlugin)
    )({
      attributes: { 'data-plite-node': 'text', ref: null },
      children: 'hi',
      text: { comment: true, text: 'hi' },
    } satisfies RenderTextProps);

    expect(result).toEqual(
      expect.objectContaining({
        props: expect.objectContaining({ children: 'hi' }),
        type: CustomText,
      })
    );
  });

  it('merges plugin text props before delegating to renderText', () => {
    const editor = createStaticEditor({
      plugins: [CommentPlugin],
    });
    let renderTextCalled = false;
    const result = pipeRenderTextStatic(editor, {
      renderText: ({ attributes, children }) => {
        renderTextCalled = true;

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
      attributes: { 'data-plite-node': 'text', className: 'base', ref: null },
      children: 'hi',
      text: { comment: true, text: 'hi' },
    } satisfies RenderTextProps);

    expect(renderTextCalled).toBe(true);
    expect(result).toEqual(
      expect.objectContaining({
        props: expect.objectContaining({
          'data-class': 'comment-text',
          'data-tone': 'warm',
        }),
      })
    );
  });
});
