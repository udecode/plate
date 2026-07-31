export declare const editorTargets: readonly {
  id: string;
  label: string;
  role: string;
  sourcePath: string;
  evidenceOwner: string;
}[];
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
}?: {
  registryPath?: string | undefined;
  rootDir?: string | undefined;
}): {
  artifacts: any;
  discardUnregistered: any;
  path: string;
  policy: any;
  runtimeAdapters: any;
  version: number;
  workloads: any;
};
export declare function createEvidenceReadinessRows({
  rootDir,
}?: {
  rootDir?: string | undefined;
}): {
  category: string;
  fixture: string;
  library: string;
  status: string;
}[];
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
}): {
  category: string;
  fixture: string;
  library: string;
  status: string;
}[];
export declare function createRichTextEditorCoverageRows({
  registry,
  registryPath,
  rootDir,
}?: {
  rootDir?: string | undefined;
}): {
  category: string;
  fixture: string;
  library: string;
  status: string;
}[];
export declare function createBenchmarkArtifactRows(
  spec: any,
  {
    rootDir,
  }?: {
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
): {
  category: string;
  fixture: string;
  library: string;
  status: string;
}[];
export declare function findStaleSurfaces(rootDir?: string): string[];
export declare function readJson(filePath: any): any;
