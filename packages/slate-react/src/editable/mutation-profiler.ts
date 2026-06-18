import { recordSlateReactRender } from '../render-profiler';

const now = () => globalThis.performance?.now?.() ?? Date.now();

export const profileEditableMutationDuration = <T>(
  id: string,
  callback: () => T
): T => {
  if (!globalThis.__SLATE_REACT_RENDER_PROFILER__) {
    return callback();
  }

  const start = now();

  try {
    return callback();
  } finally {
    recordSlateReactRender({
      duration: now() - start,
      id,
      kind: 'runtime-time',
    });
  }
};
