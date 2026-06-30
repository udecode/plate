function castArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export type QueryNodeEntry<N = unknown> = [N, number[]];

export type QueryNodeOptions = {
  /** List of types that are valid. If empty or undefined, allow all. */
  allow?: string[] | string | null;
  /** List of types that are invalid. */
  exclude?: string[] | string | null;
  /** Query the node entry. */
  filter?: (entry: QueryNodeEntry<any>) => boolean;
  /** Valid path levels. */
  level?: number[] | number | null;
  /** Paths above that value are invalid. */
  maxLevel?: number | null;
};

export const queryNode = <N>(
  entry?: QueryNodeEntry<N>,
  { allow, exclude, filter, level, maxLevel }: QueryNodeOptions = {}
) => {
  if (!entry) return false;

  const [node, path] = entry;
  const type = (node as { type?: unknown }).type;

  if (level) {
    const levels = castArray(level);

    if (!levels.includes(path.length)) {
      return false;
    }
  }
  if (maxLevel && path.length > maxLevel) {
    return false;
  }
  if (filter && !filter(entry)) {
    return false;
  }
  if (allow) {
    const allowedTypes = castArray(allow);

    if (allowedTypes.length > 0 && !allowedTypes.includes(type as string)) {
      return false;
    }
  }
  if (exclude) {
    const excludedTypes = castArray(exclude);

    if (excludedTypes.length > 0 && excludedTypes.includes(type as string)) {
      return false;
    }
  }

  return true;
};
