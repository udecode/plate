import type {
  EditorApi,
  EditorBase,
  EditorTransforms,
  TRange,
  Value,
} from '@udecode/slate';
import type { UnionToIntersection } from '@udecode/utils';
import type { KeyboardEventLike } from 'is-hotkey';
import type { Draft } from 'mutative';
import type { TStateApi } from 'zustand-x';

import type {
  AnyPluginConfig,
  InferApi,
  InferOptions,
  InferSelectors,
  InferTransforms,
  PluginConfig,
  WithRequiredKey,
} from '../plugin/BasePlugin';
import type {
  AnyEditorPlugin,
  EditorPlugin,
  InjectNodeProps,
} from '../plugin/SlatePlugin';
import type { CorePlugin } from '../plugins';

export type BaseEditor = EditorBase & {
  key: any;
  currentKeyboardEvent: KeyboardEventLike | null;
  /**
   * Whether the editor is a fallback editor.
   *
   * @default false
   * @see {@link createPlateFallbackEditor}
   */
  isFallback: boolean;
  pluginList: any[];
  plugins: Record<string, any>;
  prevSelection: TRange | null;
  setOptions: {
    <C extends AnyPluginConfig>(
      plugin: WithRequiredKey<C>,
      options: (state: Draft<Partial<InferOptions<C>>>) => void
    ): void;
    <C extends AnyPluginConfig>(
      plugin: WithRequiredKey<C>,
      options: Partial<InferOptions<C>>
    ): void;
  };
  getInjectProps: <C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C>
  ) => InjectNodeProps<C>;
  getOption: <
    C extends AnyPluginConfig,
    StateType extends InferOptions<C>,
    TSelectors extends InferSelectors<C>,
    K extends keyof StateType | keyof TSelectors | 'state',
  >(
    plugin: WithRequiredKey<C>,
    key: K,
    ...args: K extends keyof TSelectors ? Parameters<TSelectors[K]> : []
  ) => K extends 'state'
    ? StateType
    : K extends keyof TSelectors
      ? ReturnType<TSelectors[K]>
      : K extends keyof StateType
        ? StateType[K]
        : never;
  getOptions: <C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C>
  ) => InferOptions<C>;
  getOptionsStore: <C extends AnyPluginConfig>(
    plugin: WithRequiredKey<C>
  ) => TStateApi<
    InferOptions<C>,
    [['zustand/mutative-x', never]],
    {},
    InferSelectors<C>
  >;
  getPlugin: <C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C>
  ) => C extends { node: any } ? C : EditorPlugin<C>;
  getType: (plugin: WithRequiredKey) => string;
  setOption: <C extends AnyPluginConfig, K extends keyof InferOptions<C>>(
    plugin: WithRequiredKey<C>,
    optionKey: K,
    value: InferOptions<C>[K]
  ) => void;
};

export type InferPlugins<T extends AnyPluginConfig[]> = T[number];

export type SlateEditor = BaseEditor & {
  api: EditorApi & UnionToIntersection<InferApi<CorePlugin>>;
  pluginList: AnyEditorPlugin[];
  plugins: Record<string, AnyEditorPlugin>;
  // Alias for transforms
  tf: EditorTransforms & UnionToIntersection<InferTransforms<CorePlugin>>;
  transforms: EditorTransforms &
    UnionToIntersection<InferTransforms<CorePlugin>>;
  getApi: <C extends AnyPluginConfig = PluginConfig>(
    plugin?: WithRequiredKey<C>
  ) => SlateEditor['api'] & InferApi<C>;
  getTransforms: <C extends AnyPluginConfig = PluginConfig>(
    plugin?: WithRequiredKey<C>
  ) => SlateEditor['tf'] & InferTransforms<C>;
};

export type TSlateEditor<
  V extends Value = Value,
  P extends AnyPluginConfig = CorePlugin,
> = SlateEditor & {
  api: EditorApi<V> & UnionToIntersection<InferApi<CorePlugin | P>>;
  children: V;
  pluginList: P[];
  plugins: { [K in P['key']]: Extract<P, { key: K }> };
  tf: EditorTransforms<V> &
    UnionToIntersection<InferTransforms<CorePlugin | P>>;
  transforms: EditorTransforms<V> &
    UnionToIntersection<InferTransforms<CorePlugin | P>>;
  getApi: <C extends AnyPluginConfig = PluginConfig>(
    plugin?: WithRequiredKey<C>
  ) => TSlateEditor<V>['api'] & InferApi<C>;
  getTransforms: <C extends AnyPluginConfig = PluginConfig>(
    plugin?: WithRequiredKey<C>
  ) => TSlateEditor<V>['tf'] & InferTransforms<C>;
};
