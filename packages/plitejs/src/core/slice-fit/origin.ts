import type { RootChangeSection } from '../change/root-change';
import type { PreparedTokenSlice } from '../change/tokens';

export type FitSource =
  | Readonly<{ at: number; kind: 'document' }>
  | Readonly<{ kind: 'fit' }>
  | Readonly<{ kind: 'slice' }>;

export type FitRun = Readonly<{ length: number; source: FitSource }>;

declare const sealed: unique symbol;

export type FitOrigins = Readonly<{ runs: readonly FitRun[] }> & {
  readonly [sealed]: true;
};

const SHARED_SOURCES: Readonly<Record<'fit' | 'slice', FitSource>> =
  Object.freeze({
    fit: Object.freeze({ kind: 'fit' }),
    slice: Object.freeze({ kind: 'slice' }),
  });

export class FitOriginLog {
  private readonly runs: Array<{ length: number; source: FitSource }> = [];

  add(length: number, kind: FitSource['kind'], at = 0) {
    if (length === 0) return;
    const last = this.runs.at(-1);

    if (
      last?.source.kind === kind &&
      (last.source.kind !== 'document' || last.source.at + last.length === at)
    ) {
      last.length += length;

      return;
    }

    this.runs.push({
      length,
      source:
        kind === 'document'
          ? Object.freeze({ at, kind })
          : SHARED_SOURCES[kind],
    });
  }

  dropStart(length: number) {
    let remaining = length;

    while (remaining > 0) {
      const first = this.runs[0];

      if (!first) {
        throw new RangeError(
          `Cannot drop ${length} positions from fit origins.`
        );
      }
      if (first.length <= remaining) {
        remaining -= first.length;
        this.runs.shift();
        continue;
      }

      first.length -= remaining;
      if (first.source.kind === 'document') {
        first.source = Object.freeze({
          at: first.source.at + remaining,
          kind: 'document',
        });
      }
      remaining = 0;
    }
  }

  seal(insert: PreparedTokenSlice) {
    let covered = 0;

    for (const run of this.runs) covered += run.length;
    if (covered !== insert.length) {
      throw new Error(
        `Fit origins cover ${covered} positions of an insert of ${insert.length}.`
      );
    }

    return Object.freeze({
      runs: Object.freeze(
        this.runs.map(({ length, source }) => Object.freeze({ length, source }))
      ),
    }) as FitOrigins;
  }
}

export const sliceOrigins = (insert: PreparedTokenSlice) => {
  const log = new FitOriginLog();

  log.add(insert.length, 'slice');

  return log.seal(insert);
};

export const fitSections = ({
  from,
  insert,
  origins,
  to,
}: Readonly<{
  from: number;
  insert: PreparedTokenSlice;
  origins: FitOrigins;
  to: number;
}>): RootChangeSection[] => {
  const kept: Array<
    Readonly<{ at: number; insertAt: number; length: number }>
  > = [];
  let unclaimedTo = to;
  let end = insert.length;

  for (let index = origins.runs.length - 1; index >= 0; index -= 1) {
    const { length, source } = origins.runs[index];
    const start = end - length;

    end = start;
    if (source.kind !== 'document') continue;

    const keepFrom = Math.max(source.at, from);
    const keepTo = Math.min(source.at + length, unclaimedTo);

    if (keepTo <= keepFrom) continue;
    kept.push({
      at: keepFrom,
      insertAt: start + keepFrom - source.at,
      length: keepTo - keepFrom,
    });
    unclaimedTo = keepFrom;
  }

  const sections: RootChangeSection[] = [];
  let cursor = from;
  let written = 0;

  for (let index = kept.length - 1; index >= 0; index -= 1) {
    const run = kept[index];

    sections.push({
      from: cursor,
      insert: insert.slice(written, run.insertAt),
      to: run.at,
    });
    cursor = run.at + run.length;
    written = run.insertAt + run.length;
  }
  sections.push({ from: cursor, insert: insert.slice(written), to });

  return sections;
};
