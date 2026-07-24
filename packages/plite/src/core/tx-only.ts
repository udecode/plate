const TX_ONLY_METHOD: unique symbol = Symbol('plite.txOnlyMethod');
const TX_READ_METHOD: unique symbol = Symbol('plite.txReadMethod');

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
  Object.defineProperty(method, TX_ONLY_METHOD, { value: true });

  return method as TxOnlyMethod<TMethod>;
};

/**
 * Mark a state-backed method as available inside an active/spec transaction
 * while omitting it from `editor.update`.
 */
export const txRead = <TMethod extends (...args: any[]) => any>(
  method: TMethod
): TxReadMethod<TMethod> => {
  Object.defineProperty(method, TX_READ_METHOD, { value: true });

  return method as TxReadMethod<TMethod>;
};

export const isTxOnlyMethod = (
  value: unknown
): value is TxOnlyMethod<(...args: any[]) => any> =>
  typeof value === 'function' && TX_ONLY_METHOD in value;

export const isTxReadMethod = (
  value: unknown
): value is TxReadMethod<(...args: any[]) => any> =>
  typeof value === 'function' && TX_READ_METHOD in value;
