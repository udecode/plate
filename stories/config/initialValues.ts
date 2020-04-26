import faker from 'faker';
import { Node } from 'slate';
import {
  ACTION_ITEM,
  BLOCKQUOTE,
  HeadingType,
  MENTION,
  PARAGRAPH,
  TableType,
} from 'slate-plugins-next/src';

export const initialValueVoids: Node[] = [
  {
    type: 'paragraph',
    children: [
      {
        text:
          'In addition to nodes that contain editable text, you can insert void nodes, which can also contain editable elements, inputs, or an entire other Slate editor.',
      },
    ],
  },
  {
    type: 'editable-void',
    children: [{ text: '' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '',
      },
    ],
  },
];

export const initialValueActionItem: Node[] = [
  {
    type: PARAGRAPH,
    children: [
      {
        text:
          'With Slate you can build complex block types that have their own embedded content and behaviors, like rendering checkboxes inside check list items!',
      },
    ],
  },
  {
    type: ACTION_ITEM,
    checked: true,
    children: [{ text: 'Slide to the left.' }],
  },
  {
    type: ACTION_ITEM,
    checked: true,
    children: [{ text: 'Slide to the right.' }],
  },
  {
    type: ACTION_ITEM,
    checked: false,
    children: [{ text: 'Criss-cross.' }],
  },
  {
    type: ACTION_ITEM,
    checked: true,
    children: [{ text: 'Criss-cross!' }],
  },
  {
    type: ACTION_ITEM,
    checked: false,
    children: [{ text: 'Cha cha real smooth…' }],
  },
  {
    type: ACTION_ITEM,
    checked: false,
    children: [{ text: "Let's go to work!" }],
  },
  {
    type: PARAGRAPH,
    children: [{ text: 'Try it out for yourself!' }],
  },
];

export const initialValueEmbeds: Node[] = [
  {
    type: PARAGRAPH,
    children: [
      {
        text:
          'In addition to simple image nodes, you can actually create complex embedded nodes. For example, this one contains an input element that lets you change the video being rendered!',
      },
    ],
  },
  {
    type: 'video',
    url: 'https://player.vimeo.com/video/26689853',
    children: [{ text: '' }],
  },
  {
    type: PARAGRAPH,
    children: [
      {
        text:
          'Try it out! This editor is built to handle Vimeo embeds, but you could handle any type.',
      },
    ],
  },
];

export const initialValueForcedLayout: Node[] = [
  {
    type: HeadingType.H1,
    children: [{ text: 'Enforce Your Layout!' }],
  },
  {
    type: PARAGRAPH,
    children: [
      {
        text:
          'This example shows how to enforce your layout with domain-specific constraints. This document will always have a title block at the top and at least one paragraph in the body. Try deleting them and see what happens!',
      },
    ],
  },
];

export const initialValueHoveringToolbar: Node[] = [
  {
    type: PARAGRAPH,
    children: [
      {
        text:
          'This example shows how you can make a hovering menu appear above your content, which you can use to make text ',
      },
      { text: 'bold', bold: true },
      { text: ', ' },
      { text: 'italic', italic: true },
      { text: ', or anything else you might want to do!' },
    ],
  },
  {
    type: PARAGRAPH,
    children: [
      { text: 'Try it out yourself! Just ' },
      { text: 'select any piece of text and the menu will appear', bold: true },
      { text: '.' },
    ],
  },
];

const HEADINGS = 100;
const PARAGRAPHS = 7;
export const initialValueHugeDocument: Node[] = [];

for (let h = 0; h < HEADINGS; h++) {
  initialValueHugeDocument.push({
    type: HeadingType.H1,
    children: [{ text: faker.lorem.sentence() }],
  });

  for (let p = 0; p < PARAGRAPHS; p++) {
    initialValueHugeDocument.push({
      children: [{ text: faker.lorem.paragraph() }],
    });
  }
}

export const initialValueImages: Node[] = [
  {
    type: PARAGRAPH,
    children: [
      {
        text:
          'In addition to nodes that contain editable text, you can also create other types of nodes, like images or videos.',
      },
    ],
  },
  {
    type: 'image',
    url: 'https://source.unsplash.com/kFrdX5IeQzI',
    children: [{ text: '' }],
  },
  {
    type: PARAGRAPH,
    children: [
      {
        text:
          'This example shows images in action. It features two ways to add images. You can either add an image via the toolbar icon above, or if you want in on a little secret, copy an image URL to your keyboard and paste it anywhere in the editor!',
      },
    ],
  },
];

export const initialValueLinks: Node[] = [
  {
    type: PARAGRAPH,
    children: [
      {
        text: 'In addition to block nodes, you can create inline nodes, like ',
      },
      {
        type: 'link',
        url: 'https://en.wikipedia.org/wiki/Hypertext',
        children: [{ text: 'hyperlinks' }],
      },
      {
        text: '!',
      },
    ],
  },
  {
    type: PARAGRAPH,
    children: [
      {
        text:
          'This example shows hyperlinks in action. It features two ways to add links. You can either add a link via the toolbar icon above, or if you want in on a little secret, copy a URL to your keyboard and paste it while a range of text is selected.',
      },
    ],
  },
];

export const initialValueMarkdownPreview: Node[] = [
  {
    type: PARAGRAPH,
    children: [
      {
        text:
          'Slate is flexible enough to add **decorations** that can format text based on its content. For example, this editor has **Markdown** preview decorations on it, to make it _dead_ simple to make an editor with built-in Markdown previewing.',
      },
    ],
  },
  {
    type: PARAGRAPH,
    children: [{ text: '## Try it out!' }],
  },
  {
    type: PARAGRAPH,
    children: [{ text: 'Try it out for yourself!' }],
  },
];

export const initialValueMarkdownShortcuts: Node[] = [
  {
    type: PARAGRAPH,
    children: [
      {
        text:
          'The editor gives you full control over the logic you can add. For example, it\'s fairly common to want to add markdown-like shortcuts to editors. So that, when you start a line with "> " you get a blockquote that looks like this:',
      },
    ],
  },
  {
    type: BLOCKQUOTE,
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: PARAGRAPH,
    children: [
      {
        text:
          'Order when you start a line with "## " you get a level-two heading, like this:',
      },
    ],
  },
  {
    type: HeadingType.H2,
    children: [{ text: 'Try it out!' }],
  },
  {
    type: PARAGRAPH,
    children: [
      {
        text:
          'Try it out for yourself! Try starting a new line with ">", "-", or "#"s.',
      },
    ],
  },
];

export const initialValueMentions: Node[] = [
  {
    type: PARAGRAPH,
    children: [
      {
        text:
          'This example shows how you might implement a simple @-mentions feature that lets users autocomplete mentioning a user by their username. Which, in this case means Star Wars characters. The mentions are rendered as void inline elements inside the document.',
      },
    ],
  },
  {
    type: PARAGRAPH,
    children: [
      { text: 'Try mentioning characters, like ' },
      {
        type: MENTION,
        character: 'R2-D2',
        children: [{ text: '' }],
      },
      { text: ' or ' },
      {
        type: MENTION,
        character: 'Mace Windu',
        children: [{ text: '' }],
      },
      { text: '!' },
    ],
  },
];

export const initialValuePasteHtml: Node[] = [
  {
    type: PARAGRAPH,
    children: [
      {
        text:
          "By default, pasting content into a Slate editor will use the clipboard's ",
      },
      { text: "'text/plain'", code: true },
      {
        text:
          " data. That's okay for some use cases, but sometimes you want users to be able to paste in content and have it maintaing its formatting. To do this, your editor needs to handle ",
      },
      { text: "'text/html'", code: true },
      { text: ' data. ' },
    ],
  },
  {
    type: PARAGRAPH,
    children: [{ text: 'This is an example of doing exactly that!' }],
  },
  {
    type: PARAGRAPH,
    children: [
      {
        text:
          "Try it out for yourself! Copy and paste some rendered HTML rich text content (not the source code) from another site into this editor and it's formatting should be preserved.",
      },
    ],
  },
];

export const initialValuePasteMd: Node[] = [
  {
    type: PARAGRAPH,
    children: [
      {
        text:
          "By default, pasting content into a Slate editor will use the clipboard's ",
      },
      { text: "'text/plain'", code: true },
      {
        text:
          " data. That's okay for some use cases, but sometimes you want users to be able to paste in content and have it maintaing its formatting. To do this, your editor needs to handle ",
      },
      { text: "'text/html'", code: true },
      { text: ' data. ' },
    ],
  },
  {
    type: PARAGRAPH,
    children: [{ text: 'This is an example of doing exactly that!' }],
  },
  {
    type: PARAGRAPH,
    children: [
      {
        text:
          "Try it out for yourself! Copy and paste some Markdown content from another file into this editor and it's formatting should be preserved.",
      },
    ],
  },
];

export const initialValuePlainText: Node[] = [
  {
    type: PARAGRAPH,
    children: [
      { text: 'This is editable plain text, just like a <textarea>!' },
    ],
  },
];

export const initialValueMark: Node[] = [
  {
    type: PARAGRAPH,
    children: [
      { text: 'This is editable ' },
      { text: 'rich', bold: true, underline: true, italic: true },
      { text: ' text, ' },
      { text: 'much' },
      { text: ' better than a ' },
      { text: '<textarea>', code: true },
      { text: '!' },
    ],
  },
];

export const initialValueRichText: Node[] = [
  {
    type: HeadingType.H1,
    children: [{ text: 'Welcome' }],
  },
  {
    type: PARAGRAPH,
    children: [
      { text: 'This is editable ' },
      { text: 'rich', bold: true },
      { text: ' text, ' },
      { text: 'much', italic: true },
      { text: ' better than a ' },
      { text: '<textarea>', code: true },
      { text: '!' },
    ],
  },
  {
    type: PARAGRAPH,
    children: [
      {
        text:
          "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: 'bold', bold: true },
      {
        text:
          ', or add a semantically rendered block quote in the middle of the page, like this:',
      },
    ],
  },
  {
    type: BLOCKQUOTE,
    children: [{ text: 'A wise quote.' }],
  },
];

export const initialValueSearchHighlighting: Node[] = [
  {
    type: PARAGRAPH,
    children: [
      {
        text:
          'This is editable text that you can search. As you search, it looks for matching strings of text, and adds ',
      },
      { text: 'decorations', bold: true },
      { text: ' to them in realtime.' },
    ],
  },
  {
    type: PARAGRAPH,
    children: [
      { text: 'Try it out for yourself by typing in the search box above!' },
    ],
  },
];

export const initialValueTables: Node[] = [
  {
    type: PARAGRAPH,
    children: [
      {
        text:
          'Since the editor is based on a recursive tree model, similar to an HTML document, you can create complex nested structures, like tables:',
      },
    ],
  },
  {
    type: TableType.TABLE,
    children: [
      {
        type: TableType.ROW,
        children: [
          {
            type: TableType.CELL,
            children: [{ text: '' }],
          },
          {
            type: TableType.CELL,
            children: [{ text: 'Human', bold: true }],
          },
          {
            type: TableType.CELL,
            children: [{ text: 'Dog', bold: true }],
          },
          {
            type: TableType.CELL,
            children: [{ text: 'Cat', bold: true }],
          },
        ],
      },
      {
        type: TableType.ROW,
        children: [
          {
            type: TableType.CELL,
            children: [{ text: '# of Feet', bold: true }],
          },
          {
            type: TableType.CELL,
            children: [{ text: '2' }],
          },
          {
            type: TableType.CELL,
            children: [{ text: '4' }],
          },
          {
            type: TableType.CELL,
            children: [{ text: '4' }],
          },
        ],
      },
      {
        type: TableType.ROW,
        children: [
          {
            type: TableType.CELL,
            children: [{ text: '# of Lives', bold: true }],
          },
          {
            type: TableType.CELL,
            children: [{ text: '1' }],
          },
          {
            type: TableType.CELL,
            children: [{ text: '1' }],
          },
          {
            type: TableType.CELL,
            children: [{ text: '9' }],
          },
        ],
      },
    ],
  },
  {
    type: PARAGRAPH,
    children: [
      {
        text:
          "This table is just a basic example of rendering a table, and it doesn't have fancy functionality. But you could augment it to add support for navigating with arrow keys, displaying table headers, adding column and rows, or even formulas if you wanted to get really crazy!",
      },
    ],
  },
];

export const initialValueSoftBreak: Node[] = [
  {
    type: PARAGRAPH,
    children: [
      {
        text:
          'Basic example of using the SoftBreakPlugin. go and edit any node and by typing ',
      },
      {
        text: 'shift + Enter',
        code: true,
      },
      {
        text: ', you will be able to add an extra line to the same node.',
      },
    ],
  },
  {
    type: HeadingType.H2,
    children: [
      {
        text: 'This is a normal Heading 2',
      },
    ],
  },
  {
    type: HeadingType.H2,
    children: [
      {
        text: 'This is a Heading 2\nwith a soft break',
      },
    ],
  },
];
