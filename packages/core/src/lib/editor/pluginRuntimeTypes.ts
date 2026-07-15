import type {
  BaseEditor as PliteRuntimeBaseEditor,
  EditorExtensionTypeProvider,
  Value,
} from '@platejs/plite';
import type { UnionToIntersection } from '@udecode/utils';

import type { AnyBasePlugin, BasePlugin } from '../plugin/BasePlugin';
import type {
  AnyPluginConfig,
  InferApi,
  InferState,
  InferTx,
} from '../plugin/PluginConfig';
import type { CorePluginApi, CorePluginConfig, CorePluginTx } from '../plugins';

export type BasePluginInput = AnyPluginConfig | AnyBasePlugin;

export type InferPluginConfig<P> = P extends {
  readonly __config: infer C extends AnyPluginConfig;
}
  ? C
  : P extends BasePlugin<infer C>
    ? C
    : P extends AnyPluginConfig
      ? P
      : never;

export type InferPlugins<T extends readonly unknown[]> = InferPluginConfig<
  T[number]
>;

type IsAny<T> = 0 extends 1 & T ? true : false;

type IsUnknown<T> =
  IsAny<T> extends true
    ? false
    : unknown extends T
      ? [keyof T] extends [never]
        ? true
        : false
      : false;

type WidenLiteral<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends bigint
        ? bigint
        : T;

type IsUnion<T, U = T> = [T] extends [never]
  ? false
  : T extends unknown
    ? [U] extends [T]
      ? false
      : true
    : false;

type KeysOfUnion<T> = T extends unknown ? keyof T : never;

type PickUnionKey<T, K extends PropertyKey> = T extends unknown
  ? K extends keyof T
    ? Pick<T, K>
    : never
  : never;

type ValueOfUnionKey<T, K extends PropertyKey> = T extends unknown
  ? K extends keyof T
    ? T[K]
    : never
  : never;

type WidenDuplicateApiMember<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => WidenLiteral<R>
  : T extends object
    ? MergeEditorApiUnion<T>
    : WidenLiteral<T>;

type OptionalKeysOfUnion<T> = {
  [K in KeysOfUnion<T>]: undefined extends ValueOfUnionKey<T, K> ? K : never;
}[KeysOfUnion<T>];

type RequiredKeysOfUnion<T> = Exclude<KeysOfUnion<T>, OptionalKeysOfUnion<T>>;

type MergeApiUnionMember<T, K extends PropertyKey> =
  IsUnion<PickUnionKey<T, K>> extends true
    ? WidenDuplicateApiMember<Exclude<ValueOfUnionKey<T, K>, undefined>>
    : ValueOfUnionKey<T, K>;

type MergeEditorApiUnion<T> = {
  [K in RequiredKeysOfUnion<T>]: MergeApiUnionMember<T, K>;
} & {
  [K in OptionalKeysOfUnion<T>]?: MergeApiUnionMember<T, K>;
};

export type IsBroadPluginConfig<P> =
  IsAny<P> extends true ? true : P extends { key: infer K } ? IsAny<K> : false;

type KnownPluginConfig<P> = P extends unknown
  ? IsBroadPluginConfig<P> extends true
    ? never
    : P
  : never;

type InferencePluginConfig<P> = [KnownPluginConfig<P>] extends [never]
  ? never
  : IsUnknown<KnownPluginConfig<P>> extends true
    ? never
    : KnownPluginConfig<P>;

type InferApiFromPluginConfig<C> = [C] extends [never]
  ? never
  : C extends AnyPluginConfig
    ? InferApi<C>
    : never;

type InferTxFromPluginConfig<C> = [C] extends [never]
  ? never
  : C extends AnyPluginConfig
    ? InferTx<C>
    : never;

type InferStateFromPluginConfig<C> = [C] extends [never]
  ? never
  : C extends AnyPluginConfig
    ? InferState<C>
    : never;

type MergeObjectApi<T> =
  MergeEditorApiUnion<T> extends infer TApi
    ? TApi extends object
      ? TApi
      : {}
    : {};

type MergeObjectIntersection<T> = [T] extends [never]
  ? {}
  : UnionToIntersection<T> extends infer TObject
    ? TObject extends object
      ? TObject
      : {}
    : {};

type InstalledPluginApi<P> =
  IsAny<P> extends true
    ? Record<string, any>
    : MergeObjectApi<InferApiFromPluginConfig<InferencePluginConfig<P>>>;

type InstalledPluginTx<P> =
  IsAny<P> extends true
    ? Record<string, any>
    : MergeObjectIntersection<
        InferTxFromPluginConfig<InferencePluginConfig<P>>
      >;

type InstalledPluginState<P> =
  IsAny<P> extends true
    ? Record<string, any>
    : MergeObjectIntersection<
        InferStateFromPluginConfig<InferencePluginConfig<P>>
      >;

type PlateInstalledExtension<P> = {
  name: 'plate';
} & EditorExtensionTypeProvider<
  () => {
    api: CorePluginApi & InstalledPluginApi<P>;
    state: InstalledPluginState<CorePluginConfig> & InstalledPluginState<P>;
    tx: CorePluginTx & InstalledPluginTx<P>;
  }
>;

export type PliteEditorWithPlatePlugins<
  V extends Value,
  P extends AnyPluginConfig,
> = PliteRuntimeBaseEditor<V, readonly [PlateInstalledExtension<P>]>;
