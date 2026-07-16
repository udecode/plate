'use client';

import * as React from 'react';

import type { DecoratedRange, Text } from '@platejs/plite';
import {
  type Decorate,
  type RenderLeafProps,
  createBasePlugin,
  TextApi,
} from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';
import Prism, { type TokenStream } from 'prismjs';

import { cn } from '@/lib/utils';
import { BasicNodesKit } from '@/registry/components/editor/plugins/basic-nodes-kit';
import { previewMdValue } from '@/registry/examples/values/preview-md-value';
import { Editor, EditorContainer } from '@/registry/ui/editor';

import 'prismjs/components/prism-markdown.js';

/** Decorate texts with markdown preview. */
const decoratePreview: Decorate = ({ entry: [node, path] }) => {
  const ranges: DecoratedRange[] = [];

  if (!TextApi.isText(node)) {
    return ranges;
  }

  const getLength = (token: TokenStream): number => {
    if (typeof token === 'string') {
      return token.length;
    }
    if (Array.isArray(token)) {
      return token.reduce((length, child) => length + getLength(child), 0);
    }
    if (typeof token.content === 'string') {
      return token.content.length;
    }

    return getLength(token.content);
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
  } & Text
>) {
  const { blockquote, bold, code, hr, italic, list, title } = leaf;

  return (
    <span
      {...attributes}
      className={cn(
        bold && 'font-bold',
        italic && 'italic',
        title && 'mx-0 mt-5 mb-2.5 inline-block font-bold text-[20px]',
        list && 'pl-2.5 text-[20px] leading-[10px]',
        hr && 'block border-[#ddd] border-b-2 text-center',
        blockquote &&
          'inline-block border-[#ddd] border-l-2 pl-2.5 text-[#aaa] italic',
        code && 'bg-[#eee] p-[3px] font-mono'
      )}
    >
      {children}
    </span>
  );
}

export default function PreviewMdDemo() {
  const editor = usePlateEditor(
    {
      plugins: [
        ...BasicNodesKit,
        createBasePlugin({
          key: 'preview-markdown',
          decorate: decoratePreview,
        }),
      ],
      value: previewMdValue,
    },
    []
  );

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor renderLeaf={PreviewLeaf} />
      </EditorContainer>
    </Plate>
  );
}
