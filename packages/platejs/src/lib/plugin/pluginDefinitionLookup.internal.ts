import type {
  AnyBasePluginDefinition,
  DefinitionOf,
  PluginDefinitionWitness,
} from './PluginDefinition';

type ExactPluginDefinitionOf<P> =
  P extends PluginDefinitionWitness<infer D> ? D : never;

/** Internal exact definition, including finite dependency capability carriers. */
export type InternalPluginDefinitionOf<P> = [
  ExactPluginDefinitionOf<P>,
] extends [never]
  ? P extends AnyBasePluginDefinition
    ? P
    : Extract<DefinitionOf<P>, AnyBasePluginDefinition>
  : Extract<ExactPluginDefinitionOf<P>, AnyBasePluginDefinition>;
