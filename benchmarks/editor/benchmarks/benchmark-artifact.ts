import { randomUUID } from 'node:crypto';
import { mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

export const writeBenchmarkArtifact = (filePath: string, contents: string) => {
  const directory = dirname(filePath);
  const temporaryPath = join(
    directory,
    `.${basename(filePath)}.${process.pid}.${randomUUID()}.tmp`
  );

  mkdirSync(directory, { recursive: true });

  try {
    writeFileSync(temporaryPath, contents);
    renameSync(temporaryPath, filePath);
  } finally {
    rmSync(temporaryPath, { force: true });
  }
};

/**
 * Writes a benchmark result with its `strictValidation` state and returns the
 * serialized result. A strict run writes its measurements before `validate`,
 * so a failed validation replaces an older passing artifact with this run's
 * unpassed measurements.
 */
export const writeBenchmarkResult = ({
  outputPath,
  result,
  strict,
  validate,
}: {
  outputPath?: string;
  result: object;
  strict: boolean;
  validate: () => void;
}) => {
  const serialize = (status: 'measured' | 'passed') =>
    `${JSON.stringify({ ...result, strictValidation: { requested: strict, status } }, null, 2)}\n`;

  if (strict) {
    if (outputPath !== undefined) {
      writeBenchmarkArtifact(outputPath, serialize('measured'));
    }
    validate();
  }

  const output = serialize(strict ? 'passed' : 'measured');

  if (outputPath !== undefined) {
    writeBenchmarkArtifact(outputPath, output);
  }

  return output;
};
