export type CodemodEdit = Readonly<{
  end: number;
  replacement: string;
  start: number;
}>;

export type CodemodDiagnosticKind = 'manual' | 'scaffold' | 'warning';

export type CodemodDiagnostic = Readonly<{
  code: string;
  column: number;
  file: string;
  hint?: string;
  kind: CodemodDiagnosticKind;
  line: number;
  message: string;
}>;

export type CodemodTransformOptions = Readonly<{
  filePath: string;
  source: string;
}>;

export type CodemodTransformResult = Readonly<{
  changed: boolean;
  code: string;
  diagnostics: readonly CodemodDiagnostic[];
  editsApplied: number;
  skipped?: boolean;
}>;

export type CodemodDefinition = Readonly<{
  description: string;
  id: string;
  transform: (options: CodemodTransformOptions) => CodemodTransformResult;
  updatesPackageJson?: boolean;
}>;
