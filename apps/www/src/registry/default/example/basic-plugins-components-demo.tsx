'use client';

import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { Plate, usePlateEditor } from '@udecode/plate-common/react';
import { HeadingPlugin } from '@udecode/plate-heading/react';
import Prism from 'prismjs';

import { createPlateUI } from '@/lib/plate/create-plate-ui';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';

export default function BasicPluginsComponentsDemo() {
  const editor = usePlateEditor({
    override: { components: createPlateUI() },
    plugins: [
      BlockquotePlugin,
      CodeBlockPlugin.configure({ options: { prism: Prism } }),
      HeadingPlugin,
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikethroughPlugin,
      CodePlugin,
    ],
    value: basicEditorValue,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor placeholder="Type..." autoFocus={false} spellCheck={false} />
      </EditorContainer>
    </Plate>
  );
}

export const basicEditorValue = [
  {
    id: '1',
    children: [
      {
        text: '🌳 Blocks',
      },
    ],
    type: 'h1',
  },
  {
    id: '2',
    children: [
      {
        text: 'Easily create headings of various levels, from H1 to H6, to structure your content and make it more organized.',
      },
    ],
    type: 'p',
  },
  {
    id: '3',
    children: [
      {
        text: 'Create blockquotes to emphasize important information or highlight quotes from external sources.',
      },
    ],
    type: 'blockquote',
  },
  {
    id: '4',
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
    lang: 'javascript',
    type: 'code_block',
  },
  {
    id: '1',
    children: [
      {
        text: '🌱 Marks',
      },
    ],
    type: 'h1',
  },
  {
    id: '2',
    children: [
      {
        text: 'Add style and emphasis to your text using the mark plugins, which offers a variety of formatting options.',
      },
    ],
    type: 'p',
  },
  {
    id: '3',
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
    type: 'p',
  },
  {
    id: '4',
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
    type: 'p',
  },
  {
    id: '5',
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
    type: 'p',
  },
  {
    id: '6',
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
    type: 'p',
  },
];
