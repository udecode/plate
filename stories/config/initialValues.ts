import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_IMAGE,
  ELEMENT_LI,
  ELEMENT_LINK,
  ELEMENT_MEDIA_EMBED,
  ELEMENT_MENTION,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TODO_LI,
  ELEMENT_TR,
  ELEMENT_UL,
  MARK_BOLD,
  MARK_CODE,
  MARK_HIGHLIGHT,
  MARK_ITALIC,
  MARK_KBD,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
  SlateDocument,
  SlateDocumentFragment,
} from '@udecode/slate-plugins';
// import faker from 'faker';
import { Descendant, Node } from 'slate';
import { EDITABLE_VOID } from '../examples/editable-voids/defaults';
import { ELEMENT_TAG } from '../examples/tag/defaults';
import { options } from './pluginOptions';
import { createList, createParagraph, getNodesWithRandomId } from './utils';

export const initialValueEmbeds: SlateDocument = [
  {
    children: [
      {
        type: options[ELEMENT_H2].type,
        children: [
          {
            text: '🎥 Media Embed',
          },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text:
              'In addition to simple image nodes, you can actually create complex embedded nodes. For example, this one contains an input element that lets you change the video being rendered!',
          },
        ],
      },
      {
        type: options[ELEMENT_MEDIA_EMBED].type,
        url: 'https://player.vimeo.com/video/26689853',
        children: [{ text: '' }],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
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
        type: options[ELEMENT_H1].type,
        children: [{ text: '👮 Title' }],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text:
              'This example shows how to enforce your layout with domain-specific constraints. This document will always have a title block at the top and a trailing paragraph. Try deleting them and see what happens!',
          },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
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
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text:
              'This example shows how you can make a hovering menu appear above ' +
              'your content, which you can use to make text ',
          },
          { text: 'bold', [options[MARK_BOLD].type]: true },
          { text: ', ' },
          { text: 'italic', [options[MARK_ITALIC].type]: true },
          { text: ', or anything else you might want to do!' },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          { text: 'Try it out yourself! Just ' },
          {
            text: 'select any piece of text and the menu will appear',
            [options[MARK_BOLD].type]: true,
          },
          { text: '.' },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
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

const lorem =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum';

for (let h = 0; h < HEADINGS; h++) {
  (initialValueHugeDocument[0] as any).children.push({
    type: options[ELEMENT_H1].type,
    // children: [{ text: faker.lorem.sentence() }],
    children: [{ text: lorem }],
  });

  for (let p = 0; p < PARAGRAPHS; p++) {
    (initialValueHugeDocument[0] as any).children.push({
      type: options[ELEMENT_PARAGRAPH].type,
      children: [{ text: lorem }],
    });
  }
}

export const initialValueImages: SlateDocument = [
  {
    children: [
      {
        type: options[ELEMENT_H2].type,
        children: [
          {
            text: '📷 Image',
          },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text:
              'In addition to nodes that contain editable text, you can also create other types of nodes, like images or videos.',
          },
        ],
      },
      {
        type: options[ELEMENT_IMAGE].type,
        url: 'https://source.unsplash.com/kFrdX5IeQzI',
        children: [{ text: '' }],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text:
              'This example shows images in action. It features two ways to add images. You can either add an image via the toolbar icon above, or if you want in on a little secret, copy an image URL to your keyboard and paste it anywhere in the editor! Additionally, you can customize the toolbar button to load an url asynchronously, for example showing a file picker and uploading a file to Amazon S3.',
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
        type: options[ELEMENT_H2].type,
        children: [
          {
            text: '🔗 Link',
          },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text:
              'In addition to block nodes, you can create inline nodes, like ',
          },
          {
            type: options[ELEMENT_LINK].type,
            url: 'https://en.wikipedia.org/wiki/Hypertext',
            children: [{ text: 'hyperlinks' }],
          },
          {
            text: '!',
          },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
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
        type: options[ELEMENT_H1].type,
        children: [
          {
            text: '👀 Preview Markdown',
          },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text:
              'Slate is flexible enough to add **decorations** that can format text based on its content. For example, this editor has **Markdown** preview decorations on it, to make it _dead_ simple to make an editor with built-in `Markdown` previewing.',
          },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [{ text: '- List.' }],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [{ text: '> Blockquote.' }],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [{ text: '---' }],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [{ text: '## Try it out!' }],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [{ text: 'Try it out for yourself!' }],
      },
    ],
  },
];

export const initialValueAutoformat: any[] = [
  {
    children: [
      {
        type: options[ELEMENT_H1].type,
        children: [
          {
            text: '🏃‍♀️ Autoformat',
          },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text:
              "The editor gives you full control over the logic you can add. For example, it's fairly common to want to add markdown-like shortcuts to editors.",
          },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text: 'While typing:',
          },
        ],
      },
      ...createList(
        [
          'Type /**/ or /__/ on either side of your text followed by /space/ to **bold**.',
          'Type /*/ or /_/ on either side of your text followed by /space/ to *italicize*.',
          'Type /`/ on either side of your text followed by /space/ to create `inline code`.',
          'Type /~~/ on either side of your text followed by /space/ to ~~strikethrough~~.',
          'Type /```/ to create a code block below.',
        ],
        {
          splitSeparator: '/',
        }
      ),
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text:
              'At the beginning of any new block or existing block, try these:',
          },
        ],
      },
      ...createList(
        [
          'Type /*/, /-/ or /+/ followed by /space/ to create a bulleted list.',
          // "Type /[]/ to create a to-do checkbox. (There's no /space/ in between.)",
          'Type /1./ or /1)/ followed by /space/ to create a numbered list.',
          'Type />/ followed by /space/ to create a block quote.',
          'Type /```/ to create a code block.',
          'Type /#/ followed by /space/ to create an H1 heading.',
          'Type /##/ followed by /space/ to create an H2 sub-heading.',
          'Type /###/ followed by /space/ to create an H3 sub-heading.',
          'Type /####/ followed by /space/ to create an H4 sub-heading.',
          'Type /#####/ followed by /space/ to create an H5 sub-heading.',
          'Type /######/ followed by /space/ to create an H6 sub-heading.',
        ],
        { splitSeparator: '/' }
      ),
    ],
  },
];

export const initialValueMentions: SlateDocument = [
  {
    children: [
      {
        type: options[ELEMENT_H2].type,
        children: [
          {
            text: '💬 Mention',
          },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text:
              'This example shows how you might implement a simple @-mentions feature that lets users autocomplete mentioning a user by their username. Which, in this case means Star Wars characters. The mentions are rendered as void inline elements inside the document.',
          },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          { text: 'Try mentioning characters, like ' },
          {
            type: options[ELEMENT_MENTION].type,
            value: '289',
            children: [{ text: '' }],
          },
          { text: ' or ' },
          {
            type: options[ELEMENT_MENTION].type,
            value: '224',
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
        type: options[ELEMENT_H1].type,
        children: [
          {
            text: '🍪 Deserialize HTML',
          },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
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
        type: options[ELEMENT_PARAGRAPH].type,
        children: [{ text: 'This is an example of doing exactly that!' }],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
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
        type: options[ELEMENT_H1].type,
        children: [
          {
            text: '🍩 Deserialize Markdown',
          },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
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
        type: options[ELEMENT_PARAGRAPH].type,
        children: [{ text: 'This is an example of doing exactly that!' }],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text:
              'Try it out for yourself! Copy and paste Markdown content from ',
          },
          {
            type: options[ELEMENT_LINK].type,
            url: 'https://markdown-it.github.io/',
            children: [{ text: 'https://markdown-it.github.io/' }],
          },
          { text: '' },
        ],
      },
    ],
  },
];

export const initialValuePlainText: SlateDocument = [
  {
    children: [
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text:
              'This is editable plain text without plugins, just like a <textarea>!',
          },
        ],
      },
    ],
  },
];

export const initialValueCombobox: SlateDocument = [
  {
    children: [
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          { text: 'Example using useCombobox from downshift with # trigger: ' },
          { type: ELEMENT_TAG, children: [{ text: '' }], value: 'tag' },
          { text: '' },
        ],
      },
    ],
  },
];

export const initialValueBasicMarks: SlateDocument = [
  {
    children: [
      {
        type: options[ELEMENT_H1].type,
        children: [
          {
            text: '💅 Marks',
          },
        ],
      },
      {
        type: options[ELEMENT_H2].type,
        children: [
          {
            text: '💧 Basic Marks',
          },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text:
              'The basic marks consist of text formatting such as bold, italic, underline, strikethrough, subscript, superscript, and code.',
          },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text:
              'You can customize the type, the component and the hotkey for each of these.',
          },
        ],
      },
      createParagraph('This text is bold.', options[MARK_BOLD].type),
      createParagraph('This text is italic.', options[MARK_ITALIC].type),
      createParagraph('This text is underlined.', options[MARK_UNDERLINE].type),
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text: 'This text is bold, italic and underlined.',
            [options[MARK_BOLD].type]: true,
            [options[MARK_ITALIC].type]: true,
            [options[MARK_UNDERLINE].type]: true,
          },
        ],
      },
      createParagraph(
        'This is a strikethrough text.',
        options[MARK_STRIKETHROUGH].type
      ),
      createParagraph('This is an inline code.', options[MARK_CODE].type),
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          { text: 'These are ' },
          { text: 'a subscript', [options[MARK_SUBSCRIPT].type]: true },
          { text: ' and ' },
          { text: 'a superscript', [options[MARK_SUPERSCRIPT].type]: true },
          { text: '.' },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          { text: 'You can also press ' },
          { text: 'Super + B', [options[MARK_KBD].type]: true },
          { text: ' to mark selected text bold or ' },
          { text: 'Super + I', [options[MARK_KBD].type]: true },
          { text: ' to mark it italic.' },
        ],
      },
      createParagraph('There are many other keyboard shortcuts.'),
    ] as any,
  },
];

export const initialValueHighlight: SlateDocument = [
  {
    children: [
      {
        type: options[ELEMENT_H2].type,
        children: [
          {
            text: '🌈 Highlight',
          },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text: 'The Highlight plugin enables support for ',
          },
          {
            text: 'highlights',
            [options[MARK_HIGHLIGHT].type]: true,
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
        type: options[ELEMENT_H1].type,
        children: [{ text: '🧱 Elements' }],
      },
      {
        type: options[ELEMENT_H2].type,
        children: [{ text: '🔥 Basic Elements' }],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text: 'These are the most common elements, known as blocks:',
          },
        ],
      },
      {
        type: options[ELEMENT_H1].type,
        children: [{ text: 'Heading 1' }],
      },
      {
        type: options[ELEMENT_H2].type,
        children: [{ text: 'Heading 2' }],
      },
      {
        type: options[ELEMENT_H3].type,
        children: [{ text: 'Heading 3' }],
      },
      {
        type: options[ELEMENT_H4].type,
        children: [{ text: 'Heading 4' }],
      },
      {
        type: options[ELEMENT_H5].type,
        children: [{ text: 'Heading 5' }],
      },
      {
        type: options[ELEMENT_H6].type,
        children: [{ text: 'Heading 6' }],
      },
      {
        type: options[ELEMENT_BLOCKQUOTE].type,
        children: [{ text: 'Blockquote' }],
      },
      {
        type: options[ELEMENT_CODE_BLOCK].type,
        children: [
          {
            type: options[ELEMENT_CODE_LINE].type,
            children: [
              {
                text: "const a = 'Hello';",
              },
            ],
          },
          {
            type: options[ELEMENT_CODE_LINE].type,
            children: [
              {
                text: "const b = 'World';",
              },
            ],
          },
        ],
      },
    ],
  },
];

export const initialValueList: SlateDocument = [
  {
    children: [
      {
        type: options[ELEMENT_H2].type,
        children: [{ text: '✍️ List' }],
      },
      { type: options[ELEMENT_PARAGRAPH].type, children: [{ text: '' }] },
      {
        type: options[ELEMENT_UL].type,
        children: [
          {
            type: options[ELEMENT_LI].type,
            children: [
              {
                type: options[ELEMENT_PARAGRAPH].type,
                children: [{ text: 'Bulleted list' }],
              },
              {
                type: options[ELEMENT_UL].type,
                children: [
                  {
                    type: options[ELEMENT_LI].type,
                    children: [
                      {
                        type: options[ELEMENT_PARAGRAPH].type,
                        children: [{ text: 'support' }],
                      },
                      {
                        type: options[ELEMENT_UL].type,
                        children: [
                          {
                            type: options[ELEMENT_LI].type,
                            children: [
                              {
                                type: options[ELEMENT_PARAGRAPH].type,
                                children: [{ text: 'a' }],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: options[ELEMENT_LI].type,
                    children: [
                      {
                        type: options[ELEMENT_PARAGRAPH].type,
                        children: [{ text: 'nesting' }],
                      },
                      {
                        type: options[ELEMENT_UL].type,
                        children: [
                          {
                            type: options[ELEMENT_LI].type,
                            children: [
                              {
                                type: options[ELEMENT_PARAGRAPH].type,
                                children: [{ text: 'b' }],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: options[ELEMENT_LI].type,
            children: [
              {
                type: options[ELEMENT_PARAGRAPH].type,
                children: [{ text: 'c' }],
              },
            ],
          },
        ],
      },
      {
        type: options[ELEMENT_OL].type,
        children: [
          {
            type: options[ELEMENT_LI].type,
            children: [
              {
                type: options[ELEMENT_PARAGRAPH].type,
                children: [{ text: 'Numbered list' }],
              },
            ],
          },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text:
              'With Slate you can build complex block types that have their own embedded content and behaviors, like rendering checkboxes inside check list items!',
          },
        ],
      },
      {
        type: options[ELEMENT_TODO_LI].type,
        checked: true,
        children: [{ text: 'Slide to the left.' }],
      },
      {
        type: options[ELEMENT_TODO_LI].type,
        checked: true,
        children: [{ text: 'Slide to the right.' }],
      },
      {
        type: options[ELEMENT_TODO_LI].type,
        checked: false,
        children: [{ text: 'Criss-cross.' }],
      },
      {
        type: options[ELEMENT_TODO_LI].type,
        checked: true,
        children: [{ text: 'Criss-cross!' }],
      },
      {
        type: options[ELEMENT_TODO_LI].type,
        checked: false,
        children: [{ text: 'Cha cha real smooth…' }],
      },
      {
        type: options[ELEMENT_TODO_LI].type,
        checked: false,
        children: [{ text: "Let's go to work!" }],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [{ text: 'Try it out for yourself!' }],
      },
    ],
  },
];

export const initialValueSearchHighlighting: SlateDocument = [
  {
    children: [
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text:
              'This is editable text that you can search. As you search, it looks for matching strings of text, and adds ',
          },
          { text: 'decorations', [options[MARK_BOLD].type]: true },
          { text: ' to them in realtime.' },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
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
  type: options[ELEMENT_TABLE].type,
  children: [
    {
      type: options[ELEMENT_TR].type,
      children: [
        {
          type: options[ELEMENT_TD].type,
          children: [createParagraph('')],
        },
        {
          type: options[ELEMENT_TD].type,
          children: [createParagraph('Human', options[MARK_BOLD].type)],
        },
        {
          type: options[ELEMENT_TD].type,
          children: [createParagraph('Dog', options[MARK_BOLD].type)],
        },
        {
          type: options[ELEMENT_TD].type,
          children: [createParagraph('Cat', options[MARK_BOLD].type)],
        },
      ],
    },
    {
      type: options[ELEMENT_TR].type,
      children: [
        {
          type: options[ELEMENT_TD].type,
          children: [createParagraph('# of Feet', options[MARK_BOLD].type)],
        },
        {
          type: options[ELEMENT_TD].type,
          children: [createParagraph('2')],
        },
        {
          type: options[ELEMENT_TD].type,
          children: [createParagraph('4')],
        },
        {
          type: options[ELEMENT_TD].type,
          children: [createParagraph('4')],
        },
      ],
    },
    {
      type: options[ELEMENT_TR].type,
      children: [
        {
          type: options[ELEMENT_TD].type,
          children: [createParagraph('# of Lives', options[MARK_BOLD].type)],
        },
        {
          type: options[ELEMENT_TD].type,
          children: [createParagraph('1')],
        },
        {
          type: options[ELEMENT_TD].type,
          children: [createParagraph('1')],
        },
        {
          type: options[ELEMENT_TD].type,
          children: [createParagraph('9')],
        },
      ],
    },
  ],
});

const createSpanningTable = () => ({
  type: options[ELEMENT_TABLE].type,
  children: [
    {
      type: options[ELEMENT_TR].type,
      children: [
        {
          type: options[ELEMENT_TH].type,
          attributes: { colspan: '2' },
          children: [createParagraph('Heading', options[MARK_BOLD].type)],
        },
      ],
    },
    {
      type: options[ELEMENT_TR].type,
      children: [
        {
          type: options[ELEMENT_TD].type,
          children: [createParagraph('Cell 1', options[MARK_BOLD].type)],
        },
        {
          type: options[ELEMENT_TD].type,
          children: [createParagraph('Cell 2')],
        },
      ],
    },
  ],
});

export const initialValueTables: SlateDocument = [
  {
    children: [
      {
        type: options[ELEMENT_H2].type,
        children: [
          {
            text: '🏓 Table',
          },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text:
              'Since the editor is based on a recursive tree model, similar to an HTML document, you can create complex nested structures, like tables:',
          },
        ],
      },
      createTable(),
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text:
              "This table is just a basic example of rendering a table, and it doesn't have fancy functionality. But you could augment it to add support for navigating with arrow keys, displaying table headers, adding column and rows, or even formulas if you wanted to get really crazy!",
          },
        ],
      },
      createSpanningTable(),
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text:
              'This table is an example of rendering a table spanning multiple columns.',
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
        type: options[ELEMENT_H1].type,
        children: [{ text: '🍦 Soft Break ⇧⏎' }],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
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
        type: options[ELEMENT_BLOCKQUOTE].type,
        children: [{ text: 'Try here ⏎' }],
      },
      {
        type: options[ELEMENT_CODE_BLOCK].type,
        children: [{ text: 'And ⏎ here.' }],
      },
    ] as SlateDocumentFragment,
  },
];

export const initialValueExitBreak: SlateDocument = [
  {
    children: [
      {
        type: options[ELEMENT_H1].type,
        children: [{ text: '⏎ Exit Break ⏎' }],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
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
        type: options[ELEMENT_BLOCKQUOTE].type,
        children: [{ text: 'Try here ⌘⏎' }],
      },
      {
        type: options[ELEMENT_CODE_BLOCK].type,
        children: [{ text: 'And in the middle ⌘⏎ of the block.' }],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [{ text: 'It also works for nested blocks:' }],
      },
      createTable(),
    ] as SlateDocumentFragment,
  },
];

export const initialValueVoids: Node[] = [
  {
    children: [
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text:
              'In addition to nodes that contain editable text, you can insert void nodes, which can also contain editable elements, inputs, or an entire other Slate editor.',
          },
        ],
      },
      {
        type: EDITABLE_VOID,
        children: [{ text: '' }],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text: '',
          },
        ],
      },
    ],
  },
];

export const initialValueIframe: Node[] = [
  {
    children: [
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text:
              'In this example, the document gets rendered into a controlled ',
          },
          { text: '<iframe>', [MARK_CODE]: true },
          {
            text: '. This is ',
          },
          {
            text: 'particularly',
            [MARK_ITALIC]: true,
          },
          {
            text:
              ' useful, when you need to separate the styles for your editor contents from the ones addressing your UI.',
          },
        ],
      },
      {
        type: options[ELEMENT_PARAGRAPH].type,
        children: [
          {
            text: 'This also the only reliable method to preview any ',
          },
          {
            text: 'media queries',
            [MARK_BOLD]: true,
          },
          {
            text: ' in your CSS.',
          },
        ],
      },
    ],
  },
];

export const initialValuePlayground: Node[] = getNodesWithRandomId([
  ...initialValueForcedLayout,
  ...initialValueBasicMarks,
  ...initialValueHighlight,
  ...initialValueBasicElements,
  ...initialValueList,
  ...initialValueTables,
  ...initialValueLinks,
  ...initialValueMentions,
  ...initialValueImages,
  ...initialValueEmbeds,
  ...initialValueAutoformat,
  ...initialValueSoftBreak,
  ...initialValueExitBreak,
  ...initialValuePasteHtml,
]);
