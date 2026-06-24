import type { Page } from '@playwright/test';

/** Render-profiler event categories emitted by Plite React. */
export type PliteReactRenderKind =
  | 'core-time'
  | 'dom-text-sync'
  | 'editable'
  | 'element'
  | 'leaf'
  | 'root-plan'
  | 'runtime-time'
  | 'selector'
  | 'spacer'
  | 'text'
  | 'void';

/** One Plite React render-profiler event. */
export type PliteReactRenderProfilerEvent = {
  kind: PliteReactRenderKind;
  id?: string | null;
  runtimeId?: string | null;
};

/** Collected Plite React render profiler events and counters. */
/** Snapshot returned by the Plite React render profiler. */
export type PliteReactRenderProfilerSnapshot = {
  byKey: Record<string, number>;
  byKind: Partial<Record<PliteReactRenderKind, number>>;
  events: PliteReactRenderProfilerEvent[];
  total: number;
};

const installPliteReactRenderProfilerScript = () => {
  const target = window as Window & {
    __PLITE_REACT_RENDER_PROFILER__?: {
      record: (event: PliteReactRenderProfilerEvent) => void;
    };
    __PLITE_REACT_RENDER_PROFILER_RESET__?: () => void;
    __PLITE_REACT_RENDER_PROFILER_SNAPSHOT__?: () => PliteReactRenderProfilerSnapshot;
  };
  const events: PliteReactRenderProfilerEvent[] = [];
  const snapshot = (): PliteReactRenderProfilerSnapshot => {
    const byKey: Record<string, number> = {};
    const byKind: Partial<Record<PliteReactRenderKind, number>> = {};
    const isRenderEvent = (event: PliteReactRenderProfilerEvent) =>
      event.kind !== 'core-time' &&
      event.kind !== 'dom-text-sync' &&
      event.kind !== 'runtime-time' &&
      event.kind !== 'selector';

    for (const event of events) {
      byKind[event.kind] = (byKind[event.kind] ?? 0) + 1;
      const id = event.id ?? event.runtimeId;
      const key = id ? `${event.kind}:${id}` : event.kind;
      byKey[key] = (byKey[key] ?? 0) + 1;
    }

    return {
      byKey,
      byKind,
      events: events.map((event) => ({ ...event })),
      total: events.filter(isRenderEvent).length,
    };
  };

  target.__PLITE_REACT_RENDER_PROFILER__ = {
    record(event) {
      events.push({ ...event });
    },
  };
  target.__PLITE_REACT_RENDER_PROFILER_RESET__ = () => {
    events.length = 0;
  };
  target.__PLITE_REACT_RENDER_PROFILER_SNAPSHOT__ = snapshot;
};

/** Install the Plite React render profiler bridge in a Playwright page. */
export const installPliteReactRenderProfiler = async (page: Page) => {
  await page.addInitScript(installPliteReactRenderProfilerScript);
  await page.evaluate(installPliteReactRenderProfilerScript).catch(() => {});
};

/** Reset collected Plite React render profiler events in the page. */
export const resetPliteReactRenderProfiler = async (page: Page) => {
  await page.evaluate(() => {
    const target = window as Window & {
      __PLITE_REACT_RENDER_PROFILER_RESET__?: () => void;
    };

    target.__PLITE_REACT_RENDER_PROFILER_RESET__?.();
  });
};

/** Read the current Plite React render profiler snapshot from the page. */
export const getPliteReactRenderProfilerSnapshot = async (
  page: Page
): Promise<PliteReactRenderProfilerSnapshot> =>
  page.evaluate(() => {
    const target = window as Window & {
      __PLITE_REACT_RENDER_PROFILER_SNAPSHOT__?: () => PliteReactRenderProfilerSnapshot;
    };

    return (
      target.__PLITE_REACT_RENDER_PROFILER_SNAPSHOT__?.() ?? {
        byKey: {},
        byKind: {},
        events: [],
        total: 0,
      }
    );
  });
