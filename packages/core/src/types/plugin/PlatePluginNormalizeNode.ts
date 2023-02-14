import { Path } from 'slate';
import { ENode, TNodeEntry } from '../../slate';
import { Value } from '../../slate/editor/TEditor';
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
   * Maximum number of iterations to `apply` the normalization on the same node.
   * Once exceeded, `apply` is not called once.
   * The counter resets on
   */
  maxIterations?: number | (() => number);

  /**
   * If true, the iteration counter is reset on each `apply`.
   */
  resetIterations?: () => boolean;

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

  const iterationCountByPathKeyByPlugin = new WeakMap<
    WithPlatePlugin<{}, V>,
    Record<string, number>
  >();

  editor.onChange = () => {
    editor.plugins.forEach((p) => {
      iterationCountByPathKeyByPlugin.set(p, {});
    });
    console.log('reset');

    onChange();
  };

  editor.normalizeNode = (entry) => {
    const normalized = [...editor.plugins].reverse().some((plugin) => {
      const pluginNormalizeNode = plugin.editor?.normalizeNode?.(
        editor,
        plugin
      );
      if (!pluginNormalizeNode) return false;

      const {
        query,
        apply,
        maxIterations,
        resetIterations,
      } = pluginNormalizeNode;
      if (!apply) return false;

      const [node, path] = entry;

      const key = path.join(',');

      const iterationCountByPathKey =
        iterationCountByPathKeyByPlugin.get(plugin) ?? {};

      const iterationCount = iterationCountByPathKey[key] ?? 0;

      if (maxIterations && iterationCount >= maxIterations) {
        console.log('..');
        return false;
      }

      if (query && !query(entry as any)) {
        return false;
      }

      if (apply(entry as any)) {
        iterationCountByPathKeyByPlugin.set(plugin, {
          ...iterationCountByPathKey,
          [key]: iterationCount + 1,
        });
        console.log(key, iterationCount + 1);
        return true;
      }

      return false;
    });

    if (normalized) return;

    try {
      normalizeNode(entry);
    } catch (err) {
      console.warn(err);
    }
  };

  editor.apply = (op) => {
    editor.plugins.forEach((p) => {
      const iterationCountByPathKey =
        iterationCountByPathKeyByPlugin.get(p) ?? {};

      Object.keys(iterationCountByPathKey).forEach((key) => {
        const path = key.split(',').map(Number);
        const newPath = Path.transform(path, op);
        if (!newPath) return;

        const newKey = newPath.join(',');

        console.log(op, path, newPath);

        const iterationCount = iterationCountByPathKey[key] ?? 0;
        iterationCountByPathKey[newKey] = iterationCount;
        console.log(iterationCountByPathKey);
      });
    });

    apply(op);
  };

  return editor;
};
