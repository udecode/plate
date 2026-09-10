'use client';

import { TextApi } from 'platejs';
import { definePlatePlugin, Plate, useCreateEditor } from 'platejs/react';
import Prism, { type TokenStream } from 'prismjs';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { BasicNodesKit } from '@/registry/components/editor/basic-nodes';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { previewMdValue } from '@/registry/examples/values/preview-md-value';

import 'prismjs/components/prism-markdown.js';

const PreviewMarkdownPlugin = definePlatePlugin('previewMarkdown', {
  decorate: {
    read: ({ entry: [node, path] }) => {
      if (!TextApi.isText(node)) return [];

      const getLength = (token: TokenStream): number => {
        if (typeof token === 'string') return token.length;
        if (Array.isArray(token)) {
          return token.reduce((length, child) => length + getLength(child), 0);
        }
        if (typeof token.content === 'string') return token.content.length;

        return getLength(token.content);
      };
      const decorations = [];
      const tokens = Prism.tokenize(node.text, Prism.languages.markdown);
      let start = 0;

      for (const [index, token] of tokens.entries()) {
        const length = getLength(token);
        const end = start + length;

        if (typeof token !== 'string') {
          decorations.push({
            attributes: {
              className: cn(
                token.type === 'bold' && 'font-bold',
                token.type === 'italic' && 'italic',
                token.type === 'title' &&
                  'mx-0 mt-5 mb-2.5 inline-block font-bold text-[20px]',
                token.type === 'list' && 'pl-2.5 text-[20px] leading-[10px]',
                token.type === 'hr' &&
                  'block border-[#ddd] border-b-2 text-center',
                token.type === 'blockquote' &&
                  'inline-block border-[#ddd] border-l-2 pl-2.5 text-[#aaa] italic',
                token.type === 'code' && 'bg-[#eee] p-[3px] font-mono'
              ),
              'data-preview-markdown': token.type,
            },
            key: `${path.join('.')}:${index}:${start}:${end}:${token.type}`,
            range: {
              anchor: { offset: start, path },
              focus: { offset: end, path },
            },
          });
        }

        start = end;
      }

      return decorations;
    },
  },
});

export default function PreviewMdDemo() {
  const editor = useCreateEditor(
    {
      plugins: [...BasicNodesKit, PreviewMarkdownPlugin],
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
