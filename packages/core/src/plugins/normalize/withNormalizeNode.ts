import { cloneDeep } from 'lodash';
import { Value } from '../../slate';
import { PlateEditor } from '../../types/plate';
import { PluginOptions, WithPlatePlugin } from '../../types/plugin/PlatePlugin';
import { createPlateEditor } from '../../utils';
import { KEY_NORMALIZE } from './createNormalizePlugin';

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

  // editor.normalizeNode = (entry) => {
  //   const normalized = [...editor.plugins].reverse().some((p) => {
  //     const pluginNormalizeNode = p.editor?.normalizeNode?.(editor, p);
  //     if (!pluginNormalizeNode) return false;
  //
  //     const {
  //       query,
  //       apply: applyNormalizeNode,
  //       maxIterations,
  //     } = pluginNormalizeNode;
  //     if (!applyNormalizeNode) return false;
  //
  //     // plugin.normalizingCount = 0;
  //
  //     // const normalizingPluginOperations = editor.operations.filter((op) => {
  //     //   return !!op.normalizingPluginKeys[p.key];
  //     // });
  //
  //     const [node, path] = entry;
  //
  //     const id = node.id ?? nanoid();
  //
  //     if (!node.id) {
  //       setNodes<TNode>(
  //         editor,
  //         {
  //           id,
  //         },
  //         { at: path }
  //       );
  //     }
  //
  //     if (node.id) {
  //       const iterationCountByNodeId =
  //         iterationCountByNodeIdByPlugin.get(plugin) ?? {};
  //
  //       const iterationCount = iterationCountByNodeId[node.id] ?? 0;
  //     }
  //
  //     if (maxIterations && normalizingPluginOperations.length > maxIterations) {
  //       console.warn(
  //         `Plugin ${plugin.key} could not completely normalize the node after ${maxIterations} iterations! This is usually due to incorrect normalization logic that leaves a node in an invalid state.`
  //       );
  //       return false;
  //     }
  //
  //     if (query && !query(entry as any)) {
  //       return false;
  //     }
  //
  //     editor.normalizingPluginKeys[p.key] = true;
  //
  //     const stop = (value: boolean) => {
  //       delete editor.normalizingPluginKeys[p.key];
  //       return value;
  //     };
  //
  //     if (applyNormalizeNode(entry as any)) {
  //       plugin.normalizingCount = (plugin.normalizingCount ?? 0) + 1;
  //       // iterationCountByNodeIdByPlugin.set(plugin, {
  //       //   ...iterationCountByNodeId,
  //       //   [key]: iterationCount + 1,
  //       // });
  //       // console.log(key, iterationCount + 1);
  //       return stop(true);
  //     }
  //
  //     return stop(false);
  //   });
  //
  //   if (normalized) return;
  //
  //   normalizeNode(entry);
  // };

  const stagingEditorPlugins = editor.plugins.filter(
    (p) => p.key !== KEY_NORMALIZE
  );

  editor.stagingEditor = createPlateEditor({
    plugins: stagingEditorPlugins,
    disableCorePlugins: {
      normalize: true,
    },
  });

  const cloneEditor = (from: PlateEditor<V>, target: PlateEditor<V>) => {
    target.key = 'another one';
    target.id = 'another one';
    target.children = cloneDeep(from.children);
    target.history = cloneDeep(from.history);
    target.operations = cloneDeep(from.operations);
    target.selection = cloneDeep(from.selection);
    target.prevSelection = cloneDeep(from.prevSelection);
    target.marks = cloneDeep(from.marks);
    target.currentKeyboardEvent = cloneDeep(from.currentKeyboardEvent);

    return target;
  };

  editor.apply = (op) => {
    if (!editor.stagingEditor.children.length) {
      console.log(1);
      editor.stagingEditor = cloneEditor(editor, editor.stagingEditor);
    }

    const hasError = false;

    console.log(op);

    try {
      editor.stagingEditor.apply(cloneDeep(op));
    } catch (err) {
      // hasError = true;
      console.log({
        editor: editor.children,
        staging: editor.stagingEditor.children,
      });

      // editor.stagingEditor.children is dirty so we need to reset it
      editor.stagingEditor = cloneEditor(editor, editor.stagingEditor);

      console.warn(err, op);
    }

    if (!hasError) {
      apply(op);
    }

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
  };

  return editor;
};
