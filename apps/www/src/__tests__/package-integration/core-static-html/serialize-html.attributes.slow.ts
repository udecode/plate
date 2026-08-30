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
              isDecoration: false,
              nodeProps: {
                'data-plite-test': true,
              },
              textProps: {
                'data-plite-test': 'text',
              },
              leafProps: {
                'data-plite-test': 'leaf',
              },
            },
          }),
        ],
      }
    );

    const html = await renderStaticHtml(editor, {
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(html).toEqual(
      '<div data-plite-editor="true" data-plite-node="value"><div data-plite-node="element" data-plite-path="0" data-plite-root="main" style="position:relative"><span data-plite-node="text" data-plite-test="text"><em data-plite-test="true"><span data-plite-leaf="true" data-plite-test="leaf"><strong><span data-plite-string="true">Right Aligned Heading</span></strong></span></em></span><span data-plite-node="text" data-plite-test="text"><em data-plite-test="true"><span data-plite-leaf="true" data-plite-test="leaf"><span data-plite-string="true">Right Aligned Heading</span></span></em></span></div></div>'
    );
  });
});
