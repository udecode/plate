/** One browser behavior family owned by a feature area. */
export type SlateBrowserFeatureContractRow = {
  assertions: readonly string[];
  family: string;
  feature: string;
  routes: readonly string[];
};

/** Declarative browser contract bundle for one feature area. */
export type SlateBrowserFeatureContractDefinition = {
  feature: string;
  rows: readonly Omit<SlateBrowserFeatureContractRow, 'feature'>[];
};

/** Indexed browser contract registry built from feature definitions. */
export type SlateBrowserFeatureContractRegistry = {
  rowByFamily: ReadonlyMap<string, SlateBrowserFeatureContractRow>;
  rows: readonly SlateBrowserFeatureContractRow[];
};

/** Preserve a feature contract definition with exact literal family names. */
export const defineSlateBrowserFeatureContract = <
  T extends SlateBrowserFeatureContractDefinition,
>(
  contract: T
): T => contract;

/** Build and validate a browser contract registry from feature definitions. */
export const createSlateBrowserFeatureContractRegistry = (
  definitions: readonly SlateBrowserFeatureContractDefinition[]
): SlateBrowserFeatureContractRegistry => {
  const rows: SlateBrowserFeatureContractRow[] = [];
  const rowByFamily = new Map<string, SlateBrowserFeatureContractRow>();

  for (const definition of definitions) {
    if (!definition.feature) {
      throw new Error('Feature browser contract is missing a feature name.');
    }
    if (definition.rows.length === 0) {
      throw new Error(
        `Feature browser contract "${definition.feature}" has no rows.`
      );
    }

    for (const row of definition.rows) {
      if (!row.family) {
        throw new Error(
          `Feature browser contract "${definition.feature}" has a row without a family.`
        );
      }
      if (row.routes.length === 0) {
        throw new Error(
          `Feature browser contract "${definition.feature}" row "${row.family}" has no routes.`
        );
      }
      if (row.assertions.length === 0) {
        throw new Error(
          `Feature browser contract "${definition.feature}" row "${row.family}" has no assertions.`
        );
      }
      if (rowByFamily.has(row.family)) {
        throw new Error(
          `Feature browser contract family "${row.family}" is registered more than once.`
        );
      }

      const registeredRow = Object.freeze({
        ...row,
        assertions: Object.freeze([...row.assertions]),
        feature: definition.feature,
        routes: Object.freeze([...row.routes]),
      });

      rows.push(registeredRow);
      rowByFamily.set(registeredRow.family, registeredRow);
    }
  }

  return Object.freeze({
    rowByFamily,
    rows: Object.freeze(rows),
  });
};
