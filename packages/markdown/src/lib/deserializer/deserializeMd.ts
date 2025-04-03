import type { Descendant, SlateEditor } from '@udecode/plate';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';

import remarkParse from 'remark-parse';
import { unified } from 'unified';

import type { AllowNodeConfig, NodesConfig } from '../MarkdownPlugin';
import type { TNodes } from '../nodesRule';

import { mdastToSlate } from './mdastToSlate';
import {
  type ParseMarkdownBlocksOptions,
  parseMarkdownBlocks,
} from './utils';
import { getMergedOptionsDeserialize } from './utils/getMergedOptions';

// TODO: fixes tests

export type DeserializeMdOptions = {
  allowedNodes?: NodesConfig;
  allowNode?: AllowNodeConfig;
  disallowedNodes?: NodesConfig;
  editor?: SlateEditor;
  memoize?: boolean;
  nodes?: TNodes | null;
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

  const mergedOptions = getMergedOptionsDeserialize(editor, options);

  const toSlateProcessor = unified()
    .use(remarkParse)
    .use(mergedOptions.remarkPlugins ?? [])
    .use(remarkToSlate, mergedOptions);

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
  function (options = {}) {
    this.compiler = function (node) {
      return mdastToSlate(node as Root, options);
    };
  };
