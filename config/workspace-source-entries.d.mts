export interface WorkspaceSourceEntry {
  distEntry: string;
  sourceEntry: string;
  specifier: string;
}

export declare const getWorkspaceSourceEntries: (
  repoRoot: string
) => WorkspaceSourceEntry[];
