'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import {
  type Decorate,
  type RenderLeafProps,
  type TText,
  createSlatePlugin,
  TextApi,
} from '@udecode/plate';
import { BasicElementsPlugin } from '@udecode/plate-basic-elements/react';
import { BasicMarksPlugin } from '@udecode/plate-basic-marks/react';
import { Plate } from '@udecode/plate/react';
import Prism from 'prismjs';

import { useCreateEditor } from '@/registry/default/components/editor/use-create-editor';
import { previewMdValue } from '@/registry/default/examples/values/preview-md-value';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';

import 'prismjs/components/prism-markdown.js';

/** Decorate texts with markdown preview. */
const decoratePreview: Decorate = ({ entry: [node, path] }) => {
  const ranges: any[] = [];

  if (!TextApi.isText(node)) {
    return ranges;
  }

  const getLength = (token: any) => {
    if (typeof token === 'string') {
      return token.length;
    }
    if (typeof token.content === 'string') {
      return token.content.length;
    }

    return token.content.reduce((l: any, t: any) => l + getLength(t), 0);
  };

  const tokens = Prism.tokenize(node.text, Prism.languages.markdown);
  let start = 0;

  for (const token of tokens) {
    const length = getLength(token);
    const end = start + length;

    if (typeof token !== 'string') {
      ranges.push({
        anchor: { offset: start, path },
        focus: { offset: end, path },
        [token.type]: true,
      });
    }

    start = end;
  }

  return ranges;
};

function PreviewLeaf({
  attributes,
  children,
  leaf,
}: RenderLeafProps<
  {
    blockquote?: boolean;
    bold?: boolean;
    code?: boolean;
    hr?: boolean;
    italic?: boolean;
    list?: boolean;
    title?: boolean;
  } & TText
>) {
  const { blockquote, bold, code, hr, italic, list, title } = leaf;

  return (
    <span
      {...attributes}
      className={cn(
        bold && 'font-bold',
        italic && 'italic',
        title && 'mx-0 mt-5 mb-2.5 inline-block text-[20px] font-bold',
        list && 'pl-2.5 text-[20px] leading-[10px]',
        hr && 'block border-b-2 border-[#ddd] text-center',
        blockquote &&
          'inline-block border-l-2 border-[#ddd] pl-2.5 text-[#aaa] italic',
        code && 'bg-[#eee] p-[3px] font-mono'
      )}
    >
      {children}
    </span>
  );
}

export default function PreviewMdDemo() {
  const editor = useCreateEditor({
    plugins: [
      BasicElementsPlugin,
      BasicMarksPlugin,
      createSlatePlugin({
        key: 'preview-markdown',
        decorate: decoratePreview,
      }),
    ],
    value: previewMdValue,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor renderLeaf={PreviewLeaf} />
      </EditorContainer>
    </Plate>
  );
}
