import type { EditorCommandPlace, NodeTarget } from '../interfaces/editor';
import type { Span } from '../interfaces/location';
import type { NodeSelection } from '../interfaces/selection';

declare const TX_ONLY_METHOD: unique symbol;
declare const TX_DECLARED_METHOD: unique symbol;

const getRuntimeRegistry = <T extends object>(
  name: string,
  create: () => T
): T => {
  const key = Symbol.for(`editor-runtime.${name}`);
  const registry = globalThis as unknown as Record<PropertyKey, T | undefined>;
  const existing = registry[key];

  if (existing) return existing;

  const value = create();

  Object.defineProperty(registry, key, { value });

  return value;
};

const TX_ONLY_METHODS = getRuntimeRegistry(
  'tx-only-methods',
  () => new WeakSet<object>()
);

/** A method available on a transaction but omitted from direct updates. */
export type TxOnlyMethod<TMethod extends (...args: any[]) => any> = TMethod & {
  readonly [TX_ONLY_METHOD]: true;
};

/**
 * Mark a plugin method that only has meaning inside an existing update. It
 * stays on `tx`. A direct call through `editor.update.<name>` or a plugin
 * portal refuses it, and every member of a marked group.
 */
export const txOnly = <TMethod extends (...args: any[]) => any>(
  method: TMethod
): TxOnlyMethod<TMethod> => {
  TX_ONLY_METHODS.add(method);

  return method as TxOnlyMethod<TMethod>;
};

export const isTxOnlyMethod = (
  value: unknown
): value is TxOnlyMethod<(...args: any[]) => any> =>
  typeof value === 'function' && TX_ONLY_METHODS.has(value);

/**
 * A plugin update method declared with `txLocate`, `txSelection` or
 * `txStored`.
 */
export type TxDeclaredMethod<TMethod extends (...args: never[]) => unknown> =
  TMethod & {
    readonly [TX_DECLARED_METHOD]: true;
  };

type UndeclaredTxMethodPath<TMethod, TPath extends string> = TMethod extends (
  ...args: infer TArgs
) => unknown
  ? TMethod extends
      | { readonly [TX_DECLARED_METHOD]: true }
      | { readonly [TX_ONLY_METHOD]: true }
    ? never
    : TArgs extends readonly []
      ? never
      : TPath
  : never;

// One level only: recursing into every nested object reaches plugin types
// that refer to themselves and exhausts the compiler's instantiation depth.
type UndeclaredTxMethodPaths<TUpdate> = {
  [K in keyof TUpdate & string]: TUpdate[K] extends (
    ...args: never[]
  ) => unknown
    ? UndeclaredTxMethodPath<TUpdate[K], K>
    : TUpdate[K] extends object
      ? {
          [J in keyof TUpdate[K] & string]: UndeclaredTxMethodPath<
            TUpdate[K][J],
            `${K}.${J}`
          >;
        }[keyof TUpdate[K] & string]
      : never;
}[keyof TUpdate & string];

/**
 * Refuses a plugin's update methods when one takes arguments without
 * `txLocate`, `txSelection` or `txOnly`, because the update throws on such a
 * call while a command document is registered. Intersect it with the update
 * factory's return type.
 */
export type TxMethodDeclarations<TUpdate> = [
  UndeclaredTxMethodPaths<TUpdate>,
] extends [never]
  ? unknown
  : Readonly<
      Record<
        `${UndeclaredTxMethodPaths<TUpdate>} takes arguments, so declare it with txLocate, txSelection or txOnly`,
        true
      >
    >;

type TxMethodLocate =
  | BivariantLocate<readonly unknown[]>
  | false
  | 'selection'
  | 'stored';

type BivariantLocate<TArgs extends readonly unknown[]> = {
  locate(args: TArgs, place: EditorCommandPlace): TArgs | null;
}['locate'];

const TX_LOCATES = getRuntimeRegistry(
  'tx-locates',
  () => new WeakMap<object, TxMethodLocate>()
);

/**
 * Declare where a plugin update method's arguments land in the document
 * editing commands decide on. `locate` maps the stored locations in them, or
 * returns null when they have no place there, so the method does nothing;
 * `false` says they hold no location. While a command document is
 * registered, a method called with arguments that declares neither throws.
 */
export const txLocate = <TMethod extends (...args: never[]) => unknown>(
  locate: NoInfer<BivariantLocate<Parameters<TMethod>>> | false,
  method: TMethod
): TxDeclaredMethod<TMethod> => {
  TX_LOCATES.set(method, locate);

  return method as TxDeclaredMethod<TMethod>;
};

type Target = NodeSelection | NodeTarget | Span | null;

// TypeScript has no type for a tuple with one element replaced, so the
// overload keeps the caller's tuple type.
function withArgument<TArgs extends readonly unknown[]>(
  args: TArgs,
  index: number,
  value: unknown
): TArgs;
function withArgument(args: readonly unknown[], index: number, value: unknown) {
  return args.with(index, value);
}

/**
 * A `txLocate` locate for a method whose argument at `index` is options
 * holding targets under `keys`, `at` by default: it places each target
 * given, and the method does nothing when one has no place.
 */
export const locateAt =
  <TIndex extends number, TKey extends string = 'at'>(
    index: TIndex,
    ...keys: TKey[]
  ) =>
  <
    TArgs extends readonly unknown[] & {
      readonly [K in TIndex]?: Readonly<Partial<Record<TKey, Target>>>;
    },
  >(
    args: TArgs,
    place: EditorCommandPlace
  ): TArgs | null => {
    const options: Readonly<Partial<Record<string, Target>>> | undefined =
      args[index];

    if (!options) return args;

    const placed = { ...options };

    for (const key of keys.length === 0 ? ['at'] : keys) {
      const target = options[key];

      if (target === undefined || target === null) continue;

      const at = place.location(target);

      if (at === null) return null;
      placed[key] = at;
    }

    return withArgument(args, index, placed);
  };

/**
 * Declare a plugin update method that only moves the selection, as caret
 * movement does: it runs on the stored document, and throws if it changes
 * content.
 */
export const txSelection = <TMethod extends (...args: never[]) => unknown>(
  method: TMethod
): TxDeclaredMethod<TMethod> => {
  TX_LOCATES.set(method, 'selection');

  return method as TxDeclaredMethod<TMethod>;
};

/**
 * Mark a plugin update method that works on the stored document, such as
 * deciding review changes, so it runs in the update itself instead of the
 * document editing commands decide on. @internal
 */
export const txStored = <TMethod extends (...args: never[]) => unknown>(
  method: TMethod
): TxDeclaredMethod<TMethod> => {
  TX_LOCATES.set(method, 'stored');

  return method as TxDeclaredMethod<TMethod>;
};

/** @internal */
export const getTxMethodLocate = (method: object) => TX_LOCATES.get(method);

export const copyTxMethodMarkers = (source: unknown, target: object) => {
  if (isTxOnlyMethod(source)) TX_ONLY_METHODS.add(target);
  const locate =
    typeof source === 'function' ? TX_LOCATES.get(source) : undefined;

  if (locate !== undefined) TX_LOCATES.set(target, locate);
};
