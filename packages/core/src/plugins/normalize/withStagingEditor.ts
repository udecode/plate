import { Value } from '@udecode/slate';
import { cloneDeep } from 'lodash';
import { PlateEditor } from '../../types/index';
import { PluginOptions, WithPlatePlugin } from '../../types/plugin/PlatePlugin';
import { createPlateEditor } from '../../utils';
import { KEY_STAGING } from './createStagingPlugin';

export const withStagingEditor = <
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: PlateEditor<V>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  plugin: WithPlatePlugin<P, V, E>
) => {
  const { setNormalizing, apply } = editor;

  // editor.normalizingPluginKeys = {};

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
    (p) => p.key !== KEY_STAGING
  );

  editor.stagingEditor = createPlateEditor({
    id: 'staging',
    plugins: stagingEditorPlugins,
    disableCorePlugins: {
      staging: true,
    },
  });

  const resetStagingEditor = () => {
    const { id, key: _key, ...cloneEditor } = cloneDeep(editor);
    Object.keys(cloneEditor).forEach((key) => {
      if (typeof cloneEditor[key] === 'function') delete cloneEditor[key];
    });

    Object.assign(editor.stagingEditor, {
      ...editor.stagingEditor,
      ...cloneEditor,
    });
  };

  editor.setNormalizing = (value) => {
    editor.stagingEditor.setNormalizing(value);
    setNormalizing(value);
  };

  editor.withoutNormalizing = (fn) => {
    const value = editor.isNormalizing();
    editor.setNormalizing(false);
    try {
      fn();
    } finally {
      editor.setNormalizing(value);
    }

    let hasError = false;

    try {
      editor.stagingEditor.normalize();
    } catch (err) {
      hasError = true;
    }

    if (!hasError) {
      editor.normalize();
    }
  };

  editor.apply = (op) => {
    if (!editor.stagingEditor.children.length) {
      resetStagingEditor();
    }

    let hasError = false;

    try {
      editor.stagingEditor.apply(cloneDeep(op));
    } catch (err) {
      console.log(JSON.stringify(editor.children));
      console.log(JSON.stringify(editor.stagingEditor.children));
      console.log(err);
      hasError = true;

      // editor.stagingEditor.children is dirty so we need to reset it
      resetStagingEditor();

      console.warn(err, op);
    }

    if (!hasError) {
      apply(op);
    }
  };

  return editor;
};
