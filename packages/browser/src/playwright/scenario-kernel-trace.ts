import { expect } from '@playwright/test';

import type {
  PliteBrowserIllegalKernelTransition,
  PliteBrowserKernelTraceEntry,
  PliteBrowserKernelTraceExpectation,
  PliteBrowserScenarioResult,
} from './types';

/** Return kernel trace transitions that violate the expected policy. */
export const getIllegalKernelTransitions = (
  result: PliteBrowserScenarioResult
): PliteBrowserIllegalKernelTransition[] =>
  result.trace.flatMap((entry) =>
    entry.snapshot.kernelTrace.flatMap((kernelEntry) => {
      const { transition } = kernelEntry;

      return transition?.allowed === false
        ? [
            {
              label: entry.label,
              reason: transition.reason ?? null,
              stepIndex: entry.stepIndex,
            },
          ]
        : [];
    })
  );

/** Assert that a kernel trace contains no illegal transitions. */
export const assertNoIllegalKernelTransitions = (
  result: PliteBrowserScenarioResult
) => {
  expect(getIllegalKernelTransitions(result)).toEqual([]);
};

const matchesPartialObject = <T extends object>(
  actual: T,
  expected: Partial<T> | undefined
) =>
  !expected ||
  Object.entries(expected).every(
    ([key, value]) => actual[key as keyof T] === value
  );

/** Return true when a kernel trace entry satisfies an expectation. */
export const matchesPliteBrowserKernelTrace = (
  entry: PliteBrowserKernelTraceEntry,
  expected: PliteBrowserKernelTraceExpectation
) => {
  if (
    expected.eventFamily !== undefined &&
    entry.eventFamily !== expected.eventFamily
  ) {
    return false;
  }
  if (
    expected.commandKind !== undefined &&
    entry.command?.kind !== expected.commandKind
  ) {
    return false;
  }
  if (
    expected.ownership !== undefined &&
    entry.ownership !== expected.ownership
  ) {
    return false;
  }
  if (
    expected.selectionSource !== undefined &&
    entry.selectionSource !== expected.selectionSource
  ) {
    return false;
  }
  if (
    expected.selectionChangeOrigin !== undefined &&
    entry.selectionChangeOrigin !== expected.selectionChangeOrigin
  ) {
    return false;
  }
  if (expected.movement !== undefined) {
    if (expected.movement === null) {
      if (entry.movement !== null) {
        return false;
      }
    } else if (
      entry.movement === null ||
      !matchesPartialObject(entry.movement, expected.movement)
    ) {
      return false;
    }
  }
  if (
    expected.stateBefore !== undefined &&
    entry.stateBefore !== expected.stateBefore
  ) {
    return false;
  }
  if (
    expected.stateAfter !== undefined &&
    entry.stateAfter !== expected.stateAfter
  ) {
    return false;
  }
  if (
    expected.targetOwner !== undefined &&
    entry.targetOwner !== expected.targetOwner
  ) {
    return false;
  }

  return (
    matchesPartialObject(entry.selectionPolicy, expected.selectionPolicy) &&
    matchesPartialObject(entry.repairPolicy, expected.repairPolicy) &&
    matchesPartialObject(entry.transition, expected.transition)
  );
};

/** Find the first kernel trace entry matching an expectation. */
export const findPliteBrowserKernelTraceEntry = (
  trace: readonly PliteBrowserKernelTraceEntry[],
  expected: PliteBrowserKernelTraceExpectation
) => trace.find((entry) => matchesPliteBrowserKernelTrace(entry, expected));

/** Assert that a kernel trace contains an expected entry. */
export const assertPliteBrowserKernelTraceEntry = (
  trace: readonly PliteBrowserKernelTraceEntry[],
  expected: PliteBrowserKernelTraceExpectation
) => {
  const entry = findPliteBrowserKernelTraceEntry(trace, expected);

  if (!entry) {
    throw new Error(
      `Missing kernel trace entry ${JSON.stringify(
        expected
      )} in ${JSON.stringify(trace)}`
    );
  }

  return entry;
};
