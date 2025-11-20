import { serializeHtml } from '../serializeHtml';
import { createStaticEditor } from './create-static-editor';

describe('serializePlateStatic with attributes', () => {
  it('should serialize elements with right slate attributes', async () => {
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
                  'data-slate-test': true,
                },
                textProps: {
                  'data-slate-test': 'text',
                },
                leafProps: {
                  'data-slate-test': 'leaf',
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
      '<div data-slate-editor="true" data-slate-node="value"><div data-slate-node="element" data-slate-type="p" style="position:relative"><span data-slate-node="text" data-slate-test="text" data-slate-italic="true"><em data-slate-test="true"><span data-slate-leaf="true" data-slate-test="leaf" data-slate-bold="true"><strong><span data-slate-string="true">Right Aligned Heading</span></strong></span></em></span><span data-slate-node="text" data-slate-test="text" data-slate-italic="true"><em data-slate-test="true"><span data-slate-leaf="true" data-slate-test="leaf"><span data-slate-string="true">Right Aligned Heading</span></span></em></span></div></div>'
    );
  });
});
