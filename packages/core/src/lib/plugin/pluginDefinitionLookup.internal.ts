import type { AnyBasePluginDefinition, DefinitionOf } from './PluginDefinition';
import type { InternalDefinitionOf } from './pluginDefinitionCarrier.internal';

/** Internal exact definition, including finite dependency capability carriers. */
export type InternalPluginDefinitionOf<P> = [InternalDefinitionOf<P>] extends [
  never,
]
  ? Extract<DefinitionOf<P>, AnyBasePluginDefinition>
  : Extract<InternalDefinitionOf<P>, AnyBasePluginDefinition>;
