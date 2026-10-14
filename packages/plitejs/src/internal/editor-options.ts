import type { CreateEditorOptions } from '../interfaces/editor';

// `undefined extends TOptions['plugins']` stays deferred for a generic plugins
// tuple and pushes a generic wrapper off the inferred overload.
type RefuseOptionalPluginsKey<TOptions> =
  {} extends Pick<TOptions, 'plugins' & keyof TOptions>
    ? 'plugins' extends keyof TOptions
      ? { plugins: never }
      : unknown
    : unknown;

type RefuseMaybeUndefinedPlugins<TPlugins> = [TPlugins] extends [undefined]
  ? TPlugins
  : TPlugins & {};

/**
 * TypeScript runs no excess-property check against an inferred `TOptions`. It
 * also types a `lifecycleErrorSink` callback written in the call as implicit
 * `any`, because the constraint on `TOptions` lacks that key. With several
 * overloads it first relates arguments by subtype, which a sink typed with the
 * exported `EditorLifecycleErrorSink` fails against a slot holding `any`, so a
 * sink that fits the slot keeps its own type.
 *
 * @internal
 */
export type CheckedEditorOptions<
  TOptions,
  TAllowed extends { lifecycleErrorSink?: unknown },
> = {
  [K in keyof TOptions]: K extends 'lifecycleErrorSink'
    ? TOptions[K] extends TAllowed['lifecycleErrorSink']
      ? TOptions[K]
      : TAllowed['lifecycleErrorSink']
    : K extends 'plugins'
      ? RefuseMaybeUndefinedPlugins<TOptions[K]>
      : TOptions[K];
} & {
  [K in Exclude<keyof TOptions, keyof TAllowed>]: never;
} & RefuseOptionalPluginsKey<TOptions>;

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
