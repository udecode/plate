import { describe, expect, it } from 'bun:test';

import { parseHtml } from '.';
import { BaseParagraphPlugin } from '../../core';
import { BaseBoldPlugin } from '../../features/basic-nodes/lib/BaseMarkPlugins';

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

  it.each([
    '<span style="font-weight: 700 !important">x</span>',
    '<span style="font-weight: 700 ! important">x</span>',
    '<strong style="font-weight: bold !important">x</strong>',
  ])('reads an important weight in %s as bold', (html) => {
    const result = parseHtml(`<p>${html}</p>`, {
      plugins: [BaseParagraphPlugin, BaseBoldPlugin],
    });

    expect(result).toMatchObject({
      document: {
        children: [
          { children: [{ bold: true, text: 'x' }], type: 'paragraph' },
        ],
      },
      ok: true,
    });
  });

  it('reads a weight that CSS rejects, such as 0x258, as no weight', () => {
    const result = parseHtml(
      '<p><span style="font-weight: 0x258">x</span></p>',
      {
        plugins: [BaseParagraphPlugin, BaseBoldPlugin],
      }
    );

    expect(result.ok && result.document.children).toEqual([
      { children: [{ text: 'x' }], type: 'paragraph' },
    ]);
  });
});
