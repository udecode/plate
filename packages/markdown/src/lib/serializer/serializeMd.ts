import type { BaseEditor } from '@platejs/core';
import type { EditorDocumentValue } from '@platejs/plite';

import type { Options as RemarkStringifyOptions } from 'remark-stringify';
import type { Pluggable } from 'unified';

import type { AllowNodeConfig } from '../MarkdownPlugin';
import type { MdRules, PlateType } from '../types';

import { serializeMdWithRuntime } from '../internal/markdownSerializer';
import { withMarkdownRuntime } from '../internal/markdownRuntime';

export type SerializeMdOptions = {
  allowedNodes?: PlateType[] | null;
  allowNode?: AllowNodeConfig;
  disallowedNodes?: PlateType[] | null;
  /** Marks to treat as plain text without applying markdown formatting. */
  plainMarks?: PlateType[] | null;
  preserveEmptyParagraphs?: boolean;
  remarkPlugins?: Pluggable[];
  remarkStringifyOptions?: Readonly<RemarkStringifyOptions> | null;
  rules?: MdRules;
  spread?: boolean;
  value?: EditorDocumentValue;
  withBlockId?: boolean;
};

/** Serialize the editor value to Markdown. */
export const serializeMd = (editor: BaseEditor, options?: SerializeMdOptions) =>
  withMarkdownRuntime(editor, (runtime) =>
    serializeMdWithRuntime(runtime, options)
  );
