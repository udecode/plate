import type { Pluggable } from 'unified';

import type { BaseEditor } from '@platejs/core';

import type { AllowNodeConfig } from '../MarkdownPlugin';
import type { MdRules, PlateType } from '../types';

import { deserializeMdWithRuntime } from '../internal/markdownDeserializer';
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

export const deserializeMd = (
  editor: BaseEditor,
  data: string,
  options?: DeserializeMdOptions
) =>
  withMarkdownRuntime(editor, (runtime) =>
    deserializeMdWithRuntime(runtime, data, options)
  );
