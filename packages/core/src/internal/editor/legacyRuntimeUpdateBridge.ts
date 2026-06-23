import type {
  EditorUpdateContext,
  EditorUpdateTransaction,
  Node,
  Path,
  Value,
} from '@platejs/plite';
import { defineEditorExtension } from '@platejs/plite';

import type { BasePlateEditor } from '../../lib/editor/BasePlateEditor';
import type { AnyPluginConfig } from '../../lib/plugin/BasePlugin';
import type {
  AnyEditorPlugin,
  PlatePluginTxGroup,
  EditorPluginContext,
} from '../../lib/plugin/EditorPlugin';
import {
  getCurrentRuntimeTransforms,
  type CurrentRuntimeEditorTransforms,
} from '../currentRuntimeBridge';

type LegacyRuntimeUpdateTransaction = EditorUpdateTransaction<Value> &
  Record<string, unknown>;

type LegacyRuntimeUpdateCallback = Parameters<BasePlateEditor['update']>[0];
type LegacyRuntimeApi = BasePlateEditor['api'];
type LegacyRuntimeTransforms = CurrentRuntimeEditorTransforms;
type LegacyRuntimePluginContext = Omit<
  EditorPluginContext<AnyPluginConfig>,
  'tf'
>;
type LegacyRuntimePluginInput = Parameters<BasePlateEditor['getOptions']>[0];

const plateTxExtensionCleanups = new WeakMap<object, () => void>();

const asLegacyApiArg = <T>(value: unknown): T => value as T;

const matchesLegacyObject = (
  node: Node,
  objectMatch: Record<string, unknown>
) =>
  Object.entries(objectMatch).every(([key, expected]) => {
    const actual = (node as Record<string, unknown>)[key];

    return Array.isArray(expected)
      ? expected.includes(actual)
      : actual === expected;
  });

const normalizeLegacyMatch = (match: unknown) => {
  if (!match || typeof match === 'function') return match;
  if (typeof match !== 'object') return;

  return (node: Node, _path: Path) =>
    matchesLegacyObject(node, match as Record<string, unknown>);
};

const normalizeLegacyNodeOptions = (options: unknown) => {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    return options;
  }

  const match = normalizeLegacyMatch(
    (options as Record<string, unknown>).match
  );

  return match ? { ...(options as Record<string, unknown>), match } : options;
};

const toLegacyTextUnit = (options: unknown) => {
  if (typeof options === 'string') return options;
  if (options && typeof options === 'object' && 'unit' in options) {
    return (options as { unit?: unknown }).unit ?? 'character';
  }

  return 'character';
};

const asLegacyPluginInput = (
  plugin: AnyEditorPlugin
): LegacyRuntimePluginInput => plugin as unknown as LegacyRuntimePluginInput;

const createLegacyRuntimeUpdateContext = (): EditorUpdateContext => ({
  afterCommit: () => {
    throw new Error(
      'editor.update context.afterCommit is not supported by the temporary Plate legacy runtime bridge.'
    );
  },
});

const createLegacyTxBase = (
  editor: BasePlateEditor
): LegacyRuntimeUpdateTransaction =>
  ({
    break: {
      insert: () => {
        getCurrentRuntimeTransforms(editor).insertBreak();
      },
    },
    marks: {
      add: (key: string, value: unknown) => {
        getCurrentRuntimeTransforms(editor).addMark(key, value);
      },
      remove: (key: string) => {
        getCurrentRuntimeTransforms(editor).removeMark(key);
      },
      toggle: (key: string, value?: unknown) => {
        getCurrentRuntimeTransforms(editor).toggleMark(
          key,
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['toggleMark']>[1]>(
            value
          )
        );
      },
    },
    normalize: (options?: unknown) => {
      getCurrentRuntimeTransforms(editor).normalize(
        asLegacyApiArg<Parameters<LegacyRuntimeTransforms['normalize']>[0]>(
          options
        )
      );
    },
    nodes: {
      insert: (nodes: unknown, options?: unknown) => {
        getCurrentRuntimeTransforms(editor).insertNodes(
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['insertNodes']>[0]>(
            nodes
          ),
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['insertNodes']>[1]>(
            options
          )
        );
      },
      merge: (options?: unknown) => {
        getCurrentRuntimeTransforms(editor).mergeNodes(
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['mergeNodes']>[0]>(
            normalizeLegacyNodeOptions(options)
          )
        );
      },
      remove: (options?: unknown) => {
        getCurrentRuntimeTransforms(editor).removeNodes(
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['removeNodes']>[0]>(
            normalizeLegacyNodeOptions(options)
          )
        );
      },
      set: (props: Record<string, unknown>, options?: unknown) => {
        getCurrentRuntimeTransforms(editor).setNodes(
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['setNodes']>[0]>(
            props
          ),
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['setNodes']>[1]>(
            normalizeLegacyNodeOptions(options)
          )
        );
      },
      some: (options: unknown) =>
        editor.api.some(
          asLegacyApiArg<Parameters<LegacyRuntimeApi['some']>[0]>(options)
        ),
      toArray: (options: unknown) =>
        Array.from(
          editor.api.nodes(
            asLegacyApiArg<Parameters<LegacyRuntimeApi['nodes']>[0]>(options)
          )
        ),
      unset: (props: string | string[], options?: unknown) => {
        getCurrentRuntimeTransforms(editor).unsetNodes(
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['unsetNodes']>[0]>(
            props
          ),
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['unsetNodes']>[1]>(
            normalizeLegacyNodeOptions(options)
          )
        );
      },
      unwrap: (options: unknown) => {
        getCurrentRuntimeTransforms(editor).unwrapNodes(
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['unwrapNodes']>[0]>(
            normalizeLegacyNodeOptions(options)
          )
        );
      },
      wrap: (element: unknown, options?: unknown) => {
        getCurrentRuntimeTransforms(editor).wrapNodes(
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['wrapNodes']>[0]>(
            element
          ),
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['wrapNodes']>[1]>(
            normalizeLegacyNodeOptions(options)
          )
        );
      },
    },
    selection: {
      clear: () => {
        getCurrentRuntimeTransforms(editor).deselect();
      },
      collapse: (options?: unknown) => {
        getCurrentRuntimeTransforms(editor).collapse(
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['collapse']>[0]>(
            options
          )
        );
      },
      move: (options?: unknown) => {
        getCurrentRuntimeTransforms(editor).move(
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['move']>[0]>(
            options
          )
        );
      },
      set: (target: unknown) => {
        getCurrentRuntimeTransforms(editor).select(
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['select']>[0]>(
            target
          )
        );
      },
    },
    text: {
      delete: (options?: unknown) => {
        getCurrentRuntimeTransforms(editor).delete(
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['delete']>[0]>(
            options
          )
        );
      },
      deleteBackward: (options?: unknown) => {
        getCurrentRuntimeTransforms(editor).deleteBackward(
          asLegacyApiArg<
            Parameters<LegacyRuntimeTransforms['deleteBackward']>[0]
          >(toLegacyTextUnit(options))
        );
      },
      deleteForward: (options?: unknown) => {
        getCurrentRuntimeTransforms(editor).deleteForward(
          asLegacyApiArg<
            Parameters<LegacyRuntimeTransforms['deleteForward']>[0]
          >(toLegacyTextUnit(options))
        );
      },
      insert: (text: string, options?: unknown) => {
        getCurrentRuntimeTransforms(editor).insertText(
          text,
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['insertText']>[1]>(
            options
          )
        );
      },
      string: (at: unknown, options?: unknown) =>
        editor.api.string(
          asLegacyApiArg<Parameters<LegacyRuntimeApi['string']>[0]>(at),
          asLegacyApiArg<Parameters<LegacyRuntimeApi['string']>[1]>(options)
        ),
    },
    value: {
      replace: (input: unknown) => {
        const { children, marks, selection } = input as {
          children: unknown;
          marks?: unknown;
          selection?: unknown;
        };

        getCurrentRuntimeTransforms(editor).replaceNodes(
          asLegacyApiArg<
            Parameters<LegacyRuntimeTransforms['replaceNodes']>[0]
          >(children),
          {
            at: [],
            children: true,
          }
        );

        if (selection !== undefined) {
          if (selection === null) {
            getCurrentRuntimeTransforms(editor).deselect();
          } else {
            getCurrentRuntimeTransforms(editor).select(
              asLegacyApiArg<Parameters<LegacyRuntimeTransforms['select']>[0]>(
                selection
              )
            );
          }
        }

        if (marks !== undefined) {
          editor.marks = asLegacyApiArg<BasePlateEditor['marks']>(marks);
        }
      },
    },
  }) as LegacyRuntimeUpdateTransaction;

const createLegacyPluginContext = (
  editor: BasePlateEditor,
  plugin: AnyEditorPlugin
): LegacyRuntimePluginContext =>
  ({
    api: editor.api,
    editor,
    plugin,
    type: plugin.node?.type ?? plugin.key,
    getOption: ((key: PropertyKey, ...args: unknown[]) =>
      (editor.getOption as unknown as (...input: unknown[]) => unknown)(
        plugin,
        key,
        ...args
      )) as LegacyRuntimePluginContext['getOption'],
    getOptions: () => editor.getOptions(asLegacyPluginInput(plugin)),
    setOption: (key: string | Record<string, unknown>, value?: unknown) => {
      const pluginInput = asLegacyPluginInput(plugin);

      if (typeof key === 'string') {
        editor.setOption(
          pluginInput,
          asLegacyApiArg<Parameters<BasePlateEditor['setOption']>[1]>(key),
          asLegacyApiArg<Parameters<BasePlateEditor['setOption']>[2]>(value)
        );
        return;
      }

      editor.setOptions(
        pluginInput,
        asLegacyApiArg<Parameters<BasePlateEditor['setOptions']>[1]>(key)
      );
    },
    setOptions: (
      options:
        | ((state: Record<string, unknown>) => void)
        | Record<string, unknown>
    ) => {
      editor.setOptions(
        asLegacyPluginInput(plugin),
        asLegacyApiArg<Parameters<BasePlateEditor['setOptions']>[1]>(options)
      );
    },
  }) as LegacyRuntimePluginContext;

const createLegacyUpdateTransaction = (
  editor: BasePlateEditor
): LegacyRuntimeUpdateTransaction => {
  const transaction = createLegacyTxBase(editor);

  editor.meta.pluginList.forEach((plugin: AnyEditorPlugin) => {
    plugin.__txExtensions.forEach((txExtension) => {
      Object.entries(
        txExtension(createLegacyPluginContext(editor, plugin))
      ).forEach(([groupKey, groupFactory]) => {
        if (!groupFactory) return;

        transaction[groupKey] = (groupFactory as PlatePluginTxGroup)(
          transaction,
          editor,
          createLegacyRuntimeUpdateContext()
        );
      });
    });

    Object.entries(plugin.tx ?? {}).forEach(([groupKey, groupFactory]) => {
      if (!groupFactory) return;

      transaction[groupKey] = (groupFactory as PlatePluginTxGroup)(
        transaction,
        editor,
        createLegacyRuntimeUpdateContext()
      );
    });
  });

  return transaction;
};

const collectLegacyTxGroupFactories = (editor: BasePlateEditor) => {
  const txGroups = new Map<string, PlatePluginTxGroup[]>();
  const addGroup = (groupKey: string, groupFactory: unknown) => {
    if (!groupFactory) return;

    const list = txGroups.get(groupKey) ?? [];

    list.push(groupFactory as PlatePluginTxGroup);
    txGroups.set(groupKey, list);
  };

  editor.meta.pluginList.forEach((plugin: AnyEditorPlugin) => {
    plugin.__txExtensions.forEach((txExtension) => {
      Object.entries(
        txExtension(createLegacyPluginContext(editor, plugin))
      ).forEach(([groupKey, groupFactory]) => {
        addGroup(groupKey, groupFactory);
      });
    });

    Object.entries(plugin.tx ?? {}).forEach(([groupKey, groupFactory]) => {
      addGroup(groupKey, groupFactory);
    });
  });

  return txGroups;
};

const installLegacyRuntimeTxExtensionBridge = (editor: BasePlateEditor) => {
  plateTxExtensionCleanups.get(editor)?.();
  plateTxExtensionCleanups.delete(editor);

  const txGroups = collectLegacyTxGroupFactories(editor);

  if (txGroups.size === 0) return;

  const tx = Object.create(null) as Record<string, PlatePluginTxGroup>;

  txGroups.forEach((groupFactories, groupKey) => {
    tx[groupKey] = (transaction, runtimeEditor, context) => {
      const group = Object.create(null) as Record<string, unknown>;

      groupFactories.forEach((groupFactory) => {
        Object.assign(
          group,
          groupFactory(
            transaction,
            runtimeEditor as BasePlateEditor,
            context as EditorUpdateContext<BasePlateEditor>
          )
        );
      });

      return group;
    };
  });

  const cleanup = editor.extend(
    defineEditorExtension({
      name: 'plate-plugin-tx',
      tx,
    })
  );

  plateTxExtensionCleanups.set(editor, cleanup);
};

const installLegacyRuntimeTxGroupTransforms = (
  editor: BasePlateEditor,
  groupKey: string,
  groupFactory: unknown
) => {
  if (!groupFactory) return;

  const group = (groupFactory as PlatePluginTxGroup)(
    createLegacyTxBase(editor),
    editor,
    createLegacyRuntimeUpdateContext()
  );

  if (!group || typeof group !== 'object') return;

  const transformRecord = getCurrentRuntimeTransforms(editor) as Record<
    string,
    any
  >;

  transformRecord[groupKey] ??= {};

  const transformGroup = transformRecord[groupKey];

  Object.entries(group).forEach(([methodKey, method]) => {
    if (typeof method !== 'function') return;
    if (transformGroup[methodKey]) return;

    transformGroup[methodKey] = (...args: unknown[]) =>
      editor.update((tx: Record<string, any>) =>
        tx[groupKey]?.[methodKey]?.(...args)
      );
  });
};

export const installLegacyRuntimeUpdateBridge = (editor: BasePlateEditor) => {
  if (typeof editor.update === 'function') return;

  editor.update = ((callback: LegacyRuntimeUpdateCallback) => {
    let result: unknown;

    getCurrentRuntimeTransforms(editor).withoutNormalizing(() => {
      result = callback(
        createLegacyUpdateTransaction(editor),
        createLegacyRuntimeUpdateContext()
      );
    });

    return result;
  }) as BasePlateEditor['update'];
};

export const installLegacyRuntimePluginTxTransformBridge = (
  editor: BasePlateEditor,
  plugin: AnyEditorPlugin
) => {
  plugin.__txExtensions.forEach((txExtension) => {
    Object.entries(
      txExtension(createLegacyPluginContext(editor, plugin))
    ).forEach(([groupKey, groupFactory]) => {
      installLegacyRuntimeTxGroupTransforms(editor, groupKey, groupFactory);
    });
  });

  Object.entries(plugin.tx ?? {}).forEach(([groupKey, groupFactory]) => {
    installLegacyRuntimeTxGroupTransforms(editor, groupKey, groupFactory);
  });
};

export const installLegacyRuntimeTxTransformBridge = (
  editor: BasePlateEditor
) => {
  installLegacyRuntimeTxExtensionBridge(editor);

  editor.meta.pluginList.forEach((plugin: AnyEditorPlugin) => {
    installLegacyRuntimePluginTxTransformBridge(editor, plugin);
  });
};
