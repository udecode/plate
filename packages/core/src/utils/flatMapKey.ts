export const flatMapKey = <T extends Array<any>, U extends keyof T[0]>(
  arr: T,
  key: U
): NonNullable<T[0][U]>[] => arr.flatMap((item) => item[key] ?? []);
