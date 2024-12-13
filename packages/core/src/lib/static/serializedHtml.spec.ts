import { BaseBlockquotePlugin } from '@udecode/plate-block-quote';
import { BaseHeadingPlugin } from '@udecode/plate-heading';
import { BaseLinkPlugin } from '@udecode/plate-link';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@udecode/plate-table';
import { decode } from 'html-entities';

import { createSlateEditor } from '../editor';
import { BaseParagraphPlugin } from '../plugins';
import { serializePlateStatic } from './serializedHtml';

describe('serializePlateStatic', () => {
  it('should serialize paragraph to html', async () => {
    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin],
      value: [
        {
          children: [{ text: 'Some random paragraph here...' }],
          type: 'p',
        },
      ],
    });

    const html = await serializePlateStatic(editor, {});
    expect(html).toContain('Some random paragraph here...');
  });

  it('should serialize headings to html', async () => {
    const editor = createSlateEditor({
      plugins: [BaseHeadingPlugin],
      value: [
        {
          children: [{ text: 'Heading 1' }],
          type: 'h1',
        },
        {
          children: [{ text: 'Heading 2' }],
          type: 'h2',
        },
        {
          children: [{ text: 'Heading 3' }],
          type: 'h3',
        },
      ],
    });

    const html = await serializePlateStatic(editor, {});
    expect(html).toContain('Heading 1');
    expect(html).toContain('Heading 2');
    expect(html).toContain('Heading 3');
  });

  it('should serialize blockquote to html', async () => {
    const editor = createSlateEditor({
      plugins: [BaseBlockquotePlugin],
      value: [
        {
          children: [{ text: 'Blockquoted text here...' }],
          type: 'blockquote',
        },
      ],
    });

    const html = await serializePlateStatic(editor, {});
    expect(html).toContain('Blockquoted text here...');
  });

  it('should serialize link to html', async () => {
    const editor = createSlateEditor({
      plugins: [BaseLinkPlugin],
      value: [
        { children: [{ text: 'Some paragraph of text with ' }], type: 'p' },
        {
          children: [{ text: 'link' }],
          type: 'a',
          url: 'https://example.com/',
        },
        { children: [{ text: ' part.' }], type: 'p' },
      ],
    });

    const html = await serializePlateStatic(editor, {});
    expect(html).toContain(decode('href="https://example.com/"'));
    expect(html).toContain('slate-a');
  });

  // it('should serialize image to html', async () => {
  //   const editor = createSlateEditor({
  //     plugins: [BaseImagePlugin],
  //     value: [
  //       {
  //         children: [{ text: '' }],
  //         type: 'img',
  //         url: 'https://example.com/image.jpg',
  //       },
  //     ],
  //   });

  //   const html = await serializePlateStatic(editor, {});
  //   expect(html).toContain('src="https://example.com/image.jpg"');
  // });

  it('should serialize table to html', async () => {
    const editor = createSlateEditor({
      plugins: [BaseTablePlugin, BaseTableRowPlugin, BaseTableCellPlugin],
      value: [
        {
          children: [
            {
              children: [
                { children: [{ text: 'Cell 1' }], type: 'td' },
                { children: [{ text: 'Cell 2' }], type: 'td' },
              ],
              type: 'tr',
            },
          ],
          type: 'table',
        },
      ],
    });

    const html = await serializePlateStatic(editor, {});
    expect(html).toContain('Cell 1');
    expect(html).toContain('Cell 2');
  });
});
