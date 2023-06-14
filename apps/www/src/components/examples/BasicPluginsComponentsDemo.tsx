import {
  createBoldPlugin,
  createCodePlugin,
  createItalicPlugin,
  createStrikethroughPlugin,
  createUnderlinePlugin,
} from '@udecode/plate-basic-marks';
import { createBlockquotePlugin } from '@udecode/plate-block-quote';
import { createPlugins, Plate } from '@udecode/plate-common';
import { createHeadingPlugin } from '@udecode/plate-heading';
import { createParagraphPlugin } from '@udecode/plate-paragraph';

import { createPlateUI } from '@/plate/createPlateUI';
import { MyValue } from '@/plate/plate-types';

const plugins = createPlugins<MyValue>(
  [
    createParagraphPlugin(),
    createBlockquotePlugin(),
    createHeadingPlugin(),

    createBoldPlugin(),
    createItalicPlugin(),
    createUnderlinePlugin(),
    createStrikethroughPlugin(),
    createCodePlugin(),
  ],
  {
    components: createPlateUI(),
  }
);

export default function BasicPluginsComponentsDemo() {
  return (
    <Plate<MyValue>
      editableProps={{
        spellCheck: false,
        autoFocus: false,
        placeholder: 'Type…',
      }}
      initialValue={basicEditorValue}
      plugins={plugins}
    />
  );
}

export const basicEditorValue: MyValue = [
  {
    type: 'h1',
    children: [
      {
        text: '🧱 Elements',
      },
    ],
    id: '1',
  },
  {
    type: 'h2',
    children: [
      {
        text: '🔥 Basic Elements',
      },
    ],
    id: '2',
  },
  {
    type: 'p',
    children: [
      {
        text: 'These are the most common elements, known as blocks:',
      },
    ],
    id: '3',
  },
  {
    type: 'h1',
    children: [
      {
        text: 'Heading 1',
      },
    ],
    id: '4',
  },
  {
    type: 'h2',
    children: [
      {
        text: 'Heading 2',
      },
    ],
    id: '5',
  },
  {
    type: 'h3',
    children: [
      {
        text: 'Heading 3',
      },
    ],
    id: '6',
  },
  {
    type: 'h4',
    children: [
      {
        text: 'Heading 4',
      },
    ],
    id: '7',
  },
  {
    type: 'h5',
    children: [
      {
        text: 'Heading 5',
      },
    ],
    id: '8',
  },
  {
    type: 'h6',
    children: [
      {
        text: 'Heading 6',
      },
    ],
    id: '9',
  },
  {
    type: 'blockquote',
    children: [
      {
        text: 'Blockquote',
      },
    ],
    id: '10',
  },
  {
    type: 'code_block',
    lang: 'javascript',
    children: [
      {
        type: 'code_line',
        children: [
          {
            text: "const a = 'Hello';",
          },
        ],
      },
      {
        type: 'code_line',
        children: [
          {
            text: "const b = 'World';",
          },
        ],
      },
    ],
    id: '11',
  },
  {
    type: 'h1',
    children: [
      {
        text: '💅 Marks',
      },
    ],
  },
  {
    type: 'h2',
    children: [
      {
        text: '💧 Basic Marks',
      },
    ],
  },
  {
    type: 'p',
    children: [
      {
        text: 'The basic marks consist of text formatting such as bold, italic, underline, strikethrough, subscript, superscript, and code.',
      },
    ],
  },
  {
    type: 'p',
    children: [
      {
        text: 'You can customize the type, the component and the hotkey for each of these.',
      },
    ],
  },
  {
    type: 'p',
    children: [
      {
        text: 'This text is bold.',
        bold: true,
      },
    ],
  },
  {
    type: 'p',
    children: [
      {
        text: 'This text is italic.',
        italic: true,
      },
    ],
  },
  {
    type: 'p',
    children: [
      {
        text: 'This text is underlined.',
        underline: true,
      },
    ],
  },
  {
    type: 'p',
    children: [
      {
        text: 'This text is bold, italic and underlined.',
        bold: true,
        italic: true,
        underline: true,
      },
    ],
  },
  {
    type: 'p',
    children: [
      {
        text: 'This is a strikethrough text.',
        strikethrough: true,
      },
    ],
  },
  {
    type: 'p',
    children: [
      {
        text: 'This is an inline code.',
        code: true,
      },
    ],
  },
];
