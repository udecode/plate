import React from 'react';

import { property } from '../core';
import { type RenderTextProps, defineBasePlugin } from '../lib';
import { createStaticEditor } from './editor/withStatic';
import {
  pipeRenderTextStatic,
  pluginRenderTextStatic,
} from './pluginRenderTextStatic';

describe('pluginRenderTextStatic', () => {
  const CommentPlugin = defineBasePlugin('comment', {
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: {
      isDecoration: false,
      textProps: {
        className: 'comment-text',
        'data-tone': 'warm',
      },
    },
  });

  it('returns children when the text does not match the plugin', () => {
    const editor = createStaticEditor({
      plugins: [CommentPlugin],
    });

    expect(
      pluginRenderTextStatic(
        editor,
        editor.plugin(CommentPlugin)
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
      editor.plugin(CommentPlugin)
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
