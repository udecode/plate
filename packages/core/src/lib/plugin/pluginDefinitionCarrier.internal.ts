declare const pluginDefinition: unique symbol;

/** Private invariant normalized-definition witness carried by exact descriptors. */
export interface PluginDefinitionCarrier<D> {
  readonly [pluginDefinition]: (definition: D) => D;
}

/** @internal Extract the normalized author contract carried by a descriptor. */
export type InternalDefinitionOf<P> =
  P extends PluginDefinitionCarrier<infer D> ? D : never;
