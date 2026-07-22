export type PliteViewSourcePhase = 'project' | 'read' | 'resolve';

/** Diagnostic emitted when an optional view source is deactivated. */
export type PliteViewSourceError = Readonly<{
  cause: unknown;
  phase: PliteViewSourcePhase;
  sourceId: string;
}>;

export type PliteViewSourceErrorSink = (error: PliteViewSourceError) => void;

export type PliteViewSourceOptions = Readonly<{
  id: string;
  onError?: PliteViewSourceErrorSink;
}>;

/** Current isolation state for an optional view source. */
export type PliteViewSourceStatus = Readonly<{
  active: boolean;
  failureCount: number;
}>;
