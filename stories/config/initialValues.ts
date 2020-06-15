import faker from 'faker';
import { Descendant } from 'slate';
import {
  ACTION_ITEM,
  BLOCKQUOTE,
  CODE_BLOCK,
  HeadingType,
  IMAGE,
  LINK,
  ListType,
  MARK_BOLD,
  MARK_CODE,
  MARK_HIGHLIGHT,
  MARK_ITALIC,
  MARK_SEARCH_HIGHLIGHT,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
  MEDIA_EMBED,
  MENTION,
  PARAGRAPH,
  SlateDocument,
  SlateDocumentDescendant,
  SlateDocumentFragment,
  TableType,
} from '../../packages/slate-plugins/src';

export const headingTypes = [
  HeadingType.H1,
  HeadingType.H2,
  HeadingType.H3,
  HeadingType.H4,
  HeadingType.H5,
  HeadingType.H6,
];

export const nodeTypes = {
  // elements
  typeP: PARAGRAPH,
  typeMention: MENTION,
  typeBlockquote: BLOCKQUOTE,
  typeCodeBlock: CODE_BLOCK,
  typeLink: LINK,
  typeImg: IMAGE,
  typeMediaEmbed: MEDIA_EMBED,
  typeActionItem: ACTION_ITEM,
  typeTable: TableType.TABLE,
  typeTr: TableType.ROW,
  typeTd: TableType.CELL,
  typeTh: TableType.HEAD,
  typeUl: ListType.UL,
  typeOl: ListType.OL,
  typeLi: ListType.LI,
  typeH1: HeadingType.H1,
  typeH2: HeadingType.H2,
  typeH3: HeadingType.H3,
  typeH4: HeadingType.H4,
  typeH5: HeadingType.H5,
  typeH6: HeadingType.H6,
  // marks
  typeBold: MARK_BOLD,
  typeItalic: MARK_ITALIC,
  typeUnderline: MARK_UNDERLINE,
  typeStrikethrough: MARK_STRIKETHROUGH,
  typeCode: MARK_CODE,
  typeSubscript: MARK_SUBSCRIPT,
  typeSuperscript: MARK_SUPERSCRIPT,
  typeHighlight: MARK_HIGHLIGHT,
  typeSearchHighlight: MARK_SEARCH_HIGHLIGHT,
};

export const createList = (items: string[]): SlateDocumentFragment => {
  const children = items.map(
    (item): SlateDocumentDescendant => ({
      type: nodeTypes.typeLi,
      children: [
        {
          type: nodeTypes.typeP,
          children: [
            {
              text: item,
            },
          ],
        },
      ],
    })
  ) as SlateDocumentFragment;

  return [
    {
      type: nodeTypes.typeUl,
      children,
    },
  ];
};

export const initialValueEmbeds: SlateDocument = [
  {
    children: [
      {
        type: nodeTypes.typeH2,
        children: [
          {
            text: '🎥 Media Embed',
          },
        ],
      },
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
        type: nodeTypes.typeMediaEmbed,
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
    ],
  },
];

export const initialValueForcedLayout: SlateDocument = [
  {
    children: [
      {
        type: nodeTypes.typeH1,
        children: [{ text: '👮 Title' }],
      },
      {
        type: nodeTypes.typeP,
        children: [
          {
            text:
              'This example shows how to enforce your layout with domain-specific constraints. This document will always have a title block at the top and a trailing paragraph. Try deleting them and see what happens!',
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
    ],
  },
];

export const initialValueBalloonToolbar: SlateDocument = [
  {
    children: [
      {
        type: nodeTypes.typeP,
        children: [
          {
            text:
              'This example shows how you can make a hovering menu appear above ' +
              'your content, which you can use to make text ',
          },
          { text: 'bold', [nodeTypes.typeBold]: true },
          { text: ', ' },
          { text: 'italic', [nodeTypes.typeItalic]: true },
          { text: ', or anything else you might want to do!' },
        ],
      },
      {
        type: nodeTypes.typeP,
        children: [
          { text: 'Try it out yourself! Just ' },
          {
            text: 'select any piece of text and the menu will appear',
            [nodeTypes.typeBold]: true,
          },
          { text: '.' },
        ],
      },
      {
        type: nodeTypes.typeP,
        children: [
          {
            text:
              'You can enable and customize the tooltip on each toolbar button. ' +
              'Check Tippy.js documentation for more info!',
          },
        ],
      },
    ],
  },
];

const HEADINGS = 100;
const PARAGRAPHS = 7;
export const initialValueHugeDocument: Descendant[] = [{ children: [] }];

for (let h = 0; h < HEADINGS; h++) {
  (initialValueHugeDocument[0] as any).children.push({
    type: nodeTypes.typeH1,
    children: [{ text: faker.lorem.sentence() }],
  });

  for (let p = 0; p < PARAGRAPHS; p++) {
    (initialValueHugeDocument[0] as any).children.push({
      type: nodeTypes.typeP,
      children: [{ text: faker.lorem.paragraph() }],
    });
  }
}

export const initialValueImages: SlateDocument = [
  {
    children: [
      {
        type: nodeTypes.typeH2,
        children: [
          {
            text: '📷 Image',
          },
        ],
      },
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
    ],
  },
];

export const initialValueLinks: SlateDocument = [
  {
    children: [
      {
        type: nodeTypes.typeH2,
        children: [
          {
            text: '🔗 Link',
          },
        ],
      },
      {
        type: nodeTypes.typeP,
        children: [
          {
            text:
              'In addition to block nodes, you can create inline nodes, like ',
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
    ],
  },
];

export const initialValuePreview: SlateDocument = [
  {
    children: [
      {
        type: nodeTypes.typeH1,
        children: [
          {
            text: '👀 Preview Markdown',
          },
        ],
      },
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
    ],
  },
];

export const initialValueAutoformat: SlateDocument = [
  {
    children: [
      {
        type: nodeTypes.typeH1,
        children: [
          {
            text: '🏃‍♀️ Autoformat',
          },
        ],
      },
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
        type: nodeTypes.typeP,
        children: [
          {
            text:
              'Try it out for yourself! Try starting a new line with ">", "-", "1." or "#"s.',
          },
        ],
      },
    ],
  },
];

export const initialValueMentions: SlateDocument = [
  {
    children: [
      {
        type: nodeTypes.typeH2,
        children: [
          {
            text: '💬 Mention',
          },
        ],
      },
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
            value: 'R2-D2',
            children: [{ text: '' }],
          },
          { text: ' or ' },
          {
            type: nodeTypes.typeMention,
            value: 'Mace Windu',
            children: [{ text: '' }],
          },
          { text: '!' },
        ],
      },
    ],
  },
];

export const initialValuePasteHtml: SlateDocument = [
  {
    children: [
      {
        type: nodeTypes.typeH1,
        children: [
          {
            text: '🍪 Deserialize HTML',
          },
        ],
      },
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
    ],
  },
];

export const initialValuePasteMd: SlateDocument = [
  {
    children: [
      {
        type: nodeTypes.typeH1,
        children: [
          {
            text: '🍩 Deserialize Markdown',
          },
        ],
      },
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
    ],
  },
];

export const initialValuePlainText: SlateDocument = [
  {
    children: [
      {
        type: nodeTypes.typeP,
        children: [
          { text: 'This is editable plain text, just like a <textarea>!' },
        ],
      },
    ],
  },
];

export const initialValueBasicMarks: SlateDocument = [
  {
    children: [
      {
        type: nodeTypes.typeH1,
        children: [
          {
            text: '💅 Marks',
          },
        ],
      },
      {
        type: nodeTypes.typeH2,
        children: [
          {
            text: '💧 Basic Marks',
          },
        ],
      },
      {
        type: nodeTypes.typeP,
        children: [
          {
            text:
              'These are the basic marks. You can customize the type and component for each of these.',
          },
        ],
      },
      {
        type: nodeTypes.typeP,
        children: [
          { text: 'Bold, ', [nodeTypes.typeBold]: true },
          { text: 'italic, ', [nodeTypes.typeItalic]: true },
          { text: 'underline, ', [nodeTypes.typeUnderline]: true },
          { text: 'strikethrough, ', [nodeTypes.typeStrikethrough]: true },
          {
            text: 'mixed, ',
            [nodeTypes.typeBold]: true,
            [nodeTypes.typeItalic]: true,
            [nodeTypes.typeUnderline]: true,
          },
          { text: 'code, ', [nodeTypes.typeCode]: true },
          { text: 'sub, ', [nodeTypes.typeSubscript]: true },
          { text: 'sup, ', [nodeTypes.typeSuperscript]: true },
        ],
      },
    ],
  },
];

export const initialValueHighlight: SlateDocument = [
  {
    children: [
      {
        type: nodeTypes.typeH2,
        children: [
          {
            text: '🌈 Highlight',
          },
        ],
      },
      {
        type: nodeTypes.typeP,
        children: [
          {
            text: 'The Highlight plugin enables support for ',
          },
          {
            text: 'highlights',
            [nodeTypes.typeHighlight]: true,
          },
          {
            text:
              ', useful when reviewing content or highlighting it for future reference.',
          },
        ],
      },
    ],
  },
];

export const initialValueBasicElements: SlateDocument = [
  {
    children: [
      {
        type: nodeTypes.typeH1,
        children: [{ text: '🧱 Elements' }],
      },
      {
        type: nodeTypes.typeH2,
        children: [{ text: '🔥 Basic Elements' }],
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
        type: nodeTypes.typeBlockquote,
        children: [{ text: 'Blockquote' }],
      },
      {
        type: nodeTypes.typeCodeBlock,
        children: [{ text: 'Code block' }],
      },
    ],
  },
];

export const initialValueList: SlateDocument = [
  {
    children: [
      {
        type: nodeTypes.typeH2,
        children: [{ text: '✍️ List' }],
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
    ],
  },
];

export const initialValueSearchHighlighting: SlateDocument = [
  {
    children: [
      {
        type: nodeTypes.typeP,
        children: [
          {
            text:
              'This is editable text that you can search. As you search, it looks for matching strings of text, and adds ',
          },
          { text: 'decorations', [nodeTypes.typeBold]: true },
          { text: ' to them in realtime.' },
        ],
      },
      {
        type: nodeTypes.typeP,
        children: [
          {
            text: 'Try it out for yourself by typing in the search box above!',
          },
        ],
      },
    ],
  },
];

const createTable = () => ({
  type: nodeTypes.typeTable,
  children: [
    {
      type: nodeTypes.typeTr,
      children: [
        {
          type: nodeTypes.typeTh,
          children: [{ text: '' }],
        },
        {
          type: nodeTypes.typeTh,
          children: [{ text: 'Human', [nodeTypes.typeBold]: true }],
        },
        {
          type: nodeTypes.typeTh,
          children: [{ text: 'Dog', [nodeTypes.typeBold]: true }],
        },
        {
          type: nodeTypes.typeTh,
          children: [{ text: 'Cat', [nodeTypes.typeBold]: true }],
        },
      ],
    },
    {
      type: nodeTypes.typeTr,
      children: [
        {
          type: nodeTypes.typeTd,
          children: [{ text: '# of Feet', [nodeTypes.typeBold]: true }],
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
          children: [{ text: '# of Lives', [nodeTypes.typeBold]: true }],
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
});

export const initialValueTables: SlateDocument = [
  {
    children: [
      {
        type: nodeTypes.typeH2,
        children: [
          {
            text: '🏓 Table',
          },
        ],
      },
      {
        type: nodeTypes.typeP,
        children: [
          {
            text:
              'Since the editor is based on a recursive tree model, similar to an HTML document, you can create complex nested structures, like tables:',
          },
        ],
      },
      createTable(),
      {
        type: nodeTypes.typeP,
        children: [
          {
            text:
              "This table is just a basic example of rendering a table, and it doesn't have fancy functionality. But you could augment it to add support for navigating with arrow keys, displaying table headers, adding column and rows, or even formulas if you wanted to get really crazy!",
          },
        ],
      },
    ] as SlateDocumentFragment,
  },
];

export const initialValueSoftBreak: SlateDocument = [
  {
    children: [
      {
        type: nodeTypes.typeH1,
        children: [{ text: '🍦 Soft Break ⇧⏎' }],
      },
      {
        type: nodeTypes.typeP,
        children: [
          {
            text: 'You can define a set of rules with:',
          },
        ],
      },
      ...createList([
        'hotkey – e.g. press ⇧⏎ anywhere to insert a soft break 👇',
        'query – filter the block types where the rule applies, e.g. pressing ⏎ will insert a soft break only inside block quotes and code blocks.',
      ]),
      {
        type: nodeTypes.typeBlockquote,
        children: [{ text: 'Try here ⏎' }],
      },
      {
        type: nodeTypes.typeCodeBlock,
        children: [{ text: 'And ⏎ here.' }],
      },
    ] as SlateDocumentFragment,
  },
];

export const initialValueExitBreak: SlateDocument = [
  {
    children: [
      {
        type: nodeTypes.typeH1,
        children: [{ text: '⏎ Exit Break ⏎' }],
      },
      {
        type: nodeTypes.typeP,
        children: [
          {
            text: 'You can define a set of rules with:',
          },
        ],
      },
      ...createList([
        'hotkey – e.g. press ⌘⏎ to exit to the next block 👇',
        'query – Filter the block types where the rule applies.',
        'level – Path level where the exit is.',
        'before – If true, exit to the previous block. e.g. press ⇧⌘⏎ to exit before the selected block 👆',
      ]),
      {
        type: nodeTypes.typeBlockquote,
        children: [{ text: 'Try here ⌘⏎' }],
      },
      {
        type: nodeTypes.typeCodeBlock,
        children: [{ text: 'And in the middle ⌘⏎ of the block.' }],
      },
      {
        type: nodeTypes.typeP,
        children: [{ text: 'It also works for nested blocks:' }],
      },
      createTable(),
    ] as SlateDocumentFragment,
  },
];
