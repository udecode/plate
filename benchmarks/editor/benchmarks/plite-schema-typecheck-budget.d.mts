export declare const SCHEMA_TYPECHECK_COHORTS: readonly number[];
export declare const createSchemaTypecheckFixture: (plugins: any) => string;
export declare const parseTypeScriptExtendedDiagnostics: (
  output: any
) => Readonly<{
  checkMs: number;
  instantiations: number;
  memoryBytes: number;
  totalMs: number;
  types: number;
}>;
export declare const runSchemaTypecheckBudget: (root: any) => Readonly<{
  checkTimeRatio: number;
  instantiationRatio: number;
  rows: ReadonlyArray<
    Readonly<{
      checkMs: number;
      instantiations: number;
      memoryBytes: number;
      totalMs: number;
      types: number;
      plugins: number;
    }>
  >;
}>;
