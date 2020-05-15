import faker from 'faker';
import { Node } from 'slate';
import {
  ACTION_ITEM,
  BLOCKQUOTE,
  CODE,
  HeadingType,
  IMAGE,
  LINK,
  ListType,
  MARK_BOLD,
  MARK_CODE,
  MARK_HIGHLIGHT,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
  MENTION,
  PARAGRAPH,
  TableType,
  VIDEO,
} from '../../packages/slate-plugins/src';
import { EDITABLE_VOID } from '../element/block-void/editable-voids/types';

export const nodeTypes = {
  // elements
  typeP: PARAGRAPH,
  typeMention: MENTION,
  typeBlockquote: BLOCKQUOTE,
  typeCode: CODE,
  typeLink: LINK,
  typeImg: IMAGE,
  typeVideo: VIDEO,
  typeActionItem: ACTION_ITEM,
  typeTable: TableType.TABLE,
  typeTr: TableType.ROW,
  typeTd: TableType.CELL,
  typeUl: ListType.UL,
  typeOl: ListType.OL,
  typeLi: ListType.LI,
  typeH1: HeadingType.H1,
  typeH2: HeadingType.H2,
  typeH3: HeadingType.H3,
  typeH4: HeadingType.H4,
  typeH5: HeadingType.H5,
  typeH6: HeadingType.H6,
  typeEditableVoid: EDITABLE_VOID,
  // marks
  typeHighlight: MARK_HIGHLIGHT,
};

export const initialValueVoids: Node[] = [
  {
    type: nodeTypes.typeP,
    children: [
      {
        text:
          'In addition to nodes that contain editable text, you can insert void nodes, which can also contain editable elements, inputs, or an entire other Slate editor.',
      },
    ],
  },
  {
    type: nodeTypes.typeEditableVoid,
    children: [{ text: '' }],
  },
  {
    type: nodeTypes.typeP,
    children: [
      {
        text: '',
      },
    ],
  },
];

export const initialValueActionItem: Node[] = [
  {
    type: nodeTypes.typeP,
    children: [
      {
        text:
          'With Slate you can build complex block types that have their own embedded content and behaviors, like rendering checkboxes inside check list items!',
      },
    ],
  },
  {
    type: nodeTypes.typeActionItem,
    checked: true,
    children: [{ text: 'Slide to the left.' }],
  },
  {
    type: nodeTypes.typeActionItem,
    checked: true,
    children: [{ text: 'Slide to the right.' }],
  },
  {
    type: nodeTypes.typeActionItem,
    checked: false,
    children: [{ text: 'Criss-cross.' }],
  },
  {
    type: nodeTypes.typeActionItem,
    checked: true,
    children: [{ text: 'Criss-cross!' }],
  },
  {
    type: nodeTypes.typeActionItem,
    checked: false,
    children: [{ text: 'Cha cha real smooth…' }],
  },
  {
    type: nodeTypes.typeActionItem,
    checked: false,
    children: [{ text: "Let's go to work!" }],
  },
  {
    type: nodeTypes.typeP,
    children: [{ text: 'Try it out for yourself!' }],
  },
];

export const initialValueEmbeds: Node[] = [
  {
    type: nodeTypes.typeP,
    children: [
      {
        text:
          'In addition to simple image nodes, you can actually create complex embedded nodes. For example, this one contains an input element that lets you change the video being rendered!',
      },
    ],
  },
  {
    type: nodeTypes.typeVideo,
    url: 'https://player.vimeo.com/video/26689853',
    children: [{ text: '' }],
  },
  {
    type: nodeTypes.typeP,
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
    type: nodeTypes.typeH1,
    children: [{ text: 'Enforce Your Layout!' }],
  },
  {
    type: nodeTypes.typeP,
    children: [
      {
        text:
          'This example shows how to enforce your layout with domain-specific constraints. This document will always have a title block at the top and at least one paragraph in the body. Try deleting them and see what happens!',
      },
    ],
  },
  {
    type: nodeTypes.typeP,
    children: [
      {
        text:
          'Slate editors can edit complex, nested data structures. And for the most part this is great. But in certain cases inconsistencies in the data structure can be introduced—most often when allowing a user to paste arbitrary richtext content.\n' +
          '"Normalizing" is how you can ensure that your editor\'s content is always of a certain shape. It\'s similar to "validating", except instead of just determining whether the content is valid or invalid, its job is to fix the content to make it valid again.',
      },
    ],
  },
];

export const initialValueHoveringToolbar: Node[] = [
  {
    type: nodeTypes.typeP,
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
    type: nodeTypes.typeP,
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
    type: nodeTypes.typeH1,
    children: [{ text: faker.lorem.sentence() }],
  });

  for (let p = 0; p < PARAGRAPHS; p++) {
    initialValueHugeDocument.push({
      type: nodeTypes.typeP,
      children: [{ text: faker.lorem.paragraph() }],
    });
  }
}

export const initialValueImages: Node[] = [
  {
    type: nodeTypes.typeP,
    children: [
      {
        text:
          'In addition to nodes that contain editable text, you can also create other types of nodes, like images or videos.',
      },
    ],
  },
  {
    type: nodeTypes.typeImg,
    url: 'https://source.unsplash.com/kFrdX5IeQzI',
    children: [{ text: '' }],
  },
  {
    type: nodeTypes.typeP,
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
    type: nodeTypes.typeP,
    children: [
      {
        text: 'In addition to block nodes, you can create inline nodes, like ',
      },
      {
        type: nodeTypes.typeLink,
        url: 'https://en.wikipedia.org/wiki/Hypertext',
        children: [{ text: 'hyperlinks' }],
      },
      {
        text: '!',
      },
    ],
  },
  {
    type: nodeTypes.typeP,
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
    type: nodeTypes.typeP,
    children: [
      {
        text:
          'Slate is flexible enough to add **decorations** that can format text based on its content. For example, this editor has **Markdown** preview decorations on it, to make it _dead_ simple to make an editor with built-in Markdown previewing.',
      },
    ],
  },
  {
    type: nodeTypes.typeP,
    children: [{ text: '## Try it out!' }],
  },
  {
    type: nodeTypes.typeP,
    children: [{ text: 'Try it out for yourself!' }],
  },
];

export const initialValueMarkdownShortcuts: Node[] = [
  {
    type: nodeTypes.typeP,
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
    type: nodeTypes.typeP,
    children: [
      {
        text:
          'Order when you start a line with "## " you get a level-two heading, like this:',
      },
    ],
  },
  {
    type: nodeTypes.typeH2,
    children: [{ text: 'Try it out!' }],
  },
  {
    type: nodeTypes.typeP,
    children: [
      {
        text:
          'Try it out for yourself! Try starting a new line with ">", "-", "1." or "#"s.',
      },
    ],
  },
];

export const initialValueMentions: Node[] = [
  {
    type: nodeTypes.typeP,
    children: [
      {
        text:
          'This example shows how you might implement a simple @-mentions feature that lets users autocomplete mentioning a user by their username. Which, in this case means Star Wars characters. The mentions are rendered as void inline elements inside the document.',
      },
    ],
  },
  {
    type: nodeTypes.typeP,
    children: [
      { text: 'Try mentioning characters, like ' },
      {
        type: nodeTypes.typeMention,
        character: 'R2-D2',
        children: [{ text: '' }],
      },
      { text: ' or ' },
      {
        type: nodeTypes.typeMention,
        character: 'Mace Windu',
        children: [{ text: '' }],
      },
      { text: '!' },
    ],
  },
];

export const initialValuePasteHtml: Node[] = [
  {
    type: nodeTypes.typeP,
    children: [
      {
        text:
          "By default, pasting content into a Slate editor will use the clipboard's ",
      },
      { text: "'text/plain'", code: true },
      {
        text:
          " data. That's okay for some use cases, but sometimes you want users to be able to paste in content and have it maintain its formatting. To do this, your editor needs to handle ",
      },
      { text: "'text/html'", code: true },
      { text: ' data. ' },
    ],
  },
  {
    type: nodeTypes.typeP,
    children: [{ text: 'This is an example of doing exactly that!' }],
  },
  {
    type: nodeTypes.typeP,
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
    type: nodeTypes.typeP,
    children: [
      {
        text:
          "By default, pasting content into a Slate editor will use the clipboard's ",
      },
      { text: "'text/plain'", code: true },
      {
        text:
          " data. That's okay for some use cases, but sometimes you want users to be able to paste in content and have it maintain its formatting. To do this, your editor needs to handle ",
      },
      { text: "'text/html'", code: true },
      { text: ' data. ' },
    ],
  },
  {
    type: nodeTypes.typeP,
    children: [{ text: 'This is an example of doing exactly that!' }],
  },
  {
    type: nodeTypes.typeP,
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
    type: nodeTypes.typeP,
    children: [
      { text: 'This is editable plain text, just like a <textarea>!' },
    ],
  },
];

export const initialValueMarks: Node[] = [
  {
    type: nodeTypes.typeP,
    children: [
      {
        text:
          'These are all the available marks. You can customize the type and component for each of these.',
      },
    ],
  },
  {
    type: nodeTypes.typeP,
    children: [
      { text: 'Bold, ', [MARK_BOLD]: true },
      { text: 'italic, ', [MARK_ITALIC]: true },
      { text: 'underline, ', [MARK_UNDERLINE]: true },
      { text: 'strikethrough, ', [MARK_STRIKETHROUGH]: true },
      {
        text: 'mixed, ',
        [MARK_BOLD]: true,
        [MARK_ITALIC]: true,
        [MARK_UNDERLINE]: true,
      },
      { text: 'code, ', [MARK_CODE]: true },
      { text: 'sub, ', [MARK_SUBSCRIPT]: true },
      { text: 'sup, ', [MARK_SUPERSCRIPT]: true },
      { text: 'highlight', [MARK_HIGHLIGHT]: true },
    ],
  },
];

export const initialValueElements: Node[] = [
  {
    type: nodeTypes.typeH1,
    children: [{ text: 'Elements' }],
  },
  {
    type: nodeTypes.typeP,
    children: [
      {
        text: 'These are the most common elements, known as blocks:',
      },
    ],
  },
  {
    type: nodeTypes.typeH1,
    children: [{ text: 'Heading 1' }],
  },
  {
    type: nodeTypes.typeH2,
    children: [{ text: 'Heading 2' }],
  },
  {
    type: nodeTypes.typeH3,
    children: [{ text: 'Heading 3' }],
  },
  {
    type: nodeTypes.typeH4,
    children: [{ text: 'Heading 4' }],
  },
  {
    type: nodeTypes.typeH5,
    children: [{ text: 'Heading 5' }],
  },
  {
    type: nodeTypes.typeH6,
    children: [{ text: 'Heading 6' }],
  },
  {
    type: nodeTypes.typeUl,
    children: [
      {
        type: nodeTypes.typeLi,
        children: [
          { type: nodeTypes.typeP, children: [{ text: 'Bulleted list' }] },
        ],
      },
    ],
  },
  {
    type: nodeTypes.typeOl,
    children: [
      {
        type: nodeTypes.typeLi,
        children: [
          { type: nodeTypes.typeP, children: [{ text: 'Numbered list' }] },
        ],
      },
    ],
  },
  {
    type: nodeTypes.typeBlockquote,
    children: [{ text: 'Blockquote' }],
  },
  {
    type: nodeTypes.typeCode,
    children: [{ text: 'Code block' }],
  },
];

export const initialValueRichText: Node[] = [
  {
    type: nodeTypes.typeH1,
    children: [{ text: 'Welcome' }],
  },
  {
    type: nodeTypes.typeP,
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
    type: nodeTypes.typeP,
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
    type: nodeTypes.typeP,
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
    type: nodeTypes.typeP,
    children: [
      { text: 'Try it out for yourself by typing in the search box above!' },
    ],
  },
];

export const initialValueTables: Node[] = [
  {
    type: nodeTypes.typeP,
    children: [
      {
        text:
          'Since the editor is based on a recursive tree model, similar to an HTML document, you can create complex nested structures, like tables:',
      },
    ],
  },
  {
    type: nodeTypes.typeTable,
    children: [
      {
        type: nodeTypes.typeTr,
        children: [
          {
            type: nodeTypes.typeTd,
            children: [{ text: '' }],
          },
          {
            type: nodeTypes.typeTd,
            children: [{ text: 'Human', bold: true }],
          },
          {
            type: nodeTypes.typeTd,
            children: [{ text: 'Dog', bold: true }],
          },
          {
            type: nodeTypes.typeTd,
            children: [{ text: 'Cat', bold: true }],
          },
        ],
      },
      {
        type: nodeTypes.typeTr,
        children: [
          {
            type: nodeTypes.typeTd,
            children: [{ text: '# of Feet', bold: true }],
          },
          {
            type: nodeTypes.typeTd,
            children: [{ text: '2' }],
          },
          {
            type: nodeTypes.typeTd,
            children: [{ text: '4' }],
          },
          {
            type: nodeTypes.typeTd,
            children: [{ text: '4' }],
          },
        ],
      },
      {
        type: nodeTypes.typeTr,
        children: [
          {
            type: nodeTypes.typeTd,
            children: [{ text: '# of Lives', bold: true }],
          },
          {
            type: nodeTypes.typeTd,
            children: [{ text: '1' }],
          },
          {
            type: nodeTypes.typeTd,
            children: [{ text: '1' }],
          },
          {
            type: nodeTypes.typeTd,
            children: [{ text: '9' }],
          },
        ],
      },
    ],
  },
  {
    type: nodeTypes.typeP,
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
    type: nodeTypes.typeP,
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
    type: nodeTypes.typeH2,
    children: [
      {
        text: 'This is a normal Heading 2',
      },
    ],
  },
  {
    type: nodeTypes.typeH2,
    children: [
      {
        text: 'This is a Heading 2\nwith a soft break',
      },
    ],
  },
];
