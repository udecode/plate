'use client';

import { useRef } from 'react';

import { withProps } from '@udecode/cn';
import { BasicElementsPlugin } from '@udecode/plate-basic-elements/react';
import {
  BasicMarksPlugin,
  BoldPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import {
  ParagraphPlugin,
  Plate,
  PlateElement,
  PlateLeaf,
  usePlateEditor,
} from '@udecode/plate-common/react';

import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';

export function PlateEditor() {
  const containerRef = useRef(null);

  const editor = useCreateEditor();

  return (
    <Plate editor={editor}>
      <EditorContainer id="scroll_container" ref={containerRef} variant="demo">
        <Editor variant="demo" placeholder="Type..." />
      </EditorContainer>
    </Plate>
  );
}

const useCreateEditor = () => {
  return usePlateEditor({
    override: {
      // Default styles in globals.css
      components: {
        [BoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
        [ItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
        [ParagraphPlugin.key]: withProps(PlateElement, { as: 'p' }),
        [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: 's' }),
        [UnderlinePlugin.key]: withProps(PlateLeaf, { as: 'u' }),
        blockquote: withProps(PlateElement, { as: 'blockquote' }),
        h1: withProps(PlateElement, { as: 'h1' }),
        h2: withProps(PlateElement, { as: 'h2' }),
        h3: withProps(PlateElement, { as: 'h3' }),
      },
    },
    plugins: [BasicElementsPlugin, BasicMarksPlugin],
    value: [
      {
        children: [{ text: 'Basic Editor' }],
        type: 'h1',
      },
      {
        children: [{ text: 'Heading 2' }],
        type: 'h2',
      },
      {
        children: [{ text: 'Heading 3' }],
        type: 'h3',
      },
      {
        children: [{ text: 'This is a blockquote element' }],
        type: 'blockquote',
      },
      {
        children: [
          { text: 'Basic marks: ' },
          { bold: true, text: 'bold' },
          { text: ', ' },
          { italic: true, text: 'italic' },
          { text: ', ' },
          { text: 'underline', underline: true },
          { text: ', ' },
          { strikethrough: true, text: 'strikethrough' },
          { text: '.' },
        ],
        type: ParagraphPlugin.key,
      },
    ],
  });
};
