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

    const headings = new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelectorAll('h1, h2, h3');

    expect(
      Array.from(headings, (heading) => [heading.tagName, heading.textContent])
    ).toEqual([
      ['H1', 'Heading 1'],
      ['H2', 'Heading 2'],
      ['H3', 'Heading 3'],
    ]);
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

    const cells = new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelectorAll('table > tbody > tr > td');

    expect(Array.from(cells, (cell) => cell.textContent)).toEqual([
      'Cell 1',
      'Cell 2',
    ]);
  });
});
