export type PliteReactRenderKind =
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

export type PliteReactRenderProfilerEvent = {
  kind: PliteReactRenderKind;
  duration?: number;
  id?: string | null;
  runtimeId?: string | null;
};

export type PliteReactRenderProfilerSnapshot = {
  byKey: Record<string, number>;
  byKind: Partial<Record<PliteReactRenderKind, number>>;
  events: PliteReactRenderProfilerEvent[];
  total: number;
};

export type PliteReactRenderProfiler = {
  record: (event: PliteReactRenderProfilerEvent) => void;
};

declare global {
  var __PLITE_REACT_RENDER_PROFILER__: PliteReactRenderProfiler | undefined;
}

const getRenderKey = (event: PliteReactRenderProfilerEvent) => {
  const id = event.id ?? event.runtimeId;

  return id ? `${event.kind}:${id}` : event.kind;
};

const isRenderEvent = (event: PliteReactRenderProfilerEvent) =>
  event.kind !== 'core-time' &&
  event.kind !== 'dom-text-sync' &&
  event.kind !== 'runtime-time' &&
  event.kind !== 'selector';

export const recordPliteReactRender = (
  event: PliteReactRenderProfilerEvent
) => {
  globalThis.__PLITE_REACT_RENDER_PROFILER__?.record(event);
};

export const createPliteReactRenderCounter = () => {
  const events: PliteReactRenderProfilerEvent[] = [];

  const snapshot = (): PliteReactRenderProfilerSnapshot => {
    const byKey: Record<string, number> = {};
    const byKind: Partial<Record<PliteReactRenderKind, number>> = {};

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
      record(event: PliteReactRenderProfilerEvent) {
        events.push({ ...event });
      },
    },
    reset() {
      events.length = 0;
    },
    snapshot,
  };
};
