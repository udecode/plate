import type { TElement } from '@platejs/slate';

import { BaseParagraphPlugin } from '../lib/plugins';
import { createStaticEditor, serializeHtml } from './index';

const ParagraphWithTitlePlugin = BaseParagraphPlugin.extend({
  node: {
    props: ({ element }) => ({
      title: (element as TElement & { title: string }).title,
    }),
  },
});

describe('serializeHtml', () => {
  it('preserves escaped editor text', async () => {
    const editor = createStaticEditor({
      plugins: [BaseParagraphPlugin],
      value: [
        {
          children: [{ text: '<strong>safe text</strong> & more' }],
          type: 'p',
        },
      ],
    });

    const html = await serializeHtml(editor);

    expect(html).toContain('&lt;strong&gt;safe text&lt;/strong&gt; &amp; more');
  });

  it('preserves escaped editor attributes', async () => {
    const editor = createStaticEditor({
      plugins: [ParagraphWithTitlePlugin],
      value: [
        {
          children: [{ text: '' }],
          title: 'quoted " value',
          type: 'p',
        },
      ],
    });

    const html = await serializeHtml(editor);

    expect(html).toContain('title="quoted &quot; value"');
  });
});
