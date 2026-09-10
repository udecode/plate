import { createElement } from 'react';

import { createStaticEditor } from './editor/withStatic';
import { renderStaticHtml } from './renderStaticHtml';

describe('static HTML escaping', () => {
  it.each([
    '<b data-audit-literal="yes">literal</b>',
    '&lt;b&gt; &amp; &#34; &#x3C;',
    '5 < 10 & "quoted" > 2',
  ])('preserves document text %s', async (text) => {
    const editor = createStaticEditor({
      initialValue: [{ type: 'paragraph', children: [{ text }] }],
    });

    for (const strip of [false, true]) {
      const html = await renderStaticHtml(editor, {
        preserveClassNames: [],
        stripClassNames: strip,
        stripDataAttributes: strip,
      });
      const document = new DOMParser().parseFromString(html, 'text/html');

      expect(document.body.textContent).toBe(text);
      expect(document.querySelector('[data-audit-literal]')).toBeNull();
    }
  });

  it('preserves quoted attributes from a custom component', async () => {
    const title = 'a" data-injected="yes &lt;b&gt;';
    const html = await renderStaticHtml(createStaticEditor(), {
      editorComponent: () => createElement('div', { title }, 'label'),
    });
    const document = new DOMParser().parseFromString(html, 'text/html');
    const element = document.body.firstElementChild;

    expect(element?.getAttribute('title')).toBe(title);
    expect(document.querySelector('[data-injected]')).toBeNull();
    expect(document.body.textContent).toBe('label');
  });
});
