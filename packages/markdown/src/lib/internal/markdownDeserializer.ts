import type { Root } from 'mdast';
import { type Plugin, unified } from 'unified';

import {
  type Descendant,
  type Element,
  ElementApi,
  type Value,
  TextApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import remarkParse from 'remark-parse';

import type { DeserializeMdOptions } from '../deserializer/deserializeMd';
import type { DeserializeMdContext } from '../types';
import type { MarkdownRuntime } from './markdownRuntime';

import { mdastToSlate } from '../deserializer/mdastToSlate';
import { htmlToJsx } from '../deserializer/utils/htmlToJsx';
import { splitIncompleteMdx } from '../deserializer/utils/splitIncompleteMdx';
import { stripMarkdownBlocks } from '../deserializer/utils/stripMarkdown';
import { getMergedOptionsDeserialize } from './markdownOptions';

const LEADING_SPACES_REGEX = /^\s*/;
const TRAILING_SPACES_REGEX = /\s*$/;

export const markdownToAstProcessorWithRuntime = (
  runtime: MarkdownRuntime,
  data: string,
  options?: DeserializeMdOptions
) => {
  const mergedOptions = getMergedOptionsDeserialize(runtime, options);

  return unified()
    .use(remarkParse)
    .use(mergedOptions.remarkPlugins ?? [])
    .parse(data);
};

export const markdownToSlateNodesWithRuntime = (
  runtime: MarkdownRuntime,
  data: string,
  options?: DeserializeMdOptions
): Descendant[] => {
  const processedData = options?.withoutMdx ? data : htmlToJsx(data);
  const mergedOptions = getMergedOptionsDeserialize(runtime, options);
  const toSlateProcessor = unified()
    .use(remarkParse)
    .use(mergedOptions.remarkPlugins ?? [])
    .use(remarkToSlate, mergedOptions);

  return toSlateProcessor.processSync(processedData).result;
};

export const deserializeMdWithRuntime = (
  runtime: MarkdownRuntime,
  data: string,
  options?: DeserializeMdOptions
): Value => {
  let output: Descendant[] | null = null;

  try {
    output = markdownToSlateNodesWithRuntime(runtime, data, options);
  } catch (error) {
    options?.onError?.(error as Error);

    if (!options?.withoutMdx) {
      output = markdownToSlateNodesSafelyWithRuntime(runtime, data, options);
    }
  }

  if (!output) return [];

  return output.map((item) =>
    TextApi.isText(item)
      ? ({
          children: [item],
          type: runtime.registry.getType(KEYS.p),
        } as Element)
      : item
  );
};

export const deserializeInlineMdWithRuntime = (
  runtime: MarkdownRuntime,
  text: string,
  options?: DeserializeMdOptions
) => {
  const trimmedText = text.trim();
  const leadingSpaces = LEADING_SPACES_REGEX.exec(text)?.[0] || '';
  const trailingSpaces = TRAILING_SPACES_REGEX.exec(text)?.[0] || '';
  const strippedText = stripMarkdownBlocks(trimmedText);

  if (!strippedText) return text ? [{ text }] : [];

  const fragment: Descendant[] = [];

  if (leadingSpaces) fragment.push({ text: leadingSpaces });

  const result = markdownToSlateNodesWithRuntime(
    runtime,
    strippedText,
    options
  )[0];

  if (result) {
    fragment.push(
      ...(ElementApi.isElement(result) ? result.children : [result])
    );
  }
  if (trailingSpaces) fragment.push({ text: trailingSpaces });

  return fragment;
};

const isPlainTextNode = (node: unknown): node is { text: string } =>
  TextApi.isText(node) && Object.keys(node).every((key) => key === 'text');

const isSplitInsideTableRow = (completeString: string) =>
  completeString.slice(completeString.lastIndexOf('\n') + 1).includes('|');

const markdownToSlateNodesWithoutMdx = (
  runtime: MarkdownRuntime,
  data: string,
  options?: DeserializeMdOptions
) =>
  markdownToSlateNodesWithRuntime(runtime, data, {
    ...options,
    withoutMdx: true,
  });

const markdownToSlateNodesWithMdxFallback = (
  runtime: MarkdownRuntime,
  data: string,
  options?: DeserializeMdOptions
) => {
  try {
    return markdownToSlateNodesWithRuntime(runtime, data, options);
  } catch {
    return markdownToSlateNodesWithoutMdx(runtime, data, options);
  }
};

const appendInlineNodesToLastTextContainer = (
  runtime: MarkdownRuntime,
  node: unknown,
  inlineNodes: Descendant[]
): boolean => {
  if (!ElementApi.isElement(node) || runtime.state.schema.isVoid(node)) {
    return false;
  }

  const paragraphType = runtime.registry.getType(KEYS.p);

  if (
    node.type === paragraphType ||
    node.children.some((child) => TextApi.isText(child))
  ) {
    const lastChild = node.children.at(-1);

    if (
      isPlainTextNode(lastChild) &&
      inlineNodes.every((inlineNode) => isPlainTextNode(inlineNode))
    ) {
      lastChild.text += inlineNodes
        .map((inlineNode) => inlineNode.text)
        .join('');

      return true;
    }

    node.children.push(...inlineNodes);
    return true;
  }

  for (let i = node.children.length - 1; i >= 0; i--) {
    if (
      appendInlineNodesToLastTextContainer(
        runtime,
        node.children[i],
        inlineNodes
      )
    ) {
      return true;
    }
  }

  return false;
};

export const markdownToSlateNodesSafelyWithRuntime = (
  runtime: MarkdownRuntime,
  data: string,
  options?: DeserializeMdOptions
) => {
  const result = splitIncompleteMdx(data);

  if (!Array.isArray(result)) {
    return markdownToSlateNodesWithoutMdx(runtime, data, options);
  }

  const [completeString, incompleteString] = result;
  const incompleteNodes = deserializeInlineMdWithRuntime(
    runtime,
    incompleteString,
    { ...options, withoutMdx: true }
  );
  const completeNodes = markdownToSlateNodesWithMdxFallback(
    runtime,
    completeString,
    options
  );
  const newBlock = {
    children: incompleteNodes,
    type: runtime.registry.getType(KEYS.p),
  };

  if (completeNodes.length === 0) return [newBlock];

  const lastBlock = completeNodes.at(-1);

  if (
    ElementApi.isElement(lastBlock) &&
    runtime.state.schema.isVoid(lastBlock)
  ) {
    return [...completeNodes, newBlock];
  }

  const tableType = runtime.registry.getType(KEYS.table);

  if (ElementApi.isElement(lastBlock) && lastBlock.type === tableType) {
    if (isSplitInsideTableRow(completeString)) {
      const withoutMdxNodes = markdownToSlateNodesWithoutMdx(
        runtime,
        data,
        options
      );
      const tableOrdinal = completeNodes
        .filter((node) => ElementApi.isElement(node) && node.type === tableType)
        .indexOf(lastBlock);
      let fallbackTableIndex = -1;
      let seenTables = -1;

      for (const [index, node] of withoutMdxNodes.entries()) {
        if (ElementApi.isElement(node) && node.type === tableType) {
          seenTables += 1;

          if (seenTables === tableOrdinal) {
            fallbackTableIndex = index;
            break;
          }
        }
      }

      if (fallbackTableIndex !== -1) {
        return [
          ...completeNodes.slice(0, -1),
          ...withoutMdxNodes.slice(fallbackTableIndex),
        ];
      }
    }

    return [...completeNodes, newBlock];
  }

  if (
    ElementApi.isElement(lastBlock) &&
    appendInlineNodesToLastTextContainer(runtime, lastBlock, incompleteNodes)
  ) {
    return completeNodes;
  }

  return completeNodes;
};

declare module 'unified' {
  interface CompileResultMap {
    remarkToSlateNode: Descendant[];
  }
}

const remarkToSlate: Plugin<[DeserializeMdContext], Root, Descendant[]> =
  function (options) {
    this.compiler = (node) => mdastToSlate(node as Root, options);
  };
