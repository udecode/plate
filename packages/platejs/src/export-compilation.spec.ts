import { describe, expect, it } from 'bun:test';

import { HtmlPlugin, serializeHtml } from './html';
import { definePlugin } from './lib/plugin';
import { BaseParagraphPlugin } from './lib/plugins/paragraph';
import { MarkdownPlugin, serializeMarkdown } from './markdown';
import { serializePlainText } from './plain-text';

const document = {
  children: [{ children: [{ text: 'Detached' }], type: 'paragraph' }],
} as const;

describe('standalone format compilation', () => {
  it('serializes formats without activating plugins', () => {
    let activations = 0;
    const LifecycleProbe = definePlugin('exportLifecycleProbe', {}).extend({
      activate: () => {
        activations += 1;
      },
    });
    const plugins = [
      BaseParagraphPlugin,
      HtmlPlugin,
      MarkdownPlugin,
      LifecycleProbe,
    ] as const;

    expect(serializePlainText(document, { plugins }).data).toBe('Detached');
    const markdown = serializeMarkdown(document, { plugins });

    expect(markdown.ok).toBe(true);
    if (!markdown.ok) throw new Error('Expected Markdown serialization.');
    expect(markdown.data.trim()).toBe('Detached');
    expect(serializeHtml(document, { plugins })).toEqual({
      data: '<p>Detached</p>',
      diagnostics: [],
      ok: true,
    });
    expect(activations).toBe(0);
  });
});
