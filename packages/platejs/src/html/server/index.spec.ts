import { describe, expect, it } from 'bun:test';

import { parseHtml, parseHtmlSlice } from '.';
import { BaseParagraphPlugin } from '../../core';

const plugins = [BaseParagraphPlugin] as const;

describe('platejs/html/server', () => {
  it('parses without browser globals', () => {
    const names = ['document', 'Node', 'HTMLElement', 'DOMParser'] as const;
    const descriptors = new Map(
      names.map((name) => [
        name,
        Object.getOwnPropertyDescriptor(globalThis, name),
      ])
    );
    let result: ReturnType<typeof parseHtml>;

    try {
      names.forEach((name) => {
        Object.defineProperty(globalThis, name, {
          configurable: true,
          value: undefined,
          writable: true,
        });
      });
      result = parseHtml('<p>Server</p>', { plugins });
    } finally {
      names.forEach((name) => {
        const descriptor = descriptors.get(name);

        if (descriptor) {
          Object.defineProperty(globalThis, name, descriptor);
        } else {
          Reflect.deleteProperty(globalThis, name);
        }
      });
    }

    expect(result).toMatchObject({
      document: {
        children: [{ children: [{ text: 'Server' }], type: 'paragraph' }],
      },
      ok: true,
    });
  });

  it('uses the same root and safety policy for slices', () => {
    const result = parseHtmlSlice(
      '<script>bad()</script><p data-editor="true">Server slice</p>',
      { plugins }
    );

    expect(result).toMatchObject({
      diagnostics: [{ code: 'html-unsafe-content' }],
      ok: true,
      slice: {
        content: [{ children: [{ text: 'Server slice' }], type: 'paragraph' }],
      },
    });
  });
});
