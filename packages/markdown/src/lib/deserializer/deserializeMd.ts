import type { Descendant, SlateEditor } from '@udecode/plate';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';

import remarkParse from 'remark-parse';
import { unified } from 'unified';

import type { AllowNodeConfig, NodesConfig } from '../MarkdownPlugin';
import type { TRules } from '../rules';

import { mdastToSlate } from './mdastToSlate';
import { type ParseMarkdownBlocksOptions, parseMarkdownBlocks } from './utils';
import { getMergedOptionsDeserialize } from './utils/getMergedOptionsDeserialize';

// TODO: fixes tests

export type DeserializeMdOptions = {
  allowedNodes?: NodesConfig;
  allowNode?: AllowNodeConfig;
  disallowedNodes?: NodesConfig;
  editor?: SlateEditor;
  memoize?: boolean;
  parser?: ParseMarkdownBlocksOptions;
  remarkPlugins?: Plugin[];
  rules?: TRules | null;
  splitLineBreaks?: boolean;
  withoutMdx?: boolean;
  onError?: (error: Error) => void;
};

export const markdownToSlateNodes = (
  editor: SlateEditor,
  data: string,
  options?: Omit<DeserializeMdOptions, 'editor'>
) => {
  // if using remarkMdx, we need to replace <br> with <br /> since <br /> is not supported in mdx.
  if (!options?.withoutMdx) {
    data = data.replaceAll('<br>', '<br />');
  }

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

export const deserializeMd = (
  editor: SlateEditor,
  data: string,
  options?: Omit<DeserializeMdOptions, 'editor'>
): any => {
  try {
    return markdownToSlateNodes(editor, data, options);
  } catch (error) {
    options?.onError?.(error as Error);

    if (!options?.withoutMdx) {
      return markdownToSlateNodes(editor, data, {
        ...options,
        withoutMdx: true,
      });
    }
  }
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
