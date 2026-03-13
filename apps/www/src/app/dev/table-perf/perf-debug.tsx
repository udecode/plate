'use client';

/**
 * Performance debugging utilities for table rendering
 *
 * Usage: Import and call startPerfMeasure('name') before operations,
 * then endPerfMeasure('name') after. Call logPerfResults() to see summary.
 */

const perfMeasures = new Map<string, { count: number; total: number }>();

export function startPerfMeasure(_name: string): number {
  return performance.now();
}

export function endPerfMeasure(name: string, startTime: number): void {
  const duration = performance.now() - startTime;
  const existing = perfMeasures.get(name) || { count: 0, total: 0 };
  perfMeasures.set(name, {
    count: existing.count + 1,
    total: existing.total + duration,
  });
}

export function resetPerfMeasures(): void {
  perfMeasures.clear();
}

export function logPerfResults(): void {
  console.log('\n=== Performance Breakdown ===');
  const sorted = Array.from(perfMeasures.entries()).sort(
    (a, b) => b[1].total - a[1].total
  );

  for (const [name, { count, total }] of sorted) {
    console.log(
      `${name}: ${total.toFixed(2)}ms total, ${count} calls, ${(total / count).toFixed(3)}ms avg`
    );
  }
  console.log('=============================\n');
}

// Hook call counter for debugging
let hookCallCount = 0;

export function countHookCall(): void {
  hookCallCount++;
}

export function resetHookCount(): void {
  hookCallCount = 0;
}

export function getHookCount(): number {
  return hookCallCount;
}
