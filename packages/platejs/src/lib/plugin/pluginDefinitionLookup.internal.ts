import type {
  EditorSchemaDeclaration,
  RuntimePluginReference,
} from '../../facade';
import type {
  AnyBasePluginDefinition,
  DefinitionOf,
  PluginDefinitionWitness,
  PluginSchemaDeclaration,
} from './PluginDefinition';

type ExactPluginDefinitionOf<P> =
  P extends PluginDefinitionWitness<infer D> ? D : never;

type KeysOfUnion<T> = T extends unknown ? keyof T : never;

type DisallowedPluginSchemaKey = Exclude<
  KeysOfUnion<EditorSchemaDeclaration>,
  keyof PluginSchemaDeclaration
>;

type DisallowedPluginSchemaRejection = Readonly<
  Partial<Record<DisallowedPluginSchemaKey, never>>
>;

export type ExactPluginSchemaDeclaration<T extends PluginSchemaDeclaration> =
  T &
    DisallowedPluginSchemaRejection &
    Readonly<
      Partial<
        Record<Exclude<KeysOfUnion<T>, keyof PluginSchemaDeclaration>, never>
      >
    >;

/** Internal exact definition, including finite dependency capability carriers. */
export type InternalPluginDefinitionOf<P> = [
  ExactPluginDefinitionOf<P>,
] extends [never]
  ? P extends RuntimePluginReference
    ? never
    : P extends AnyBasePluginDefinition
      ? P
      : Extract<DefinitionOf<P>, AnyBasePluginDefinition>
  : Extract<ExactPluginDefinitionOf<P>, AnyBasePluginDefinition>;
