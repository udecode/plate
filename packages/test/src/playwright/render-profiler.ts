import type { Page } from '@playwright/test';

/** Render-profiler event categories emitted by editor React. */
export type ReactRenderKind =
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

/** One editor React render-profiler event. */
export type ReactRenderProfilerEvent = {
  kind: ReactRenderKind;
  id?: string | null;
  nodeKey?: string | null;
};

/** Collected editor React render profiler events and counters. */
/** Snapshot returned by the editor React render profiler. */
export type ReactRenderProfilerSnapshot = {
  byKey: Record<string, number>;
  byKind: Partial<Record<ReactRenderKind, number>>;
  events: ReactRenderProfilerEvent[];
  total: number;
};

const installRenderProfilerScript = () => {
  const target = window as Window & {
    __EDITOR_REACT_RENDER_PROFILER__?: {
      record: (event: ReactRenderProfilerEvent) => void;
    };
    __EDITOR_REACT_RENDER_PROFILER_RESET__?: () => void;
    __EDITOR_REACT_RENDER_PROFILER_SNAPSHOT__?: () => ReactRenderProfilerSnapshot;
  };
  const events: ReactRenderProfilerEvent[] = [];
  const snapshot = (): ReactRenderProfilerSnapshot => {
    const byKey: Record<string, number> = {};
    const byKind: Partial<Record<ReactRenderKind, number>> = {};
    const isRenderEvent = (event: ReactRenderProfilerEvent) =>
      event.kind !== 'core-time' &&
      event.kind !== 'dom-text-sync' &&
      event.kind !== 'runtime-time' &&
      event.kind !== 'selector';

    for (const event of events) {
      byKind[event.kind] = (byKind[event.kind] ?? 0) + 1;
      const id = event.id ?? event.nodeKey;
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

  target.__EDITOR_REACT_RENDER_PROFILER__ = {
    record(event) {
      events.push({ ...event });
    },
  };
  target.__EDITOR_REACT_RENDER_PROFILER_RESET__ = () => {
    events.length = 0;
  };
  target.__EDITOR_REACT_RENDER_PROFILER_SNAPSHOT__ = snapshot;
};

/** Install the editor React render profiler bridge in a Playwright page. */
export const installReactRenderProfiler = async (page: Page) => {
  await page.addInitScript(installRenderProfilerScript);
  await page.evaluate(installRenderProfilerScript).catch(() => {});
};

/** Reset collected editor React render profiler events in the page. */
export const resetReactRenderProfiler = async (page: Page) => {
  await page.evaluate(() => {
    const target = window as Window & {
      __EDITOR_REACT_RENDER_PROFILER_RESET__?: () => void;
    };

    target.__EDITOR_REACT_RENDER_PROFILER_RESET__?.();
  });
};

/** Read the current editor React render profiler snapshot from the page. */
export const getReactRenderProfilerSnapshot = async (
  page: Page
): Promise<ReactRenderProfilerSnapshot> =>
  page.evaluate(() => {
    const target = window as Window & {
      __EDITOR_REACT_RENDER_PROFILER_SNAPSHOT__?: () => ReactRenderProfilerSnapshot;
    };

    return (
      target.__EDITOR_REACT_RENDER_PROFILER_SNAPSHOT__?.() ?? {
        byKey: {},
        byKind: {},
        events: [],
        total: 0,
      }
    );
  });
