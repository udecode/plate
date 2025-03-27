import type { Descendant, SlateEditor } from '@udecode/plate';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';

import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

import type { TNodes } from '../nodesRule';

import { MarkdownPlugin } from '../MarkdownPlugin';
import { mdastToSlate } from './mdastToSlate';

export const deserializeMd = (editor: SlateEditor, data: string) => {
  const nodes = editor.getOption(MarkdownPlugin, 'nodes');

  const toSlateProcessor = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkGfm)
    .use(remarkToSlate, {
      nodes: nodes,
    });

  return toSlateProcessor.processSync(data).result;
};

export type deserializeOptions = {
  nodes?: TNodes;
};

declare module 'unified' {
  interface CompileResultMap {
    remarkToSlateNode: Descendant[];
  }
}

const remarkToSlate: Plugin<[deserializeOptions?], Root, Descendant[]> =
  function ({ nodes } = {}) {
    this.compiler = function (node) {
      return mdastToSlate(node as Root, { nodes });
    };
  };
