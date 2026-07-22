import type { Pluggable } from 'unified';

import type { BaseEditor } from '@platejs/core';
import type { Descendant, Value } from '@platejs/plite';

import type { AllowNodeConfig } from '../MarkdownPlugin';
import type { MdRules, PlateType } from '../types';

import {
  deserializeMdWithRuntime,
  markdownToAstProcessorWithRuntime,
  markdownToSlateNodesWithRuntime,
} from '../internal/markdownDeserializer';
import { withMarkdownRuntime } from '../internal/markdownRuntime';

export type DeserializeMdOptions = {
  allowedNodes?: PlateType[] | null;
  allowNode?: AllowNodeConfig;
  disallowedNodes?: PlateType[] | null;
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
) =>
  withMarkdownRuntime(editor, (runtime) =>
    markdownToAstProcessorWithRuntime(runtime, data, options)
  );

export const markdownToSlateNodes = (
  editor: BaseEditor,
  data: string,
  options?: DeserializeMdOptions
): Descendant[] =>
  withMarkdownRuntime(editor, (runtime) =>
    markdownToSlateNodesWithRuntime(runtime, data, options)
  );

export const deserializeMd = (
  editor: BaseEditor,
  data: string,
  options?: DeserializeMdOptions
): Value =>
  withMarkdownRuntime(editor, (runtime) =>
    deserializeMdWithRuntime(runtime, data, options)
  );
