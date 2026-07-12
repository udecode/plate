import { createBaseEditor, getEditorPlugin } from '@platejs/core';
import { getHtmlDocument } from '@platejs/test-utils';
import { KEYS } from '@platejs/utils';

import { BaseLinkPlugin } from './BaseLinkPlugin';

describe('BaseLinkPlugin', () => {
  const createEditor = () => createBaseEditor({ plugins: [BaseLinkPlugin] });

  it('parses valid anchors with a default target', () => {
    const editor = createEditor();
    const plugin = editor.getPlugin(BaseLinkPlugin);
    const parse = plugin.parsers.html?.deserializer?.parse;
    const element = getHtmlDocument(
      '<html><body><a href="https://example.com">Link</a></body></html>'
    ).querySelector('a');

    expect(parse).toBeDefined();
    expect(element).toBeDefined();

    if (!parse || !element) return;

    expect(
      parse({
        ...getEditorPlugin(editor, plugin),
        element,
        node: {},
        type: editor.getType(KEYS.link),
      })
    ).toEqual({
      target: '_blank',
      type: editor.getType(KEYS.link),
      url: 'https://example.com',
    });
  });

  it('rejects missing and unsafe href values', () => {
    const editor = createEditor();
    const plugin = editor.getPlugin(BaseLinkPlugin);
    const parse = plugin.parsers.html?.deserializer?.parse;
    const document = getHtmlDocument(
      '<html><body><a>No href</a><a href="javascript:alert(1)">Bad</a></body></html>'
    );
    const links = document.querySelectorAll('a');

    expect(parse).toBeDefined();
    expect(links).toHaveLength(2);

    if (!parse) return;

    const context = getEditorPlugin(editor, plugin);

    for (const element of links) {
      expect(
        parse({
          ...context,
          element,
          node: {},
          type: editor.getType(KEYS.link),
        })
      ).toBeUndefined();
    }
  });

  it('registers no input rules by default', () => {
    const editor = createEditor();

    expect(editor.runtime.inputRules.plugins[KEYS.link].rules).toEqual([]);
  });
});
