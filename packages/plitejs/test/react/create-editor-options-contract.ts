import {
  createEditor,
  defineEditorSchema,
  type EditorLifecycleErrorSink,
  schema,
  type ValueOf,
} from 'plitejs';
import type { history } from 'plitejs/history';
import { createEditor as createReactEditor, useEditor } from 'plitejs/react';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Assert<T extends true> = T;

const withoutSink = createEditor({
  initialValue: [{ children: [{ text: 'One' }], type: 'paragraph' }],
});
const withUndefinedSink = createEditor({
  initialValue: [{ children: [{ text: 'One' }], type: 'paragraph' }],
  lifecycleErrorSink: undefined,
});

export type UndefinedSinkKeepsInferredValue = Assert<
  Equal<ValueOf<typeof withUndefinedSink>, ValueOf<typeof withoutSink>>
>;

const withInlineSink = createEditor({
  initialValue: [{ children: [{ text: 'One' }], type: 'paragraph' }],
  lifecycleErrorSink: (error) => report(error),
});

export type InlineSinkKeepsInferredValue = Assert<
  Equal<ValueOf<typeof withInlineSink>, ValueOf<typeof withoutSink>>
>;

const report: EditorLifecycleErrorSink = () => {};
const paragraphSchema = defineEditorSchema('schema:create-editor-options', {
  elements: {
    paragraph: { content: schema.content.text({ default: 'text', min: 1 }) },
  },
  id: 'create-editor-options',
  root: schema.content.group('block', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

createEditor({
  initialValue: [{ children: [{ text: 'One' }], type: 'paragraph' }],
  lifecycleErrorSink: report,
});
export const createReportingEditor = (
  lifecycleErrorSink?: EditorLifecycleErrorSink
) => createEditor({ lifecycleErrorSink, plugins: [paragraphSchema] });

const withUndefinedPlugins = createEditor({
  initialValue: [{ children: [{ text: 'One' }], type: 'paragraph' }],
  lifecycleErrorSink: report,
  plugins: undefined,
});

export type UndefinedPluginsKeepInferredValue = Assert<
  Equal<ValueOf<typeof withUndefinedPlugins>, ValueOf<typeof withoutSink>>
>;

const reactValue = [
  { children: [{ text: 'One' }], type: 'paragraph' as const },
];
const reactWithoutSink = createReactEditor({
  initialValue: reactValue,
  plugins: [paragraphSchema],
});
const reactWithSink = createReactEditor({
  initialValue: reactValue,
  lifecycleErrorSink: report,
  plugins: [paragraphSchema],
});
const useEditorWithSink = () =>
  useEditor({
    initialValue: reactValue,
    lifecycleErrorSink: report,
    plugins: [paragraphSchema],
  });

export type ReactSinkKeepsInferredValue = Assert<
  Equal<ValueOf<typeof reactWithSink>, ValueOf<typeof reactWithoutSink>>
>;
export type UseEditorSinkKeepsInferredValue = Assert<
  Equal<
    ValueOf<ReturnType<typeof useEditorWithSink>>,
    ValueOf<typeof reactWithoutSink>
  >
>;

const withSchema = createEditor({ plugins: [paragraphSchema] });
const forward = <const TPlugins extends readonly unknown[]>(
  plugins: TPlugins
) => createEditor({ plugins });
const forwardReact = <const TPlugins extends readonly unknown[]>(
  plugins: TPlugins
) => createReactEditor({ plugins });
const useForwardedPlugins = <const TPlugins extends readonly unknown[]>(
  plugins: TPlugins
) => useEditor({ plugins });
type SchemaPlugins = readonly [typeof paragraphSchema];

export type GenericPluginsKeepSchemaValue = Assert<
  Equal<
    ValueOf<ReturnType<typeof forward<SchemaPlugins>>>,
    ValueOf<typeof withSchema>
  >
>;
export type GenericReactPluginsKeepSchemaValue = Assert<
  Equal<
    ValueOf<ReturnType<typeof forwardReact<SchemaPlugins>>>,
    ValueOf<typeof withSchema>
  >
>;
export type GenericHookPluginsKeepSchemaValue = Assert<
  Equal<
    ValueOf<ReturnType<typeof useForwardedPlugins<SchemaPlugins>>>,
    ValueOf<typeof withSchema>
  >
>;

const optionalPlugins: {
  plugins?: readonly [ReturnType<typeof history>];
} = {};
const maybeUndefinedPlugins: {
  plugins: readonly [ReturnType<typeof history>] | undefined;
} = { plugins: undefined };

// @ts-expect-error -- optional plugins are refused
createEditor(optionalPlugins);
// @ts-expect-error -- plugins that may be undefined are refused
createEditor(maybeUndefinedPlugins);
