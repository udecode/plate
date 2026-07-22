import type { DeserializeMdOptions } from '../deserializer/deserializeMd';
import type { SerializeMdOptions } from '../serializer/serializeMd';
import type {
  DeserializeMdContext,
  MarkdownConversionContext,
  SerializeMdContext,
} from '../types';
import type { MarkdownRuntime } from './markdownRuntime';

import {
  getRemarkPluginsWithoutMdx,
  materializeMarkdownSettings,
  materializeRemarkPlugins,
} from '../utils/getRemarkPluginsWithoutMdx';
import { buildRulesWithRuntime } from './markdownRuntime';

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
    runtime.config;

  return {
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
};

export const getMergedOptionsSerialize = (
  runtime: MarkdownRuntime,
  options?: SerializeMdOptions
): SerializeMdContext => {
  const {
    allowedNodes,
    allowNode,
    disallowedNodes,
    plainMarks,
    remarkPlugins,
    remarkStringifyOptions,
    rules,
  } = runtime.config;

  return {
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
    value: options?.value ?? [...runtime.state.children()],
    withBlockId: options?.withBlockId ?? false,
  };
};
