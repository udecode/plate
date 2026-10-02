export type RoundRobinCohortMeasurements = Readonly<{
  order: ReadonlyArray<readonly number[]>;
  samples: ReadonlyArray<readonly number[]>;
}>;

export const measureCohortsRoundRobin = <TCohort>(
  cohorts: readonly TCohort[],
  samplesPerCohort: number,
  warmup: (cohort: TCohort) => void,
  measure: (cohort: TCohort) => number,
  collectGarbage: () => void = () => globalThis.gc?.()
): RoundRobinCohortMeasurements => {
  const samples = cohorts.map(() => [] as number[]);

  for (const cohort of cohorts) {
    warmup(cohort);
    collectGarbage();
  }

  const order = Array.from({ length: samplesPerCohort }, (_, sampleIndex) =>
    Array.from({ length: cohorts.length }, (_value, orderIndex) => {
      const cohortIndex = (sampleIndex + orderIndex) % cohorts.length;

      collectGarbage();
      samples[cohortIndex].push(measure(cohorts[cohortIndex]));

      return cohortIndex;
    })
  );

  return { order, samples };
};
