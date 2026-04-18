import { getHtmlDocument } from '@platejs/test-utils';
import { createSlateEditor, KEYS } from 'platejs';

import { BaseLinkPlugin } from './BaseLinkPlugin';

describe('BaseLinkPlugin', () => {
  const createEditor = () =>
    createSlateEditor({
      plugins: [BaseLinkPlugin],
    } as any);

  it('parses valid anchor elements into link nodes with a default target', () => {
    const editor = createEditor();
    const plugin = editor.getPlugin(BaseLinkPlugin);
    const element = getHtmlDocument(
      '<html><body><a href="https://example.com">Link</a></body></html>'
    ).querySelector('a')!;
    const parse = plugin.parsers.html?.deserializer?.parse;

    if (!parse) {
      throw new Error('Missing html link deserializer');
    }

    const parsed = parse({
      editor,
      element,
      type: editor.getType(KEYS.link),
    } as any);

    expect(parsed).toEqual({
      target: '_blank',
      type: editor.getType(KEYS.link),
      url: 'https://example.com',
    });
  });

  it('rejects anchors with missing or invalid href values', () => {
    const editor = createEditor();
    const plugin = editor.getPlugin(BaseLinkPlugin);
    const missingHref = getHtmlDocument(
      '<html><body><a>No href</a></body></html>'
    ).querySelector('a')!;
    const invalidHref = getHtmlDocument(
      '<html><body><a href="javascript:alert(1)">Bad</a></body></html>'
    ).querySelector('a')!;
    const parse = plugin.parsers.html?.deserializer?.parse;

    if (!parse) {
      throw new Error('Missing html link deserializer');
    }

    expect(
      parse({
        editor,
        element: missingHref,
        type: editor.getType(KEYS.link),
      } as any)
    ).toBeUndefined();

    expect(
      parse({
        editor,
        element: invalidHref,
        type: editor.getType(KEYS.link),
      } as any)
    ).toBeUndefined();
  });

  it('registers no input rules by default', () => {
    const editor = createEditor();

    expect(editor.meta.inputRules.plugins[KEYS.link].rules).toEqual([]);
  });
});
