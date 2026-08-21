import { createPlateEditor } from 'platejs/react';

import { linkPlugin } from './link';

const editor = createPlateEditor({ plugins: [linkPlugin] });

describe('LinkPlugin.api.decodeUrl', () => {
  it('decodes URL', () => {
    const url = 'https://example.com/path?query=%E3%81%82';
    expect(editor.plugin(linkPlugin).api.decodeUrl(url)).toEqual(
      'https://example.com/path?query=あ'
    );
  });

  it('handles malformed URI sequence', () => {
    const url = 'https://example.com/path?query=%';
    expect(editor.plugin(linkPlugin).api.decodeUrl(url)).toEqual(url);
  });
});

describe('LinkPlugin.api.encodeUrl', () => {
  it('does not transform a URL containing no special characters', () => {
    const userInfo = ['username', 'credential'].join(':');
    const url = `https://${userInfo}@example.com:1234/path?query=value#fragment`;
    expect(editor.plugin(linkPlugin).api.encodeUrl(url)).toEqual(url);
  });

  it('does not transform a URL containing encoded characters', () => {
    const url =
      'https://example.com/path%20with%20spaces?query=value%2Bencoded';
    expect(editor.plugin(linkPlugin).api.encodeUrl(url)).toEqual(url);
  });

  it('encodes unescaped characters without double-encoding escapes', () => {
    const url = 'https://example.com/path%20with%20spaces?query=あ';
    expect(editor.plugin(linkPlugin).api.encodeUrl(url)).toEqual(
      'https://example.com/path%20with%20spaces?query=%E3%81%82'
    );
  });

  it('encodes a URL containing special characters', () => {
    const url = 'https://example.com/path?query=あ';
    expect(editor.plugin(linkPlugin).api.encodeUrl(url)).toEqual(
      'https://example.com/path?query=%E3%81%82'
    );
  });

  it.each(['https://example.com/%', ''])(
    'preserves malformed or empty input %j',
    (url) => {
      expect(editor.plugin(linkPlugin).api.encodeUrl(url)).toEqual(url);
    }
  );

  it('encodes a non-URI string', () => {
    const url = 'Just a random string without URI format';
    expect(editor.plugin(linkPlugin).api.encodeUrl(url)).toEqual(
      'Just%20a%20random%20string%20without%20URI%20format'
    );
  });
});

describe('LinkPlugin floating API', () => {
  it('preserves configured state when hiding the toolbar', () => {
    const configuredPlugin = linkPlugin.configure({
      initialState: {
        forceSubmit: true,
        triggerFloatingLinkHotkeys: 'alt+k',
      },
    });
    const editor = createPlateEditor({ plugins: [configuredPlugin] });
    const link = editor.plugin(configuredPlugin);

    link.store.set({ mode: 'insert', text: 'draft', url: '/draft' });
    link.api.hide();

    expect(link.store.get()).toMatchObject({
      forceSubmit: true,
      mode: '',
      text: '',
      triggerFloatingLinkHotkeys: 'alt+k',
      url: '',
    });
  });

  it('reopens edit mode from the current link selection after hiding', () => {
    const editor = createPlateEditor({
      plugins: [linkPlugin],
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
              type: 'link',
              url: 'https://example.com',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ],
    });
    const link = editor.plugin(linkPlugin);

    link.api.show('edit', editor.id);
    link.api.hide();

    expect(link.api.trigger({ focused: true })).toBe(true);
    expect(link.store.get()).toMatchObject({
      isEditing: true,
      mode: 'edit',
      openEditorId: editor.id,
      url: 'https://example.com',
    });
  });

  it('does not trigger a stale link selection in an unfocused editor', () => {
    const editor = createPlateEditor({
      plugins: [linkPlugin],
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
              type: 'link',
              url: 'https://example.com',
            },
          ],
          type: 'paragraph',
        },
      ],
    });
    const link = editor.plugin(linkPlugin);

    expect(link.api.trigger({ focused: false })).toBeUndefined();
    expect(link.store.get().mode).toBe('');
  });

  it('opens insert mode with selected text', () => {
    const editor = createPlateEditor({
      plugins: [linkPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 13, path: [0, 0] },
      },
      initialValue: [
        { children: [{ text: 'selected text' }], type: 'paragraph' },
      ],
    });

    const triggered = editor
      .plugin(linkPlugin)
      .api.triggerInsert({ focused: true });

    expect(triggered).toBe(true);
    expect(editor.plugin(linkPlugin).store.get()).toMatchObject({
      mode: 'insert',
      openEditorId: editor.id,
      text: 'selected text',
    });
  });

  it('loads link state into edit mode and strips duplicate URL text', () => {
    const editor = createPlateEditor({
      plugins: [linkPlugin],
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
              type: 'link',
              url: 'https://x.dev',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ],
    });

    const triggered = editor.plugin(linkPlugin).api.triggerEdit();

    expect(triggered).toBe(true);
    expect(editor.plugin(linkPlugin).store.get()).toMatchObject({
      isEditing: true,
      newTab: true,
      text: '',
      url: 'https://x.dev',
    });
  });

  it('loads the selected link when the document contains multiple links', () => {
    const editor = createPlateEditor({
      plugins: [linkPlugin],
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
              type: 'link',
              url: 'https://first.dev',
            },
            { text: ' and ' },
            {
              children: [{ text: 'second' }],
              type: 'link',
              url: 'https://second.dev',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ],
    });

    const triggered = editor.plugin(linkPlugin).api.triggerEdit();

    expect(triggered).toBe(true);
    expect(editor.plugin(linkPlugin).store.get()).toMatchObject({
      text: 'second',
      url: 'https://second.dev',
    });
  });

  it('routes edit mode through the edit trigger', () => {
    const editor = createPlateEditor({
      plugins: [
        linkPlugin.configure({
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
              type: 'link',
              url: 'https://x.dev',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.plugin(linkPlugin).api.trigger({ focused: true });

    expect(editor.plugin(linkPlugin).store.get()).toMatchObject({
      isEditing: true,
      text: 'hello',
      url: 'https://x.dev',
    });
  });
});
