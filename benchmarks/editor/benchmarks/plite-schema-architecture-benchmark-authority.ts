import { writeBenchmarkArtifact } from './benchmark-artifact';

export type RoundRobinCohortMeasurements = Readonly<{
  order: readonly (readonly number[])[];
  samples: readonly (readonly number[])[];
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
      samples[cohortIndex]!.push(measure(cohorts[cohortIndex]!));

      return cohortIndex;
    })
  );

  return { order, samples };
};

type StrictBenchmarkResult = {
  strictValidation: {
    status: 'measured' | 'passed';
  };
};

const serialize = (result: StrictBenchmarkResult) =>
  `${JSON.stringify(result, null, 2)}\n`;

export const validateAndWriteStrictBenchmarkArtifact = ({
  outputPath,
  result,
  validate,
}: {
  outputPath?: string;
  result: StrictBenchmarkResult;
  validate: () => void;
}) => {
  result.strictValidation.status = 'measured';
  if (outputPath !== undefined) {
    writeBenchmarkArtifact(outputPath, serialize(result));
  }

  validate();

  result.strictValidation.status = 'passed';
  if (outputPath !== undefined) {
    writeBenchmarkArtifact(outputPath, serialize(result));
  }
};
