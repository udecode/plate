import {
  DEFAULTS_ALIGN,
  DEFAULTS_BLOCKQUOTE,
  DEFAULTS_BOLD,
  DEFAULTS_CODE,
  DEFAULTS_CODE_BLOCK,
  DEFAULTS_HEADING,
  DEFAULTS_HIGHLIGHT,
  DEFAULTS_IMAGE,
  DEFAULTS_ITALIC,
  DEFAULTS_KBD,
  DEFAULTS_LINK,
  DEFAULTS_LIST,
  DEFAULTS_MEDIA_EMBED,
  DEFAULTS_MENTION,
  DEFAULTS_PARAGRAPH,
  DEFAULTS_SEARCH_HIGHLIGHT,
  DEFAULTS_STRIKETHROUGH,
  DEFAULTS_SUBSUPSCRIPT,
  DEFAULTS_TABLE,
  DEFAULTS_TODO_LIST,
  DEFAULTS_UNDERLINE,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
  ResetBlockTypePluginOptions,
  setDefaults,
  SlateDocument,
  SlateDocumentDescendant,
  SlateDocumentFragment,
} from '@udecode/slate-plugins';
// import faker from 'faker';
import { Descendant, Text } from 'slate';
import { DEFAULTS_TAG } from '../examples/tag/defaults';

export const headingTypes = [
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
];

export const headingOptions = {
  ...DEFAULTS_HEADING,
  h1: {
    ...DEFAULTS_HEADING.h1,
    hotkey: ['mod+opt+1', 'mod+shift+1'],
  },
  h2: {
    ...DEFAULTS_HEADING.h2,
    hotkey: ['mod+opt+2', 'mod+shift+2'],
  },
  h3: {
    ...DEFAULTS_HEADING.h3,
    hotkey: ['mod+opt+3', 'mod+shift+3'],
  },
};

export const options = {
  ...setDefaults(DEFAULTS_PARAGRAPH, {}),
  ...setDefaults(DEFAULTS_MENTION, {}),
  ...setDefaults(DEFAULTS_BLOCKQUOTE, {}),
  ...setDefaults(DEFAULTS_CODE_BLOCK, {}),
  ...setDefaults(DEFAULTS_LINK, {}),
  ...setDefaults(DEFAULTS_IMAGE, {}),
  ...setDefaults(DEFAULTS_MEDIA_EMBED, {}),
  ...setDefaults(DEFAULTS_TODO_LIST, {}),
  ...setDefaults(DEFAULTS_TABLE, {}),
  ...setDefaults(DEFAULTS_LIST, {}),
  ...setDefaults(headingOptions, {}),
  ...setDefaults(DEFAULTS_ALIGN, {}),
  ...setDefaults(DEFAULTS_BOLD, {}),
  ...setDefaults(DEFAULTS_ITALIC, {}),
  ...setDefaults(DEFAULTS_UNDERLINE, {}),
  ...setDefaults(DEFAULTS_STRIKETHROUGH, {}),
  ...setDefaults(DEFAULTS_CODE, {}),
  ...setDefaults(DEFAULTS_KBD, {}),
  ...setDefaults(DEFAULTS_SUBSUPSCRIPT, {}),
  ...setDefaults(DEFAULTS_HIGHLIGHT, {}),
  ...setDefaults(DEFAULTS_SEARCH_HIGHLIGHT, {}),
  ...setDefaults(DEFAULTS_TAG, {}),
};

export const inlineTypes = [options.mention.type, options.link.type];

const resetBlockTypesCommonRule = {
  types: [options.blockquote.type, options.todo_li.type],
  defaultType: options.p.type,
};

export const optionsResetBlockTypes: ResetBlockTypePluginOptions = {
  rules: [
    {
      ...resetBlockTypesCommonRule,
      hotkey: 'Enter',
      predicate: isBlockAboveEmpty,
    },
    {
      ...resetBlockTypesCommonRule,
      hotkey: 'Backspace',
      predicate: isSelectionAtBlockStart,
    },
  ],
};

const createParagraph = (text: string, mark?: string) => {
  const leaf = { text };
  if (mark) {
    leaf[mark] = true;
  }

  return {
    type: options.p.type,
    children: [leaf],
  };
};

export const createList = (
  items: string[],
  { splitSeparator = '`' }: { splitSeparator?: string } = {}
): SlateDocumentFragment => {
  const children = items.map(
    (item): SlateDocumentDescendant => {
      const texts = item.split(splitSeparator);
      const marks: Text[] = texts.map((text, index) => {
        const res: any = { text };
        if (index % 2 === 1) {
          res.code = true;
        }
        return res;
      });

      return {
        type: options.li.type,
        children: [
          {
            type: options.p.type,
            children: marks,
          },
        ],
      } as any;
    }
  ) as SlateDocumentFragment;

  return [
    {
      type: options.ul.type,
      children,
    },
  ];
};

export const initialValueEmbeds: SlateDocument = [
  {
    children: [
      {
        type: options.h2.type,
        children: [
          {
            text: '🎥 Media Embed',
          },
        ],
      },
      {
        type: options.p.type,
        children: [
          {
            text:
              'In addition to simple image nodes, you can actually create complex embedded nodes. For example, this one contains an input element that lets you change the video being rendered!',
          },
        ],
      },
      {
        type: options.media_embed.type,
        url: 'https://player.vimeo.com/video/26689853',
        children: [{ text: '' }],
      },
      {
        type: options.p.type,
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
        type: options.h1.type,
        children: [{ text: '👮 Title' }],
      },
      {
        type: options.p.type,
        children: [
          {
            text:
              'This example shows how to enforce your layout with domain-specific constraints. This document will always have a title block at the top and a trailing paragraph. Try deleting them and see what happens!',
          },
        ],
      },
      {
        type: options.p.type,
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
        type: options.p.type,
        children: [
          {
            text:
              'This example shows how you can make a hovering menu appear above ' +
              'your content, which you can use to make text ',
          },
          { text: 'bold', [options.bold.type]: true },
          { text: ', ' },
          { text: 'italic', [options.italic.type]: true },
          { text: ', or anything else you might want to do!' },
        ],
      },
      {
        type: options.p.type,
        children: [
          { text: 'Try it out yourself! Just ' },
          {
            text: 'select any piece of text and the menu will appear',
            [options.bold.type]: true,
          },
          { text: '.' },
        ],
      },
      {
        type: options.p.type,
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
    type: options.h1.type,
    // children: [{ text: faker.lorem.sentence() }],
    children: [{ text: lorem }],
  });

  for (let p = 0; p < PARAGRAPHS; p++) {
    (initialValueHugeDocument[0] as any).children.push({
      type: options.p.type,
      children: [{ text: lorem }],
    });
  }
}

export const initialValueImages: SlateDocument = [
  {
    children: [
      {
        type: options.h2.type,
        children: [
          {
            text: '📷 Image',
          },
        ],
      },
      {
        type: options.p.type,
        children: [
          {
            text:
              'In addition to nodes that contain editable text, you can also create other types of nodes, like images or videos.',
          },
        ],
      },
      {
        type: options.img.type,
        url: 'https://source.unsplash.com/kFrdX5IeQzI',
        children: [{ text: '' }],
      },
      {
        type: options.p.type,
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
        type: options.h2.type,
        children: [
          {
            text: '🔗 Link',
          },
        ],
      },
      {
        type: options.p.type,
        children: [
          {
            text:
              'In addition to block nodes, you can create inline nodes, like ',
          },
          {
            type: options.link.type,
            url: 'https://en.wikipedia.org/wiki/Hypertext',
            children: [{ text: 'hyperlinks' }],
          },
          {
            text: '!',
          },
        ],
      },
      {
        type: options.p.type,
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
        type: options.h1.type,
        children: [
          {
            text: '👀 Preview Markdown',
          },
        ],
      },
      {
        type: options.p.type,
        children: [
          {
            text:
              'Slate is flexible enough to add **decorations** that can format text based on its content. For example, this editor has **Markdown** preview decorations on it, to make it _dead_ simple to make an editor with built-in `Markdown` previewing.',
          },
        ],
      },
      {
        type: options.p.type,
        children: [{ text: '- List.' }],
      },
      {
        type: options.p.type,
        children: [{ text: '> Blockquote.' }],
      },
      {
        type: options.p.type,
        children: [{ text: '---' }],
      },
      {
        type: options.p.type,
        children: [{ text: '## Try it out!' }],
      },
      {
        type: options.p.type,
        children: [{ text: 'Try it out for yourself!' }],
      },
    ],
  },
];

export const initialValueAutoformat: any[] = [
  {
    children: [
      {
        type: options.h1.type,
        children: [
          {
            text: '🏃‍♀️ Autoformat',
          },
        ],
      },
      {
        type: options.p.type,
        children: [
          {
            text:
              "The editor gives you full control over the logic you can add. For example, it's fairly common to want to add markdown-like shortcuts to editors.",
          },
        ],
      },
      {
        type: options.p.type,
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
        type: options.p.type,
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
        type: options.h2.type,
        children: [
          {
            text: '💬 Mention',
          },
        ],
      },
      {
        type: options.p.type,
        children: [
          {
            text:
              'This example shows how you might implement a simple @-mentions feature that lets users autocomplete mentioning a user by their username. Which, in this case means Star Wars characters. The mentions are rendered as void inline elements inside the document.',
          },
        ],
      },
      {
        type: options.p.type,
        children: [
          { text: 'Try mentioning characters, like ' },
          {
            type: options.mention.type,
            value: '289',
            children: [{ text: '' }],
          },
          { text: ' or ' },
          {
            type: options.mention.type,
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
        type: options.h1.type,
        children: [
          {
            text: '🍪 Deserialize HTML',
          },
        ],
      },
      {
        type: options.p.type,
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
        type: options.p.type,
        children: [{ text: 'This is an example of doing exactly that!' }],
      },
      {
        type: options.p.type,
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
        type: options.h1.type,
        children: [
          {
            text: '🍩 Deserialize Markdown',
          },
        ],
      },
      {
        type: options.p.type,
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
        type: options.p.type,
        children: [{ text: 'This is an example of doing exactly that!' }],
      },
      {
        type: options.p.type,
        children: [
          {
            text:
              'Try it out for yourself! Copy and paste Markdown content from ',
          },
          {
            type: options.link.type,
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
        type: options.p.type,
        children: [
          { text: 'This is editable plain text, just like a <textarea>!' },
        ],
      },
    ],
  },
];

export const initialValueCombobox: SlateDocument = [
  {
    children: [
      {
        type: options.p.type,
        children: [
          { text: 'Example using useCombobox from downshift with # trigger: ' },
          { type: options.tag.type, children: [{ text: '' }], value: 'tag' },
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
        type: options.h1.type,
        children: [
          {
            text: '💅 Marks',
          },
        ],
      },
      {
        type: options.h2.type,
        children: [
          {
            text: '💧 Basic Marks',
          },
        ],
      },
      {
        type: options.p.type,
        children: [
          {
            text:
              'The basic marks consist of text formatting such as bold, italic, underline, strikethrough, subscript, superscript, and code.',
          },
        ],
      },
      {
        type: options.p.type,
        children: [
          {
            text:
              'You can customize the type, the component and the hotkey for each of these.',
          },
        ],
      },
      createParagraph('This text is bold.', options.bold.type),
      createParagraph('This text is italic.', options.italic.type),
      createParagraph('This text is underlined.', options.underline.type),
      {
        type: options.p.type,
        children: [
          {
            text: 'This text is bold, italic and underlined.',
            [options.bold.type]: true,
            [options.italic.type]: true,
            [options.underline.type]: true,
          },
        ],
      },
      createParagraph(
        'This is a strikethrough text.',
        options.strikethrough.type
      ),
      createParagraph('This is an inline code.', options.code.type),
      {
        type: options.p.type,
        children: [
          { text: 'These are ' },
          { text: 'a subscript', [options.subscript.type]: true },
          { text: ' and ' },
          { text: 'a superscript', [options.superscript.type]: true },
          { text: '.' },
        ],
      },
      {
        type: options.p.type,
        children: [
          { text: 'You can also press ' },
          { text: 'Super + B', [options.kbd.type]: true },
          { text: ' to mark selected text bold or ' },
          { text: 'Super + I', [options.kbd.type]: true },
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
        type: options.h2.type,
        children: [
          {
            text: '🌈 Highlight',
          },
        ],
      },
      {
        type: options.p.type,
        children: [
          {
            text: 'The Highlight plugin enables support for ',
          },
          {
            text: 'highlights',
            [options.highlight.type]: true,
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
        type: options.h1.type,
        children: [{ text: '🧱 Elements' }],
      },
      {
        type: options.h2.type,
        children: [{ text: '🔥 Basic Elements' }],
      },
      {
        type: options.p.type,
        children: [
          {
            text: 'These are the most common elements, known as blocks:',
          },
        ],
      },
      {
        type: options.h1.type,
        children: [{ text: 'Heading 1' }],
      },
      {
        type: options.h2.type,
        children: [{ text: 'Heading 2' }],
      },
      {
        type: options.h3.type,
        children: [{ text: 'Heading 3' }],
      },
      {
        type: options.h4.type,
        children: [{ text: 'Heading 4' }],
      },
      {
        type: options.h5.type,
        children: [{ text: 'Heading 5' }],
      },
      {
        type: options.h6.type,
        children: [{ text: 'Heading 6' }],
      },
      {
        type: options.blockquote.type,
        children: [{ text: 'Blockquote' }],
      },
      {
        type: options.code_block.type,
        children: [
          {
            type: options.code_line.type,
            children: [
              {
                text: "const a = 'Hello';",
              },
            ],
          },
          {
            type: options.code_line.type,
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
        type: options.h2.type,
        children: [{ text: '✍️ List' }],
      },
      { type: options.p.type, children: [{ text: '' }] },
      {
        type: options.ul.type,
        children: [
          {
            type: options.li.type,
            children: [
              { type: options.p.type, children: [{ text: 'Bulleted list' }] },
              {
                type: options.ul.type,
                children: [
                  {
                    type: options.li.type,
                    children: [
                      {
                        type: options.p.type,
                        children: [{ text: 'support' }],
                      },
                      {
                        type: options.ul.type,
                        children: [
                          {
                            type: options.li.type,
                            children: [
                              {
                                type: options.p.type,
                                children: [{ text: 'a' }],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: options.li.type,
                    children: [
                      {
                        type: options.p.type,
                        children: [{ text: 'nesting' }],
                      },
                      {
                        type: options.ul.type,
                        children: [
                          {
                            type: options.li.type,
                            children: [
                              {
                                type: options.p.type,
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
            type: options.li.type,
            children: [
              {
                type: options.p.type,
                children: [{ text: 'c' }],
              },
            ],
          },
        ],
      },
      {
        type: options.ol.type,
        children: [
          {
            type: options.li.type,
            children: [
              { type: options.p.type, children: [{ text: 'Numbered list' }] },
            ],
          },
        ],
      },
      {
        type: options.p.type,
        children: [
          {
            text:
              'With Slate you can build complex block types that have their own embedded content and behaviors, like rendering checkboxes inside check list items!',
          },
        ],
      },
      {
        type: options.todo_li.type,
        checked: true,
        children: [{ text: 'Slide to the left.' }],
      },
      {
        type: options.todo_li.type,
        checked: true,
        children: [{ text: 'Slide to the right.' }],
      },
      {
        type: options.todo_li.type,
        checked: false,
        children: [{ text: 'Criss-cross.' }],
      },
      {
        type: options.todo_li.type,
        checked: true,
        children: [{ text: 'Criss-cross!' }],
      },
      {
        type: options.todo_li.type,
        checked: false,
        children: [{ text: 'Cha cha real smooth…' }],
      },
      {
        type: options.todo_li.type,
        checked: false,
        children: [{ text: "Let's go to work!" }],
      },
      {
        type: options.p.type,
        children: [{ text: 'Try it out for yourself!' }],
      },
    ],
  },
];

export const initialValueSearchHighlighting: SlateDocument = [
  {
    children: [
      {
        type: options.p.type,
        children: [
          {
            text:
              'This is editable text that you can search. As you search, it looks for matching strings of text, and adds ',
          },
          { text: 'decorations', [options.bold.type]: true },
          { text: ' to them in realtime.' },
        ],
      },
      {
        type: options.p.type,
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
  type: options.table.type,
  children: [
    {
      type: options.tr.type,
      children: [
        {
          type: options.td.type,
          children: [createParagraph('')],
        },
        {
          type: options.td.type,
          children: [createParagraph('Human', options.bold.type)],
        },
        {
          type: options.td.type,
          children: [createParagraph('Dog', options.bold.type)],
        },
        {
          type: options.td.type,
          children: [createParagraph('Cat', options.bold.type)],
        },
      ],
    },
    {
      type: options.tr.type,
      children: [
        {
          type: options.td.type,
          children: [createParagraph('# of Feet', options.bold.type)],
        },
        {
          type: options.td.type,
          children: [createParagraph('2')],
        },
        {
          type: options.td.type,
          children: [createParagraph('4')],
        },
        {
          type: options.td.type,
          children: [createParagraph('4')],
        },
      ],
    },
    {
      type: options.tr.type,
      children: [
        {
          type: options.td.type,
          children: [createParagraph('# of Lives', options.bold.type)],
        },
        {
          type: options.td.type,
          children: [createParagraph('1')],
        },
        {
          type: options.td.type,
          children: [createParagraph('1')],
        },
        {
          type: options.td.type,
          children: [createParagraph('9')],
        },
      ],
    },
  ],
});

const createSpanningTable = () => ({
  type: options.table.type,
  children: [
    {
      type: options.tr.type,
      children: [
        {
          type: options.th.type,
          attributes: { colspan: '2' },
          children: [createParagraph('Heading', options.bold.type)],
        },
      ],
    },
    {
      type: options.tr.type,
      children: [
        {
          type: options.td.type,
          children: [createParagraph('Cell 1', options.bold.type)],
        },
        {
          type: options.td.type,
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
        type: options.h2.type,
        children: [
          {
            text: '🏓 Table',
          },
        ],
      },
      {
        type: options.p.type,
        children: [
          {
            text:
              'Since the editor is based on a recursive tree model, similar to an HTML document, you can create complex nested structures, like tables:',
          },
        ],
      },
      createTable(),
      {
        type: options.p.type,
        children: [
          {
            text:
              "This table is just a basic example of rendering a table, and it doesn't have fancy functionality. But you could augment it to add support for navigating with arrow keys, displaying table headers, adding column and rows, or even formulas if you wanted to get really crazy!",
          },
        ],
      },
      createSpanningTable(),
      {
        type: options.p.type,
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
        type: options.h1.type,
        children: [{ text: '🍦 Soft Break ⇧⏎' }],
      },
      {
        type: options.p.type,
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
        type: options.blockquote.type,
        children: [{ text: 'Try here ⏎' }],
      },
      {
        type: options.code_block.type,
        children: [{ text: 'And ⏎ here.' }],
      },
    ] as SlateDocumentFragment,
  },
];

export const initialValueExitBreak: SlateDocument = [
  {
    children: [
      {
        type: options.h1.type,
        children: [{ text: '⏎ Exit Break ⏎' }],
      },
      {
        type: options.p.type,
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
        type: options.blockquote.type,
        children: [{ text: 'Try here ⌘⏎' }],
      },
      {
        type: options.code_block.type,
        children: [{ text: 'And in the middle ⌘⏎ of the block.' }],
      },
      {
        type: options.p.type,
        children: [{ text: 'It also works for nested blocks:' }],
      },
      createTable(),
    ] as SlateDocumentFragment,
  },
];
