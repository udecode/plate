import { serializeHtml } from '../serializeHtml';
import { createStaticEditor, staticComponents } from './create-static-editor';

describe('serializePlateStatic with attributes', () => {
  it('should serialize elements with right slate attributes', async () => {
    const editor = createStaticEditor([
      {
        children: [{ bold: true, text: 'Right Aligned Heading' }],
        type: 'p',
      },
    ]);

    const html = await serializeHtml(editor, {
      components: staticComponents,
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(html).toEqual(
      '<div style="position:relative;user-select:text;white-space:pre-wrap;word-wrap:break-word;z-index:-1" data-slate-editor="true" data-slate-node="value"><div data-slate-node="element"><span data-slate-node="text"><span data-slate-leaf="true"><strong data-slate-leaf="true"><span data-slate-string="true">Right Aligned Heading</span></strong></span></span></div></div>'
    );
  });
});
