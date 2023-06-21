import { htmlStringToDOMNode, Value } from '@/packages/common/src/index';
import { createBoldPlugin } from '@/packages/nodes/basic-marks/src/createBoldPlugin';
import { createItalicPlugin } from '@/packages/nodes/basic-marks/src/createItalicPlugin';
import { createListPlugin } from '@/packages/nodes/list/src/createListPlugin';
import { createParagraphPlugin } from '@/packages/nodes/paragraph/src/createParagraphPlugin';
import { serializeHtml } from '@/packages/serializers/html/src/serializeHtml';
import { createPlateUIEditor } from '@/plate/createPlateUIEditor';

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
  expect(render.querySelectorAll('p').length).toEqual(3);
  expect(render.querySelectorAll('p')[0].outerHTML).toBe(
    '<p class="slate-p">Some paragraph that contains, <em class="slate-italic">italicized text</em> and <strong class="slate-bold">bolded text</strong> is first.</p>'
  );
  expect(render.querySelectorAll('ul').length).toEqual(1);
  expect(render.querySelectorAll('li').length).toEqual(2);
  expect(render.querySelectorAll('ul')[0].innerHTML).toBe(
    '<li class="slate-li"><p class="slate-p">Item one in list</p></li><li class="slate-li"><p class="slate-p">Item two in list</p></li>'
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
    '<div><p class="slate-p">Some paragraph that contains, <em class="slate-italic">italicized text</em> and <strong class="slate-bold">bolded text</strong> is first.</p></div>'
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
    '<div><p class="slate-p">Some paragraph that contains, <em class="slate-italic">italicized text</em> and <strong class="slate-bold">bolded text</strong> is first.</p></div><div><strong class="slate-bold">FOO</strong></div>'
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
    '<div><p class="slate-p">None encoded string 100%</p></div><div>Encoded string 100%25</div>'
  );
});
