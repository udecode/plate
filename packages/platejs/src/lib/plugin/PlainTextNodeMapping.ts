import type { PluginFormatContext, PluginFormatModelView } from './BasePlugin';
import type { AnyBasePluginDefinition } from './PluginDefinition';
import type { PluginFormatIsMark, PluginFormatNode } from './pluginNodeTypes';

/** Context supplied to a plugin's `formats.plainText` encoder. */
export type PlainTextEncodeContext<
  TNode,
  D extends AnyBasePluginDefinition,
> = Readonly<{
  /** Serialized plain text of the element's own children. */
  children: string;
  /** The element being serialized. */
  node: TNode;
  /** Serialized plain text of a named content-root slot on `node`, including slots contributed by other plugins. */
  rootText: (slot: string) => string;
}> &
  PluginFormatContext<D> &
  Omit<PluginFormatModelView, 'node'>;

/** Schema-bound plain-text encoder owned by an element or element-property plugin. */
export type PlainTextNodeMapping<D extends AnyBasePluginDefinition> =
  PluginFormatIsMark<D> extends true
    ? never
    : Readonly<{
        /** Return plain text for `node`, or `undefined` to fall through to lower-priority mappings or default serialization. */
        encode: (
          context: PlainTextEncodeContext<PluginFormatNode<D>, D>
        ) => string | undefined;
        /** Higher runs first among plain-text mappings that match `node`. */
        priority?: number;
      }>;

/** One plain-text mapping or a non-empty tuple of plain-text mappings for a plugin. */
export type PlainTextNodeMappingInput<D extends AnyBasePluginDefinition> =
  | PlainTextNodeMapping<D>
  | readonly [PlainTextNodeMapping<D>, ...Array<PlainTextNodeMapping<D>>];
