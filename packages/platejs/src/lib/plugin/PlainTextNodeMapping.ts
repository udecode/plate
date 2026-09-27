import type { PluginFormatContext, PluginFormatModelView } from './BasePlugin';
import type { AnyBasePluginDefinition } from './PluginDefinition';
import type { PluginFormatNode } from './pluginNodeTypes';

export type PlainTextEncodeContext<
  TNode,
  D extends AnyBasePluginDefinition,
> = Readonly<{
  children: string;
  node: TNode;
  rootText: (slot: string) => string;
}> &
  PluginFormatContext<D> &
  Omit<PluginFormatModelView, 'node'>;

export type PlainTextNodeMapping<D extends AnyBasePluginDefinition> = Readonly<{
  encode: (
    context: PlainTextEncodeContext<PluginFormatNode<D>, D>
  ) => string | undefined;
  kind: 'node';
  priority?: number;
}>;

export type PlainTextNodeMappingInput<D extends AnyBasePluginDefinition> =
  | PlainTextNodeMapping<D>
  | readonly [PlainTextNodeMapping<D>, ...Array<PlainTextNodeMapping<D>>];
