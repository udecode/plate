export type ViewSourcePhase = 'project' | 'read' | 'resolve';

/** Diagnostic emitted when an optional view source is deactivated. */
export type ViewSourceError = Readonly<{
  cause: unknown;
  phase: ViewSourcePhase;
  sourceId: string;
}>;

export type ViewSourceErrorSink = (error: ViewSourceError) => void;

export type ViewSourceOptions = Readonly<{
  id: string;
  onError?: ViewSourceErrorSink;
}>;

/** Current isolation state for an optional view source. */
export type ViewSourceStatus = Readonly<{
  active: boolean;
  failureCount: number;
}>;
