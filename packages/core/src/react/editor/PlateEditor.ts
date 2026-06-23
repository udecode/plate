import type {
  EditorUpdateContext,
  EditorUpdateOptions,
  EditorUpdateTransaction,
  Value,
} from '@platejs/plite';
import type {
  CurrentRuntimeDescendantIn as DescendantIn,
  CurrentRuntimeEditorApi as EditorApi,
  CurrentRuntimeOperation as Operation,
} from '../../internal/currentRuntimeBridge';
import type { UnionToIntersection } from '@udecode/utils';

import type {
  AnyPluginConfig,
  BaseEditor,
  InferApi,
  InferKey,
  InferTx,
  PluginConfig,
  WithRequiredKey,
} from '../../lib';
import type { ResolvedInputRulesMeta } from '../../lib/plugins/input-rules/types';
import type {
  AnyEditorPlatePlugin,
  EditorPlatePlugin,
  PlatePlugin,
  Shortcuts,
} from '../plugin/PlatePlugin';
import type { PlateCorePlugin } from './withPlate';

export type PlateEditor = BaseEditor & {
  api: EditorApi & UnionToIntersection<InferApi<PlateCorePlugin>>;
  meta: BaseEditor['meta'] & {
    inputRules: ResolvedInputRulesMeta;
    pluginList: AnyEditorPlatePlugin[];
    shortcuts: Shortcuts;
  };
  plugins: Record<string, AnyEditorPlatePlugin>;
  getPlugin: <C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C>
  ) => C extends { node: any } ? C : EditorPlatePlugin<C>;
  update: <TTx extends object = {}>(
    fn: (
      transaction: EditorUpdateTransaction & TTx,
      context: EditorUpdateContext
    ) => void,
    options?: EditorUpdateOptions
  ) => void;
  uid?: string;
};

type FilterKeys<T, K extends keyof T> = {
  [P in keyof T as Exclude<P, K>]: T[P];
};

type InferInstalledPlatePluginTx<P> =
  P extends PlatePlugin<infer C> ? InferTx<C> : InferTx<P>;

export type TPlateEditor<
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
> = FilterKeys<PlateEditor, 'children' | 'operations' | 'update'> & {
  api: EditorApi<V> & UnionToIntersection<InferApi<P | PlateCorePlugin>>;
  children: V;
  meta: BaseEditor['meta'] & {
    inputRules: ResolvedInputRulesMeta;
    pluginList: P[];
    shortcuts: Shortcuts;
  };
  operations: Operation<DescendantIn<V>>[];
  plugins: { [K in P['key']]: Extract<P, { key: K }> };
  update: <TTx extends object = {}>(
    fn: (
      transaction: EditorUpdateTransaction<V> &
        UnionToIntersection<InferInstalledPlatePluginTx<P | PlateCorePlugin>> &
        TTx,
      context: EditorUpdateContext
    ) => void,
    options?: EditorUpdateOptions
  ) => void;
};

export type KeyofPlugins<T extends AnyPluginConfig> =
  | (string & {})
  | InferKey<PlateCorePlugin | T>;
