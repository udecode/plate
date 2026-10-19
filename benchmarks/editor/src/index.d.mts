export declare const editorTargets: ReadonlyArray<{
  id: string;
  label: string;
  role: string;
  sourcePath: string;
  evidenceOwner: string;
}>;
export declare const staleSurfacePaths: readonly string[];
export declare const benchmarkRegistryDefaultPath =
  'research/benchmark-registry.json';
export declare const slateLegacyCompareSurfaceOrder: readonly string[];
export declare function normalizeBenchmarkRow(
  row: any,
  context?: {}
): {
  category: string;
  fixture: string;
  library: string;
  status: string;
};
export declare function normalizeBenchmarkResult(
  payload: any,
  context?: {}
): {
  name: any;
  generatedAt: any;
  node: any;
  rows: any;
};
export declare function readResearchSources(filePath: any): any;
export declare function readBenchmarkRegistry({
  registryPath,
  rootDir,
  repoRoot,
}?: {
  registryPath?: string | undefined;
  rootDir?: string | undefined;
  repoRoot?: string | undefined;
}): {
  artifacts: any;
  discardUnregistered: any;
  path: string;
  policy: any;
  repoRoot: string;
  retired: any;
  targetRegistry: any;
  version: number;
  workloads: any;
};
export declare function readArtifactAdmission(
  spec: any,
  payload: any,
  {
    registry,
  }: {
    registry: any;
  }
): {
  latestRun: any;
  reasons: string[];
  state: 'current' | 'stale' | 'unknown';
};
export declare function createEvidenceReadinessRows({
  rootDir,
}?: {
  rootDir?: string | undefined;
}): Array<{
  category: string;
  fixture: string;
  library: string;
  status: string;
}>;
export declare function createSlateLegacyCompareRows({
  artifactPath,
  registry,
  registryPath,
  rootDir,
}?: {
  rootDir?: string | undefined;
}): any;
export declare function createRichTextEditorBenchmarkRows({
  registry,
  registryPath,
  rootDir,
}?: {
  rootDir?: string | undefined;
}): Array<{
  category: string;
  fixture: string;
  library: string;
  status: string;
}>;
export declare function createRichTextEditorCoverageRows({
  artifactRows,
  registry,
  registryPath,
  rootDir,
}?: {
  rootDir?: string | undefined;
}): Array<{
  category: string;
  fixture: string;
  library: string;
  status: string;
}>;
export declare function createBenchmarkArtifactRows(
  spec: any,
  {
    registry,
    rootDir,
  }: {
    registry: any;
    rootDir?: string | undefined;
  }
): any;
export declare function normalizeSlateLegacyCompareArtifact(
  payload: any,
  {
    artifactPath,
    rootDir,
  }?: {
    artifactPath?: string | undefined;
    rootDir?: string | undefined;
  }
): Array<{
  category: string;
  fixture: string;
  library: string;
  status: string;
}>;
export declare function findStaleSurfaces(rootDir?: string): string[];
export declare function readJson(filePath: any): any;
