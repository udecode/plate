import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import {
  type BasePluginInput,
  BaseParagraphPlugin,
  createEditor,
  type Element,
  type EditorDocumentValue,
  type Value,
} from '../../../core';
import {
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHeadingPlugin,
  BaseHighlightPlugin,
  BaseHorizontalRulePlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseScriptPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from '../../../features/basic-nodes';
import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontFamilyPlugin,
  BaseFontSizePlugin,
  BaseFontWeightPlugin,
} from '../../../features/basic-styles';
import { BaseCalloutPlugin } from '../../../features/callout';
import { BaseCodeBlockPlugin } from '../../../features/code-block';
import { BaseDatePlugin } from '../../../features/date';
import { BaseDetailsPlugin } from '../../../features/details';
import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
} from '../../../features/footnote';
import { BaseColumnPlugin } from '../../../features/layout';
import { BaseLinkPlugin } from '../../../features/link';
import { BaseListPlugin } from '../../../features/list';
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin,
} from '../../../features/media';
import { BaseMentionPlugin } from '../../../features/mention';
import { BaseTablePlugin } from '../../../features/table';
import { BaseTocPlugin } from '../../../features/toc';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from '../../../math';
import {
  withMarkdownRuntime,
  getMergedOptionsDeserialize,
  getMergedOptionsSerialize,
} from '../internal/markdownConversion';
import { createMarkdownModelLocator } from '../internal/markdownDiagnostics';
import { type MarkdownApi, MarkdownPlugin } from '../MarkdownPlugin';
import type {
  MarkdownEditorSerializeOptions,
  MarkdownParsePolicy,
  MarkdownSerializePolicy,
} from '../types';

const testSchemaPlugins: readonly BasePluginInput[] = [
  BaseHeadingPlugin,

  BaseBlockquotePlugin,
  BaseHorizontalRulePlugin,
  BaseBoldPlugin,
  BaseItalicPlugin,
  BaseUnderlinePlugin,
  BaseCodePlugin,
  BaseStrikethroughPlugin,
  BaseScriptPlugin,
  BaseHighlightPlugin,
  BaseKbdPlugin,
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontFamilyPlugin,
  BaseFontSizePlugin,
  BaseFontWeightPlugin,
  BaseLinkPlugin,
  BaseCodeBlockPlugin,
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
  BaseListPlugin,
  BaseMentionPlugin,
  BaseDatePlugin,
  BaseDetailsPlugin,
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
  BaseFilePlugin,
  BaseAudioPlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin,
  BaseColumnPlugin,
  BaseTablePlugin,
  BaseCalloutPlugin,
  BaseTocPlugin,
];

const markdownPlugin = MarkdownPlugin.configure({
  initialState: {
    remarkPlugins: [remarkMath, remarkGfm, remarkEmoji],
  },
});

export const createTestEditor = () =>
  createEditor({
    plugins: [BaseParagraphPlugin, ...testSchemaPlugins, markdownPlugin],
  });

type TestMarkdownEditor<V extends Value = Value> = Readonly<{
  api: Readonly<{ markdown: MarkdownApi<V> }>;
}>;

export const parseTestMarkdown = <V extends Value>(
  editor: TestMarkdownEditor<V>,
  source: string,
  options?: MarkdownParsePolicy
): EditorDocumentValue<V> => {
  const result = editor.api.markdown.parse(source, options);

  if (!result.ok) {
    throw new Error(
      result.diagnostics.map(({ message }) => message).join('\n')
    );
  }

  return result.document;
};

export const parseTestMarkdownInline = <V extends Value>(
  editor: TestMarkdownEditor<V>,
  source: string,
  options?: MarkdownParsePolicy
) => {
  const result = editor.api.markdown.parseInline(source, options);

  if (!result.ok) {
    throw new Error(
      result.diagnostics.map(({ message }) => message).join('\n')
    );
  }

  return result.slice.content;
};

export const serializeTestMarkdown = <V extends Value>(
  editor: TestMarkdownEditor<V>,
  options?: MarkdownEditorSerializeOptions<V>
) => {
  const result = editor.api.markdown.serialize(options);

  if (!result.ok) {
    throw new Error(
      result.diagnostics.map(({ message }) => message).join('\n')
    );
  }

  return result;
};

export const getTestDeserializeOptions = (
  editor: ReturnType<typeof createTestEditor>,
  options?: MarkdownParsePolicy
) =>
  withMarkdownRuntime(
    editor,
    editor.plugin(MarkdownPlugin).store.get(),
    (runtime) => getMergedOptionsDeserialize(runtime, options)
  );

export const getTestSerializeOptions = (
  editor: ReturnType<typeof createTestEditor>,
  options?: MarkdownSerializePolicy
) =>
  withMarkdownRuntime(
    editor,
    editor.plugin(MarkdownPlugin).store.get(),
    (runtime) => getMergedOptionsSerialize(runtime, options)
  );

export const withTestSerializeDocument = (
  options: ReturnType<typeof getTestSerializeOptions>,
  children: readonly Element[]
) => {
  const document: EditorDocumentValue = { children: [...children] };

  return {
    ...options,
    document,
    modelLocation: createMarkdownModelLocator(document),
    value: document.children,
  };
};
