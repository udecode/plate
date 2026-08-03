import type {
  BaseEditor,
  AnyEditor as Editor,
  EditorReadDescriptor,
  EditorReadInput,
  EditorReadRegistration,
  EditorReadResult,
  EditorStateView,
  ExtensionsOf,
  ValueOf,
} from '../interfaces/editor';
import { getReadRegistrationRuntime } from './read-definition';
import { getEditorRuntimeOwner } from './editor-runtime';
import {
  type CompiledReadPipeline,
  type CompiledReadRegistry,
  getExtensionRegistry,
} from './extension-registry';
import { enterEditorRead, getEditorStateView } from './public-state';

type RegisteredRead = Readonly<{
  read: Readonly<{ id: string }>;
  run: (context: unknown) => unknown;
}>;

type AnyGenerator = Generator<unknown, unknown, unknown>;
const ACTIVE_READ_DEFAULTS = new WeakMap<Editor, Set<object>>();

const isGeneratorLike = (value: unknown): value is AnyGenerator =>
  !!value &&
  typeof value === 'object' &&
  typeof (value as { next?: unknown }).next === 'function' &&
  typeof (value as { [Symbol.iterator]?: unknown })[Symbol.iterator] ===
    'function';

function* wrapGeneratorContext(
  generator: AnyGenerator,
  run: <T>(fn: () => T) => T
): AnyGenerator {
  let sent: unknown;

  try {
    while (true) {
      let result = run(() => generator.next(sent));

      while (!result.done) {
        try {
          sent = yield result.value;
          break;
        } catch (error) {
          if (!generator.throw) throw error;
          result = run(() => generator.throw!(error));
        }
      }

      if (result.done) return result.value;
    }
  } finally {
    run(() => {
      generator.return?.(undefined);
    });
  }
}

export const registerReadInRegistry = <TEditor extends BaseEditor<any, any>>(
  reads: CompiledReadRegistry,
  registration: EditorReadRegistration<TEditor>
) => {
  const byDescriptor = reads.byDescriptor as Map<object, CompiledReadPipeline>;
  const byId = reads.byId as Map<string, object>;
  const { read, run } = getReadRegistrationRuntime(registration);

  if (read.id.length === 0) {
    throw new Error('Editor read ids must not be empty.');
  }

  const known = byId.get(read.id);

  if (known && known !== read) {
    throw new Error(
      `Editor read id "${read.id}" cannot install multiple descriptor identities.`
    );
  }

  const pipeline = byDescriptor.get(read);
  const entries = (pipeline?.entries ?? []) as RegisteredRead[];
  const compiled = Object.freeze({
    read,
    run: run as (context: unknown) => unknown,
  });

  entries.push(compiled);
  byDescriptor.set(read, {
    descriptor: read,
    entries,
    id: read.id,
  });
  byId.set(read.id, read);

  return () => {
    const current = byDescriptor.get(read)?.entries as
      | RegisteredRead[]
      | undefined;

    if (!current) return;

    const index = current.indexOf(compiled);
    if (index >= 0) current.splice(index, 1);
    if (current.length === 0) {
      byDescriptor.delete(read);
      byId.delete(read.id);
      return;
    }

    byDescriptor.set(read, {
      descriptor: read,
      entries: current,
      id: read.id,
    });
  };
};

export const executeEditorRead = <
  TRead extends EditorReadDescriptor<any, any, any>,
  TEditor extends BaseEditor<any, any>,
>(
  editor: TEditor,
  read: TRead,
  input: EditorReadInput<TRead>,
  applyDefault: (input: EditorReadInput<TRead>) => EditorReadResult<TRead>
): EditorReadResult<TRead> => {
  const owner = getEditorRuntimeOwner(editor as Editor);
  const entries =
    getExtensionRegistry(owner).reads.byDescriptor.get(read)?.entries ?? [];
  const runInRead = <T>(fn: () => T): T => {
    const exitRead = enterEditorRead(owner);

    try {
      return fnWithState(
        fn,
        getEditorStateView(owner) as EditorStateView<
          ValueOf<TEditor>,
          ExtensionsOf<TEditor>
        >
      );
    } finally {
      exitRead();
    }
  };
  let activeState:
    | EditorStateView<ValueOf<TEditor>, ExtensionsOf<TEditor>>
    | undefined;
  const fnWithState = <T>(
    fn: () => T,
    state: EditorStateView<ValueOf<TEditor>, ExtensionsOf<TEditor>>
  ): T => {
    const previous = activeState;
    activeState = state;

    try {
      const result = fn();

      return (
        isGeneratorLike(result)
          ? wrapGeneratorContext(result, runInRead)
          : result
      ) as T;
    } finally {
      activeState = previous;
    }
  };
  const runDefault = (
    currentInput: EditorReadInput<TRead>
  ): EditorReadResult<TRead> => {
    const activeDefaults = ACTIVE_READ_DEFAULTS.get(owner) ?? new Set<object>();

    if (activeDefaults.has(read)) return applyDefault(currentInput);
    activeDefaults.add(read);
    ACTIVE_READ_DEFAULTS.set(owner, activeDefaults);

    try {
      const result = applyDefault(currentInput);

      return (
        isGeneratorLike(result)
          ? wrapGeneratorContext(result, (next) =>
              runInRead(() => {
                activeDefaults.add(read);
                try {
                  return next();
                } finally {
                  activeDefaults.delete(read);
                }
              })
            )
          : result
      ) as EditorReadResult<TRead>;
    } finally {
      activeDefaults.delete(read);
      if (activeDefaults.size === 0) ACTIVE_READ_DEFAULTS.delete(owner);
    }
  };
  const dispatch = (
    index: number,
    currentInput: EditorReadInput<TRead>
  ): EditorReadResult<TRead> => {
    const registration = entries[index] as RegisteredRead | undefined;

    if (!registration) return runDefault(currentInput);

    let delegated = false;
    const next = (...overrideInput: [] | [EditorReadInput<TRead>]) => {
      if (delegated) {
        throw new Error(
          `Editor read "${read.id}" handlers may delegate only once.`
        );
      }

      delegated = true;
      return dispatch(
        index + 1,
        overrideInput.length === 0 ? currentInput : overrideInput[0]!
      );
    };
    return registration.run({
      editor,
      input: currentInput,
      next,
      state: activeState,
    }) as EditorReadResult<TRead>;
  };

  return ACTIVE_READ_DEFAULTS.get(owner)?.has(read)
    ? runInRead(() => applyDefault(input))
    : runInRead(() => dispatch(0, input));
};
