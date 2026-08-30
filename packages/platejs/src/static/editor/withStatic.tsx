import { createEditor as createPliteEditor, type Value } from '../../facade';
import type {
  BasePluginInput,
  Editor,
  CreateEditorOptions,
  EditorValueInput,
  InferPlugins,
  InferRuntimePlugins,
  InternalBaseEditorWithInstalledPlugins,
  MergeInstalledPluginDefinitions,
} from '../../lib/editor';
import { applyEditor } from '../../lib/editor/withPlite';
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
  CreateEditorOptions<Value, readonly [], StaticPluginTuple<P>>,
  'initialValue' | 'plugins'
> & {
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

export type StaticEditor<P extends readonly unknown[] = readonly []> = Editor<
  Value,
  readonly [],
  StaticPluginTuple<P>
>;

export function createStaticEditor<
  const P extends readonly unknown[] = readonly [],
>(options?: CreateStaticEditorOptions<P>): StaticEditor<P>;
export function createStaticEditor<
  V extends Value = Value,
  const P extends readonly BasePluginInput[] = readonly [],
>({
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
  const editor = createPliteEditor({ id });
  const staticEditor = applyEditor(
    editor,
    {
      ...options,
      plugins: [...getStaticPlugins(), ...(options.plugins ?? [])],
    } as unknown as Parameters<typeof applyEditor>[1],
    true
  );

  return staticEditor as unknown as InternalBaseEditorWithInstalledPlugins<
    V,
    StaticEditorRuntimePlugins<P>,
    StaticEditorSchemaPlugins<P>
  >;
}
