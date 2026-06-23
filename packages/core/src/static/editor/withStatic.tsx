import type { Value } from '@platejs/slate';

import {
  createCurrentRuntimeEditor,
  type CurrentRuntimeEditor as Editor,
} from '../../internal/currentRuntimeBridge';
import type { AnyPluginConfig } from '../../lib/plugin';
import type { CorePlugin } from '../../lib/plugins';

import {
  type CreateSlateEditorOptions,
  type InferPlugins,
  type SlatePluginInput,
  type WithSlateOptions,
  withSlate,
} from '../../lib/editor';
import { getStaticPlugins } from '../plugins/getStaticPlugins';

type CreateStaticEditorOptions<
  V extends Value = Value,
  P extends readonly SlatePluginInput[] = readonly CorePlugin[],
> = CreateSlateEditorOptions<V, P> & {};

type WithStaticOptions<
  V extends Value = Value,
  P extends AnyPluginConfig = CorePlugin,
> = WithSlateOptions<V, P> & {};

const withStatic = <
  V extends Value = Value,
  P extends AnyPluginConfig = CorePlugin,
>(
  editor: Editor,
  options: WithStaticOptions<V, P> = {}
) => {
  const { plugins = [], ..._rest } = options;

  const staticPlugins = getStaticPlugins() as any;

  options.plugins = [...staticPlugins, ...plugins];

  return withSlate<V, P>(editor, options);
};

export const createStaticEditor = <
  V extends Value = Value,
  const P extends readonly SlatePluginInput[] = readonly CorePlugin[],
>({
  editor = createCurrentRuntimeEditor(),
  ...options
}: CreateStaticEditorOptions<V, P> = {}) =>
  withStatic<V, InferPlugins<P>>(
    editor,
    options as WithStaticOptions<V, InferPlugins<P>>
  );
