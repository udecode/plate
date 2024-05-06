// local import, not from npm
import {
  createBoldPlugin,
  createCodePlugin,
  createItalicPlugin,
  createStrikethroughPlugin,
  createUnderlinePlugin,
} from '@udecode/plate-basic-marks';
import { createBlockquotePlugin } from '@udecode/plate-block-quote';
import { createCodeBlockPlugin } from '@udecode/plate-code-block';
import { Plate, createPlugins } from '@udecode/plate-common';
import { createHeadingPlugin } from '@udecode/plate-heading';
import { createParagraphPlugin } from '@udecode/plate-paragraph';

import { createPlateUI } from '@/plate/create-plate-ui';
import { Editor } from '@/registry/default/plate-ui/editor';

const plugins = createPlugins(
  [
    // Pick your plugins in https://platejs.org/?builder=true
    createParagraphPlugin(),
    createBlockquotePlugin(),
    createCodeBlockPlugin(),
    createHeadingPlugin(),

    createBoldPlugin(),
    createItalicPlugin(),
    createUnderlinePlugin(),
    createStrikethroughPlugin(),
    createCodePlugin(),
  ],
  {
    // Pick your components in https://platejs.org/?builder=true
    components: createPlateUI(),
  }
);

export default function BasicPluginsComponentsDemo() {
  return (
    <Plate initialValue={basicEditorValue} plugins={plugins}>
      <Editor autoFocus={false} placeholder="Type..." spellCheck={false} />
    </Plate>
  );
}

export const basicEditorValue = [
  {
    children: [
      {
        text: '🌳 Blocks',
      },
    ],
    id: '1',
    type: 'h1',
  },
  {
    children: [
      {
        text: 'Easily create headings of various levels, from H1 to H6, to structure your content and make it more organized.',
      },
    ],
    id: '2',
    type: 'p',
  },
  {
    children: [
      {
        text: 'Create blockquotes to emphasize important information or highlight quotes from external sources.',
      },
    ],
    id: '3',
    type: 'blockquote',
  },
  {
    children: [
      {
        children: [
          {
            text: '// Use code blocks to showcase code snippets',
          },
        ],
        type: 'code_line',
      },
      {
        children: [
          {
            text: 'function greet() {',
          },
        ],
        type: 'code_line',
      },
      {
        children: [
          {
            text: "  console.info('Hello World!');",
          },
        ],
        type: 'code_line',
      },
      {
        children: [
          {
            text: '}',
          },
        ],
        type: 'code_line',
      },
    ],
    id: '4',
    lang: 'javascript',
    type: 'code_block',
  },
  {
    children: [
      {
        text: '🌱 Marks',
      },
    ],
    id: '1',
    type: 'h1',
  },
  {
    children: [
      {
        text: 'Add style and emphasis to your text using the mark plugins, which offers a variety of formatting options.',
      },
    ],
    id: '2',
    type: 'p',
  },
  {
    children: [
      {
        text: 'Make text ',
      },
      {
        bold: true,
        text: 'bold',
      },
      {
        text: ', ',
      },
      {
        italic: true,
        text: 'italic',
      },
      {
        text: ', ',
      },
      {
        text: 'underlined',
        underline: true,
      },
      {
        text: ', or apply a ',
      },
      {
        bold: true,
        italic: true,
        text: 'combination',
        underline: true,
      },
      {
        text: ' of these styles for a visually striking effect.',
      },
    ],
    id: '3',
    type: 'p',
  },
  {
    children: [
      {
        text: 'Add ',
      },
      {
        strikethrough: true,
        text: 'strikethrough',
      },
      {
        text: ' to indicate deleted or outdated content.',
      },
    ],
    id: '4',
    type: 'p',
  },
  {
    children: [
      {
        text: 'Write code snippets with inline ',
      },
      {
        code: true,
        text: 'code',
      },
      {
        text: ' formatting for easy readability.',
      },
    ],
    id: '5',
    type: 'p',
  },
  {
    children: [
      {
        text: 'Press ',
      },
      {
        kbd: true,
        text: '⌘+B',
      },
      {
        text: ' to apply bold mark or ',
      },
      {
        kbd: true,
        text: '⌘+I',
      },
      {
        text: ' for italic mark.',
      },
    ],
    id: '6',
    type: 'p',
  },
];
