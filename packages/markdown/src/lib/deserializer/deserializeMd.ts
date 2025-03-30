import type { Descendant, SlateEditor } from '@udecode/plate';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';

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
  editor?: SlateEditor;
  memoize?: boolean;
  nodes?: TNodes;
  parser?: ParseMarkdownBlocksOptions;
  remarkPlugins?: Plugin[];
  splitLineBreaks?: boolean;
};

export const deserializeMd = (
  editor: SlateEditor,
  data: string,
  options?: Omit<DeserializeMdOptions, 'editor'>
): any => {
  // if using remarkMdx, we need to replace <br> with <br /> since <br /> is not supported in mdx.
  data = data.replaceAll('<br>', '<br />');

  const {
    nodes,
    remarkPlugins: PluginOptionsRemarkPlugins,
    splitLineBreaks: PluginOptionsSplitLineBreaks,
  } = editor.getOptions(MarkdownPlugin);

  const remarkPlugins = options?.remarkPlugins ?? PluginOptionsRemarkPlugins;

  const splitLineBreaks =
    options?.splitLineBreaks ?? PluginOptionsSplitLineBreaks;

  const toSlateProcessor = unified()
    .use(remarkParse)
    .use(remarkPlugins)
    .use(remarkSplitLineBreaks, { splitLineBreaks })
    .use(remarkToSlate, {
      // TODO:
      ...options,
      editor,
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

declare module 'unified' {
  interface CompileResultMap {
    remarkToSlateNode: Descendant[];
  }
}

const remarkToSlate: Plugin<[DeserializeMdOptions?], Root, Descendant[]> =
  // TODO: options
  function ({ editor, nodes, splitLineBreaks = false } = {}) {
    this.compiler = function (node) {
      return mdastToSlate(node as Root, { editor, nodes, splitLineBreaks });
    };
  };
