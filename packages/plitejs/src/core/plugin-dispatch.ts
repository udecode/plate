import { isTxOnlyMethod } from './tx-only';

/**
 * The transaction guard answers this with whether a plugin member came from
 * the plugin's update group. Members the guard never built, such as core
 * update groups, answer nothing.
 *
 * @internal
 */
export const PLUGIN_UPDATE_ORIGIN = Symbol('plugin update origin');

export type PluginMethodPath = Readonly<{
  /** The last value reached before a `call` or `apply` adapter. */
  authoredMethod: unknown;
  owner: unknown;
  txOnly: boolean;
  value: unknown;
}>;

const MISSING: PluginMethodPath = Object.freeze({
  authoredMethod: undefined,
  owner: undefined,
  txOnly: false,
  value: undefined,
});

/**
 * `call` and `apply` on a function become adapters that keep the method's
 * receiver.
 *
 * @internal
 */
export const resolvePluginMethod = (
  source: unknown,
  path: readonly PropertyKey[]
): PluginMethodPath => {
  let owner: unknown = source;
  let value: unknown = source;
  let authoredMethod: unknown = source;
  let adapted = false;
  let txOnly = isTxOnlyMethod(source);

  for (const key of path) {
    const receiver = owner;

    owner = value;
    if (
      (typeof value !== 'object' || value === null) &&
      typeof value !== 'function'
    ) {
      return MISSING;
    }

    const descriptor = Object.getOwnPropertyDescriptor(value, key);

    if (!descriptor || !('value' in descriptor)) {
      if (typeof value === 'function' && (key === 'call' || key === 'apply')) {
        const target = value;

        owner = (...args: unknown[]) => Reflect.apply(target, receiver, args);
        value = Function.prototype[key];
        adapted = true;
        continue;
      }

      return MISSING;
    }

    ({ value } = descriptor);
    if (!adapted) authoredMethod = value;
    if (isTxOnlyMethod(value)) txOnly = true;
  }

  return { authoredMethod, owner, txOnly, value };
};

/** @internal */
export const callPluginUpdateMethod = (
  label: string,
  method: PluginMethodPath,
  args: readonly unknown[]
): unknown => {
  const { authoredMethod, owner, txOnly, value } = method;

  if (typeof value !== 'function') {
    throw new TypeError(`${label} is not callable.`);
  }
  if (txOnly) {
    throw new Error(`${label} is transaction-only.`);
  }
  if (
    typeof authoredMethod === 'function' &&
    Reflect.get(authoredMethod, PLUGIN_UPDATE_ORIGIN) === false
  ) {
    throw new Error(`${label} is read-only.`);
  }

  return Reflect.apply(value, owner, args);
};
