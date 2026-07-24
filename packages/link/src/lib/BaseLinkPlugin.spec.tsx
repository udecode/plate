import { createBaseEditor, HtmlPlugin } from '@platejs/core';
import { getPlateRuntime } from '@platejs/core/internal';
import { NodeApi } from '@platejs/plite';

import { BaseLinkPlugin } from './BaseLinkPlugin';

describe('BaseLinkPlugin', () => {
  const createEditor = () =>
    createBaseEditor({
      plugins: [BaseLinkPlugin],
    });

  it('parses valid anchors with a default target', () => {
    const editor = createEditor();
    const fragment = editor.plugin(HtmlPlugin).api.deserialize({
      element: '<a href="https://example.com">Link</a>',
    });
    const link = Array.from(
      NodeApi.elements({ children: fragment, type: 'root' }),
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
    const fragment = editor.plugin(HtmlPlugin).api.deserialize({
      element: '<a>No href</a><a href="javascript:alert(1)">Bad</a>',
    });
    const hasLink = Array.from(
      NodeApi.elements({ children: fragment, type: 'root' }),
      ([node]) => node
    ).some((node) => node.type === editor.getType(BaseLinkPlugin.key));

    expect(hasLink).toBe(false);
  });

  it('registers no input rules by default', () => {
    const editor = createEditor();

    expect(
      getPlateRuntime(editor).inputRules.plugins[BaseLinkPlugin.key].rules
    ).toEqual([]);
  });
});
