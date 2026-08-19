import type {
  BaseEditor,
  AnyEditor as Editor,
  EditorCommand,
  EditorCommandDescriptor,
  EditorCommandContext,
  EditorCommandInput,
  EditorCommandContinuation,
  EditorCommandDispatch,
  EditorCommandRegistration,
  EditorCommandResult,
  EditorStateView,
  TransactionSpec,
} from '../interfaces/editor';
import {
  getCommandRegistrationRuntime,
  getCommandRuntime,
} from './command-definition';
import { getEditorRuntimeOwner } from './editor-runtime';
import {
  type CompiledCommandPipeline,
  type CompiledCommandRegistry,
  getExtensionRegistry,
} from './extension-registry';
import { profileCoreDuration } from './profiling';
import {
  applyTransactionSpec,
  continueTransactionSpec,
  enterEditorRead,
  getActiveEditorUpdateTags,
  getActiveEditorTransaction,
  isBuildingTransactionSpec,
  isInTransaction,
  isTransactionSpec,
  isTransactionSpecContinuation,
  withTransactionSpecDraftRead,
} from './public-state';

export { defineCommand } from './command-definition';

type RegisteredCommand = Readonly<{
  command: Readonly<{ id: string }>;
  kind: 'around' | 'handle';
  owner: string;
  run: (context: unknown) => EditorCommandResult;
}>;

export type EditorCommandEvaluation = Readonly<{
  /** Installed extension names that materially changed the default result. */
  materialHandlers: readonly string[];
  /** True only when every installed handler delegated the original input unchanged. */
  nativeEquivalent: boolean;
  result: EditorCommandResult;
}>;

export type EditorCommandNativeProbe = Readonly<{
  materialHandlers: readonly string[];
  nativeEquivalent: boolean;
}>;

const EMPTY_MATERIAL_HANDLERS = Object.freeze([]) as readonly string[];
const NATIVE_EQUIVALENT_PROBE = Object.freeze({
  materialHandlers: EMPTY_MATERIAL_HANDLERS,
  nativeEquivalent: true,
}) satisfies EditorCommandNativeProbe;

const commandStacks = new WeakMap<Editor, EditorCommand<unknown>[]>();
const getCommandRegistry = (editor: Editor) =>
  getExtensionRegistry(editor).commands.byDescriptor as ReadonlyMap<
    object,
    Readonly<{ entries: readonly RegisteredCommand[] }>
  >;

export const hasCommandHandler = <Input>(
  editor: Editor,
  command: EditorCommand<Input>
) => (getCommandRegistry(editor).get(command)?.entries.length ?? 0) > 0;

/** Compile one pure command registration into a detached extension registry. */
export const registerCommandInRegistry = <TEditor extends BaseEditor<any, any>>(
  commands: CompiledCommandRegistry,
  registration: EditorCommandRegistration<TEditor>,
  owner: string
) => {
  const byDescriptor = commands.byDescriptor as Map<
    object,
    CompiledCommandPipeline
  >;
  const byId = commands.byId as Map<string, object>;
  const { command, kind, run } = getCommandRegistrationRuntime(registration);

  if (command.id.length === 0) {
    throw new Error('Editor command ids must not be empty.');
  }

  const known = byId.get(command.id);

  if (known && known !== command) {
    throw new Error(
      `Editor command id "${command.id}" cannot install multiple descriptor identities.`
    );
  }

  const pipeline = byDescriptor.get(command);
  const entries = (pipeline?.entries ?? []) as RegisteredCommand[];
  const compiled = Object.freeze({
    command,
    kind,
    owner,
    run: run as (context: unknown) => EditorCommandResult,
  });

  if (kind === 'around') {
    const firstHandlerIndex = entries.findIndex(
      (entry) => entry.kind === 'handle'
    );

    entries.splice(
      firstHandlerIndex === -1 ? entries.length : firstHandlerIndex,
      0,
      compiled
    );
  } else {
    entries.push(compiled);
  }
  byDescriptor.set(command, {
    descriptor: command,
    entries,
    hasAround: entries.some((entry) => entry.kind === 'around'),
    id: command.id,
  });
  byId.set(command.id, command);

  return () => {
    const current = byDescriptor.get(command)?.entries as
      | RegisteredCommand[]
      | undefined;

    if (!current) return;

    const index = current.indexOf(compiled);
    if (index >= 0) current.splice(index, 1);
    if (current.length === 0) {
      byDescriptor.delete(command);
      byId.delete(command.id);
      return;
    }

    byDescriptor.set(command, {
      descriptor: command,
      entries: current,
      hasAround: current.some((entry) => entry.kind === 'around'),
      id: command.id,
    });
  };
};

const assertCommandResult = (
  id: string,
  result: unknown
): EditorCommandResult => {
  if (result === false) return false;
  if (isTransactionSpec(result)) return result;

  throw new Error(`Command "${id}" must return false or a transaction spec.`);
};

const evaluateCommandChainInRead = <
  Input,
  TEditor extends BaseEditor<any, any>,
>(
  editor: TEditor,
  command: EditorCommand<Input, TEditor>,
  input: Input,
  state: EditorStateView<any, any>
): EditorCommandEvaluation => {
  if (state.view.isReadOnly()) {
    throw new Error('Cannot update a read-only editor view.');
  }

  const owner = getEditorRuntimeOwner(editor);
  const entries = getCommandRegistry(owner).get(command)?.entries ?? [];
  const runtime = getCommandRuntime(command);
  let cachedReadState = state as unknown as
    | EditorCommandContext<Input, TEditor>['state']
    | undefined;
  const readState = () =>
    (cachedReadState ??= (isBuildingTransactionSpec(owner) ||
    isInTransaction(owner)
      ? withTransactionSpecDraftRead(owner, () =>
          editor.read((state) => state as EditorStateView)
        )
      : editor.read(
          (state) => state as EditorStateView
        )) as unknown as EditorCommandContext<Input, TEditor>['state']);
  const tags = () => getActiveEditorUpdateTags(owner);
  let defaultResult: EditorCommandResult | undefined;
  let inputOverridden = false;
  let materialHandlers: Set<string> | null = null;
  const markMaterial = (name: string) => {
    materialHandlers ??= new Set();
    materialHandlers.add(name);
  };

  const dispatch = (
    index: number,
    nextInput: Input,
    prepared = false
  ): EditorCommandResult => {
    const preparedInput = prepared ? nextInput : runtime.prepare(nextInput);
    const registration = profileCoreDuration(
      `command-${command.id}-read-handler`,
      () => entries[index]
    );

    if (!registration) {
      defaultResult = profileCoreDuration(`command-${command.id}-default`, () =>
        assertCommandResult(
          command.id,
          runtime.build({
            input: preparedInput,
            state: readState(),
            tags: tags(),
          })
        )
      );

      return defaultResult;
    }

    if (registration.kind === 'handle') {
      const result = profileCoreDuration(`command-${command.id}-handler`, () =>
        registration.run({
          input: preparedInput as Readonly<Input>,
          state: readState(),
          tags: tags(),
        })
      );
      const commandResult = assertCommandResult(command.id, result);

      if (commandResult !== false) {
        markMaterial(registration.owner);
      }

      return commandResult === false
        ? dispatch(index + 1, preparedInput, true)
        : commandResult;
    }

    let delegated = false;
    let delegatedResult: EditorCommandResult | undefined;
    const beginDelegation = () => {
      if (delegated) {
        throw new Error(
          `Command "${command.id}" handlers may delegate only once.`
        );
      }
      delegated = true;
    };
    const next = Object.assign(
      (...overrideInput: [] | [Input]) => {
        beginDelegation();
        const hasDifferentInput =
          overrideInput.length > 0 && overrideInput[0] !== preparedInput;

        inputOverridden ||= hasDifferentInput;
        if (hasDifferentInput) {
          markMaterial(registration.owner);
        }
        delegatedResult = dispatch(
          index + 1,
          hasDifferentInput ? overrideInput[0]! : preparedInput,
          !hasDifferentInput
        );
        return delegatedResult;
      },
      {
        after(prefix: TransactionSpec, ...overrideInput: [] | [Input]) {
          beginDelegation();
          const hasDifferentInput =
            overrideInput.length > 0 && overrideInput[0] !== preparedInput;

          inputOverridden ||= hasDifferentInput;
          markMaterial(registration.owner);
          delegatedResult = continueTransactionSpec(owner, prefix, () => {
            cachedReadState = undefined;

            return dispatch(
              index + 1,
              hasDifferentInput ? overrideInput[0]! : preparedInput,
              !hasDifferentInput
            );
          });
          return delegatedResult;
        },
      }
    ) as EditorCommandContinuation<Input>;
    const result = profileCoreDuration(`command-${command.id}-around`, () =>
      registration.run({
        input: preparedInput as Readonly<Input>,
        next: next as EditorCommandContinuation<unknown>,
        state: readState(),
        tags: tags(),
      })
    );
    const commandResult = assertCommandResult(command.id, result);

    if (
      commandResult !== false &&
      (!delegated || commandResult !== delegatedResult)
    ) {
      markMaterial(registration.owner);
    }

    if (delegated) {
      if (
        commandResult !== delegatedResult &&
        !(
          commandResult !== false &&
          delegatedResult !== undefined &&
          delegatedResult !== false &&
          isTransactionSpecContinuation(commandResult, delegatedResult)
        )
      ) {
        throw new Error(
          `Command "${command.id}" handlers must return their delegated result.`
        );
      }
      return commandResult;
    }

    return commandResult === false
      ? dispatch(index + 1, preparedInput, true)
      : commandResult;
  };

  const stack = commandStacks.get(owner) ?? [];
  if (stack.includes(command as unknown as EditorCommand<unknown>)) {
    throw new Error(
      `Command recursion cycle: ${[
        ...stack.map((item) => item.id),
        command.id,
      ].join(' -> ')}`
    );
  }
  if (stack.length >= 64) {
    throw new Error('Command recursion depth exceeded 64.');
  }

  stack.push(command as unknown as EditorCommand<unknown>);
  commandStacks.set(owner, stack);
  try {
    const result = profileCoreDuration(`command-${command.id}-dispatch`, () =>
      dispatch(0, input)
    );

    const nativeEquivalent =
      result !== false &&
      result === defaultResult &&
      !inputOverridden &&
      materialHandlers === null;

    return Object.freeze({
      materialHandlers:
        materialHandlers === null
          ? EMPTY_MATERIAL_HANDLERS
          : Object.freeze([...materialHandlers]),
      nativeEquivalent,
      result,
    });
  } finally {
    stack.pop();
    if (stack.length === 0) commandStacks.delete(owner);
  }
};

const evaluateCommandChain = <Input, TEditor extends BaseEditor<any, any>>(
  editor: TEditor,
  command: EditorCommand<Input, TEditor>,
  input: Input
): EditorCommandEvaluation => {
  const owner = getEditorRuntimeOwner(editor);
  const readState = () => editor.read((state) => state);
  const state =
    isBuildingTransactionSpec(owner) || isInTransaction(owner)
      ? withTransactionSpecDraftRead(owner, readState)
      : readState();
  const exitRead = enterEditorRead(owner);

  try {
    return evaluateCommandChainInRead(editor, command, input, state);
  } finally {
    exitRead();
  }
};

const applyCommandEvaluation = <TEditor extends BaseEditor<any, any>>(
  editor: TEditor,
  evaluation: EditorCommandEvaluation
) => {
  const { result } = evaluation;

  if (result === false) return false;

  const owner = getEditorRuntimeOwner(editor);

  if (isInTransaction(owner)) {
    getActiveEditorTransaction(owner)?.tags.add('semantic-command');
    applyTransactionSpec(owner, result);
  } else {
    editor.update({ tags: 'semantic-command' }, () =>
      applyTransactionSpec(owner, result)
    );
  }

  return true;
};

const runCommandChain = <Input, TEditor extends BaseEditor<any, any>>(
  editor: TEditor,
  command: EditorCommand<Input, TEditor>,
  input: Input
) =>
  applyCommandEvaluation(editor, evaluateCommandChain(editor, command, input));

/** @internal Evaluate one pure command without publishing its transaction. */
export const evaluateCommand = <TCommand extends EditorCommandDescriptor>(
  editor: Editor<any, any>,
  command: TCommand,
  ...input: [EditorCommandInput<TCommand>] extends [void]
    ? [] | [input: EditorCommandInput<TCommand>]
    : [input: EditorCommandInput<TCommand>]
): EditorCommandEvaluation =>
  evaluateCommandChain(
    editor as Editor,
    command as unknown as EditorCommand<unknown, Editor>,
    input[0]
  );

/** @internal Probe whether installed handlers preserve the default command unchanged. */
export const probeCommandNativeEquivalent = <
  TCommand extends EditorCommandDescriptor,
>(
  editor: Editor<any, any>,
  command: TCommand,
  ...input: [EditorCommandInput<TCommand>] extends [void]
    ? [] | [input: EditorCommandInput<TCommand>]
    : [input: EditorCommandInput<TCommand>]
): EditorCommandNativeProbe => {
  const evaluation = evaluateCommandChain(
    editor as Editor,
    command as unknown as EditorCommand<unknown, Editor>,
    input[0]
  );

  return evaluation.nativeEquivalent
    ? NATIVE_EQUIVALENT_PROBE
    : Object.freeze({
        materialHandlers: evaluation.materialHandlers,
        nativeEquivalent: false,
      });
};

/** @internal Imperatively dispatch a pure command at a host boundary. */
export const dispatchCommand = <TCommand extends EditorCommandDescriptor>(
  editor: Editor<any, any>,
  command: TCommand,
  ...input: [EditorCommandInput<TCommand>] extends [void]
    ? [] | [input: EditorCommandInput<TCommand>]
    : [input: EditorCommandInput<TCommand>]
): boolean =>
  runCommandChain(
    editor as Editor,
    command as unknown as EditorCommand<unknown, Editor>,
    input[0]
  );

/** @internal Bind typed command dispatch to a runtime editor owner. */
export const createCommandDispatch = <TEditor extends Editor>(
  getEditor: () => TEditor
): EditorCommandDispatch<TEditor> =>
  ((command: EditorCommand<unknown>, input?: unknown) =>
    runCommandChain(
      getEditor(),
      command as unknown as EditorCommand<unknown, TEditor>,
      input
    )) as unknown as EditorCommandDispatch<TEditor>;
