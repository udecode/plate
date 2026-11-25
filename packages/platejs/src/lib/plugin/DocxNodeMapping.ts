import type { AnyBasePluginDefinition } from './PluginDefinition';
import type { PluginFormatNode } from './pluginNodeTypes';

/**
 * How Word export writes an element Word has no form for: as one run of text.
 * The export reports what that drops once per plugin, as a `property-dropped`
 * warning that counts the elements.
 */
export type DocxNodeMapping<D extends AnyBasePluginDefinition> = Readonly<{
  /**
   * What Word keeps and drops of each element, such as "Word keeps each field
   * answer and drops its name and settings." It is the warning's message.
   */
  dropped: string;
  /** The text Word export writes in place of `node`. */
  text: (context: Readonly<{ node: PluginFormatNode<D> }>) => string;
}>;
