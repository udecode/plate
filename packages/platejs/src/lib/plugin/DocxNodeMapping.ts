import type { AnyBasePluginDefinition } from './PluginDefinition';
import type {
  PluginFormatElementPropertyKey,
  PluginFormatHasElement,
  PluginFormatNode,
} from './pluginNodeTypes';

type IsUnion<T, TWhole = T> = T extends TWhole
  ? [TWhole] extends [T]
    ? false
    : true
  : never;

type DocxElementNodeMapping<D extends AnyBasePluginDefinition> = Readonly<{
  /**
   * What Word keeps and drops of each element, such as "Word keeps each
   * field answer and drops its name and settings." It is the warning's
   * message.
   */
  dropped: string;
  property?: never;
  /** The text Word export writes in place of `node`. */
  text: (context: Readonly<{ node: PluginFormatNode<D> }>) => string;
}>;

type DocxPropertyNodeMapping<
  TKey extends string,
  TOptional extends boolean,
> = TOptional extends true
  ? Readonly<{
      /** Warning message reported when an element property is omitted on export. */
      dropped: string;
      /** Optional element property key to scan (defaults to the plugin's primary property key). */
      property?: TKey;
      text?: never;
    }>
  : Readonly<{
      /** Warning message reported when an element property is omitted on export. */
      dropped: string;
      /** Element property key to scan when the plugin owns multiple properties without a primary key. */
      property: TKey;
      text?: never;
    }>;

/**
 * How Word export handles an element or element property Word has no form for.
 * Element mappings provide `text` to write a fallback run; element-property
 * mappings provide `dropped` (and `property` when the plugin owns multiple
 * element properties without a primary key) to report a `property-dropped`
 * warning.
 */
export type DocxNodeMapping<D extends AnyBasePluginDefinition> =
  string extends D['name']
    ? DocxElementNodeMapping<D> | DocxPropertyNodeMapping<string, true>
    : PluginFormatHasElement<D> extends true
      ? DocxElementNodeMapping<D>
      : [PluginFormatElementPropertyKey<D>] extends [never]
        ? never
        : DocxPropertyNodeMapping<
            PluginFormatElementPropertyKey<D>,
            IsUnion<PluginFormatElementPropertyKey<D>> extends false
              ? true
              : D['name'] extends PluginFormatElementPropertyKey<D>
                ? true
                : false
          >;
