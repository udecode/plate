import { createBaseEditor } from '@platejs/core';
import { getPlateRuntime } from '@platejs/core/internal';
import { NodeApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { BaseLinkPlugin } from './BaseLinkPlugin';

describe('BaseLinkPlugin', () => {
  const createEditor = () =>
    createBaseEditor({
      plugins: [BaseLinkPlugin],
    });

  it('parses valid anchors with a default target', () => {
    const editor = createEditor();
    const fragment = editor.api.html.deserialize({
      element: '<a href="https://example.com">Link</a>',
    });
    const link = Array.from(
      NodeApi.elements({ children: fragment ?? [], type: 'root' }),
      ([node]) => node
    ).find((node) => node.type === editor.getType(BaseLinkPlugin.key));

    expect(link).toMatchObject({
      children: [{ text: 'Link' }],
      target: '_blank',
      type: editor.getType(BaseLinkPlugin.key),
      url: 'https://example.com',
    });
  });

  it('rejects missing and unsafe href values', () => {
    const editor = createEditor();
    const fragment = editor.api.html.deserialize({
      element: '<a>No href</a><a href="javascript:alert(1)">Bad</a>',
    });
    const hasLink = Array.from(
      NodeApi.elements({ children: fragment ?? [], type: 'root' }),
      ([node]) => node
    ).some((node) => node.type === editor.getType(BaseLinkPlugin.key));

    expect(hasLink).toBe(false);
  });

  it('encodes links with their semantic attributes', () => {
    const editor = createBaseEditor({
      plugins: [BaseLinkPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 4, path: [0, 0, 0] },
      },
      initialValue: [
        {
          children: [
            {
              children: [{ text: 'Link' }],
              target: '_self',
              type: KEYS.link,
              url: 'https://example.com',
            },
          ],
          type: 'p',
        },
      ],
    });
    const data = new DataTransfer();

    editor.api.clipboard.writeSelection(data);

    const anchor = new DOMParser()
      .parseFromString(data.getData('text/html'), 'text/html')
      .body.querySelector('a');

    expect(anchor?.getAttribute('href')).toBe('https://example.com/');
    expect(anchor?.getAttribute('target')).toBe('_self');
    expect(anchor?.textContent).toBe('Link');
  });

  it('registers no input rules by default', () => {
    const editor = createEditor();

    expect(
      getPlateRuntime(editor).inputRules.plugins[BaseLinkPlugin.key].rules
    ).toEqual([]);
  });
});
