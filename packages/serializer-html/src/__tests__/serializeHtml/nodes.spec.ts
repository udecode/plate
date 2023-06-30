import { createBoldPlugin } from '@/packages/basic-marks/src/createBoldPlugin';
import { createItalicPlugin } from '@/packages/basic-marks/src/createItalicPlugin';
import { createListPlugin } from '@/packages/list/src/createListPlugin';
import { createParagraphPlugin } from '@/packages/paragraph/src/createParagraphPlugin';
import { serializeHtml } from '@/packages/serializer-html/src/serializeHtml';
import { Value, htmlStringToDOMNode } from '@udecode/plate-common';
import { createPlateUIEditor } from 'www/src/lib/plate/createPlateUIEditor';

it('serialize complex example list with paragraphs to html', () => {
  const plugins = [
    createItalicPlugin(),
    createBoldPlugin(),
    createParagraphPlugin(),
    createListPlugin(),
  ];
  const editor = createPlateUIEditor({ plugins });

  const render = htmlStringToDOMNode(
    serializeHtml(editor, {
      nodes: [
        {
          type: 'p',
          children: [
            {
              text: 'Some paragraph that contains, ',
            },
            {
              text: 'italicized text',
              italic: true,
            },
            {
              text: ' and ',
            },
            {
              text: 'bolded text',
              bold: true,
            },
            {
              text: ' is first.',
            },
          ],
        },
        {
          type: 'ul',
          children: [
            {
              type: 'li',
              children: [
                {
                  type: 'p',
                  children: [
                    {
                      text: 'Item one in list',
                    },
                  ],
                },
              ],
            },
            {
              type: 'li',
              children: [
                {
                  type: 'p',
                  children: [
                    {
                      text: 'Item two in list',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })
  );
  expect(render.querySelectorAll('div').length).toEqual(3);
  expect(render.querySelectorAll('div')[0].outerHTML).toBe(
    '<div class="slate-p">Some paragraph that contains, <em class="slate-italic">italicized text</em> and <strong class="slate-bold">bolded text</strong> is first.</div>'
  );
  expect(render.querySelectorAll('ul').length).toEqual(1);
  expect(render.querySelectorAll('li').length).toEqual(2);
  expect(render.querySelectorAll('ul')[0].innerHTML).toBe(
    '<li class="slate-li"><div class="slate-p">Item one in list</div></li><li class="slate-li"><div class="slate-p">Item two in list</div></li>'
  );
});

it('serialize complex example with no type on top level node to html', () => {
  const plugins = [
    createItalicPlugin(),
    createBoldPlugin(),
    createParagraphPlugin(),
    createListPlugin(),
  ];
  const editor = createPlateUIEditor({ plugins });

  const render = serializeHtml(editor, {
    nodes: [
      {
        children: [
          {
            type: 'p',
            children: [
              {
                text: 'Some paragraph that contains, ',
              },
              {
                text: 'italicized text',
                italic: true,
              },
              {
                text: ' and ',
              },
              {
                text: 'bolded text',
                bold: true,
              },
              {
                text: ' is first.',
              },
            ],
          },
        ],
      },
    ] as Value,
  });
  expect(render).toBe(
    '<div><div class="slate-p">Some paragraph that contains, <em class="slate-italic">italicized text</em> and <strong class="slate-bold">bolded text</strong> is first.</div></div>'
  );
});

it('serialize complex example with multiple no types on top level node to html', () => {
  const plugins = [
    createItalicPlugin(),
    createBoldPlugin(),
    createParagraphPlugin(),
    createListPlugin(),
  ];
  const editor = createPlateUIEditor({ plugins });

  const render = serializeHtml(editor, {
    nodes: [
      {
        children: [
          {
            type: 'p',
            children: [
              {
                text: 'Some paragraph that contains, ',
              },
              {
                text: 'italicized text',
                italic: true,
              },
              {
                text: ' and ',
              },
              {
                text: 'bolded text',
                bold: true,
              },
              {
                text: ' is first.',
              },
            ],
          },
        ],
      },
      {
        children: [{ text: 'FOO', bold: true }],
      },
    ] as Value,
  });
  expect(render).toBe(
    '<div><div class="slate-p">Some paragraph that contains, <em class="slate-italic">italicized text</em> and <strong class="slate-bold">bolded text</strong> is first.</div></div><div><strong class="slate-bold">FOO</strong></div>'
  );
});

it('serialize string with %', () => {
  const plugins = [createParagraphPlugin()];
  const editor = createPlateUIEditor({ plugins });

  const render = serializeHtml(editor, {
    nodes: [
      {
        children: [
          {
            type: 'p',
            children: [
              {
                text: 'None encoded string 100%',
              },
            ],
          },
        ],
      },
      {
        children: [{ text: 'Encoded string 100%25' }],
      },
    ] as Value,
  });
  expect(render).toBe(
    '<div><div class="slate-p">None encoded string 100%</div></div><div>Encoded string 100%25</div>'
  );
});
