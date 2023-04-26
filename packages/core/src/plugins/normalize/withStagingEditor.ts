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
  const { setNormalizing, apply, normalize } = editor;

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

  editor.errors = [];

  editor.stagingEditor = createPlateEditor({
    id: 'staging',
    plugins: stagingEditorPlugins,
    disableCorePlugins: {
      staging: true,
    },
  });

  const {
    setNormalizing: setNormalizingStaging,
    normalizeStaging,
    apply: applyStaging,
  } = editor.stagingEditor;

  // editor.setNormalizing = (value) => {
  //   editor.stagingEditor.setNormalizing(value);
  //   setNormalizing(value);
  // };

  const resetStagingEditor = () => {
    const { id, key: _key, ...cloneEditor } = cloneDeep(editor);
    Object.keys(cloneEditor).forEach((key) => {
      if (typeof cloneEditor[key] === 'function') delete cloneEditor[key];
    });

    Object.assign(editor.stagingEditor, cloneEditor);
  };

  // editor.stagingEditor.normalize = (force?: boolean) => {
  //   // if (force) {
  //   normalizeStaging();
  //   // }
  // };

  // editor.normalize = () => {
  //
  // };

  editor.stagingEditor.isNormalizing = () => {
    return editor.isNormalizing();
  };

  editor.stagingEditor.apply = (op) => {
    if (editor.isNormalizing()) {
      console.log(op);
      applyStaging(op);
    }

    // if (force) {
    //   applyStaging(op);
    // }
    // console.log(editor.isNormalizing());
    // console.log(editor.stagingEditor.isNormalizing());
    // console.log('STAGING', op);
    // if (editor.stagingEditor.isNormalizing()) {
    // applyStaging(op);
    // }
  };

  editor.withoutNormalizing = (fn) => {
    const value = editor.isNormalizing();
    // const valueStaging = editor.stagingEditor.isNormalizing();

    editor.setNormalizing(false);
    // editor.stagingEditor.setNormalizing(false);

    try {
      fn();
    } finally {
      editor.setNormalizing(value);
      // editor.stagingEditor.setNormalizing(value);
    }

    let hasError = false;

    try {
      // console.log(1, value, valueStaging);
      // editor.stagingEditor.setNormalizing(false);
      editor.stagingEditor.normalize();
      console.log('1');
      // editor.normalize();
    } catch (err) {
      console.log(err);
      editor.errors.push({ type: 'normalize', error: err });
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
      // editor.stagingEditor.setNormalizing(false);
      applyStaging(cloneDeep(op));
      // editor.stagingEditor.setNormalizing(true);
      // console.log('EDITOR', op);
    } catch (err) {
      editor.errors.push({ type: 'apply', error: err });

      console.log(err);
      console.log(JSON.stringify(editor.children));
      console.log(JSON.stringify(editor.stagingEditor.children));
      hasError = true;

      // editor.stagingEditor.children is dirty so we need to reset it
      resetStagingEditor();
    }

    if (!hasError) {
      apply(op);
    }
  };

  return editor;
};
