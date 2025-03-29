import type { Descendant, SlateEditor } from '@udecode/plate';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';

import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

import type { TNodes } from '../nodesRule';

import { MarkdownPlugin } from '../MarkdownPlugin';
import { mdastToSlate } from './mdastToSlate';
import {
  type ParseMarkdownBlocksOptions,
  parseMarkdownBlocks,
  remarkSplitLineBreaks,
} from './utils';

// TODO: fixes tests

export type DeserializeMdOptions = {
  memoize?: boolean;
  nodes?: TNodes;
  parser?: ParseMarkdownBlocksOptions;
  splitLineBreaks?: boolean;
};

export const deserializeMd = (
  editor: SlateEditor,
  data: string,
  options?: DeserializeMdOptions
) => {
  // if using remarkMdx, we need to replace <br> with <br /> since <br /> is not supported in mdx.
  data = data.replaceAll('<br>', '<br />');

  const { nodes, splitLineBreaks } = editor.getOptions(MarkdownPlugin);

  const toSlateProcessor = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkSplitLineBreaks, { splitLineBreaks })
    .use(remarkToSlate, {
      nodes,
      splitLineBreaks,
    });

  if (options?.memoize) {
    return parseMarkdownBlocks(data, options.parser).flatMap((token) => {
      if (token.type === 'space') {
        return {
          ...editor.api.create.block(),
          _memo: token.raw,
        };
      }

      return toSlateProcessor
        .processSync(token.raw)
        .result.map((result: any) => {
          return {
            _memo: token.raw,
            ...result,
          };
        });
    });
  }

  return toSlateProcessor.processSync(data).result;
};

export type deserializeOptions = {
  nodes?: TNodes;
  splitLineBreaks?: boolean;
};

declare module 'unified' {
  interface CompileResultMap {
    remarkToSlateNode: Descendant[];
  }
}

const remarkToSlate: Plugin<[deserializeOptions?], Root, Descendant[]> =
  function ({ nodes, splitLineBreaks = false } = {}) {
    this.compiler = function (node) {
      return mdastToSlate(node as Root, { nodes, splitLineBreaks });
    };
  };
