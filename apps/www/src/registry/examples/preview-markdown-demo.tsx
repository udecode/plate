'use client';

import { type DecoratedRange, property, TextApi } from 'platejs';
import {
  type PlateLeafProps,
  definePlatePlugin,
  Plate,
  PlateLeaf,
  useCreateEditor,
} from 'platejs/react';
import Prism, { type TokenStream } from 'prismjs';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { BasicNodesKit } from '@/registry/components/editor/basic-nodes';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { previewMdValue } from '@/registry/examples/values/preview-md-value';

import 'prismjs/components/prism-markdown.js';

const PreviewMarkdownPlugin = definePlatePlugin('previewMarkdown', {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  decorate: ({ entry: [node, path] }) => {
    if (!TextApi.isText(node)) return [];

    const getLength = (token: TokenStream): number => {
      if (typeof token === 'string') return token.length;
      if (Array.isArray(token)) {
        return token.reduce((length, child) => length + getLength(child), 0);
      }
      if (typeof token.content === 'string') return token.content.length;

      return getLength(token.content);
    };
    const ranges: Array<
      DecoratedRange & {
        blockquote?: boolean;
        bold?: boolean;
        code?: boolean;
        hr?: boolean;
        italic?: boolean;
        list?: boolean;
        previewMarkdown: boolean;
        title?: boolean;
      }
    > = [];
    const tokens = Prism.tokenize(node.text, Prism.languages.markdown);
    let start = 0;

    for (const token of tokens) {
      const length = getLength(token);
      const end = start + length;

      if (typeof token !== 'string') {
        ranges.push({
          anchor: { offset: start, path },
          blockquote: token.type === 'blockquote' || undefined,
          bold: token.type === 'bold' || undefined,
          code: token.type === 'code' || undefined,
          focus: { offset: end, path },
          hr: token.type === 'hr' || undefined,
          italic: token.type === 'italic' || undefined,
          list: token.type === 'list' || undefined,
          previewMarkdown: true,
          title: token.type === 'title' || undefined,
        });
      }

      start = end;
    }

    return ranges;
  },
});

function PreviewLeaf(props: PlateLeafProps<typeof PreviewMarkdownPlugin>) {
  const { blockquote, bold, code, hr, italic, list, title } = props.leaf;

  return (
    <PlateLeaf
      {...props}
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
    />
  );
}

const PreviewMarkdownKit = PreviewMarkdownPlugin.configure({
  component: PreviewLeaf,
});

export default function PreviewMdDemo() {
  const editor = useCreateEditor(
    {
      plugins: [...BasicNodesKit, PreviewMarkdownKit],
      initialValue: previewMdValue,
    },
    []
  );

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
