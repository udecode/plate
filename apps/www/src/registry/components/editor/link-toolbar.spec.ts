import { createEditor } from 'platejs/react';

import { linkPlugin } from './link';

const editor = createEditor({ plugins: [linkPlugin] });

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
    const innerEditor = createEditor({ plugins: [configuredPlugin] });
    const link = innerEditor.plugin(configuredPlugin);

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
    const innerEditor2 = createEditor({
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
    const link = innerEditor2.plugin(linkPlugin);

    link.api.show('edit', innerEditor2.id);
    link.api.hide();

    expect(link.api.trigger({ focused: true })).toBe(true);
    expect(link.store.get()).toMatchObject({
      isEditing: true,
      mode: 'edit',
      openEditorId: innerEditor2.id,
      url: 'https://example.com',
    });
  });

  it('does not trigger a stale link selection in an unfocused editor', () => {
    const innerEditor3 = createEditor({
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
    const link = innerEditor3.plugin(linkPlugin);

    expect(link.api.trigger({ focused: false })).toBeUndefined();
    expect(link.store.get().mode).toBe('');
  });

  it('opens insert mode with selected text', () => {
    const innerEditor4 = createEditor({
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

    const triggered = innerEditor4
      .plugin(linkPlugin)
      .api.triggerInsert({ focused: true });

    expect(triggered).toBe(true);
    expect(innerEditor4.plugin(linkPlugin).store.get()).toMatchObject({
      mode: 'insert',
      openEditorId: innerEditor4.id,
      text: 'selected text',
    });
  });

  it('loads link state into edit mode and strips duplicate URL text', () => {
    const innerEditor5 = createEditor({
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

    const triggered = innerEditor5.plugin(linkPlugin).api.triggerEdit();

    expect(triggered).toBe(true);
    expect(innerEditor5.plugin(linkPlugin).store.get()).toMatchObject({
      isEditing: true,
      newTab: true,
      text: '',
      url: 'https://x.dev',
    });
  });

  it('loads the selected link when the document contains multiple links', () => {
    const innerEditor6 = createEditor({
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

    const triggered = innerEditor6.plugin(linkPlugin).api.triggerEdit();

    expect(triggered).toBe(true);
    expect(innerEditor6.plugin(linkPlugin).store.get()).toMatchObject({
      text: 'second',
      url: 'https://second.dev',
    });
  });

  it('routes edit mode through the edit trigger', () => {
    const innerEditor7 = createEditor({
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

    innerEditor7.plugin(linkPlugin).api.trigger({ focused: true });

    expect(innerEditor7.plugin(linkPlugin).store.get()).toMatchObject({
      isEditing: true,
      text: 'hello',
      url: 'https://x.dev',
    });
  });
});
