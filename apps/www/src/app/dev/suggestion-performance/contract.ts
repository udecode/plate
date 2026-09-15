export const SUGGESTION_PERFORMANCE_CASES = {
  normal: {
    changeCount: 10,
    nodeCount: 100,
    semanticP95Ms: 1,
    timeoutMs: 120_000,
  },
  large: {
    changeCount: 100,
    nodeCount: 1000,
    semanticP95Ms: 1,
    timeoutMs: 180_000,
  },
  stress: {
    changeCount: 1000,
    nodeCount: 10_000,
    semanticP95Ms: 5,
    timeoutMs: 600_000,
  },
  pathological: {
    changeCount: 5000,
    nodeCount: 50_000,
    semanticP95Ms: 20,
    timeoutMs: 1_200_000,
  },
} as const;

export type SuggestionPerformanceCohort =
  keyof typeof SUGGESTION_PERFORMANCE_CASES;

export type SuggestionPerformanceMetrics = Readonly<{
  bucketReadCount: number;
  changedBucketCount: number;
  downstreamNodeSubscriptionCount: number;
  failureCount: number;
  invalidRangeDropCount: number;
  sourceCount: number;
  sourceObserverCount: number;
  sourceReadCount: number;
  wakeCount: number;
}>;

export type SuggestionPerformanceLatency = Readonly<{
  max: number;
  mean: number;
  min: number;
  p95: number;
  p99: number;
  samples: readonly number[];
}>;

export type SuggestionPerformanceCounterDelta = Readonly<{
  changedBucketCount: number;
  sourceReadCount: number;
  wakeCount: number;
}>;

export type SuggestionPerformancePass = Readonly<{
  activeView: 0 | 1;
  clickCount: number;
  dom: SuggestionPerformanceLatency;
  maxActiveDelta: SuggestionPerformanceCounterDelta;
  maxSiblingDelta: SuggestionPerformanceCounterDelta;
  semantic: SuggestionPerformanceLatency;
}>;

export type SuggestionPerformanceResult = Readonly<{
  authoredStateUnchanged: boolean;
  changeCount: number;
  cohort: SuggestionPerformanceCohort;
  distinctViewManagers: boolean;
  modelUnchanged: boolean;
  mountedViewCount: number;
  nodeCount: number;
  passes: readonly SuggestionPerformancePass[];
  selectionUnchanged: boolean;
  sourceObserverCounts: readonly [number, number];
  stabilityPasses: number;
}>;

export type SuggestionPerformanceHarness = Readonly<{
  run: () => Promise<SuggestionPerformanceResult>;
}>;

declare global {
  interface Window {
    __suggestionPerformanceHarness?: SuggestionPerformanceHarness;
  }
}
