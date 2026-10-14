export const isNonNegativeSafeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

/**
 * `value` as an indent level the schema accepts, or undefined when it is not a
 * positive safe integer.
 */
export const toIndentLevel = (value: number) =>
  isNonNegativeSafeInteger(value) && value > 0 ? value : undefined;
