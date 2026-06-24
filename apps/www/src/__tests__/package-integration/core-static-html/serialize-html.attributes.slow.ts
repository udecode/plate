import { serializeHtml } from 'platejs/static';

import { createStaticEditor } from './create-static-editor';

describe('core static serializeHtml attributes', () => {
  it('applies element, text, and leaf props to the output', async () => {
    const editor = createStaticEditor(
      [
        {
          children: [
            { bold: true, italic: true, text: 'Right Aligned Heading' },
            { italic: true, text: 'Right Aligned Heading' },
          ],
          type: 'p',
        },
      ],
      {
        override: {
          plugins: {
            italic: {
              node: {
                isDecoration: false,
                props: {
                  'data-plite-test': true,
                },
                textProps: {
                  'data-plite-test': 'text',
                },
                leafProps: {
                  'data-plite-test': 'leaf',
                },
              },
            },
          },
        },
      }
    );

    const html = await serializeHtml(editor, {
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(html).toEqual(
      '<div data-plite-editor="true" data-plite-node="value"><div data-plite-node="element" data-plite-type="p" style="position:relative"><span data-plite-node="text" data-plite-test="text" data-plite-italic="true"><em data-plite-test="true"><span data-plite-leaf="true" data-plite-test="leaf" data-plite-bold="true"><strong><span data-plite-string="true">Right Aligned Heading</span></strong></span></em></span><span data-plite-node="text" data-plite-test="text" data-plite-italic="true"><em data-plite-test="true"><span data-plite-leaf="true" data-plite-test="leaf"><span data-plite-string="true">Right Aligned Heading</span></span></em></span></div></div>'
    );
  });
});
