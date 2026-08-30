const TX_ONLY_METHOD: unique symbol = Symbol('plite.txOnlyMethod');
const TX_READ_METHOD: unique symbol = Symbol('plite.txReadMethod');

const getRuntimeMethodSet = (name: string): WeakSet<object> => {
  const key = Symbol.for(`plitejs.${name}`);
  const registry = globalThis as unknown as Record<PropertyKey, unknown>;
  const existing = registry[key];

  if (existing instanceof WeakSet) return existing;

  const methods = new WeakSet<object>();

  Object.defineProperty(registry, key, { value: methods });

  return methods;
};

const TX_ONLY_METHODS = getRuntimeMethodSet('txOnlyMethods');
const TX_READ_METHODS = getRuntimeMethodSet('txReadMethods');

/** A method available on a transaction but omitted from direct updates. */
export type TxOnlyMethod<TMethod extends (...args: any[]) => any> = TMethod & {
  readonly [TX_ONLY_METHOD]: true;
};

/** A read method available on state views and transactions, but not direct updates. */
export type TxReadMethod<TMethod extends (...args: any[]) => any> = TMethod & {
  readonly [TX_READ_METHOD]: true;
};

/**
 * Mark an extension method that only has meaning inside an existing update.
 * The method stays available on `tx` and is omitted from `editor.update`.
 */
export const txOnly = <TMethod extends (...args: any[]) => any>(
  method: TMethod
): TxOnlyMethod<TMethod> => {
  TX_ONLY_METHODS.add(method);

  return method as TxOnlyMethod<TMethod>;
};

/**
 * Mark a state-backed method as available inside an active/spec transaction
 * while omitting it from `editor.update`.
 */
export const txRead = <TMethod extends (...args: any[]) => any>(
  method: TMethod
): TxReadMethod<TMethod> => {
  TX_READ_METHODS.add(method);

  return method as TxReadMethod<TMethod>;
};

export const isTxOnlyMethod = (
  value: unknown
): value is TxOnlyMethod<(...args: any[]) => any> =>
  typeof value === 'function' && TX_ONLY_METHODS.has(value);

export const isTxReadMethod = (
  value: unknown
): value is TxReadMethod<(...args: any[]) => any> =>
  typeof value === 'function' && TX_READ_METHODS.has(value);

export const copyTxMethodMarkers = (source: unknown, target: object) => {
  if (isTxOnlyMethod(source)) TX_ONLY_METHODS.add(target);
  if (isTxReadMethod(source)) TX_READ_METHODS.add(target);
};
