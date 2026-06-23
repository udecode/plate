import type {
  BaseEditor,
  Editor,
  EditorCommitContext,
  EditorExtension,
  EditorExtensionInput,
  EditorExtensionRuntimeState,
  EditorExtensionSetupContext,
  EditorExtensionSetupOutput,
  EditorNodeNormalizerContext,
  EditorPublicTransformMiddlewareKey,
  EditorRootNormalizerArgs,
  EditorTransformMiddlewareArgs,
  EditorTransformMiddlewareContext,
  RegisteredEditorExtension,
  ValueOf,
} from '../interfaces/editor';
import { registerCommand } from './command-registry';
import {
  getExtensionRegistry,
  registerCapability,
  registerCommitListener,
  registerElementSpec,
  registerNormalizer,
  registerOperationMiddleware,
  registerQueryMiddleware,
  registerStateGroup,
  registerTxGroup,
} from './extension-registry';
import {
  getActiveUpdateView,
  getEditorStateView,
  getSnapshot,
} from './public-state';
import {
  EDITOR_TRANSFORM_MIDDLEWARE_KEYS,
  getTransformCommandType,
} from './transform-middleware';

type ExtensionRecord = {
  cleanups: Array<() => void>;
  extension: EditorExtension<Editor>;
  order: number;
};

type ExtensionState = {
  records: Map<string, ExtensionRecord>;
};

type TransformMiddlewareArgs<
  TEditor extends BaseEditor<any>,
  TKey extends EditorPublicTransformMiddlewareKey,
> = EditorTransformMiddlewareArgs<ValueOf<TEditor>>[TKey];

type TransformMiddlewareCommand<
  TEditor extends BaseEditor<any>,
  TKey extends EditorPublicTransformMiddlewareKey,
> = TransformMiddlewareArgs<TEditor, TKey> & {
  type: string;
};

type TransformMiddleware<
  TEditor extends BaseEditor<any>,
  TKey extends EditorPublicTransformMiddlewareKey,
> = (
  context: EditorTransformMiddlewareContext<
    TEditor,
    TransformMiddlewareArgs<TEditor, TKey>
  >
) => boolean;

const EXTENSION_STATE = new WeakMap<Editor, ExtensionState>();

let extensionOrder = 0;

const getExtensionState = (editor: Editor) => {
  let state = EXTENSION_STATE.get(editor);

  if (!state) {
    state = {
      records: new Map(),
    };
    EXTENSION_STATE.set(editor, state);
  }

  return state;
};

const normalizeExtensionInput = <TEditor extends Editor>(
  input: EditorExtensionInput<TEditor>
) =>
  (Array.isArray(input)
    ? input
    : [input]) as readonly EditorExtension<TEditor>[];

const getExtensionSlotId = (extensionName: string, slot: string) =>
  `${extensionName}:${slot}`;

const resolveLatestExtensionEntries = (
  extensions: readonly EditorExtension<Editor, any>[]
) => {
  const entries = new Map<string, EditorExtension<Editor, any> | null>();

  for (const extension of extensions) {
    assertNoUnsupportedSlots(extension);

    if (!extension.name) {
      throw new Error('Editor extension must have a name.');
    }

    entries.delete(extension.name);
    entries.set(extension.name, extension.enabled === false ? null : extension);
  }

  return {
    extensions: [...entries.values()].filter(
      (extension): extension is EditorExtension<Editor, any> =>
        extension !== null
    ),
    replacedNames: [...entries.keys()],
  };
};

const getValidationStateWithoutReplacements = (
  state: ExtensionState,
  replacedNames: readonly string[]
) => {
  if (replacedNames.length === 0) {
    return state;
  }

  const records = new Map(state.records);

  for (const name of replacedNames) {
    records.delete(name);
  }

  return { records };
};

type DefineEditorExtension = {
  <TEditor extends BaseEditor<any> = Editor>(): <
    const TExtension extends EditorExtension<TEditor, any>,
  >(
    extension: NoExtraEditorExtensionProperties<
      TExtension,
      EditorExtension<TEditor, any>
    >
  ) => TExtension;
  <const TExtension extends EditorExtension<any, any>>(
    extension: NoExtraEditorExtensionProperties<
      TExtension,
      EditorExtension<any, any>
    >
  ): TExtension;
};

type NoExtraEditorExtensionProperties<
  TExtension extends EditorExtension<any, any>,
  TShape extends EditorExtension<any, any>,
> = TExtension & Record<Exclude<keyof TExtension, keyof TShape>, never>;

/**
 * Defines an editor extension while preserving literal names, typed setup
 * output, and compile-time rejection of unsupported extension keys.
 *
 * Use the curried form to bind an extension to a specific editor type before
 * passing the descriptor.
 */
export const defineEditorExtension = ((
  extension?: EditorExtension<any, any>
) =>
  extension === undefined
    ? <const TExtension extends EditorExtension<any, any>>(
        typedExtension: TExtension
      ) => typedExtension
    : extension) as DefineEditorExtension;

export const isEditorExtensionInstalled = (
  editor: Editor,
  extension: EditorExtension<any, any>
) =>
  getExtensionState(editor).records.get(extension.name)?.extension ===
  extension;

const assertNoUnsupportedSlots = (extension: EditorExtension<Editor, any>) => {
  const methods = (extension as unknown as { methods?: unknown }).methods;
  const publicCommands = (extension as unknown as { commands?: unknown })
    .commands;
  const commitListeners = (
    extension as unknown as { commitListeners?: unknown }
  ).commitListeners;
  const operationMiddlewares = (
    extension as unknown as { operationMiddlewares?: unknown }
  ).operationMiddlewares;
  const register = (extension as unknown as { register?: unknown }).register;

  if (methods !== undefined) {
    throw new Error(
      `Editor extension "${extension.name}" cannot use methods. Add state or tx groups instead.`
    );
  }

  if (publicCommands !== undefined) {
    throw new Error(
      `Editor extension "${extension.name}" cannot use commands. Add state or tx groups instead.`
    );
  }

  if (operationMiddlewares !== undefined) {
    throw new Error(
      `Editor extension "${extension.name}" cannot use operationMiddlewares. Add operations.apply instead.`
    );
  }

  if (commitListeners !== undefined) {
    throw new Error(
      `Editor extension "${extension.name}" cannot use commitListeners. Add onCommit instead.`
    );
  }

  if (register !== undefined) {
    throw new Error(
      `Editor extension "${extension.name}" cannot use register. Add setup instead.`
    );
  }
};

const assertNoUnsupportedSetupOutput = (
  extensionName: string,
  slots: EditorExtensionSetupOutput<Editor>
) => {
  const commitListeners = (slots as unknown as { commitListeners?: unknown })
    .commitListeners;
  const operationMiddlewares = (
    slots as unknown as { operationMiddlewares?: unknown }
  ).operationMiddlewares;
  const commands = (slots as unknown as { commands?: unknown }).commands;

  if (commands !== undefined) {
    throw new Error(
      `Editor extension "${extensionName}" setup output cannot use commands. Add state or tx groups instead.`
    );
  }

  if (operationMiddlewares !== undefined) {
    throw new Error(
      `Editor extension "${extensionName}" setup output cannot use operationMiddlewares. Add operations.apply instead.`
    );
  }

  if (commitListeners !== undefined) {
    throw new Error(
      `Editor extension "${extensionName}" setup output cannot use commitListeners. Add onCommit instead.`
    );
  }
};

const createRuntimeState = <TValue>(
  initialValue: TValue | (() => TValue)
): EditorExtensionRuntimeState<TValue> & { cleanup: () => void } => {
  let active = true;
  let current =
    typeof initialValue === 'function'
      ? (initialValue as () => TValue)()
      : initialValue;

  const assertActive = () => {
    if (!active) {
      throw new Error('Editor extension runtime state has been cleaned up.');
    }
  };

  return {
    cleanup() {
      active = false;
      current = undefined as TValue;
    },
    get() {
      assertActive();

      return current;
    },
    set(value) {
      assertActive();
      current =
        typeof value === 'function'
          ? (value as (previous: TValue) => TValue)(current)
          : value;
    },
  };
};

const hasExtensionNamed = (
  state: ExtensionState,
  pending: Map<string, EditorExtension<Editor, any>>,
  name: string
) => state.records.has(name) || pending.has(name);

const getInstalledConflict = (
  state: ExtensionState,
  extension: EditorExtension<Editor, any>
) => {
  for (const [installedName, record] of state.records) {
    if (
      extension.conflicts?.includes(installedName) ||
      record.extension.conflicts?.includes(extension.name)
    ) {
      return installedName;
    }
  }

  return null;
};

const getPendingConflict = (
  extension: EditorExtension<Editor, any>,
  pending: Map<string, EditorExtension<Editor, any>>
) => {
  for (const [pendingName, pendingExtension] of pending) {
    if (pendingName === extension.name) {
      continue;
    }

    if (
      extension.conflicts?.includes(pendingName) ||
      pendingExtension.conflicts?.includes(extension.name)
    ) {
      return pendingName;
    }
  }

  return null;
};

const resolveExtensionOrder = (
  state: ExtensionState,
  extensions: readonly EditorExtension<Editor, any>[]
) => {
  const pending = new Map<string, EditorExtension<Editor, any>>();
  const ordered: EditorExtension<Editor, any>[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  for (const extension of extensions) {
    pending.set(extension.name, extension);
  }

  for (const extension of extensions) {
    const installedConflict = getInstalledConflict(state, extension);

    if (installedConflict) {
      throw new Error(
        `Editor extension "${extension.name}" conflicts with "${installedConflict}".`
      );
    }

    const pendingConflict = getPendingConflict(extension, pending);

    if (pendingConflict) {
      throw new Error(
        `Editor extension "${extension.name}" conflicts with "${pendingConflict}".`
      );
    }

    for (const peerDependency of extension.peerDependencies ?? []) {
      if (!hasExtensionNamed(state, pending, peerDependency)) {
        throw new Error(
          `Editor extension "${extension.name}" has missing peer dependency "${peerDependency}".`
        );
      }
    }
  }

  const visit = (extension: EditorExtension<Editor, any>) => {
    if (visited.has(extension.name)) {
      return;
    }

    if (visiting.has(extension.name)) {
      throw new Error(
        `Editor extension "${extension.name}" has a cyclic dependency.`
      );
    }

    visiting.add(extension.name);

    for (const dependency of extension.dependencies ?? []) {
      const pendingDependency = pending.get(dependency);

      if (pendingDependency) {
        visit(pendingDependency);
        continue;
      }

      if (!state.records.has(dependency)) {
        throw new Error(
          `Editor extension "${extension.name}" has missing dependency "${dependency}".`
        );
      }
    }

    visiting.delete(extension.name);
    visited.add(extension.name);
    ordered.push(extension);
  };

  for (const extension of extensions) {
    visit(extension);
  }

  return ordered;
};

const registerExtensionSlots = <TEditor extends Editor>(
  editor: TEditor,
  extension: EditorExtension<TEditor, any>
) => {
  const cleanups: Array<() => void> = [];
  const runtimeStateCleanups: Array<() => void> = [];
  const abortController = new AbortController();

  const context = {
    editor,
    name: extension.name,
    options: extension.options,
    runtimeState(initialValue) {
      const state = createRuntimeState(initialValue);
      runtimeStateCleanups.push(state.cleanup);

      return state;
    },
    signal: abortController.signal,
  } satisfies EditorExtensionSetupContext<TEditor, any>;

  const registerSlots = (slots: EditorExtensionSetupOutput<TEditor>) => {
    assertNoUnsupportedSetupOutput(
      extension.name,
      slots as EditorExtensionSetupOutput<Editor>
    );

    for (const key of EDITOR_TRANSFORM_MIDDLEWARE_KEYS) {
      const middleware = slots.transforms?.[key] as
        | TransformMiddleware<TEditor, typeof key>
        | undefined;

      if (!middleware) {
        continue;
      }

      cleanups.push(
        registerCommand<TransformMiddlewareCommand<TEditor, typeof key>>(
          editor,
          getTransformCommandType(key),
          (context, next) => {
            const { type: _type, ...commandArgs } = context.command;
            let delegated = false;
            let nextResult = false;

            const runNext = (
              overrides: Partial<
                TransformMiddlewareArgs<TEditor, typeof key>
              > = {}
            ) => {
              if (delegated) {
                throw new Error(
                  'Transform middleware next() cannot be called more than once.'
                );
              }

              delegated = true;
              nextResult = next({
                ...context.command,
                ...overrides,
                type: context.command.type,
              });

              return nextResult;
            };

            const result = middleware({
              ...(commandArgs as TransformMiddlewareArgs<TEditor, typeof key>),
              editor,
              next: runNext,
              tx: getActiveUpdateView<ValueOf<TEditor>>(
                editor as Editor<ValueOf<TEditor>>
              ),
            });

            if (typeof result !== 'boolean') {
              throw new Error(
                'Transform middleware must return true, false, or next(...).'
              );
            }

            return result;
          }
        )
      );
    }

    for (const [name, value] of Object.entries(slots.api ?? {})) {
      const values = Array.isArray(value) ? value : [value];

      for (const capability of values) {
        cleanups.push(registerCapability(editor, name, capability));
      }
    }

    if (slots.clipboard?.insertData) {
      cleanups.push(
        registerCapability(
          editor,
          'clipboard.insertData',
          ((_runtimeEditor, data) =>
            slots.clipboard?.insertData?.(data, {
              editor,
              next: () => false,
              state: getEditorStateView(editor),
            }) === true) as (editor: TEditor, data: DataTransfer) => boolean
        )
      );
    }

    for (const spec of slots.elements ?? []) {
      cleanups.push(registerElementSpec(editor, extension.name, spec));
    }

    if (slots.normalizers?.editor) {
      cleanups.push(
        registerNormalizer(
          editor,
          getExtensionSlotId(extension.name, 'normalizers.editor'),
          (context) => {
            if (context.entry[1].length !== 0) {
              context.next();
              return;
            }

            const { entry, ...normalizerOptions } = context;

            slots.normalizers?.editor?.({
              ...normalizerOptions,
              next(
                overrides: Partial<
                  EditorRootNormalizerArgs<ValueOf<TEditor>>
                > = {}
              ) {
                context.next(overrides);
              },
            });
          }
        )
      );
    }

    if (slots.normalizers?.node) {
      cleanups.push(
        registerNormalizer(
          editor,
          getExtensionSlotId(extension.name, 'normalizers.node'),
          (context) => {
            if (context.entry[1].length === 0) {
              context.next();
              return;
            }

            slots.normalizers?.node?.(
              context as EditorNodeNormalizerContext<TEditor>
            );
          }
        )
      );
    }

    if (slots.onCommit) {
      cleanups.push(
        registerCommitListener(editor, (commit) => {
          let snapshot: ReturnType<typeof getSnapshot> | null = null;

          slots.onCommit?.({
            commit,
            editor,
            get snapshot() {
              snapshot ??= getSnapshot(editor);

              return snapshot;
            },
          } as EditorCommitContext<TEditor>);
        })
      );
    }

    if (slots.operations?.apply) {
      cleanups.push(
        registerOperationMiddleware(editor, (context, next) => {
          slots.operations?.apply?.({
            ...context,
            next,
          });
        })
      );
    }

    for (const [group, methods] of Object.entries(slots.queries ?? {})) {
      for (const [method, middleware] of Object.entries(methods ?? {})) {
        if (middleware) {
          cleanups.push(
            registerQueryMiddleware(
              editor,
              group as never,
              method as never,
              middleware as never
            )
          );
        }
      }
    }

    for (const groupName of Object.keys(slots.state ?? {})) {
      const factory = slots.state?.[groupName];

      if (factory) {
        cleanups.push(
          registerStateGroup(editor, extension.name, groupName, factory)
        );
      }
    }

    for (const groupName of Object.keys(slots.tx ?? {})) {
      const factory = slots.tx?.[groupName];

      if (factory) {
        cleanups.push(
          registerTxGroup(editor, extension.name, groupName, factory)
        );
      }
    }
  };

  try {
    const setupOutput = extension.setup?.(context) ?? {};

    registerSlots(extension);
    registerSlots(setupOutput);

    for (const cleanup of runtimeStateCleanups) {
      cleanups.push(cleanup);
    }

    if (setupOutput.cleanup) {
      cleanups.push(setupOutput.cleanup);
    }

    cleanups.push(() => abortController.abort());
  } catch (error) {
    for (const cleanup of cleanups.slice().reverse()) {
      cleanup();
    }
    for (const cleanup of runtimeStateCleanups.slice().reverse()) {
      cleanup();
    }
    abortController.abort();

    throw error;
  }

  return cleanups;
};

const cleanupInstalledExtensions = (
  state: ExtensionState,
  registry: { extensions: { delete: (name: string) => boolean } },
  installedNames: readonly string[]
) => {
  for (const name of installedNames.slice().reverse()) {
    const record = state.records.get(name);

    if (!record) {
      continue;
    }

    for (const cleanup of record.cleanups.slice().reverse()) {
      cleanup();
    }

    state.records.delete(name);
    registry.extensions.delete(name);
  }
};

const getInstalledExtensionRecords = (
  state: ExtensionState,
  installedNames: readonly string[]
) =>
  installedNames
    .map((name) => state.records.get(name))
    .filter((record): record is ExtensionRecord => record !== undefined)
    .sort((a, b) => a.order - b.order);

const getRegisteredExtension = (
  extension: EditorExtension<Editor, any>,
  order: number
): RegisteredEditorExtension => ({
  conflicts: Object.freeze([...(extension.conflicts ?? [])]),
  dependencies: Object.freeze([...(extension.dependencies ?? [])]),
  name: extension.name,
  order,
  peerDependencies: Object.freeze([...(extension.peerDependencies ?? [])]),
});

const installExtensionRecord = (
  state: ExtensionState,
  registry: { extensions: Map<string, RegisteredEditorExtension> },
  extension: EditorExtension<Editor, any>,
  cleanups: Array<() => void>,
  order: number
) => {
  state.records.set(extension.name, {
    cleanups,
    extension,
    order,
  });
  registry.extensions.set(
    extension.name,
    getRegisteredExtension(extension, order)
  );
};

const restoreInstalledExtensionRecords = <TEditor extends Editor>(
  editor: TEditor,
  state: ExtensionState,
  registry: { extensions: Map<string, RegisteredEditorExtension> },
  records: readonly ExtensionRecord[]
) => {
  for (const record of records) {
    const cleanups = registerExtensionSlots(
      editor,
      record.extension as EditorExtension<TEditor, any>
    );

    installExtensionRecord(
      state,
      registry,
      record.extension,
      cleanups,
      record.order
    );
  }
};

export const extendEditor = <TEditor extends Editor>(
  editor: TEditor,
  input: EditorExtensionInput<TEditor>
): (() => void) => {
  const state = getExtensionState(editor);
  const registry = getExtensionRegistry(editor);
  const extensions = normalizeExtensionInput(input);
  const latest = resolveLatestExtensionEntries(
    extensions as readonly EditorExtension<Editor, any>[]
  );
  const replacedRecords = getInstalledExtensionRecords(
    state,
    latest.replacedNames
  );
  const validationState = getValidationStateWithoutReplacements(
    state,
    latest.replacedNames
  );
  const orderedExtensions = resolveExtensionOrder(
    validationState,
    latest.extensions
  );

  cleanupInstalledExtensions(state, registry, latest.replacedNames);

  const installedNames: string[] = [];

  try {
    for (const extension of orderedExtensions) {
      const order = extensionOrder++;
      const cleanups = registerExtensionSlots(
        editor,
        extension as EditorExtension<TEditor, any>
      );

      installExtensionRecord(
        state,
        registry,
        extension as EditorExtension<Editor, any>,
        cleanups,
        order
      );
      installedNames.push(extension.name);
    }
  } catch (error) {
    cleanupInstalledExtensions(state, registry, installedNames);
    restoreInstalledExtensionRecords(editor, state, registry, replacedRecords);
    throw error;
  }

  return () => {
    cleanupInstalledExtensions(state, registry, installedNames);
  };
};
