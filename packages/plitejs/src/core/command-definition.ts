import type {
  BaseEditor,
  EditorCommand,
  EditorCommandAroundHandler,
  EditorCommandContext,
  EditorCommandDescriptor,
  EditorCommandHandler,
  EditorCommandInput,
  EditorCommandPlace,
  EditorCommandRegistration,
  EditorCommandResult,
  Editor,
} from '../interfaces/editor';

type CommandLocate<Input> = (
  input: Input,
  place: EditorCommandPlace
) => Input | null;

type CommandDefinitionSpec<
  Input,
  TEditor extends BaseEditor<any, any>,
> = Readonly<
  {
    build?: (
      context: EditorCommandContext<Input, TEditor>
    ) => EditorCommandResult;
    prepare?: (input: Input) => Input;
  } & (
    | {
        /**
         * Map the input's stored locations to where they land in the
         * document the command decides on, or return null when they have no
         * place there, so the command does nothing. `false` says the input
         * holds no location. A command with input that declares neither this
         * nor `selection` throws while a command document is registered.
         */
        locate?: CommandLocate<Input> | false;
        selection?: never;
      }
    | {
        locate?: never;
        /** The command changes only the selection, so it runs as stored. */
        selection: true;
      }
  )
>;

type CommandRuntime<Input, TEditor extends BaseEditor<any, any>> = Readonly<{
  build: (context: EditorCommandContext<Input, TEditor>) => EditorCommandResult;
  locate: CommandLocate<Input> | false | undefined;
  prepare: (input: Input) => Input;
  selection: boolean;
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
  });

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
    locate: spec.locate,
    prepare: spec.prepare ?? ((input: Input) => input),
    selection: spec.selection === true,
  });
  const command = {
    id,
  } as unknown as EditorCommand<Input, TEditor>;

  COMMAND_RUNTIMES.set(command, runtime);

  Object.freeze(command);

  return command;
};

/**
 * Resolve private descriptor preparation and default behavior.
 *
 * @internal
 */
export const getCommandRuntime = <Input, TEditor extends BaseEditor<any, any>>(
  command: EditorCommand<Input, TEditor>
): CommandRuntime<Input, TEditor> => {
  const runtime = COMMAND_RUNTIMES.get(command);

  if (!runtime) {
    throw new Error(
      `Editor command "${command.id}" must be created with defineCommand.`
    );
  }

  return runtime;
};

/**
 * Resolve one opaque registration created by an plugin factory.
 *
 * @internal
 */
export const getCommandRegistrationRuntime = <
  TEditor extends BaseEditor<any, any>,
>(
  registration: EditorCommandRegistration<TEditor>
): CommandRegistrationRuntime<any, TEditor> => {
  const runtime = COMMAND_REGISTRATION_RUNTIMES.get(registration);

  if (!runtime) {
    throw new Error(
      'Editor command registrations must be created by the plugin command factory.'
    );
  }

  return runtime;
};
