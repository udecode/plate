import { serializePlateStatic } from '../serializedHtml';
import { createStaticEditor, staticComponents } from './create-static-editor';

describe('serializePlateStatic with attributes', () => {
  it('should serialize elements with right slate attributes', async () => {
    const editor = createStaticEditor([
      {
        children: [{ bold: true, text: 'Right Aligned Heading' }],
        type: 'p',
      },
    ]);

    const html = await serializePlateStatic(editor, staticComponents, {
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(html).toEqual(
      '<div data-slate-node="element"><span data-slate-node="text"><span data-slate-leaf="true"><strong data-slate-leaf="true"><span data-slate-string="true">Right Aligned Heading</span></strong></span></span></div>'
    );
  });
});
