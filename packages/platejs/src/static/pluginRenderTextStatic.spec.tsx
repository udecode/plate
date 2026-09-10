import React from 'react';

import { property } from '../core';
import { type RenderTextProps, defineBasePlugin } from '../lib';
import { createStaticEditor } from './editor/withStatic';
import {
  pipeRenderTextStatic,
  pluginRenderTextStatic,
} from './pluginRenderTextStatic.internal';

describe('pluginRenderTextStatic', () => {
  const TonePlugin = defineBasePlugin('tone', {
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: {
      mark: {
        placement: 'text',
        textAttributes: {
          className: 'comment-text',
          'data-tone': 'warm',
        },
      },
    },
  });

  it('returns children when the text does not match the plugin', () => {
    const editor = createStaticEditor({
      plugins: [TonePlugin],
    });

    expect(
      pluginRenderTextStatic(
        editor,
        editor.plugin(TonePlugin)
      )({
        attributes: { 'data-plite-node': 'text', ref: null },
        children: 'plain',
        text: { text: 'plain' },
      } satisfies RenderTextProps)
    ).toBe('plain');
  });

  it('uses the configured component for matching text nodes', () => {
    const CustomText = ({ children }: { children: React.ReactNode }) => (
      <mark data-kind="custom">{children}</mark>
    );
    const ConfiguredTonePlugin = TonePlugin.configure({
      component: CustomText,
    });
    const editor = createStaticEditor({ plugins: [ConfiguredTonePlugin] });
    const result = pluginRenderTextStatic(
      editor,
      editor.plugin(ConfiguredTonePlugin)
    )({
      attributes: { 'data-plite-node': 'text', ref: null },
      children: 'hi',
      text: { text: 'hi', tone: true },
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
      plugins: [TonePlugin],
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
      text: { text: 'hi', tone: true },
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
