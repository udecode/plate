import type { CreateEditorOptions } from '../interfaces/editor';

type LiteralKeys<T> = keyof {
  [K in keyof T as {} extends Record<K, unknown> ? never : K]: K;
};

type UnknownEditorOptionKeys<TOptions, TAllowed> = TOptions extends unknown
  ? Exclude<LiteralKeys<TOptions>, keyof TAllowed>
  : never;

/**
 * TypeScript runs no excess-property check against a bare inferred type
 * parameter, so when `TOptions` holds a key `TAllowed` lacks, this type drops
 * every such key, and the excess-property check against the filtered type
 * names the key. TypeScript finds the unknown keys of a generic `TOptions`
 * assignable to `never`, so it checks a type parameter, or a mapped type of
 * one such as `Readonly<O>`, against the first branch alone, and a wrapper
 * that forwards its options keeps the inferred overload. Inference reads both
 * branches, and `NoInfer` keeps it from reading the second. The second branch
 * filters each member of a union on its own, where `Omit` would keep only the
 * keys the members share.
 *
 * @internal
 */
export type CheckedEditorOptions<TOptions, TAllowed> =
  UnknownEditorOptionKeys<TOptions, TAllowed> extends never
    ? TOptions
    : NoInfer<{
        [
          K in keyof TOptions as K extends keyof TAllowed ? K : never
        ]: TOptions[K];
      }>;

/**
 * TypeScript reports a call that more than three overloads refuse with the
 * last overload's error, and `Parameters`, `call` and `apply` read the last
 * overload, which in headless `createEditor` takes this type.
 *
 * @internal
 */
export type UnknownEditorOptionTarget<TOptions, TAllowed> =
  UnknownEditorOptionKeys<TOptions, TAllowed> extends never
    ? TOptions extends TAllowed
      ? TOptions
      : TAllowed
    : TOptions &
        `Unknown editor option '${Extract<
          UnknownEditorOptionKeys<TOptions, TAllowed>,
          number | string
        >}'`;

/** @internal */
export const EDITOR_OPTION_KEYS = {
  id: true,
  initialSelection: true,
  initialValue: true,
  lifecycleErrorSink: true,
  maxLength: true,
  plugins: true,
  readOnly: true,
} satisfies Record<keyof CreateEditorOptions, true>;

// Read once, so a property added to Object.prototype later cannot widen the
// keys a custom prototype may hold.
const keysEveryObjectInherits = new Set(
  Object.getOwnPropertyNames(Object.prototype)
);

/** @internal */
export const assertEditorOptions = (
  options: object,
  keys: Readonly<Record<string, true>>
) => {
  for (
    let object: object | null = options;
    object !== null && object !== Object.prototype;
    object = Object.getPrototypeOf(object)
  ) {
    for (const key of Object.getOwnPropertyNames(object)) {
      if (Object.hasOwn(keys, key)) continue;
      if (object !== options && keysEveryObjectInherits.has(key)) continue;

      throw new TypeError(
        key === 'value'
          ? 'Unknown editor option "value". Use "initialValue" to set the document.'
          : `Unknown editor option "${key}".`
      );
    }
  }
};

/**
 * Copies each option in `keys` that `options` holds, own or inherited, into a
 * plain object that a rest or spread copies whole.
 *
 * @internal
 */
export const readEditorOptions = <TOptions extends object>(
  options: TOptions,
  keys: Readonly<Record<string, true>>
): Partial<TOptions> => {
  const read: Partial<TOptions> = {};

  for (const key of Object.keys(keys) as Array<keyof TOptions & string>) {
    const value = options[key];

    if (value !== undefined || key in options) read[key] = value;
  }

  return read;
};
