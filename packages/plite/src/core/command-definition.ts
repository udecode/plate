import type {
  BaseEditor,
  Editor,
  EditorCommand,
  EditorCommandAroundHandler,
  EditorCommandContext,
  EditorCommandDescriptor,
  EditorCommandHandler,
  EditorCommandInput,
  EditorCommandRegistration,
  EditorCommandResult,
  EditorStateView,
  EditorUpdateTag,
  ExtensionsOf,
  ValueOf,
} from '../interfaces/editor';

type CommandDefinitionSpec<
  Input,
  TEditor extends BaseEditor<any, any>,
> = Readonly<{
  build?: (
    context: EditorCommandContext<Input, TEditor>
  ) => EditorCommandResult;
  prepare?: (input: Input) => Input;
}>;

type CommandRuntime<Input, TEditor extends BaseEditor<any, any>> = Readonly<{
  build: (context: EditorCommandContext<Input, TEditor>) => EditorCommandResult;
  prepare: (input: Input) => Input;
}>;

type CommandRegistrationRuntime<
  Input,
  THandlerEditor extends BaseEditor<any, any>,
> = Readonly<{
  command: EditorCommandDescriptor;
  kind: 'around' | 'handle';
  run:
    | EditorCommandAroundHandler<Input, THandlerEditor>
    | EditorCommandHandler<Input, THandlerEditor>;
}>;

const COMMAND_RUNTIMES = new WeakMap<
  object,
  CommandRuntime<any, BaseEditor<any, any>>
>();
const COMMAND_REGISTRATION_RUNTIMES = new WeakMap<
  object,
  CommandRegistrationRuntime<any, BaseEditor<any, any>>
>();

export const createCommandRegistration = <
  TCommand extends EditorCommandDescriptor,
  THandlerEditor extends BaseEditor<any, any>,
>(
  command: TCommand,
  kind: 'around' | 'handle',
  run:
    | EditorCommandAroundHandler<EditorCommandInput<TCommand>, THandlerEditor>
    | EditorCommandHandler<EditorCommandInput<TCommand>, THandlerEditor>
): EditorCommandRegistration<THandlerEditor> => {
  const registration = Object.freeze(
    {}
  ) as EditorCommandRegistration<THandlerEditor>;

  COMMAND_REGISTRATION_RUNTIMES.set(registration, {
    command,
    kind,
    run,
  } as unknown as CommandRegistrationRuntime<any, BaseEditor<any, any>>);

  return registration;
};

/** Define a semantic command with descriptor-owned identity and pure behavior. */
export const defineCommand = <
  Input = void,
  TEditor extends BaseEditor<any, any> = Editor,
>(
  id: string,
  spec: CommandDefinitionSpec<Input, TEditor> = {}
): EditorCommand<Input, TEditor> => {
  if (id.length === 0) {
    throw new Error('Editor command ids must not be empty.');
  }

  const runtime = Object.freeze({
    build: spec.build ?? (() => false),
    prepare: spec.prepare ?? ((input: Input) => input),
  });
  const command = {
    build(
      state: EditorStateView<ValueOf<TEditor>, ExtensionsOf<TEditor>>,
      ...input: [Input] extends [void] ? [] | [input: Input] : [input: Input]
    ) {
      return runtime.build({
        input: runtime.prepare(input[0] as Input) as Readonly<Input>,
        state,
        tags: Object.freeze([]) as readonly EditorUpdateTag[],
      });
    },
    id,
  } as unknown as EditorCommand<Input, TEditor>;

  COMMAND_RUNTIMES.set(
    command,
    runtime as CommandRuntime<any, BaseEditor<any, any>>
  );

  return Object.freeze(command);
};

/** @internal Resolve private descriptor preparation and default behavior. */
export const getCommandRuntime = <Input, TEditor extends BaseEditor<any, any>>(
  command: EditorCommand<Input, TEditor>
): CommandRuntime<Input, TEditor> => {
  const runtime = COMMAND_RUNTIMES.get(command);

  if (!runtime) {
    throw new Error(
      `Editor command "${command.id}" must be created with defineCommand.`
    );
  }

  return runtime as CommandRuntime<Input, TEditor>;
};

/** @internal Resolve one opaque registration created by an extension factory. */
export const getCommandRegistrationRuntime = <
  TEditor extends BaseEditor<any, any>,
>(
  registration: EditorCommandRegistration<TEditor>
): CommandRegistrationRuntime<any, TEditor> => {
  const runtime = COMMAND_REGISTRATION_RUNTIMES.get(registration);

  if (!runtime) {
    throw new Error(
      'Editor command registrations must be created by the extension command factory.'
    );
  }

  return runtime as unknown as CommandRegistrationRuntime<any, TEditor>;
};
