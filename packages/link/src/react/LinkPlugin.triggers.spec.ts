import { createPlateEditor } from '@platejs/core/react';

import { LinkPlugin } from './LinkPlugin';

describe('floating link triggers', () => {
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

    expect(editor.plugin(LinkPlugin).api.triggerInsert({ focused: true })).toBe(
      true
    );
    expect(editor.plugin(LinkPlugin).getOptions()).toMatchObject({
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

    expect(editor.plugin(LinkPlugin).api.triggerEdit()).toBe(true);
    expect(editor.plugin(LinkPlugin).getOptions()).toMatchObject({
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

    expect(editor.plugin(LinkPlugin).api.triggerEdit()).toBe(true);
    expect(editor.plugin(LinkPlugin).getOptions()).toMatchObject({
      text: 'second',
      url: 'https://second.dev',
    });
  });

  it('routes edit mode through the edit trigger', () => {
    const editor = createPlateEditor({
      plugins: [
        LinkPlugin.configure({
          options: { mode: 'edit' },
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

    editor.plugin(LinkPlugin).api.trigger({ focused: true });

    expect(editor.plugin(LinkPlugin).getOptions()).toMatchObject({
      isEditing: true,
      text: 'hello',
      url: 'https://x.dev',
    });
  });
});
