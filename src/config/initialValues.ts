import faker from 'faker';
import { Node, Node } from 'slate';

export const initialValueCheckLists: Node[] = [
  {
    children: [
      {
        text:
          'With Slate you can build complex block types that have their own embedded content and behaviors, like rendering checkboxes inside check list items!',
      },
    ],
  },
  {
    type: 'check-list-item',
    checked: true,
    children: [{ text: 'Slide to the left.' }],
  },
  {
    type: 'check-list-item',
    checked: true,
    children: [{ text: 'Slide to the right.' }],
  },
  {
    type: 'check-list-item',
    checked: false,
    children: [{ text: 'Criss-cross.' }],
  },
  {
    type: 'check-list-item',
    checked: true,
    children: [{ text: 'Criss-cross!' }],
  },
  {
    type: 'check-list-item',
    checked: false,
    children: [{ text: 'Cha cha real smooth…' }],
  },
  {
    type: 'check-list-item',
    checked: false,
    children: [{ text: "Let's go to work!" }],
  },
  {
    children: [{ text: 'Try it out for yourself!' }],
  },
];

export const initialValueEmbeds: Node[] = [
  {
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
    type: 'heading-one',
    children: [{ text: 'Enforce Your Layout!' }],
  },
  {
    type: 'paragraph',
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
    type: 'heading-one',
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
    type: 'paragraph',
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
    type: 'paragraph',
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
    children: [
      {
        text:
          'Slate is flexible enough to add **decorations** that can format text based on its content. For example, this editor has **Markdown** preview decorations on it, to make it _dead_ simple to make an editor with built-in Markdown previewing.',
      },
    ],
  },
  {
    children: [{ text: '## Try it out!' }],
  },
  {
    children: [{ text: 'Try it out for yourself!' }],
  },
];

export const initialValueMarkdownShortcuts: Node[] = [
  {
    type: 'paragraph',
    children: [
      {
        text:
          'The editor gives you full control over the logic you can add. For example, it\'s fairly common to want to add markdown-like shortcuts to editors. So that, when you start a line with "> " you get a blockquote that looks like this:',
      },
    ],
  },
  {
    type: 'block-quote',
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          'Order when you start a line with "## " you get a level-two heading, like this:',
      },
    ],
  },
  {
    type: 'heading-two',
    children: [{ text: 'Try it out!' }],
  },
  {
    type: 'paragraph',
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
    children: [
      {
        text:
          'This example shows how you might implement a simple @-mentions feature that lets users autocomplete mentioning a user by their username. Which, in this case means Star Wars characters. The mentions are rendered as void inline elements inside the document.',
      },
    ],
  },
  {
    children: [
      { text: 'Try mentioning characters, like ' },
      {
        type: 'mention',
        character: 'R2-D2',
        children: [{ text: '' }],
      },
      { text: ' or ' },
      {
        type: 'mention',
        character: 'Mace Windu',
        children: [{ text: '' }],
      },
      { text: '!' },
    ],
  },
];

export const initialValuePasteHtml: Node[] = [
  {
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
    children: [{ text: 'This is an example of doing exactly that!' }],
  },
  {
    children: [
      {
        text:
          "Try it out for yourself! Copy and paste some rendered HTML rich text content (not the source code) from another site into this editor and it's formatting should be preserved.",
      },
    ],
  },
];

export const initialValuePlainText: Node[] = [
  {
    children: [
      { text: 'This is editable plain text, just like a <textarea>!' },
    ],
  },
];

export const initialValueReadOnly: Node[] = [
  {
    children: [
      { text: 'This is editable plain text, just like a <textarea>!' },
    ],
  },
];

export const initialValueRichText: Node[] = [
  {
    type: 'paragraph',
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
    type: 'paragraph',
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
    type: 'block-quote',
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Try it out for yourself!' }],
  },
];

export const initialValueSearchHighlighting: Node[] = [
  {
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
    children: [
      { text: 'Try it out for yourself by typing in the search box above!' },
    ],
  },
];

export const initialValueTables: Node[] = [
  {
    children: [
      {
        text:
          'Since the editor is based on a recursive tree model, similar to an HTML document, you can create complex nested structures, like tables:',
      },
    ],
  },
  {
    type: 'table',
    children: [
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            children: [{ text: '' }],
          },
          {
            type: 'table-cell',
            children: [{ text: 'Human', bold: true }],
          },
          {
            type: 'table-cell',
            children: [{ text: 'Dog', bold: true }],
          },
          {
            type: 'table-cell',
            children: [{ text: 'Cat', bold: true }],
          },
        ],
      },
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            children: [{ text: '# of Feet', bold: true }],
          },
          {
            type: 'table-cell',
            children: [{ text: '2' }],
          },
          {
            type: 'table-cell',
            children: [{ text: '4' }],
          },
          {
            type: 'table-cell',
            children: [{ text: '4' }],
          },
        ],
      },
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            children: [{ text: '# of Lives', bold: true }],
          },
          {
            type: 'table-cell',
            children: [{ text: '1' }],
          },
          {
            type: 'table-cell',
            children: [{ text: '1' }],
          },
          {
            type: 'table-cell',
            children: [{ text: '9' }],
          },
        ],
      },
    ],
  },
  {
    children: [
      {
        text:
          "This table is just a basic example of rendering a table, and it doesn't have fancy functionality. But you could augment it to add support for navigating with arrow keys, displaying table headers, adding column and rows, or even formulas if you wanted to get really crazy!",
      },
    ],
  },
];
