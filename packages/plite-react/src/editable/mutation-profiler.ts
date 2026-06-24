import { recordPliteReactRender } from '../render-profiler';

const now = () => globalThis.performance?.now?.() ?? Date.now();

export const profileEditableMutationDuration = <T>(
  id: string,
  callback: () => T
): T => {
  if (!globalThis.__PLITE_REACT_RENDER_PROFILER__) {
    return callback();
  }

  const start = now();

  try {
    return callback();
  } finally {
    recordPliteReactRender({
      duration: now() - start,
      id,
      kind: 'runtime-time',
    });
  }
};
