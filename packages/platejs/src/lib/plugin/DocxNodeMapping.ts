import type { AnyBasePluginDefinition } from './PluginDefinition';
import type { PluginFormatNode } from './pluginNodeTypes';

/**
 * How Word export handles an element or element property Word has no form for.
 * Element mappings provide `text` to write a fallback run; element-property
 * mappings provide `dropped` alone to report a `property-dropped` warning.
 */
export type DocxNodeMapping<D extends AnyBasePluginDefinition> =
  | Readonly<{
      /**
       * What Word keeps and drops of each element, such as "Word keeps each
       * field answer and drops its name and settings." It is the warning's
       * message.
       */
      dropped: string;
      /** The text Word export writes in place of `node`. */
      text: (context: Readonly<{ node: PluginFormatNode<D> }>) => string;
    }>
  | Readonly<{
      /** Warning message reported when an element property is omitted on export. */
      dropped: string;
      /** Optional element property key to scan (defaults to the plugin's primary property key). */
      property?: string;
    }>;
