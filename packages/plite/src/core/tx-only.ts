const TX_ONLY_METHOD: unique symbol = Symbol('plite.txOnlyMethod');

/** A method available on a transaction but omitted from direct updates. */
export type TxOnlyMethod<TMethod extends (...args: any[]) => any> = TMethod & {
  readonly [TX_ONLY_METHOD]: true;
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

export const isTxOnlyMethod = (
  value: unknown
): value is TxOnlyMethod<(...args: any[]) => any> =>
  typeof value === 'function' && TX_ONLY_METHOD in value;
