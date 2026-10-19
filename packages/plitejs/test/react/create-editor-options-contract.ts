import {
  createEditor,
  type CreateEditorOptions,
  defineEditorSchema,
  type EditorLifecycleErrorSink,
  type PluginsOf,
  schema,
  type Value,
  type ValueOf,
} from 'plitejs';
import { history } from 'plitejs/history';
import { createEditor as createReactEditor, useEditor } from 'plitejs/react';

import type { UnknownEditorOptionTarget } from '../../src/internal/editor-options';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Assert<T extends true> = T;

const withoutSink = createEditor({
  initialValue: [{ children: [{ text: 'One' }], type: 'paragraph' }],
});

export type InitialValueInfersItsDocument = Assert<
  Equal<
    ValueOf<typeof withoutSink>,
    ReadonlyArray<{
      readonly children: ReadonlyArray<{ readonly text: string }>;
      readonly type: string;
    }>
  >
>;

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

export type SchemaPluginsDeriveTheDocument = Assert<
  Equal<ValueOf<typeof withSchema>[number]['type'], 'paragraph'>
>;
export type SchemaPluginsKeepTheirTuple = Assert<
  Equal<PluginsOf<typeof withSchema>, readonly [typeof paragraphSchema]>
>;

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

const flag = Math.random() > 0.5;
const fromEitherSchemaOptions = createEditor(
  flag
    ? { plugins: [paragraphSchema] }
    : { plugins: [paragraphSchema, history()] }
);
const fromEitherReactOptions = createReactEditor(
  flag
    ? { plugins: [paragraphSchema] }
    : { plugins: [paragraphSchema, history()] }
);
const useEitherOptions = () =>
  useEditor(
    flag
      ? { plugins: [paragraphSchema] }
      : { plugins: [paragraphSchema, history()] }
  );
const fromEitherWithEmptyValue = createEditor(
  flag
    ? { initialValue: [], plugins: [paragraphSchema] }
    : { plugins: [paragraphSchema] }
);

export type UnionOptionsKeepSchemaValue = Assert<
  Equal<ValueOf<typeof fromEitherSchemaOptions>, ValueOf<typeof withSchema>>
>;
export type ReactUnionOptionsKeepSchemaValue = Assert<
  Equal<ValueOf<typeof fromEitherReactOptions>, ValueOf<typeof withSchema>>
>;
export type HookUnionOptionsKeepSchemaValue = Assert<
  Equal<
    ValueOf<ReturnType<typeof useEitherOptions>>,
    ValueOf<typeof withSchema>
  >
>;
export type UnionWithEmptyValueKeepsSchemaValue = Assert<
  Equal<ValueOf<typeof fromEitherWithEmptyValue>, ValueOf<typeof withSchema>>
>;

const forwardSink = <TSink extends EditorLifecycleErrorSink>(sink: TSink) =>
  createEditor({ lifecycleErrorSink: sink, plugins: [paragraphSchema] });
const forwardReactSink = <TSink extends EditorLifecycleErrorSink>(
  sink: TSink
) =>
  createReactEditor({ lifecycleErrorSink: sink, plugins: [paragraphSchema] });
const useForwardedSink = <TSink extends EditorLifecycleErrorSink>(
  sink: TSink
) => useEditor({ lifecycleErrorSink: sink, plugins: [paragraphSchema] });

export type GenericSinkKeepsSchemaValue = Assert<
  Equal<
    ValueOf<ReturnType<typeof forwardSink<typeof report>>>,
    ValueOf<typeof withSchema>
  >
>;
export type GenericReactSinkKeepsSchemaValue = Assert<
  Equal<
    ValueOf<ReturnType<typeof forwardReactSink<typeof report>>>,
    ValueOf<typeof withSchema>
  >
>;
export type GenericHookSinkKeepsSchemaValue = Assert<
  Equal<
    ValueOf<ReturnType<typeof useForwardedSink<typeof report>>>,
    ValueOf<typeof withSchema>
  >
>;

const forwardOptions = <const TOptions extends { plugins: SchemaPlugins }>(
  options: TOptions
) => createEditor(options);
const forwardReactOptions = <const TOptions extends { plugins: SchemaPlugins }>(
  options: TOptions
) => createReactEditor(options);
const useForwardedOptions = <const TOptions extends { plugins: SchemaPlugins }>(
  options: TOptions
) => useEditor(options);
type SchemaOptions = { readonly plugins: SchemaPlugins };

export type ForwardedOptionsKeepSchemaValue = Assert<
  Equal<
    ValueOf<ReturnType<typeof forwardOptions<SchemaOptions>>>,
    ValueOf<typeof withSchema>
  >
>;
export type ForwardedReactOptionsKeepSchemaValue = Assert<
  Equal<
    ValueOf<ReturnType<typeof forwardReactOptions<SchemaOptions>>>,
    ValueOf<typeof withSchema>
  >
>;
export type ForwardedHookOptionsKeepSchemaValue = Assert<
  Equal<
    ValueOf<ReturnType<typeof useForwardedOptions<SchemaOptions>>>,
    ValueOf<typeof withSchema>
  >
>;

const forwardReadonly = <const TOptions extends { plugins: SchemaPlugins }>(
  options: Readonly<TOptions>
) => createEditor(options);
const forwardReactReadonly = <
  const TOptions extends { plugins: SchemaPlugins },
>(
  options: Readonly<TOptions>
) => createReactEditor(options);
const useForwardedReadonly = <
  const TOptions extends { plugins: SchemaPlugins },
>(
  options: Readonly<TOptions>
) => useEditor(options);
const forwardRest = <
  const TOptions extends { plugins: SchemaPlugins; tag?: string },
>({
  tag,
  ...options
}: TOptions) => createEditor(options);
const forwardReactRest = <
  const TOptions extends { plugins: SchemaPlugins; tag?: string },
>({
  tag,
  ...options
}: TOptions) => createReactEditor(options);
const useForwardedRest = <
  const TOptions extends { plugins: SchemaPlugins; tag?: string },
>({
  tag,
  ...options
}: TOptions) => useEditor(options);
const forwardPicked = <
  const TOptions extends { plugins: SchemaPlugins },
  K extends keyof TOptions,
>(
  options: Pick<TOptions, K>
) => createEditor(options);
const forwardOmitted = <
  const TOptions extends { plugins: SchemaPlugins },
  K extends keyof TOptions,
>(
  options: Omit<TOptions, K>
) => createEditor(options);
type TaggedSchemaOptions = SchemaOptions & { readonly tag?: string };

export type MappedOptionsKeepSchemaValue = Assert<
  Equal<
    [
      ValueOf<ReturnType<typeof forwardReadonly<SchemaOptions>>>,
      ValueOf<ReturnType<typeof forwardReactReadonly<SchemaOptions>>>,
      ValueOf<ReturnType<typeof useForwardedReadonly<SchemaOptions>>>,
      ValueOf<ReturnType<typeof forwardRest<TaggedSchemaOptions>>>,
      ValueOf<ReturnType<typeof forwardReactRest<TaggedSchemaOptions>>>,
      ValueOf<ReturnType<typeof useForwardedRest<TaggedSchemaOptions>>>,
      ValueOf<
        ReturnType<typeof forwardPicked<SchemaOptions, keyof SchemaOptions>>
      >,
      ValueOf<ReturnType<typeof forwardOmitted<TaggedSchemaOptions, 'tag'>>>,
    ],
    [
      ValueOf<typeof withSchema>,
      ValueOf<typeof withSchema>,
      ValueOf<typeof withSchema>,
      ValueOf<typeof withSchema>,
      ValueOf<typeof withSchema>,
      ValueOf<typeof withSchema>,
      ValueOf<typeof withSchema>,
      ValueOf<typeof withSchema>,
    ]
  >
>;

const forwardDocumentRest = <
  const TOptions extends {
    initialValue: Value;
    plugins?: never;
    tag?: string;
  },
>({
  tag,
  ...options
}: TOptions) => createEditor(options);

export type MappedDocumentOptionsKeepTheirValue = Assert<
  Equal<
    ValueOf<
      ReturnType<
        typeof forwardDocumentRest<{
          readonly initialValue: typeof reactValue;
          readonly tag: 'a';
        }>
      >
    >,
    typeof reactValue
  >
>;

createEditor({
  lifecycleErrorSink(error) {
    error.editor.read.children()[0]?.children[0]?.text.toUpperCase();
  },
});

const noPluginsSlot: {
  initialValue: typeof reactValue;
  lifecycleErrorSink: EditorLifecycleErrorSink;
  plugins?: undefined;
} = { initialValue: reactValue, lifecycleErrorSink: report };
createEditor(noPluginsSlot);

const unreachable = (): never => {
  throw new Error('unreachable');
};

export const refuseUnknownKeyValuedNever = () => {
  // @ts-expect-error -- an unknown key is refused whatever its value
  createEditor({ plugins: [paragraphSchema], typo: unreachable() });
  createReactEditor({
    plugins: [paragraphSchema],
    // @ts-expect-error -- an unknown key is refused whatever its value
    typo: unreachable(),
  });
};

export const refuseUnknownKeyInOneBranch = () =>
  createReactEditor(
    flag
      ? {
          plugins: [paragraphSchema],
          // @ts-expect-error -- an unknown key in one branch is refused
          value: reactValue,
        }
      : { plugins: [paragraphSchema] }
  );

export type LastOverloadKeepsHeadParameters = Assert<
  Equal<
    Parameters<typeof createEditor>,
    [
      options?: Omit<CreateEditorOptions, 'plugins'> & {
        plugins?: never;
      },
    ]
  >
>;

export const refuseWrongKnownValueAtItsKey = () =>
  createEditor({
    // @ts-expect-error -- a wrong known value fails at its own key
    readOnly: 'yes',
  });

export const refuseUnknownKeyWithoutPlugins = () =>
  // @ts-expect-error -- an unknown key is refused without plugins too
  createEditor({ readOnly: true, value: reactValue });

export const refuseWhatAnExplicitOptionsTypeRefuses = () => {
  // @ts-expect-error -- an index signature keeps its value type
  createEditor<Record<string, never>>({ readOnly: true });
  // @ts-expect-error -- a never options type takes no document
  createEditor<never>({ initialValue: reactValue });
  // @ts-expect-error -- a literal options type keeps its value
  createEditor<{ readOnly: true }>({ readOnly: false });
  // @ts-expect-error -- an options type keeps its required keys
  createEditor<{ id: string }>({});
};

export type UnknownKeyTargetNamesTheKey = Assert<
  Equal<
    UnknownEditorOptionTarget<
      { readonly readOnly: true; readonly value: 1 },
      { readOnly?: boolean }
    >,
    {
      readonly readOnly: true;
      readonly value: 1;
    } & "Unknown editor option 'value'"
  >
>;

type PluginBranches =
  | {
      readonly id: 'a';
      readonly plugins: readonly [typeof paragraphSchema];
      readonly readOnly: true;
    }
  | {
      readonly id: 'b';
      readonly plugins: readonly [typeof paragraphSchema];
      readonly readOnly: false;
    };
type SinkBranches =
  | {
      readonly id: 'a';
      readonly lifecycleErrorSink: (error: unknown) => void;
      readonly plugins: readonly [typeof paragraphSchema];
    }
  | {
      readonly id: 'b';
      readonly lifecycleErrorSink: EditorLifecycleErrorSink;
      readonly plugins: readonly [typeof paragraphSchema];
    };

export const keepEachMemberOfAnExplicitUnion = () => {
  const plugins = [paragraphSchema] as const;
  createEditor<PluginBranches>({ id: 'a', plugins, readOnly: true });
  // @ts-expect-error -- a call cannot mix two members' values
  createEditor<PluginBranches>({ id: 'a', plugins, readOnly: false });
  createReactEditor<SinkBranches>({
    id: 'b',
    lifecycleErrorSink(error) {
      error.editor.read.children();
    },
    plugins: [paragraphSchema],
  });
  // @ts-expect-error -- a primitive fits no member
  createEditor<{ readonly id: 'a' } | { readonly readOnly: true }>(42);
};

type MetaBranches = PluginBranches & { readonly metadata?: string };
type MetaSinkBranches = SinkBranches & { readonly metadata?: string };
type UnknownInOneBranch =
  | { readonly id: 'a' }
  | { readonly readOnly: true; readonly value: typeof reactValue };

export const keepEachMemberBesideAnUnknownKey = () => {
  const plugins = [paragraphSchema] as const;
  // @ts-expect-error -- a call cannot mix two members' values
  createEditor<MetaBranches>({ id: 'a', plugins, readOnly: false });
  createReactEditor<MetaSinkBranches>({
    id: 'b',
    lifecycleErrorSink(error) {
      error.editor.read.children();
    },
    plugins: [paragraphSchema],
  });
  // @ts-expect-error -- a primitive fits no member
  createEditor<UnknownInOneBranch>(42);
  // @ts-expect-error -- a key no member has is refused
  createEditor<UnknownInOneBranch>({ valu: 1 });
};
