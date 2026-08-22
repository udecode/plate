import { createEditor, type Editor, type Value } from '@platejs/plite';

import {
  type BasePluginInput,
  type BaseEditor,
  type CreateBaseEditorOptions,
  type EditorValueInput,
  type InferPlugins,
  type InferRuntimePlugins,
  type InternalBaseEditorWithInstalledPlugins,
  type MergeInstalledPluginDefinitions,
  createBaseEditor,
} from '../../lib/editor';
import type { CorePluginDefinition, CorePlugins } from '../../lib/plugins';
import { getStaticPlugins } from '../plugins/getStaticPlugins';

type StaticPluginTuple<P extends readonly unknown[]> = readonly [
  ...ReturnType<typeof getStaticPlugins>,
  ...P,
];

type StaticEditorRuntimePlugins<P extends readonly unknown[] = readonly []> =
  MergeInstalledPluginDefinitions<
    InferRuntimePlugins<CorePlugins>,
    InferRuntimePlugins<StaticPluginTuple<P>>
  >;

type StaticEditorSchemaPlugins<P extends readonly unknown[] = readonly []> =
  MergeInstalledPluginDefinitions<
    CorePluginDefinition,
    InferPlugins<StaticPluginTuple<P>>
  >;

type CreateStaticEditorOptionsForValue<
  V extends Value,
  P extends readonly unknown[] = readonly [],
> = Omit<
  CreateBaseEditorOptions<StaticPluginTuple<P>>,
  'editor' | 'initialValue' | 'plugins'
> & {
  editor?: Editor;
  initialValue?:
    | ((context: {
        editor: InternalBaseEditorWithInstalledPlugins<
          V,
          StaticEditorRuntimePlugins<P>,
          StaticEditorSchemaPlugins<P>
        >;
      }) => EditorValueInput<NoInfer<V>>)
    | EditorValueInput<NoInfer<V>>;
  plugins?: P;
};

export type CreateStaticEditorOptions<
  P extends readonly unknown[] = readonly [],
> = CreateStaticEditorOptionsForValue<Value, P>;

export type StaticEditor<P extends readonly unknown[] = readonly []> =
  BaseEditor<StaticPluginTuple<P>>;

type ProjectInjectedEditor<TEditor, TProjection> = Omit<
  TEditor,
  keyof TProjection
> &
  TProjection;

export function createStaticEditor<
  const TEditor,
  const P extends readonly unknown[] = readonly [],
>(
  options: Omit<CreateStaticEditorOptions<P>, 'editor' | 'initialValue'> & {
    editor: TEditor extends Editor<infer _V, infer _TExtensions>
      ? TEditor
      : never;
    initialValue?: CreateStaticEditorOptionsForValue<
      TEditor extends Editor<infer V, infer _TExtensions> ? V : never,
      P
    >['initialValue'];
  }
): ProjectInjectedEditor<
  TEditor,
  InternalBaseEditorWithInstalledPlugins<
    TEditor extends Editor<infer V, infer _TExtensions> ? V : never,
    StaticEditorRuntimePlugins<P>,
    StaticEditorSchemaPlugins<P>
  >
>;
export function createStaticEditor<
  const P extends readonly unknown[] = readonly [],
>(options?: CreateStaticEditorOptions<P>): StaticEditor<P>;
export function createStaticEditor<
  V extends Value = Value,
  const P extends readonly BasePluginInput[] = readonly [],
>({
  editor,
  id,
  ...options
}: CreateStaticEditorOptionsForValue<
  V,
  P
> = {}): InternalBaseEditorWithInstalledPlugins<
  V,
  StaticEditorRuntimePlugins<P>,
  StaticEditorSchemaPlugins<P>
> {
  const staticEditor = createBaseEditor({
    editor: editor ?? createEditor({ id }),
    ...options,
    plugins: [...getStaticPlugins(), ...(options.plugins ?? [])],
  } as unknown as CreateBaseEditorOptions & {
    editor: ReturnType<typeof createEditor>;
    plugins: readonly BasePluginInput[];
  });

  return staticEditor as unknown as InternalBaseEditorWithInstalledPlugins<
    V,
    StaticEditorRuntimePlugins<P>,
    StaticEditorSchemaPlugins<P>
  >;
}
