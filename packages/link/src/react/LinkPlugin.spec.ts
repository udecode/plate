import React from 'react';

import { act, renderHook } from '@testing-library/react';
import { createPlateEditor, Plate } from '@platejs/core/react';

import { LinkPlugin } from './LinkPlugin';
import { useFloatingLinkActions } from './useFloatingLink';

const editor = createPlateEditor({ plugins: [LinkPlugin] });

describe('LinkPlugin.api.decodeUrl', () => {
  it('decodes URL', () => {
    const url = 'https://example.com/path?query=%E3%81%82';
    expect(editor.plugin(LinkPlugin).api.decodeUrl(url)).toEqual(
      'https://example.com/path?query=あ'
    );
  });

  it('handles malformed URI sequence', () => {
    const url = 'https://example.com/path?query=%';
    expect(editor.plugin(LinkPlugin).api.decodeUrl(url)).toEqual(url);
  });
});

describe('LinkPlugin.api.encodeUrl', () => {
  it('does not transform a URL containing no special characters', () => {
    const url =
      'https://username:password@example.com:1234/path?query=value#fragment';
    expect(editor.plugin(LinkPlugin).api.encodeUrl(url)).toEqual(url);
  });

  it('does not transform a URL containing encoded characters', () => {
    const url =
      'https://example.com/path%20with%20spaces?query=value%2Bencoded';
    expect(editor.plugin(LinkPlugin).api.encodeUrl(url)).toEqual(url);
  });

  it('does not transform a URL containing encoded and special characters', () => {
    const url = 'https://example.com/path%20with%20spaces?query=あ';
    expect(editor.plugin(LinkPlugin).api.encodeUrl(url)).toEqual(url);
  });

  it('encodes a URL containing special characters', () => {
    const url = 'https://example.com/path?query=あ';
    expect(editor.plugin(LinkPlugin).api.encodeUrl(url)).toEqual(
      'https://example.com/path?query=%E3%81%82'
    );
  });

  it.each([
    'https://example.com/%',
    '',
  ])('preserves malformed or empty input %j', (url) => {
    expect(editor.plugin(LinkPlugin).api.encodeUrl(url)).toEqual(url);
  });

  it('encodes a non-URI string', () => {
    const url = 'Just a random string without URI format';
    expect(editor.plugin(LinkPlugin).api.encodeUrl(url)).toEqual(
      'Just%20a%20random%20string%20without%20URI%20format'
    );
  });
});

describe('useFloatingLinkActions', () => {
  it('opens insert mode with selected text', () => {
    const editor = createPlateEditor({
      plugins: [LinkPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 13, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'selected text' }], type: 'p' }],
    });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Plate, {
        children,
        editor,
        suppressInstanceWarning: true,
      });
    const { result } = renderHook(() => useFloatingLinkActions(), { wrapper });
    let triggered: boolean | undefined;

    act(() => {
      triggered = result.current.triggerInsert({ focused: true });
    });

    expect(triggered).toBe(true);
    expect(editor.plugin(LinkPlugin).store.get()).toMatchObject({
      mode: 'insert',
      openEditorId: editor.id,
      text: 'selected text',
    });
  });

  it('loads link state into edit mode and strips duplicate URL text', () => {
    const editor = createPlateEditor({
      plugins: [LinkPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 3, path: [0, 1, 0] },
        focus: { offset: 3, path: [0, 1, 0] },
      },
      initialValue: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: 'https://x.dev' }],
              target: '_blank',
              type: 'a',
              url: 'https://x.dev',
            },
            { text: '' },
          ],
          type: 'p',
        },
      ],
    });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Plate, {
        children,
        editor,
        suppressInstanceWarning: true,
      });
    const { result } = renderHook(() => useFloatingLinkActions(), { wrapper });
    let triggered: boolean | undefined;

    act(() => {
      triggered = result.current.triggerEdit();
    });

    expect(triggered).toBe(true);
    expect(editor.plugin(LinkPlugin).store.get()).toMatchObject({
      isEditing: true,
      newTab: true,
      text: '',
      url: 'https://x.dev',
    });
  });

  it('loads the selected link when the document contains multiple links', () => {
    const editor = createPlateEditor({
      plugins: [LinkPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 3, path: [0, 3, 0] },
        focus: { offset: 3, path: [0, 3, 0] },
      },
      initialValue: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: 'first' }],
              type: 'a',
              url: 'https://first.dev',
            },
            { text: ' and ' },
            {
              children: [{ text: 'second' }],
              type: 'a',
              url: 'https://second.dev',
            },
            { text: '' },
          ],
          type: 'p',
        },
      ],
    });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Plate, {
        children,
        editor,
        suppressInstanceWarning: true,
      });
    const { result } = renderHook(() => useFloatingLinkActions(), { wrapper });
    let triggered: boolean | undefined;

    act(() => {
      triggered = result.current.triggerEdit();
    });

    expect(triggered).toBe(true);
    expect(editor.plugin(LinkPlugin).store.get()).toMatchObject({
      text: 'second',
      url: 'https://second.dev',
    });
  });

  it('routes edit mode through the edit trigger', () => {
    const editor = createPlateEditor({
      plugins: [
        LinkPlugin.configure({
          initialState: { mode: 'edit' },
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 1, 0] },
        focus: { offset: 2, path: [0, 1, 0] },
      },
      initialValue: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: 'hello' }],
              type: 'a',
              url: 'https://x.dev',
            },
            { text: '' },
          ],
          type: 'p',
        },
      ],
    });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Plate, {
        children,
        editor,
        suppressInstanceWarning: true,
      });
    const { result } = renderHook(() => useFloatingLinkActions(), { wrapper });

    act(() => {
      result.current.trigger({ focused: true });
    });

    expect(editor.plugin(LinkPlugin).store.get()).toMatchObject({
      isEditing: true,
      text: 'hello',
      url: 'https://x.dev',
    });
  });
});
