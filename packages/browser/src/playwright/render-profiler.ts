import type { Page } from '@playwright/test';

/** Render-profiler event categories emitted by Slate React. */
export type SlateReactRenderKind =
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

/** One Slate React render-profiler event. */
export type SlateReactRenderProfilerEvent = {
  kind: SlateReactRenderKind;
  id?: string | null;
  runtimeId?: string | null;
};

/** Collected Slate React render profiler events and counters. */
/** Snapshot returned by the Slate React render profiler. */
export type SlateReactRenderProfilerSnapshot = {
  byKey: Record<string, number>;
  byKind: Partial<Record<SlateReactRenderKind, number>>;
  events: SlateReactRenderProfilerEvent[];
  total: number;
};

const installSlateReactRenderProfilerScript = () => {
  const target = window as Window & {
    __SLATE_REACT_RENDER_PROFILER__?: {
      record: (event: SlateReactRenderProfilerEvent) => void;
    };
    __SLATE_REACT_RENDER_PROFILER_RESET__?: () => void;
    __SLATE_REACT_RENDER_PROFILER_SNAPSHOT__?: () => SlateReactRenderProfilerSnapshot;
  };
  const events: SlateReactRenderProfilerEvent[] = [];
  const snapshot = (): SlateReactRenderProfilerSnapshot => {
    const byKey: Record<string, number> = {};
    const byKind: Partial<Record<SlateReactRenderKind, number>> = {};
    const isRenderEvent = (event: SlateReactRenderProfilerEvent) =>
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

  target.__SLATE_REACT_RENDER_PROFILER__ = {
    record(event) {
      events.push({ ...event });
    },
  };
  target.__SLATE_REACT_RENDER_PROFILER_RESET__ = () => {
    events.length = 0;
  };
  target.__SLATE_REACT_RENDER_PROFILER_SNAPSHOT__ = snapshot;
};

/** Install the Slate React render profiler bridge in a Playwright page. */
export const installSlateReactRenderProfiler = async (page: Page) => {
  await page.addInitScript(installSlateReactRenderProfilerScript);
  await page.evaluate(installSlateReactRenderProfilerScript).catch(() => {});
};

/** Reset collected Slate React render profiler events in the page. */
export const resetSlateReactRenderProfiler = async (page: Page) => {
  await page.evaluate(() => {
    const target = window as Window & {
      __SLATE_REACT_RENDER_PROFILER_RESET__?: () => void;
    };

    target.__SLATE_REACT_RENDER_PROFILER_RESET__?.();
  });
};

/** Read the current Slate React render profiler snapshot from the page. */
export const getSlateReactRenderProfilerSnapshot = async (
  page: Page
): Promise<SlateReactRenderProfilerSnapshot> =>
  page.evaluate(() => {
    const target = window as Window & {
      __SLATE_REACT_RENDER_PROFILER_SNAPSHOT__?: () => SlateReactRenderProfilerSnapshot;
    };

    return (
      target.__SLATE_REACT_RENDER_PROFILER_SNAPSHOT__?.() ?? {
        byKey: {},
        byKind: {},
        events: [],
        total: 0,
      }
    );
  });
