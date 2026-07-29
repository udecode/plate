import type { Root } from 'mdast';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { type Plugin, unified } from 'unified';

import type { BaseEditor, NormalizePluginState } from '@platejs/core';
import { getPluginKey } from '@platejs/core';
import {
  type Descendant,
  type EditorCoreStateView,
  type EditorDocumentValue,
  type Element,
  ElementApi,
  TextApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { MarkdownPluginState } from '../MarkdownPlugin';
import { mdastToSlate } from '../deserializer/mdastToSlate';
import { htmlToJsx } from '../deserializer/utils/htmlToJsx';
import { splitIncompleteMdx } from '../deserializer/utils/splitIncompleteMdx';
import { stripMarkdownBlocks } from '../deserializer/utils/stripMarkdown';
import type { MdRoot } from '../mdast';
import { defaultRules } from '../rules/defaultRules';
import { convertNodesSerialize } from '../serializer/convertNodesSerialize';
import type {
  DeserializeMdContext,
  MarkdownConversionContext,
  MdRules,
  PlateType,
  SerializeMdContext,
} from '../types';
import {
  getRemarkPluginsWithoutMdx,
  materializeMarkdownSettings,
  materializeRemarkPlugins,
} from '../utils/getRemarkPluginsWithoutMdx';
import type { DeserializeMdOptions, SerializeMdOptions } from '../types';
import type { MarkdownSerializeDocumentValue } from './markdownDocument';

export type MarkdownRuntimeState = NormalizePluginState<MarkdownPluginState>;

type MarkdownPluginRegistry = Readonly<{
  getKey: (type: string) => string | undefined;
  getType: (key: string) => string;
  has: (key: string) => boolean;
}>;

type MarkdownRuntimeOptions = Readonly<{
  allowedNodes: readonly PlateType[] | null;
  allowNode?: MarkdownRuntimeState['allowNode'];
  disallowedNodes: readonly PlateType[] | null;
  plainMarks: readonly PlateType[] | null;
  remarkPlugins: NonNullable<MarkdownRuntimeState['remarkPlugins']>;
  remarkStringifyOptions: NonNullable<
    MarkdownRuntimeState['remarkStringifyOptions']
  > | null;
  rules: NonNullable<MarkdownRuntimeState['rules']> | null;
}>;

export type MarkdownRuntime = Readonly<{
  options: MarkdownRuntimeOptions;
  registry: MarkdownPluginRegistry;
  state: EditorCoreStateView;
}>;

export const createMarkdownRuntime = (
  editor: BaseEditor,
  options: MarkdownRuntimeState,
  state: EditorCoreStateView
): MarkdownRuntime =>
  Object.freeze({
    options: Object.freeze(options),
    registry: Object.freeze({
      getKey: (type: string) => getPluginKey(editor, type),
      getType: (key: string) => editor.getType(key),
      has: (key: string) => editor.plugin({ key }).installed,
    }),
    state,
  });

export const withMarkdownRuntime = <T>(
  editor: BaseEditor,
  options: MarkdownRuntimeState,
  run: (runtime: MarkdownRuntime) => T
): T =>
  editor.read((state) => run(createMarkdownRuntime(editor, options, state)));

export const buildRulesWithRuntime = (runtime: MarkdownRuntime): MdRules => {
  const rules: MdRules = {};

  Object.entries(defaultRules).forEach(([key, rule]) => {
    rules[runtime.registry.getKey(key) ?? key] = rule;
  });

  return rules;
};

const createConversionContext = (
  runtime: MarkdownRuntime
): MarkdownConversionContext => ({
  getPluginKey: (type) => runtime.registry.getKey(type),
  getPluginType: (key) => runtime.registry.getType(key),
  hasPlugin: (key) => runtime.registry.has(key),
  isBlock: (node) => runtime.state.schema.isBlock(node),
  isInline: (node) => runtime.state.schema.isInline(node),
});

export const getMergedOptionsDeserialize = (
  runtime: MarkdownRuntime,
  options?: DeserializeMdOptions
): DeserializeMdContext => {
  const { allowedNodes, allowNode, disallowedNodes, remarkPlugins, rules } =
    runtime.options;

  const context: DeserializeMdContext = {
    allowedNodes:
      options?.allowedNodes ??
      (allowedNodes ? [...allowedNodes] : allowedNodes),
    allowNode: options?.allowNode ?? allowNode,
    disallowedNodes:
      options?.disallowedNodes ??
      (disallowedNodes ? [...disallowedNodes] : disallowedNodes),
    ...createConversionContext(runtime),
    remarkPlugins: options?.withoutMdx
      ? getRemarkPluginsWithoutMdx(options.remarkPlugins ?? remarkPlugins)
      : materializeRemarkPlugins(options?.remarkPlugins ?? remarkPlugins),
    rules: {
      ...buildRulesWithRuntime(runtime),
      ...(options?.rules ?? rules),
    },
    splitLineBreaks: options?.splitLineBreaks,
  };

  return context;
};

export const getMergedOptionsSerialize = (
  runtime: MarkdownRuntime,
  options?: SerializeMdOptions,
  documentOverride?: MarkdownSerializeDocumentValue
): SerializeMdContext => {
  const {
    allowedNodes,
    allowNode,
    disallowedNodes,
    plainMarks,
    remarkPlugins,
    remarkStringifyOptions,
    rules,
  } = runtime.options;

  const document = documentOverride ?? options?.value ?? runtime.state.value();
  const context: SerializeMdContext = {
    allowedNodes:
      options?.allowedNodes ??
      (allowedNodes ? [...allowedNodes] : allowedNodes),
    allowNode: options?.allowNode ?? allowNode,
    disallowedNodes:
      options?.disallowedNodes ??
      (disallowedNodes ? [...disallowedNodes] : disallowedNodes),
    ...createConversionContext(runtime),
    plainMarks:
      options?.plainMarks ?? (plainMarks ? [...plainMarks] : plainMarks),
    preserveEmptyParagraphs: options?.preserveEmptyParagraphs,
    remarkPlugins: materializeRemarkPlugins(
      options?.remarkPlugins ?? remarkPlugins
    ),
    remarkStringifyOptions:
      options?.remarkStringifyOptions ??
      (remarkStringifyOptions
        ? materializeMarkdownSettings(remarkStringifyOptions)
        : remarkStringifyOptions),
    rules: {
      ...buildRulesWithRuntime(runtime),
      ...(options?.rules ?? rules),
    },
    spread: options?.spread,
    value: [...document.children],
    withBlockId: options?.withBlockId ?? false,
  };

  return context;
};

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
): EditorDocumentValue => {
  let output: Descendant[] | null = null;

  try {
    output = markdownToSlateNodesWithRuntime(runtime, data, options);
  } catch (error) {
    options?.onError?.(error as Error);

    if (!options?.withoutMdx) {
      output = markdownToSlateNodesSafelyWithRuntime(runtime, data, options);
    }
  }

  if (!output) return { children: [] };

  return {
    children: output.map((item) =>
      TextApi.isText(item)
        ? ({
            children: [item],
            type: runtime.registry.getType(KEYS.p),
          } as Element)
        : item
    ),
  };
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
  inlineNodes: readonly Descendant[]
): Element | null => {
  if (!ElementApi.isElement(node) || runtime.state.schema.isVoid(node)) {
    return null;
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
      return {
        ...node,
        children: [
          ...node.children.slice(0, -1),
          {
            ...lastChild,
            text:
              lastChild.text +
              inlineNodes.map((inlineNode) => inlineNode.text).join(''),
          },
        ],
      };
    }

    return {
      ...node,
      children: [...node.children, ...inlineNodes],
    };
  }

  for (let i = node.children.length - 1; i >= 0; i--) {
    const child = appendInlineNodesToLastTextContainer(
      runtime,
      node.children[i],
      inlineNodes
    );

    if (child) {
      return {
        ...node,
        children: [
          ...node.children.slice(0, i),
          child,
          ...node.children.slice(i + 1),
        ],
      };
    }
  }

  return null;
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

  if (ElementApi.isElement(lastBlock)) {
    const appendedBlock = appendInlineNodesToLastTextContainer(
      runtime,
      lastBlock,
      incompleteNodes
    );

    if (appendedBlock) {
      return [...completeNodes.slice(0, -1), appendedBlock];
    }
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

export const serializeMdWithRuntime = (
  runtime: MarkdownRuntime,
  options?: SerializeMdOptions,
  document?: MarkdownSerializeDocumentValue
) => {
  const mergedOptions = getMergedOptionsSerialize(runtime, options, document);
  const { remarkPlugins, value } = mergedOptions;
  const toRemarkProcessor = unified()
    .use(remarkPlugins ?? [])
    .use(remarkStringify, {
      emphasis: '_',
      resourceLink: false,
      ...mergedOptions.remarkStringifyOptions,
    });
  return toRemarkProcessor.stringify({
    children: convertNodesSerialize(
      value,
      mergedOptions,
      true
    ) as MdRoot['children'],
    type: 'root',
  });
};
