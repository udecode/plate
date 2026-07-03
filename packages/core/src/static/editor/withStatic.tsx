import { createEditor, type Editor, type Value } from '@platejs/plite';
import type { CorePluginConfig } from '../../lib/plugins';

import {
  type BaseEditor,
  type BasePluginInput,
  type CreateBaseEditorOptions,
  type InferPluginConfig,
  extendBaseEditor,
} from '../../lib/editor';
import { getStaticPlugins } from '../plugins/getStaticPlugins';

type CreateStaticEditorOptions<
  V extends Value = Value,
  P extends readonly BasePluginInput[] = readonly [],
> = CreateBaseEditorOptions<V, P>;

type StaticPluginInput<P extends readonly BasePluginInput[] = readonly []> =
  | ReturnType<typeof getStaticPlugins>[number]
  | P[number];

type StaticEditorPlugins<P extends readonly BasePluginInput[] = readonly []> =
  | CorePluginConfig
  | InferPluginConfig<StaticPluginInput<P>>;

const extendStaticEditor = <
  V extends Value = Value,
  const P extends readonly BasePluginInput[] = readonly [],
>(
  editor: Editor,
  options: CreateStaticEditorOptions<V, P> = {}
) => {
  const { plugins = [] } = options;

  return extendBaseEditor<V, StaticPluginInput<P>>(editor, {
    ...options,
    plugins: [...getStaticPlugins(), ...plugins],
  });
};

export const createStaticEditor = <
  V extends Value = Value,
  const P extends readonly BasePluginInput[] = readonly [],
>({
  editor = createEditor(),
  ...options
}: CreateStaticEditorOptions<V, P> = {}): BaseEditor<
  V,
  StaticEditorPlugins<P>
> => extendStaticEditor<V, P>(editor, options);
