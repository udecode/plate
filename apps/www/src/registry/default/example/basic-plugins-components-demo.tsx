// local import, not from npm
import { createPlateUI } from '@/plate/create-plate-ui';
import {
  createBoldPlugin,
  createCodePlugin,
  createItalicPlugin,
  createStrikethroughPlugin,
  createUnderlinePlugin,
} from '@udecode/plate-basic-marks';
import { createBlockquotePlugin } from '@udecode/plate-block-quote';
import { createCodeBlockPlugin } from '@udecode/plate-code-block';
import { createPlugins, Plate } from '@udecode/plate-common';
import { createHeadingPlugin } from '@udecode/plate-heading';
import { createParagraphPlugin } from '@udecode/plate-paragraph';

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
      <Editor spellCheck={false} autoFocus={false} placeholder="Type..." />
    </Plate>
  );
}

export const basicEditorValue = [
  {
    type: 'h1',
    children: [
      {
        text: '🌳 Blocks',
      },
    ],
    id: '1',
  },
  {
    type: 'p',
    children: [
      {
        text: 'Easily create headings of various levels, from H1 to H6, to structure your content and make it more organized.',
      },
    ],
    id: '2',
  },
  {
    type: 'blockquote',
    children: [
      {
        text: 'Create blockquotes1 to emphasize important information or highlight quotes from external sources.',
      },
    ],
    id: '3',
  },
  {
    type: 'code_block',
    lang: 'javascript',
    children: [
      {
        type: 'code_line',
        children: [
          {
            text: '// Use code blocks to showcase code snippets',
          },
        ],
      },
      {
        type: 'code_line',
        children: [
          {
            text: 'function greet() {',
          },
        ],
      },
      {
        type: 'code_line',
        children: [
          {
            text: "  console.info('Hello World!');",
          },
        ],
      },
      {
        type: 'code_line',
        children: [
          {
            text: '}',
          },
        ],
      },
    ],
    id: '4',
  },
  {
    type: 'h1',
    children: [
      {
        text: '🌱 Marks',
      },
    ],
    id: '1',
  },
  {
    type: 'p',
    children: [
      {
        text: 'Add style and emphasis to your text using the mark plugins, which offers a variety of formatting options.',
      },
    ],
    id: '2',
  },
  {
    type: 'p',
    children: [
      {
        text: 'Make text ',
      },
      {
        text: 'bold',
        bold: true,
      },
      {
        text: ', ',
      },
      {
        text: 'italic',
        italic: true,
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
        text: 'combination',
        bold: true,
        italic: true,
        underline: true,
      },
      {
        text: ' of these styles for a visually striking effect.',
      },
    ],
    id: '3',
  },
  {
    type: 'p',
    children: [
      {
        text: 'Add ',
      },
      {
        text: 'strikethrough',
        strikethrough: true,
      },
      {
        text: ' to indicate deleted or outdated content.',
      },
    ],
    id: '4',
  },
  {
    type: 'p',
    children: [
      {
        text: 'Write code snippets with inline ',
      },
      {
        text: 'code',
        code: true,
      },
      {
        text: ' formatting for easy readability.',
      },
    ],
    id: '5',
  },
  {
    type: 'p',
    children: [
      {
        text: 'Press ',
      },
      {
        text: '⌘+B',
        kbd: true,
      },
      {
        text: ' to apply bold mark or ',
      },
      {
        text: '⌘+I',
        kbd: true,
      },
      {
        text: ' for italic mark.',
      },
    ],
    id: '6',
  },
];
