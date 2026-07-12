import { createPlateEditor } from '@platejs/core/react';

import { LinkPlugin } from '../LinkPlugin';
import { triggerFloatingLink } from './triggerFloatingLink';
import { triggerFloatingLinkEdit } from './triggerFloatingLinkEdit';
import { triggerFloatingLinkInsert } from './triggerFloatingLinkInsert';

describe('floating link triggers', () => {
  it('opens insert mode with selected text', () => {
    const editor = createPlateEditor({
      plugins: [LinkPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 13, path: [0, 0] },
      },
      value: [{ children: [{ text: 'selected text' }], type: 'p' }],
    });

    expect(triggerFloatingLinkInsert(editor, { focused: true })).toBe(true);
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
        anchor: { offset: 3, path: [0, 0, 0] },
        focus: { offset: 3, path: [0, 0, 0] },
      },
      value: [
        {
          children: [
            {
              children: [{ text: 'https://x.dev' }],
              target: '_blank',
              type: 'a',
              url: 'https://x.dev',
            },
          ],
          type: 'p',
        },
      ],
    });

    expect(triggerFloatingLinkEdit(editor)).toBe(true);
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
        anchor: { offset: 3, path: [0, 2, 0] },
        focus: { offset: 3, path: [0, 2, 0] },
      },
      value: [
        {
          children: [
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
          ],
          type: 'p',
        },
      ],
    });

    expect(triggerFloatingLinkEdit(editor)).toBe(true);
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
        anchor: { offset: 2, path: [0, 0, 0] },
        focus: { offset: 2, path: [0, 0, 0] },
      },
      value: [
        {
          children: [
            {
              children: [{ text: 'hello' }],
              type: 'a',
              url: 'https://x.dev',
            },
          ],
          type: 'p',
        },
      ],
    });

    triggerFloatingLink(editor, { focused: true });

    expect(editor.plugin(LinkPlugin).getOptions()).toMatchObject({
      isEditing: true,
      text: 'hello',
      url: 'https://x.dev',
    });
  });
});
