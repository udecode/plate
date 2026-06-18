import type {
  Editor,
  EditorCommand,
  EditorCommandDefinition,
  EditorCommandHandler,
  EditorCommandOptions,
  EditorCommandReference,
} from '../interfaces/editor';
import { getExtensionRegistry } from './extension-registry';
import { profileCoreDuration } from './profiling';
import {
  getCommandContext,
  updateEditor,
  withCommandContext,
} from './public-state';

type RegisteredCommand = {
  handler: EditorCommandHandler<any>;
  order: number;
  priority: number;
};

let commandOrder = 0;

const getCommandRegistry = (editor: Editor) =>
  getExtensionRegistry(editor).commands as Map<string, RegisteredCommand[]>;

const getCommandType = <TCommand extends EditorCommand>(
  command: EditorCommandReference<TCommand>
) => (typeof command === 'string' ? command : command.type);

export const defineCommand = <TCommand extends EditorCommand>(
  type: TCommand['type']
): EditorCommandDefinition<TCommand> => Object.freeze({ type });

export const registerCommand = <TCommand extends EditorCommand>(
  editor: Editor,
  command: EditorCommandReference<TCommand>,
  handler: EditorCommandHandler<TCommand>,
  { priority = 0 }: EditorCommandOptions = {}
) => {
  const commands = getCommandRegistry(editor);
  const type = getCommandType(command);
  const handlers = commands.get(type) ?? [];
  const registration = {
    handler,
    order: commandOrder++,
    priority,
  };

  handlers.push(registration);
  handlers.sort((a, b) => b.priority - a.priority || a.order - b.order);
  commands.set(type, handlers);

  return () => {
    const current = getCommandRegistry(editor).get(type);

    if (!current) {
      return;
    }

    const index = current.indexOf(registration);
    if (index >= 0) {
      current.splice(index, 1);
    }
  };
};

export const executeCommand = <TCommand extends EditorCommand>(
  editor: Editor,
  command: TCommand,
  defaultHandler: (command: TCommand) => boolean,
  options: { implicitUpdate?: boolean } = {}
): boolean => {
  const handlers = getCommandRegistry(editor).get(command.type) ?? [];

  const dispatch = (index: number, nextCommand: TCommand): boolean => {
    const registration = profileCoreDuration(
      `command-${command.type}-read-handler`,
      () => handlers[index]
    );

    if (!registration) {
      return profileCoreDuration(`command-${command.type}-default`, () =>
        defaultHandler(nextCommand)
      );
    }

    let delegated = false;
    const result = profileCoreDuration(`command-${command.type}-handler`, () =>
      registration.handler(
        {
          command: nextCommand,
          editor,
        },
        (overrideCommand = nextCommand) => {
          delegated = true;
          return dispatch(index + 1, overrideCommand);
        }
      )
    );

    if (result) {
      return true;
    }
    if (delegated) {
      return false;
    }

    return dispatch(index + 1, nextCommand);
  };

  if (getCommandContext(editor)) {
    return profileCoreDuration(`command-${command.type}-dispatch`, () =>
      dispatch(0, command)
    );
  }

  if (!options.implicitUpdate) {
    return profileCoreDuration(`command-${command.type}-context`, () =>
      withCommandContext(
        editor,
        { origin: 'command', type: command.type },
        () =>
          profileCoreDuration(`command-${command.type}-dispatch`, () =>
            dispatch(0, command)
          )
      )
    );
  }

  let result = false;
  profileCoreDuration(`command-${command.type}-implicit-update`, () =>
    updateEditor(editor, () => {
      result = withCommandContext(
        editor,
        { origin: 'command', type: command.type },
        () =>
          profileCoreDuration(`command-${command.type}-dispatch`, () =>
            dispatch(0, command)
          )
      );
    })
  );

  return result;
};
