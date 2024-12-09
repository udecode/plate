'use client';

import { withProps } from '@udecode/cn';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import {
  Plate,
  PlateElement,
  PlateLeaf,
  usePlateEditor,
} from '@udecode/plate-common/react';
import { HeadingPlugin } from '@udecode/plate-heading/react';

import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';

export default function BasicPluginsComponentsDemo() {
  const editor = usePlateEditor({
    override: {
      components: {
        blockquote: withProps(PlateElement, {
          as: 'blockquote',
          className: 'mb-4 border-l-4 border-[#d0d7de] pl-4 text-[#636c76]',
        }),
        bold: withProps(PlateLeaf, { as: 'strong' }),
        h1: withProps(PlateElement, {
          as: 'h1',
          className:
            'mb-4 mt-6 text-3xl font-semibold tracking-tight lg:text-4xl',
        }),
        h2: withProps(PlateElement, {
          as: 'h2',
          className: 'mb-4 mt-6 text-2xl font-semibold tracking-tight',
        }),
        h3: withProps(PlateElement, {
          as: 'h3',
          className: 'mb-4 mt-6 text-xl font-semibold tracking-tight',
        }),
        italic: withProps(PlateLeaf, { as: 'em' }),
        p: withProps(PlateElement, {
          as: 'p',
          className: 'mb-4',
        }),
        underline: withProps(PlateLeaf, { as: 'u' }),
      },
    },
    plugins: [
      BlockquotePlugin,
      HeadingPlugin,
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
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
];
