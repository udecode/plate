import { render } from '@testing-library/react';
import React from 'react';

import { createEditor, property } from '../core';
import { type RenderLeafProps, definePlugin } from '../lib';
import { EditorStatic } from './components/PlateStatic';
import {
  pipeRenderLeafStatic,
  pluginRenderLeafStatic,
} from './pluginRenderLeafStatic.internal';

describe('pluginRenderLeafStatic', () => {
  const HighlightPlugin = definePlugin('highlight', {
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: {
      mark: {
        leafAttributes: {
          className: 'highlight-leaf',
          'data-tone': 'warm',
        },
      },
    },
  });

  it('returns children when the leaf does not match the plugin', () => {
    const editor = createEditor({
      plugins: [HighlightPlugin],
    });

    expect(
      pluginRenderLeafStatic(
        editor,
        editor.plugin(HighlightPlugin)
      )({
        attributes: {},
        children: 'plain',
        leaf: { text: 'plain' },
        text: { text: 'plain' },
      } satisfies RenderLeafProps)
    ).toBe('plain');
  });

  it('uses the plugin component when the leaf matches the plugin', () => {
    const CustomLeafPlugin = HighlightPlugin.configure({
      component: ({ children }) => (
        <mark data-kind="custom-leaf">{children}</mark>
      ),
    });
    const editor = createEditor({
      plugins: [CustomLeafPlugin],
      initialValue: [
        { children: [{ highlight: true, text: 'hi' }], type: 'paragraph' },
      ],
    });
    const { container } = render(<EditorStatic editor={editor} />);

    expect(
      container.querySelector('mark[data-kind="custom-leaf"]')?.textContent
    ).toBe('hi');
  });

  it('matches marks by persisted key rather than plugin name', () => {
    const MarkPlugin = definePlugin('markCapability', {
      schema: {
        mark: {
          key: 'persistedMark',
          property: property.boolean({ default: false, omitDefault: true }),
        },
      },
      component: ({ children }) => (
        <mark data-kind="persisted-mark">{children}</mark>
      ),
    });
    const editor = createEditor({
      plugins: [MarkPlugin],
      initialValue: [
        { children: [{ persistedMark: true, text: 'hi' }], type: 'paragraph' },
      ],
    });
    const { container } = render(<EditorStatic editor={editor} />);

    expect(
      container.querySelector('mark[data-kind="persisted-mark"]')?.textContent
    ).toBe('hi');
  });

  it('merges plugin leaf props before delegating to renderLeaf', () => {
    const editor = createEditor({
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
