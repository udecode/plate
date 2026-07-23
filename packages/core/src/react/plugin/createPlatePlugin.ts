import type { PlatePlugin, PlatePluginMethods, Shortcut } from './PlatePlugin';

import {
  type AnyPluginConfig,
  type AnyPluginTx,
  type PluginConfig,
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
  D extends readonly unknown[] = readonly [],
  P extends readonly unknown[] = readonly [],
> = Omit<
  Partial<PlatePlugin<PluginConfig<K, O, A, Tx, S, {}, D, P>>>,
  keyof PlatePluginMethods | 'api'
> & {
  api?: A;
};

type CreatePlatePluginConfig<C extends AnyPluginConfig = PluginConfig> = Omit<
  Partial<PlatePlugin<C>>,
  keyof PlatePluginMethods
> & {
  api?: C['api'];
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
  P extends readonly unknown[],
  D extends readonly unknown[],
  TType extends string,
  TShortcuts extends InferredPlateShortcutRecord,
> = Omit<
  PlatePluginConfig<K, O, A, Tx, S, D, P>,
  'key' | 'schema' | 'shortcuts' | 'type'
> & {
  key: K;
  shortcuts?: PluginShortcutInput<
    PluginConfig<K, O, A, Tx, S, {}, D>,
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
  D extends readonly unknown[],
  TType extends string,
  TDeclaration extends PluginSchemaDeclaration,
> = (
  context: PluginSchemaContext<PluginConfig<K, O, A, Tx, S, {}, D>, TType>
) => TDeclaration;

export function createPlatePlugin<
  const K extends string,
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  const P extends readonly unknown[] = readonly [],
  const D extends readonly unknown[] = readonly [],
  const TType extends string = K,
  const TShortcuts extends InferredPlateShortcutRecord = {},
  const TDeclaration extends PluginSchemaDeclaration = PluginSchemaDeclaration,
>(
  config: InferredPlatePluginInput<K, O, A, Tx, S, P, D, TType, TShortcuts> & {
    schema: InferredPlatePluginSchemaFactory<
      K,
      NoInfer<O>,
      NoInfer<A>,
      NoInfer<Tx>,
      NoInfer<S>,
      NoInfer<D>,
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
    P,
    PluginSchemaModel<
      TType,
      InferredPlatePluginSchemaFactory<K, O, A, Tx, S, D, TType, TDeclaration>
    >
  >
>;
export function createPlatePlugin<
  const K extends string,
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  const P extends readonly unknown[] = readonly [],
  const D extends readonly unknown[] = readonly [],
  const TType extends string = K,
  const TShortcuts extends InferredPlateShortcutRecord = {},
  const TDeclaration extends PluginSchemaDeclaration = PluginSchemaDeclaration,
>(
  config: InferredPlatePluginInput<K, O, A, Tx, S, P, D, TType, TShortcuts> & {
    schema: TDeclaration;
  }
): PlatePlugin<
  PluginConfig<K, O, A, Tx, S, {}, D, P, PluginSchemaModel<TType, TDeclaration>>
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
  const P extends readonly unknown[] = readonly [],
  const D extends readonly unknown[] = readonly [],
  const TType extends string = K,
  const TShortcuts extends InferredPlateShortcutRecord = {},
>(
  config: InferredPlatePluginInput<K, O, A, Tx, S, P, D, TType, TShortcuts> & {
    schema?: null;
  }
): PlatePlugin<
  PluginConfig<K, O, A, Tx, S, {}, D, P, PluginSchemaModel<TType, null>>
>;

export function createPlatePlugin(
  config?: Omit<CreatePlatePluginConfig, 'shortcuts'> & {
    shortcuts?: never;
  }
): PlatePlugin<PluginConfig>;

export function createPlatePlugin(config: any = {}): any {
  const plugin = createBasePlugin(config as any);

  return toPlatePlugin(plugin as any) as any;
}
