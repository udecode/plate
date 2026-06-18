const now = () => globalThis.performance?.now?.() ?? Date.now();

export const profileCoreDuration = <T>(id: string, callback: () => T): T => {
  const profiler = (
    globalThis as typeof globalThis & {
      __SLATE_REACT_RENDER_PROFILER__?: {
        record?: (event: {
          duration: number;
          id: string;
          kind: 'core-time';
        }) => void;
      };
    }
  ).__SLATE_REACT_RENDER_PROFILER__;

  if (!profiler) {
    return callback();
  }

  const start = now();

  try {
    return callback();
  } finally {
    profiler.record?.({
      duration: now() - start,
      id,
      kind: 'core-time',
    });
  }
};
