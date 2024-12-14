import { serializePlateStatic } from '../serializedHtml';
import { createStaticEditor, staticComponents } from './create-static-editor';

describe('serializePlateStatic nodes', () => {
  // it('should serialize complex example list with paragraphs to html', async () => {
  //   const editor = createStaticEditor([
  //     {
  //       children: [
  //         {
  //           text: 'Some paragraph that contains, ',
  //         },
  //         {
  //           italic: true,
  //           text: 'italicized text',
  //         },
  //         {
  //           text: ' and ',
  //         },
  //         {
  //           bold: true,
  //           text: 'bolded text',
  //         },
  //         {
  //           text: ' is first.',
  //         },
  //       ],
  //       type: 'p',
  //     },
  //     {
  //       children: [
  //         {
  //           children: [
  //             {
  //               children: [
  //                 {
  //                   text: 'Item one in list',
  //                 },
  //               ],
  //               type: 'p',
  //             },
  //           ],
  //           type: 'li',
  //         },
  //         {
  //           children: [
  //             {
  //               children: [
  //                 {
  //                   text: 'Item two in list',
  //                 },
  //               ],
  //               type: 'p',
  //             },
  //           ],
  //           type: 'li',
  //         },
  //       ],
  //       type: 'ul',
  //     },
  //   ]);

  //   const html = await serializePlateStatic(editor, staticComponents, {
  //     preserveClassNames: [],
  //     stripClassNames: true,
  //     stripDataAttributes: true,
  //   });

  //   expect(html).toContain(
  //     '<p>Some paragraph that contains, <em><span>italicized text</span></em> and <strong><span>bolded text</span></strong> is first.</p>'
  //   );
  //   expect(html).toContain(
  //     '<ul><li><p>Item one in list</p></li><li><p>Item two in list</p></li></ul>'
  //   );
  // });

  // it('should serialize complex example with no type on top level node to html', async () => {
  //   const editor = createStaticEditor([
  //     {
  //       children: [
  //         {
  //           text: 'Some paragraph that contains, ',
  //         },
  //         {
  //           italic: true,
  //           text: 'italicized text',
  //         },
  //         {
  //           text: ' and ',
  //         },
  //         {
  //           bold: true,
  //           text: 'bolded text',
  //         },
  //         {
  //           text: ' is first.',
  //         },
  //       ],
  //       type: 'p',
  //     },
  //   ]);

  //   const html = await serializePlateStatic(editor, staticComponents, {
  //     preserveClassNames: [],
  //     stripClassNames: true,
  //     stripDataAttributes: true,
  //   });

  //   expect(html).toContain(
  //     '<p>Some paragraph that contains, <em><span>italicized text</span></em> and <strong><span>bolded text</span></strong> is first.</p>'
  //   );
  // });

  // it('should serialize complex example with multiple no types on top level node to html', async () => {
  //   const editor = createStaticEditor([
  //     {
  //       children: [
  //         {
  //           text: 'Some paragraph that contains, ',
  //         },
  //         {
  //           italic: true,
  //           text: 'italicized text',
  //         },
  //         {
  //           text: ' and ',
  //         },
  //         {
  //           bold: true,
  //           text: 'bolded text',
  //         },
  //         {
  //           text: ' is first.',
  //         },
  //       ],
  //       type: 'p',
  //     },
  //     {
  //       children: [{ bold: true, text: 'FOO' }],
  //       type: 'p',
  //     },
  //   ]);

  //   const html = await serializePlateStatic(editor, staticComponents, {
  //     preserveClassNames: [],
  //     stripClassNames: true,
  //     stripDataAttributes: true,
  //   });

  //   expect(html).toContain(
  //     '<p>Some paragraph that contains, <em><span>italicized text</span></em> and <strong><span>bolded text</span></strong> is first.</p>'
  //   );
  //   expect(html).toContain('<strong><span>FOO</span></strong>');
  // });

  it('should serialize string with %', async () => {
    const editor = createStaticEditor([
      {
        children: [
          {
            text: 'None encoded string 100%',
          },
        ],
        type: 'p',
      },
      {
        children: [{ text: 'Encoded string 100%25' }],
        type: 'p',
      },
    ]);

    const html = await serializePlateStatic(editor, staticComponents, {
      preserveClassNames: [],
      stripClassNames: true,
      // stripDataAttributes: true,
    });

    expect(html).toContain(
      '<div data-slate-node="element><span data-slate-leaf="true"><span data-slate-string="true">None encoded string 100%</span></span></div>'
    );
    // expect(html).toContain(
    //   '<div><span data-slate-leaf="true"><span data-slate-string="true">Encoded string 100%25</span></span></div>'
    // );
  });
});
