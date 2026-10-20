import { createEditor } from 'platejs';
import { renderStaticHtml } from 'platejs/static';

import { BaseEditorKit } from '@/registry/components/editor/plugins-static';

describe('core static renderStaticHtml element rendering', () => {
  it('renders heading nodes', async () => {
    const editor = createEditor({
      plugins: BaseEditorKit,
      initialValue: [
        {
          children: [{ text: 'Heading 1' }],
          level: 1,
          type: 'heading',
        },
        {
          children: [{ text: 'Heading 2' }],
          level: 2,
          type: 'heading',
        },
        {
          children: [{ text: 'Heading 3' }],
          level: 3,
          type: 'heading',
        },
      ],
    });

    const { data: html } = await renderStaticHtml(editor);

    expect(html).toContain('Heading 1');
    expect(html).toContain('Heading 2');
    expect(html).toContain('Heading 3');
  });

  it('renders table cell content', async () => {
    const editor = createEditor({
      plugins: BaseEditorKit,
      initialValue: [
        {
          children: [
            {
              children: [
                { children: [{ text: 'Cell 1' }], type: 'tableCell' },
                { children: [{ text: 'Cell 2' }], type: 'tableCell' },
              ],
              type: 'tableRow',
            },
          ],
          type: 'table',
        },
      ],
    });

    const { data: html } = await renderStaticHtml(editor);

    expect(html).toContain('Cell 1');
    expect(html).toContain('Cell 2');
  });
});
