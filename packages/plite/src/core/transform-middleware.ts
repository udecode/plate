import type {
  Editor,
  EditorPublicTransformMiddlewareKey,
  EditorTransformMiddlewareArgs,
  Value,
} from '../interfaces/editor';
import { executeCommand } from './command-registry';
import { getExtensionRegistry } from './extension-registry';
import { profileCoreDuration } from './profiling';

export const EDITOR_TRANSFORM_MIDDLEWARE_KEYS = [
  'addMark',
  'collapse',
  'delete',
  'deleteBackward',
  'deleteForward',
  'deleteFragment',
  'deselect',
  'insertBreak',
  'insertFragment',
  'insertNode',
  'insertNodes',
  'insertSoftBreak',
  'insertText',
  'liftNodes',
  'mergeNodes',
  'move',
  'moveNodes',
  'removeMark',
  'removeNodes',
  'select',
  'setNodes',
  'setPoint',
  'setSelection',
  'splitNodes',
  'toggleMark',
  'unsetNodes',
  'unwrapNodes',
  'wrapNodes',
] as const satisfies readonly EditorPublicTransformMiddlewareKey[];

type RegisteredEditorTransformMiddlewareKey =
  (typeof EDITOR_TRANSFORM_MIDDLEWARE_KEYS)[number];
type MissingRegisteredEditorTransformMiddlewareKey = Exclude<
  EditorPublicTransformMiddlewareKey,
  RegisteredEditorTransformMiddlewareKey
>;
type ExtraRegisteredEditorTransformMiddlewareKey = Exclude<
  RegisteredEditorTransformMiddlewareKey,
  EditorPublicTransformMiddlewareKey
>;
type AssertRegisteredEditorTransformMiddlewareKey<T extends never> = T;
type _NoMissingRegisteredEditorTransformMiddlewareKey =
  AssertRegisteredEditorTransformMiddlewareKey<MissingRegisteredEditorTransformMiddlewareKey>;
type _NoExtraRegisteredEditorTransformMiddlewareKey =
  AssertRegisteredEditorTransformMiddlewareKey<ExtraRegisteredEditorTransformMiddlewareKey>;

type TransformMiddlewareCommand<
  V extends Value,
  TKey extends EditorPublicTransformMiddlewareKey,
> = EditorTransformMiddlewareArgs<V>[TKey] & {
  type: string;
};

const TRANSFORM_COMMAND_PREFIX = 'transform:';
const DEFAULT_DEPTH = new WeakMap<Editor, number>();

export const getTransformCommandType = (
  key: EditorPublicTransformMiddlewareKey
) => `${TRANSFORM_COMMAND_PREFIX}${key}`;

export const hasTransformMiddleware = (
  editor: Editor,
  key: EditorPublicTransformMiddlewareKey
) => {
  const type = getTransformCommandType(key);
  const handlers = getExtensionRegistry(editor).commands.get(type);

  return !!handlers?.length;
};

const isApplyingTransformDefault = (editor: Editor) =>
  (DEFAULT_DEPTH.get(editor) ?? 0) > 0;

const runTransformDefault = <T>(editor: Editor, fn: () => T): T => {
  DEFAULT_DEPTH.set(editor, (DEFAULT_DEPTH.get(editor) ?? 0) + 1);

  try {
    return fn();
  } finally {
    const nextDepth = (DEFAULT_DEPTH.get(editor) ?? 1) - 1;

    if (nextDepth > 0) {
      DEFAULT_DEPTH.set(editor, nextDepth);
    } else {
      DEFAULT_DEPTH.delete(editor);
    }
  }
};

const stripCommandType = <
  V extends Value,
  TKey extends EditorPublicTransformMiddlewareKey,
>(
  command: TransformMiddlewareCommand<V, TKey>
) => {
  const { type: _type, ...args } = command;

  return args as unknown as EditorTransformMiddlewareArgs<V>[TKey];
};

export const executeTransformMiddleware = <
  V extends Value,
  TKey extends EditorPublicTransformMiddlewareKey,
>(
  editor: Editor<V>,
  key: TKey,
  args: EditorTransformMiddlewareArgs<V>[TKey],
  applyDefault: (args: EditorTransformMiddlewareArgs<V>[TKey]) => void
): boolean => {
  if (isApplyingTransformDefault(editor)) {
    profileCoreDuration(`transform-${key}-nested-default`, () =>
      applyDefault(args)
    );

    return true;
  }

  const type = getTransformCommandType(key);
  const handlers = profileCoreDuration(`transform-${key}-handlers`, () =>
    getExtensionRegistry(editor).commands.get(type)
  );

  if (!handlers?.length) {
    profileCoreDuration(`transform-${key}-default`, () =>
      runTransformDefault(editor, () => applyDefault(args))
    );

    return true;
  }

  return profileCoreDuration(`transform-${key}-command`, () =>
    executeCommand<TransformMiddlewareCommand<V, TKey>>(
      editor,
      {
        ...args,
        type,
      },
      (command) => {
        profileCoreDuration(`transform-${key}-command-default`, () =>
          runTransformDefault(editor, () =>
            applyDefault(stripCommandType(command))
          )
        );

        return true;
      }
    )
  );
};
