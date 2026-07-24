import type { PlatePlugin, PlatePluginMethods, Shortcut } from './PlatePlugin';

import {
  type AnyPluginConfig,
  type AnyPluginTx,
  type PluginConfig,
  type PluginReference,
  type PluginSchemaContext,
  type PluginSchemaDeclaration,
  type PluginSchemaModel,
  type PluginShortcutInput,
  createBasePlugin,
} from '../../lib';
import { toPlatePlugin } from './toPlatePlugin';

type PlatePluginConfig<
  K extends string = any,
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  D extends readonly PluginReference[] = readonly [],
  Enabled extends boolean = boolean,
> = Omit<
  Partial<PlatePlugin<PluginConfig<K, O, A, Tx, S, {}, D, never, {}, Enabled>>>,
  keyof PlatePluginMethods | 'api'
> & {
  api?: A;
};

type CreatePlatePluginConfig<C extends AnyPluginConfig = PluginConfig> = Omit<
  Partial<PlatePlugin<C>>,
  keyof PlatePluginMethods | 'key'
> & {
  api?: C['api'];
  key: C['key'];
};

type NoInferConfig<T> = [T][T extends any ? 0 : never];

type ExplicitTypedPlatePluginConfig<C extends AnyPluginConfig> = [C] extends [
  never,
]
  ? never
  : Omit<CreatePlatePluginConfig<NoInferConfig<C>>, 'shortcuts'> & {
      shortcuts?: never;
    };

type InferredPlateShortcutRecord = Record<string, Shortcut | null | undefined>;

type InferredPlatePluginInput<
  K extends string,
  O,
  A,
  Tx extends AnyPluginTx,
  S,
  D extends readonly PluginReference[],
  Enabled extends boolean,
  TType extends string,
  TShortcuts extends InferredPlateShortcutRecord,
> = Omit<
  PlatePluginConfig<K, O, A, Tx, S, D, Enabled>,
  'enabled' | 'key' | 'schema' | 'shortcuts' | 'type'
> & {
  enabled?: Enabled;
  key: K;
  shortcuts?: PluginShortcutInput<
    PluginConfig<K, O, A, Tx, S, {}, D, never, {}, Enabled>,
    TShortcuts,
    Shortcut
  >;
  type?: TType;
};

type InferredPlatePluginSchemaFactory<
  K extends string,
  O,
  A,
  Tx extends AnyPluginTx,
  S,
  D extends readonly PluginReference[],
  Enabled extends boolean,
  TType extends string,
  TDeclaration extends PluginSchemaDeclaration,
> = (
  context: PluginSchemaContext<
    PluginConfig<K, O, A, Tx, S, {}, D, never, {}, Enabled>,
    TType
  >
) => TDeclaration;

export function createPlatePlugin<
  const K extends string,
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  const D extends readonly PluginReference[] = readonly [],
  const Enabled extends boolean = boolean,
  const TType extends string = K,
  const TShortcuts extends InferredPlateShortcutRecord = {},
  const TDeclaration extends PluginSchemaDeclaration = PluginSchemaDeclaration,
>(
  config: InferredPlatePluginInput<
    K,
    O,
    A,
    Tx,
    S,
    D,
    Enabled,
    TType,
    TShortcuts
  > & {
    schema: InferredPlatePluginSchemaFactory<
      K,
      NoInfer<O>,
      NoInfer<A>,
      NoInfer<Tx>,
      NoInfer<S>,
      NoInfer<D>,
      NoInfer<Enabled>,
      TType,
      TDeclaration
    >;
  }
): PlatePlugin<
  PluginConfig<
    K,
    O,
    A,
    Tx,
    S,
    {},
    D,
    PluginSchemaModel<
      TType,
      InferredPlatePluginSchemaFactory<
        K,
        O,
        A,
        Tx,
        S,
        D,
        Enabled,
        TType,
        TDeclaration
      >
    >,
    {},
    Enabled
  >
>;
export function createPlatePlugin<
  const K extends string,
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  const D extends readonly PluginReference[] = readonly [],
  const Enabled extends boolean = boolean,
  const TType extends string = K,
  const TShortcuts extends InferredPlateShortcutRecord = {},
  const TDeclaration extends PluginSchemaDeclaration = PluginSchemaDeclaration,
>(
  config: InferredPlatePluginInput<
    K,
    O,
    A,
    Tx,
    S,
    D,
    Enabled,
    TType,
    TShortcuts
  > & {
    schema: TDeclaration;
  }
): PlatePlugin<
  PluginConfig<
    K,
    O,
    A,
    Tx,
    S,
    {},
    D,
    PluginSchemaModel<TType, TDeclaration>,
    {},
    Enabled
  >
>;

export function createPlatePlugin<C extends AnyPluginConfig = never>(
  config: ExplicitTypedPlatePluginConfig<C>
): PlatePlugin<C>;

export function createPlatePlugin<
  const K extends string,
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  const D extends readonly PluginReference[] = readonly [],
  const Enabled extends boolean = boolean,
  const TType extends string = K,
  const TShortcuts extends InferredPlateShortcutRecord = {},
>(
  config: InferredPlatePluginInput<
    K,
    O,
    A,
    Tx,
    S,
    D,
    Enabled,
    TType,
    TShortcuts
  > & {
    schema?: null;
  }
): PlatePlugin<
  PluginConfig<
    K,
    O,
    A,
    Tx,
    S,
    {},
    D,
    PluginSchemaModel<TType, null>,
    {},
    Enabled
  >
>;

export function createPlatePlugin(config: any): any {
  const plugin = createBasePlugin(config as any);

  return toPlatePlugin(plugin as any) as any;
}
