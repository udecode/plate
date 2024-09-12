import { BoldPlugin, ItalicPlugin } from '@udecode/plate-basic-marks/react';
import { type Value, htmlStringToDOMNode } from '@udecode/plate-common';
import { ParagraphPlugin } from '@udecode/plate-common/react';
import { ListPlugin } from '@udecode/plate-list/react';

import { serializeHtml } from '../../react/serializeHtml';
import { createPlateUIEditor } from '../create-plate-ui-editor';

it('serialize complex example list with paragraphs to html', () => {
  const plugins = [ItalicPlugin, BoldPlugin, ParagraphPlugin, ListPlugin];
  const editor = createPlateUIEditor({ plugins });

  const render = htmlStringToDOMNode(
    serializeHtml(editor, {
      nodes: [
        {
          children: [
            {
              text: 'Some paragraph that contains, ',
            },
            {
              italic: true,
              text: 'italicized text',
            },
            {
              text: ' and ',
            },
            {
              bold: true,
              text: 'bolded text',
            },
            {
              text: ' is first.',
            },
          ],
          type: 'p',
        },
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      text: 'Item one in list',
                    },
                  ],
                  type: 'p',
                },
              ],
              type: 'li',
            },
            {
              children: [
                {
                  children: [
                    {
                      text: 'Item two in list',
                    },
                  ],
                  type: 'p',
                },
              ],
              type: 'li',
            },
          ],
          type: 'ul',
        },
      ],
    })
  );
  expect(render.querySelectorAll('div')).toHaveLength(3);
  expect(render.querySelectorAll('div')[0].outerHTML).toBe(
    '<div class="slate-p">Some paragraph that contains, <em class="slate-italic">italicized text</em> and <strong class="slate-bold">bolded text</strong> is first.</div>'
  );
  expect(render.querySelectorAll('ul')).toHaveLength(1);
  expect(render.querySelectorAll('li')).toHaveLength(2);
  expect(render.querySelectorAll('ul')[0].innerHTML).toBe(
    '<li class="slate-li"><div class="slate-p">Item one in list</div></li><li class="slate-li"><div class="slate-p">Item two in list</div></li>'
  );
});

it('serialize complex example with no type on top level node to html', () => {
  const plugins = [ItalicPlugin, BoldPlugin, ParagraphPlugin, ListPlugin];
  const editor = createPlateUIEditor({ plugins });

  const render = serializeHtml(editor, {
    nodes: [
      {
        children: [
          {
            children: [
              {
                text: 'Some paragraph that contains, ',
              },
              {
                italic: true,
                text: 'italicized text',
              },
              {
                text: ' and ',
              },
              {
                bold: true,
                text: 'bolded text',
              },
              {
                text: ' is first.',
              },
            ],
            type: 'p',
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
  const plugins = [ItalicPlugin, BoldPlugin, ParagraphPlugin, ListPlugin];
  const editor = createPlateUIEditor({ plugins });

  const render = serializeHtml(editor, {
    nodes: [
      {
        children: [
          {
            children: [
              {
                text: 'Some paragraph that contains, ',
              },
              {
                italic: true,
                text: 'italicized text',
              },
              {
                text: ' and ',
              },
              {
                bold: true,
                text: 'bolded text',
              },
              {
                text: ' is first.',
              },
            ],
            type: 'p',
          },
        ],
      },
      {
        children: [{ bold: true, text: 'FOO' }],
      },
    ] as Value,
  });
  expect(render).toBe(
    '<div><div class="slate-p">Some paragraph that contains, <em class="slate-italic">italicized text</em> and <strong class="slate-bold">bolded text</strong> is first.</div></div><div><strong class="slate-bold">FOO</strong></div>'
  );
});

it('serialize string with %', () => {
  const plugins = [ParagraphPlugin];
  const editor = createPlateUIEditor({ plugins });

  const render = serializeHtml(editor, {
    nodes: [
      {
        children: [
          {
            children: [
              {
                text: 'None encoded string 100%',
              },
            ],
            type: 'p',
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
