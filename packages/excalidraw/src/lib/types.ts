type ExcalidrawElementLike = Record<string, unknown>;
type ExcalidrawAppStateLike = Record<string, unknown>;
type ExcalidrawFilesLike = Record<string, unknown>;

export interface ExcalidrawDataState {
  appState?: ExcalidrawAppStateLike | null;
  elements?: readonly Partial<ExcalidrawElementLike>[] | null;
  files?: ExcalidrawFilesLike | null;
  [key: string]: unknown;
}
