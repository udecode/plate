import { createRequire } from 'node:module';

import type { ReactElement } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

const require = createRequire(
  new URL('../../../../packages/slate-react/package.json', import.meta.url)
);
const { JSDOM } = require('jsdom') as typeof import('jsdom');

export const round = (value: number) => Number(value.toFixed(2));
export const now = () => performance.now();

const percentile = (sorted: number[], ratio: number) => {
  if (sorted.length === 0) {
    return 0;
  }

  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(sorted.length * ratio) - 1)
  );

  return sorted[index];
};

export const summarize = (samples: number[]) => {
  if (samples.length === 0) {
    return {
      max: 0,
      mean: 0,
      median: 0,
      min: 0,
      p75: 0,
      p95: 0,
      p99: 0,
      samples: [],
    };
  }

  const sorted = [...samples].sort((left, right) => left - right);
  const mean =
    samples.reduce((total, sample) => total + sample, 0) / samples.length;
  const middle = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];

  return {
    max: round(sorted.at(-1) ?? 0),
    mean: round(mean),
    median: round(median),
    min: round(sorted[0] ?? 0),
    p75: round(percentile(sorted, 0.75)),
    p95: round(percentile(sorted, 0.95)),
    p99: round(percentile(sorted, 0.99)),
    samples: samples.map(round),
  };
};

export const summarizeMetrics = (samples: Record<string, number>[]) =>
  Object.fromEntries(
    Object.keys(samples[0] ?? {}).map((key) => [
      key,
      summarize(samples.map((sample) => sample[key] ?? 0)),
    ])
  );

export const cloneCounts = (counts: Record<string, number>) => ({ ...counts });

export const deltaCounts = (
  current: Record<string, number>,
  baseline: Record<string, number>
) =>
  Object.fromEntries(
    Object.keys(current).map((key) => [
      key,
      current[key] - (baseline[key] ?? 0),
    ])
  );

export const increment = (counts: Record<string, number>, key: string) => {
  counts[key] = (counts[key] ?? 0) + 1;
};

const installDomGlobals = (dom: import('jsdom').JSDOM) => {
  const globals = globalThis as typeof globalThis & {
    Document?: typeof Document;
    Element?: typeof Element;
    HTMLElement?: typeof HTMLElement;
    HTMLDivElement?: typeof HTMLDivElement;
    IS_REACT_ACT_ENVIRONMENT?: boolean;
    Node?: typeof Node;
    Range?: typeof Range;
    Selection?: typeof Selection;
    ShadowRoot?: typeof ShadowRoot;
    Text?: typeof Text;
    cancelAnimationFrame?: typeof cancelAnimationFrame;
    document?: Document;
    navigator?: Navigator;
    requestAnimationFrame?: typeof requestAnimationFrame;
    window?: Window & typeof globalThis;
  };
  const previous = {
    Document: globals.Document,
    Element: globals.Element,
    HTMLElement: globals.HTMLElement,
    HTMLDivElement: globals.HTMLDivElement,
    Node: globals.Node,
    Range: globals.Range,
    Selection: globals.Selection,
    ShadowRoot: globals.ShadowRoot,
    Text: globals.Text,
    cancelAnimationFrame: globals.cancelAnimationFrame,
    document: globals.document,
    navigator: globals.navigator,
    requestAnimationFrame: globals.requestAnimationFrame,
    window: globals.window,
  };

  globals.IS_REACT_ACT_ENVIRONMENT = true;
  globals.window = dom.window as unknown as Window & typeof globalThis;
  globals.document = dom.window.document;
  globals.Document = dom.window.Document;
  globals.Element = dom.window.Element;
  globals.HTMLElement = dom.window.HTMLElement;
  globals.HTMLDivElement = dom.window.HTMLDivElement;
  globals.Node = dom.window.Node;
  globals.Range = dom.window.Range;
  globals.Selection = dom.window.Selection;
  globals.ShadowRoot = dom.window.ShadowRoot;
  globals.Text = dom.window.Text;

  if (!dom.window.requestAnimationFrame) {
    dom.window.requestAnimationFrame = (callback) =>
      dom.window.setTimeout(() => callback(dom.window.performance.now()), 0);
  }

  if (!dom.window.cancelAnimationFrame) {
    dom.window.cancelAnimationFrame = (handle) => {
      dom.window.clearTimeout(handle);
    };
  }

  globals.requestAnimationFrame = dom.window.requestAnimationFrame.bind(
    dom.window
  );
  globals.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(
    dom.window
  );

  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: dom.window.navigator,
  });

  return () => {
    globals.window = previous.window;
    globals.Document = previous.Document;
    globals.Element = previous.Element;
    globals.HTMLElement = previous.HTMLElement;
    globals.HTMLDivElement = previous.HTMLDivElement;
    globals.Node = previous.Node;
    globals.Range = previous.Range;
    globals.Selection = previous.Selection;
    globals.ShadowRoot = previous.ShadowRoot;
    globals.Text = previous.Text;
    globals.document = previous.document;

    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: previous.navigator,
    });

    globals.requestAnimationFrame = previous.requestAnimationFrame;
    globals.cancelAnimationFrame = previous.cancelAnimationFrame;
  };
};

export const mountApp = async (element: ReactElement) => {
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="root"></div></body></html>'
  );
  const container = dom.window.document.getElementById('root');

  if (!container) {
    throw new Error('Missing app root');
  }

  const restoreGlobals = installDomGlobals(dom);
  const root = createRoot(container);

  await act(async () => {
    root.render(element);
  });

  return {
    container,
    dispose: async () => {
      await act(async () => {
        root.unmount();
      });
      restoreGlobals();
      dom.window.close();
    },
  };
};
