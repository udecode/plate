const KEYED_PROJECTION_DELTA = Symbol.for(
  'plitejs/react/keyed-projection-delta/v1'
);

export type KeyedProjectionDelta = Readonly<{
  /** `null` means source membership or order changed. */
  changedKeys: readonly string[] | null;
  revision: number;
}>;

/** Reads Plate's private delta hint without widening Plite's public source API. */
export const readKeyedProjectionDelta = (
  projections: readonly unknown[]
): KeyedProjectionDelta | null => {
  const candidate = Reflect.get(projections, KEYED_PROJECTION_DELTA) as
    | Partial<KeyedProjectionDelta>
    | undefined;

  if (
    !candidate ||
    !Number.isSafeInteger(candidate.revision) ||
    (candidate.changedKeys !== null &&
      (!Array.isArray(candidate.changedKeys) ||
        candidate.changedKeys.some((key) => typeof key !== 'string')))
  ) {
    return null;
  }

  return candidate as KeyedProjectionDelta;
};
