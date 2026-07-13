import type { Root } from 'mdast';
import type { Pluggable, Plugin } from 'unified';

import { type BaseEditor, getPluginKey } from '@platejs/core';
import {
  type Descendant,
  type Element,
  type Value,
  TextApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

import type { AllowNodeConfig } from '../MarkdownPlugin';
import type { MdRules, PlateType } from '../types';

import { mdastToSlate } from './mdastToSlate';
import {
  type ParseMarkdownBlocksOptions,
  htmlToJsx,
  parseMarkdownBlocks,
} from './utils';
import { getMergedOptionsDeserialize } from './utils/getMergedOptionsDeserialize';
import { markdownToSlateNodesSafely } from './utils/markdownToSlateNodesSafely';

// TODO: fixes tests

export type DeserializeMdOptions = {
  allowedNodes?: PlateType[] | null;
  allowNode?: AllowNodeConfig;
  disallowedNodes?: PlateType[] | null;
  editor?: BaseEditor;
  memoize?: boolean;
  parser?: ParseMarkdownBlocksOptions;
  preserveEmptyParagraphs?: boolean;
  remarkPlugins?: Pluggable[];
  rules?: MdRules | null;
  splitLineBreaks?: boolean;
  withoutMdx?: boolean;
  onError?: (error: Error) => void;
};

export const markdownToAstProcessor = (
  editor: BaseEditor,
  data: string,
  options?: DeserializeMdOptions
) => {
  const mergedOptions = getMergedOptionsDeserialize(editor, options);

  return unified()
    .use(remarkParse)
    .use(mergedOptions.remarkPlugins ?? [])
    .parse(data);
};

export const markdownToSlateNodes = (
  editor: BaseEditor,
  data: string,
  options?: Omit<DeserializeMdOptions, 'editor'>
): Descendant[] => {
  const processedData = options?.withoutMdx ? data : htmlToJsx(data);

  const mergedOptions = getMergedOptionsDeserialize(editor, options);

  const toSlateProcessor = unified()
    .use(remarkParse)
    .use(mergedOptions.remarkPlugins ?? [])
    .use(remarkToSlate, mergedOptions);

  if (options?.memoize) {
    return parseMarkdownBlocks(processedData, options.parser).flatMap(
      (token) => {
        if (token.type === 'space') {
          return {
            children: [{ text: '' }],
            type: editor.getType(KEYS.p),
            _memo: token.raw,
          };
        }

        return toSlateProcessor
          .processSync(token.raw)
          .result.map((result: any) => ({
            _memo: token.raw,
            ...result,
          }));
      }
    );
  }

  return toSlateProcessor.processSync(processedData).result;
};

export const deserializeMd = (
  editor: BaseEditor,
  data: string,
  options?: Omit<DeserializeMdOptions, 'editor'>
): Value => {
  let output: Descendant[] | null = null;

  try {
    output = markdownToSlateNodes(editor, data, options);
  } catch (error) {
    options?.onError?.(error as Error);

    if (!options?.withoutMdx) {
      output = markdownToSlateNodesSafely(editor, data, options);
    }
  }

  if (!output) return [];

  // when output is inline text, we need to wrap the text in a paragraph
  return output.map((item) =>
    TextApi.isText(item)
      ? ({
          children: [item],
          type: getPluginKey(editor, KEYS.p) ?? KEYS.p,
        } as Element)
      : item
  );
};

declare module 'unified' {
  interface CompileResultMap {
    remarkToSlateNode: Descendant[];
  }
}

const remarkToSlate: Plugin<[DeserializeMdOptions?], Root, Descendant[]> =
  // TODO: options
  function (options = {}) {
    this.compiler = (node) => mdastToSlate(node as Root, options);
  };
