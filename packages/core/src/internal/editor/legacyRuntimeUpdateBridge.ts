import type {
  EditorUpdateContext,
  EditorUpdateTransaction,
  Value,
} from '@platejs/slate';

import type { SlateEditor } from '../../lib/editor/SlateEditor';
import type { AnyPluginConfig } from '../../lib/plugin/BasePlugin';
import type {
  AnySlatePlugin,
  PlatePluginTxGroup,
  SlatePluginContext,
} from '../../lib/plugin/SlatePlugin';
import {
  getCurrentRuntimeTransforms,
  type CurrentRuntimeEditorTransforms,
} from '../currentRuntimeBridge';

type LegacyRuntimeUpdateTransaction = EditorUpdateTransaction<Value> &
  Record<string, unknown>;

type LegacyRuntimeUpdateCallback = Parameters<SlateEditor['update']>[0];
type LegacyRuntimeApi = SlateEditor['api'];
type LegacyRuntimeTransforms = CurrentRuntimeEditorTransforms;
type LegacyRuntimePluginContext = Omit<
  SlatePluginContext<AnyPluginConfig>,
  'tf'
>;
type LegacyRuntimePluginInput = Parameters<SlateEditor['getOptions']>[0];

const asLegacyApiArg = <T>(value: unknown): T => value as T;

const toLegacyTextUnit = (options: unknown) => {
  if (typeof options === 'string') return options;
  if (options && typeof options === 'object' && 'unit' in options) {
    return (options as { unit?: unknown }).unit ?? 'character';
  }

  return 'character';
};

const asLegacyPluginInput = (
  plugin: AnySlatePlugin
): LegacyRuntimePluginInput => plugin as unknown as LegacyRuntimePluginInput;

const createLegacyRuntimeUpdateContext = (): EditorUpdateContext => ({
  afterCommit: () => {
    throw new Error(
      'editor.update context.afterCommit is not supported by the temporary Plate legacy runtime bridge.'
    );
  },
});

const createLegacyTxBase = (
  editor: SlateEditor
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
            options
          )
        );
      },
      remove: (options?: unknown) => {
        getCurrentRuntimeTransforms(editor).removeNodes(
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['removeNodes']>[0]>(
            options
          )
        );
      },
      set: (props: Record<string, unknown>, options?: unknown) => {
        getCurrentRuntimeTransforms(editor).setNodes(
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['setNodes']>[0]>(
            props
          ),
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['setNodes']>[1]>(
            options
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
            options
          )
        );
      },
      unwrap: (options: unknown) => {
        getCurrentRuntimeTransforms(editor).unwrapNodes(
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['unwrapNodes']>[0]>(
            options
          )
        );
      },
      wrap: (element: unknown, options?: unknown) => {
        getCurrentRuntimeTransforms(editor).wrapNodes(
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['wrapNodes']>[0]>(
            element
          ),
          asLegacyApiArg<Parameters<LegacyRuntimeTransforms['wrapNodes']>[1]>(
            options
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
          editor.marks = asLegacyApiArg<SlateEditor['marks']>(marks);
        }
      },
    },
  }) as LegacyRuntimeUpdateTransaction;

const createLegacyPluginContext = (
  editor: SlateEditor,
  plugin: AnySlatePlugin
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
          asLegacyApiArg<Parameters<SlateEditor['setOption']>[1]>(key),
          asLegacyApiArg<Parameters<SlateEditor['setOption']>[2]>(value)
        );
        return;
      }

      editor.setOptions(
        pluginInput,
        asLegacyApiArg<Parameters<SlateEditor['setOptions']>[1]>(key)
      );
    },
    setOptions: (
      options:
        | ((state: Record<string, unknown>) => void)
        | Record<string, unknown>
    ) => {
      editor.setOptions(
        asLegacyPluginInput(plugin),
        asLegacyApiArg<Parameters<SlateEditor['setOptions']>[1]>(options)
      );
    },
  }) as LegacyRuntimePluginContext;

const createLegacyUpdateTransaction = (
  editor: SlateEditor
): LegacyRuntimeUpdateTransaction => {
  const transaction = createLegacyTxBase(editor);

  editor.meta.pluginList.forEach((plugin: AnySlatePlugin) => {
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

const installLegacyRuntimeTxGroupTransforms = (
  editor: SlateEditor,
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

export const installLegacyRuntimeUpdateBridge = (editor: SlateEditor) => {
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
  }) as SlateEditor['update'];
};

export const installLegacyRuntimePluginTxTransformBridge = (
  editor: SlateEditor,
  plugin: AnySlatePlugin
) => {
  plugin.__txExtensions.forEach((txExtension) => {
    Object.entries(txExtension(createLegacyPluginContext(editor, plugin))).forEach(
      ([groupKey, groupFactory]) => {
        installLegacyRuntimeTxGroupTransforms(editor, groupKey, groupFactory);
      }
    );
  });

  Object.entries(plugin.tx ?? {}).forEach(([groupKey, groupFactory]) => {
    installLegacyRuntimeTxGroupTransforms(editor, groupKey, groupFactory);
  });
};

export const installLegacyRuntimeTxTransformBridge = (editor: SlateEditor) => {
  editor.meta.pluginList.forEach((plugin: AnySlatePlugin) => {
    installLegacyRuntimePluginTxTransformBridge(editor, plugin);
  });
};
