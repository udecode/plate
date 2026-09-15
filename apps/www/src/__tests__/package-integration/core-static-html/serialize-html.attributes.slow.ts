import { BaseItalicPlugin } from 'platejs';
import { renderStaticHtml } from 'platejs/static';

import { BaseEditorKit } from '@/registry/components/editor/plugins-static';

import { createStaticEditor } from './create-static-editor';

describe('core static renderStaticHtml attributes', () => {
  it('applies element, text, and leaf props to the output', async () => {
    const editor = createStaticEditor(
      [
        {
          children: [
            { bold: true, italic: true, text: 'Right Aligned Heading' },
            { italic: true, text: 'Right Aligned Heading' },
          ],
          type: 'paragraph',
        },
      ],
      {
        plugins: [
          ...BaseEditorKit.filter(
            (plugin) => plugin.name !== BaseItalicPlugin.name
          ),
          BaseItalicPlugin.configure({
            render: {
              attributes: {
                'data-editor-test': true,
              },
              mark: {
                leafAttributes: {
                  'data-editor-test': 'leaf',
                },
                placement: 'text',
                textAttributes: {
                  'data-editor-test': 'text',
                },
              },
            },
          }),
        ],
      }
    );

    const html = await renderStaticHtml(editor, {
      preserveClassNames: [],
      stripClassNames: true,
      stripDataAttributes: true,
    });

    expect(html).toEqual(
      '<div><div style="position:relative"><span data-editor-test="text"><em data-editor-test="true"><span data-editor-test="leaf"><strong><span>Right Aligned Heading</span></strong></span></em></span><span data-editor-test="text"><em data-editor-test="true"><span data-editor-test="leaf"><span>Right Aligned Heading</span></span></em></span></div></div>'
    );
  });
});
