export type ReactRenderKind =
  | 'core-time'
  | 'dom-text-sync'
  | 'editable'
  | 'element'
  | 'group'
  | 'leaf'
  | 'root-plan'
  | 'runtime-time'
  | 'selector'
  | 'spacer'
  | 'text'
  | 'void';

export type ReactRenderProfilerEvent = {
  kind: ReactRenderKind;
  duration?: number;
  id?: string | null;
  nodeKey?: string | null;
};

export type ReactRenderProfilerSnapshot = {
  byKey: Record<string, number>;
  byKind: Partial<Record<ReactRenderKind, number>>;
  events: ReactRenderProfilerEvent[];
  total: number;
};

export type PliteReactRenderProfiler = {
  record: (event: ReactRenderProfilerEvent) => void;
};

declare global {
  var __EDITOR_REACT_RENDER_PROFILER__: PliteReactRenderProfiler | undefined;
}

const getRenderKey = (event: ReactRenderProfilerEvent) => {
  const id = event.id ?? event.nodeKey;

  return id ? `${event.kind}:${id}` : event.kind;
};

const isRenderEvent = (event: ReactRenderProfilerEvent) =>
  event.kind !== 'core-time' &&
  event.kind !== 'dom-text-sync' &&
  event.kind !== 'runtime-time' &&
  event.kind !== 'selector';

export const recordPliteReactRender = (event: ReactRenderProfilerEvent) => {
  globalThis.__EDITOR_REACT_RENDER_PROFILER__?.record(event);
};

export const createPliteReactRenderCounter = () => {
  const events: ReactRenderProfilerEvent[] = [];

  const snapshot = (): ReactRenderProfilerSnapshot => {
    const byKey: Record<string, number> = {};
    const byKind: Partial<Record<ReactRenderKind, number>> = {};

    for (const event of events) {
      byKind[event.kind] = (byKind[event.kind] ?? 0) + 1;
      const key = getRenderKey(event);
      byKey[key] = (byKey[key] ?? 0) + 1;
    }

    return {
      byKey,
      byKind,
      events: events.map((event) => ({ ...event })),
      total: events.filter(isRenderEvent).length,
    };
  };

  return {
    profiler: {
      record(event: ReactRenderProfilerEvent) {
        events.push({ ...event });
      },
    },
    reset() {
      events.length = 0;
    },
    snapshot,
  };
};

const now = () => globalThis.performance?.now?.() ?? Date.now();

export const profilePliteReactDuration = <T>(
  id: string,
  callback: () => T
): T => {
  if (!globalThis.__EDITOR_REACT_RENDER_PROFILER__) return callback();
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
