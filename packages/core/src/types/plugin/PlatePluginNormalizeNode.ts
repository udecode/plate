import { ENode, setNodes, TNode, TNodeEntry } from '../../slate';
import { Value } from '../../slate/editor/TEditor';
import { nanoid } from '../../utils';
import { Nullable } from '../misc';
import { PlateEditor } from '../plate';
import { HandlerReturnType } from './DOMHandlers';
import { PluginOptions, WithPlatePlugin } from './PlatePlugin';

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

export const withNormalizeNode = <
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: PlateEditor<V>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  plugin: WithPlatePlugin<P, V, E>
) => {
  const { normalizeNode, apply, onChange } = editor;

  const iterationCountByNodeIdByPlugin = new WeakMap<
    WithPlatePlugin<{}, V>,
    Record<string, number>
  >();

  editor.normalizingPluginKeys = {};

  editor.onChange = () => {
    editor.plugins.forEach((p) => {
      iterationCountByNodeIdByPlugin.set(p, {});
    });
    console.log('reset');

    onChange();
  };

  editor.normalizeNode = (entry) => {
    const normalized = [...editor.plugins].reverse().some((p) => {
      const pluginNormalizeNode = p.editor?.normalizeNode?.(editor, p);
      if (!pluginNormalizeNode) return false;

      const {
        query,
        apply: applyNormalizeNode,
        maxIterations,
      } = pluginNormalizeNode;
      if (!applyNormalizeNode) return false;

      // plugin.normalizingCount = 0;

      // const normalizingPluginOperations = editor.operations.filter((op) => {
      //   return !!op.normalizingPluginKeys[p.key];
      // });

      const [node, path] = entry;

      const id = node.id ?? nanoid();

      if (!node.id) {
        setNodes<TNode>(
          editor,
          {
            id,
          },
          { at: path }
        );
      }

      if (node.id) {
        const iterationCountByNodeId =
          iterationCountByNodeIdByPlugin.get(plugin) ?? {};

        const iterationCount = iterationCountByNodeId[node.id] ?? 0;
      }

      if (maxIterations && normalizingPluginOperations.length > maxIterations) {
        console.warn(
          `Plugin ${plugin.key} could not completely normalize the node after ${maxIterations} iterations! This is usually due to incorrect normalization logic that leaves a node in an invalid state.`
        );
        return false;
      }

      if (query && !query(entry as any)) {
        return false;
      }

      editor.normalizingPluginKeys[p.key] = true;

      const stop = (value: boolean) => {
        delete editor.normalizingPluginKeys[p.key];
        return value;
      };

      if (applyNormalizeNode(entry as any)) {
        plugin.normalizingCount = (plugin.normalizingCount ?? 0) + 1;
        // iterationCountByNodeIdByPlugin.set(plugin, {
        //   ...iterationCountByNodeId,
        //   [key]: iterationCount + 1,
        // });
        // console.log(key, iterationCount + 1);
        return stop(true);
      }

      return stop(false);
    });

    if (normalized) return;

    normalizeNode(entry);
  };

  editor.apply = (op) => {
    op.type === '';
    // op.normalizingPluginKeys = { ...editor.normalizingPluginKeys };

    // editor.plugins.forEach((p) => {
    //   const iterationCountByNodeId =
    //     iterationCountByNodeIdByPlugin.get(p) ?? {};
    //
    //   Object.keys(iterationCountByNodeId).forEach((key) => {
    //     const path = key.split(',').map(Number);
    //     const newPath = Path.transform(path, op);
    //     if (!newPath) return;
    //
    //     const newKey = newPath.join(',');
    //
    //     console.log(op, path, newPath);
    //
    //     const iterationCount = iterationCountByNodeId[key] ?? 0;
    //     iterationCountByNodeId[newKey] = iterationCount;
    //     console.log(iterationCountByNodeId);
    //   });
    // });

    apply(op);
  };

  return editor;
};
