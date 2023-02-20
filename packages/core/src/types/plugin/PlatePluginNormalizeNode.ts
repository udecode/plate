import { ENode, TNodeEntry } from "../../slate";
import { Value } from "../../slate/editor/TEditor";
import { Nullable } from "../misc";
import { PlateEditor } from "../plate";
import { HandlerReturnType } from "./DOMHandlers";
import { PluginOptions, WithPlatePlugin } from "./PlatePlugin";

export type PlatePluginNormalizeNode<
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> = (
  editor: PlateEditor<V>,
  plugin: WithPlatePlugin<P, V, E>
) => Nullable<{
  /**
   * Maximum number of iterations per node per editor change. Requires the node to have an id.
   * @see createNodeIdPlugin
   */
  maxIterationsPerNodeChange?:
    | number
    | ((entry: TNodeEntry<ENode<V>>) => number);

  /**
   * Maximum number of iterations per editor change.
   */
  maxIterationsPerChange?: number | ((entry: TNodeEntry<ENode<V>>) => number);

  /**
   * Maximum number of iterations per editor lifetime.
   */
  maxIterations?: boolean;

  /**
   * Conditions to `apply` the normalization.
   * @default () => true
   */
  query?: (entry: TNodeEntry<ENode<V>>) => boolean;

  /**
   * Similar to `editor.normalizeNode` but only called on the node that matches the `query`.
   * Return `true` to prevent calling the next plugin handler.
   */
  apply?: (entry: TNodeEntry<ENode<V>>) => HandlerReturnType;
}>;

