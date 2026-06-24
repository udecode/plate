import type {
  Editor,
  EditorQueryGroup,
  EditorQueryMiddlewareArgs,
  EditorQueryMiddlewareContext,
  EditorQueryMiddlewareResult,
  Value,
} from '../interfaces/editor';
import {
  getExtensionRegistry,
  getQueryMiddlewareKey,
} from './extension-registry';
import { getEditorStateView } from './public-state';

type QueryMethod<
  V extends Value,
  TGroup extends EditorQueryGroup,
> = keyof EditorQueryMiddlewareArgs<V>[TGroup] &
  keyof EditorQueryMiddlewareResult<V>[TGroup];

type QueryArgs<
  V extends Value,
  TGroup extends EditorQueryGroup,
  TMethod extends QueryMethod<V, TGroup>,
> = EditorQueryMiddlewareArgs<V>[TGroup][TMethod];

type QueryResult<
  V extends Value,
  TGroup extends EditorQueryGroup,
  TMethod extends QueryMethod<V, TGroup>,
> = EditorQueryMiddlewareResult<V>[TGroup][TMethod];

type QueryMiddleware<TEditor extends Editor, TArgs extends object, TResult> = (
  context: EditorQueryMiddlewareContext<TEditor, TArgs, TResult>
) => TResult;

type AnyGenerator = Generator<unknown, unknown, unknown>;

const DEFAULT_DEPTH = new WeakMap<Editor, number>();
const QUERY_DEPTH = new WeakMap<Editor, number>();

const isApplyingQueryDefault = (editor: Editor) =>
  (DEFAULT_DEPTH.get(editor) ?? 0) > 0;

export const isExecutingQueryMiddleware = (editor: Editor) =>
  (QUERY_DEPTH.get(editor) ?? 0) > 0;

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
      const result = run(() => generator.next(sent));

      if (result.done) {
        return result.value;
      }

      sent = yield result.value;
    }
  } finally {
    run(() => {
      generator.return?.(undefined);
    });
  }
}

const runQueryDefault = <T>(editor: Editor, fn: () => T): T => {
  DEFAULT_DEPTH.set(editor, (DEFAULT_DEPTH.get(editor) ?? 0) + 1);

  try {
    const result = fn();

    return (
      isGeneratorLike(result)
        ? wrapGeneratorContext(result, (next) => runQueryDefault(editor, next))
        : result
    ) as T;
  } finally {
    const nextDepth = (DEFAULT_DEPTH.get(editor) ?? 1) - 1;

    if (nextDepth > 0) {
      DEFAULT_DEPTH.set(editor, nextDepth);
    } else {
      DEFAULT_DEPTH.delete(editor);
    }
  }
};

const runQueryHandler = <T>(editor: Editor, fn: () => T): T => {
  QUERY_DEPTH.set(editor, (QUERY_DEPTH.get(editor) ?? 0) + 1);

  try {
    const result = fn();

    return (
      isGeneratorLike(result)
        ? wrapGeneratorContext(result, (next) => runQueryHandler(editor, next))
        : result
    ) as T;
  } finally {
    const nextDepth = (QUERY_DEPTH.get(editor) ?? 1) - 1;

    if (nextDepth > 0) {
      QUERY_DEPTH.set(editor, nextDepth);
    } else {
      QUERY_DEPTH.delete(editor);
    }
  }
};

export const executeQueryMiddleware = <
  V extends Value,
  TGroup extends EditorQueryGroup,
  TMethod extends QueryMethod<V, TGroup>,
>(
  editor: Editor<V>,
  group: TGroup,
  method: TMethod,
  args: QueryArgs<V, TGroup, TMethod>,
  applyDefault: (
    args: QueryArgs<V, TGroup, TMethod>
  ) => QueryResult<V, TGroup, TMethod>
): QueryResult<V, TGroup, TMethod> => {
  if (isApplyingQueryDefault(editor)) {
    return applyDefault(args);
  }

  const key = getQueryMiddlewareKey(group, String(method));
  const middlewares = getExtensionRegistry(editor).queryMiddlewares.get(key);

  if (!middlewares?.length) {
    return applyDefault(args);
  }

  const run = (
    index: number,
    currentArgs: QueryArgs<V, TGroup, TMethod>
  ): QueryResult<V, TGroup, TMethod> => {
    const middleware = middlewares[index] as
      | QueryMiddleware<
          Editor<V>,
          QueryArgs<V, TGroup, TMethod> & object,
          QueryResult<V, TGroup, TMethod>
        >
      | undefined;

    if (!middleware) {
      return runQueryDefault(editor, () => applyDefault(currentArgs));
    }

    let delegated = false;
    let nextResult: QueryResult<V, TGroup, TMethod> | undefined;

    const next = (
      overrides: Partial<QueryArgs<V, TGroup, TMethod>> = {}
    ): QueryResult<V, TGroup, TMethod> => {
      if (delegated) {
        throw new Error(
          'Query middleware next() cannot be called more than once.'
        );
      }

      delegated = true;
      nextResult = run(index + 1, {
        ...currentArgs,
        ...overrides,
      });

      return nextResult;
    };

    const result = runQueryHandler(editor, () =>
      middleware({
        ...currentArgs,
        editor,
        next,
        state: getEditorStateView(editor),
      } as EditorQueryMiddlewareContext<
        Editor<V>,
        QueryArgs<V, TGroup, TMethod> & object,
        QueryResult<V, TGroup, TMethod>
      >)
    );

    if (delegated && result === undefined) {
      return nextResult as QueryResult<V, TGroup, TMethod>;
    }

    return result as QueryResult<V, TGroup, TMethod>;
  };

  return run(0, args);
};
