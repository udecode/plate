/* eslint-disable prettier/prettier */
import Prism from 'prismjs';
import 'prismjs/components/prism-markdown';

import React from 'react';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { previewMdValue } from '@/plate/demo/values/previewMdValue';
import {
  createPluginFactory,
  isText,
  Plate,
  TRenderLeafProps,
  TText,
} from '@udecode/plate-common';

import { createMyPlugins, MyValue } from '@/types/plate-types';
import { cn } from '@/lib/utils';
import { Editor } from '@/registry/default/plate-ui/editor';

/**
 * Decorate texts with markdown preview.
 */
const decoratePreview =
  () =>
  ([node, path]: any) => {
    const ranges: any[] = [];

    if (!isText(node)) {
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
          [token.type]: true,
          anchor: { path, offset: start },
          focus: { path, offset: end },
        });
      }
      start = end;
    }

    return ranges;
  };

const createPreviewPlugin = createPluginFactory({
  key: 'preview-md',
  decorate: decoratePreview,
});

const plugins = createMyPlugins([...basicNodesPlugins, createPreviewPlugin()], {
  components: plateUI,
});

function PreviewLeaf({
  attributes,
  leaf,
  children,
}: TRenderLeafProps<
  MyValue,
  TText & {
    title?: boolean;
    list?: boolean;
    italic?: boolean;
    hr?: boolean;
    code?: boolean;
    bold?: boolean;
    blockquote?: boolean;
  }
>) {
  const { title, list, italic, hr, code, bold, blockquote } = leaf;

  return (
    <span
      {...attributes}
      className={cn(
        bold && 'font-bold',
        italic && 'italic',
        title && 'mx-0 mb-2.5 mt-5 inline-block text-[20px] font-bold',
        list && 'pl-2.5 text-[20px] leading-[10px]',
        hr && 'block border-b-2 border-[#ddd] text-center',
        blockquote &&
          'inline-block border-l-2 border-[#ddd] pl-2.5 italic text-[#aaa]',
        code && 'bg-[#eee] p-[3px] font-mono'
      )}
    >
      {children}
    </span>
  );
}

const _editableProps = {
  ...editableProps,
  renderLeaf: PreviewLeaf,
};

export default function PreviewMdDemo() {
  return (
    <div className="p-10">
      <Plate<MyValue> plugins={plugins} initialValue={previewMdValue}>
        <Editor {..._editableProps} />
      </Plate>
    </div>
  );
}
