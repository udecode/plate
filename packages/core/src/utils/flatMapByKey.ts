type FlattenIfArray<T> = T extends (infer R)[] ? R : T;

/**
 * Flat map an array of object by key.
 */
export const flatMapByKey = <TItem, TKey extends keyof TItem>(
  arr: TItem[],
  key: TKey
) =>
  arr.flatMap((item: TItem) => item[key] ?? []) as FlattenIfArray<
    NonNullable<TItem[TKey]>
  >[];
