import type { DocumentIndex } from './document-index';
import { jsonEqual } from './json';
import { isTextNode, nodeProps, type PreparedTokenSlice } from './tokens';

type TextReplacement = Readonly<{
  from: number;
  insert: PreparedTokenSlice;
  to: number;
}>;

type TokenRange = Readonly<{ from: number; to: number }>;

/**
 * Whether `target` in a change's output was retained verbatim (without
 * replacement) from a different range than `base` in its base document.
 */
export const isRetainedFromOtherRange = (
  sections: readonly number[],
  target: TokenRange,
  base: TokenRange
) => {
  for (
    let i = 0, a = 0, b = 0, runA = 0, runB = 0;
    i < sections.length;
    i += 2
  ) {
    const length = sections[i];
    const inserted = sections[i + 1];

    if (inserted < 0) {
      if (b !== runB + (a - runA)) {
        runA = a;
        runB = b;
      }
      a += length;
      b += length;
      if (runB <= target.from && target.to <= b) {
        return (
          runA + target.from - runB !== base.from ||
          runA + target.to - runB !== base.to
        );
      }
    } else {
      a += length;
      b += inserted;
      runA = a;
      runB = b;
    }
  }

  return false;
};

/**
 * When a pure deletion removes an empty text leaf next to an adjacent text
 * leaf of the same properties and the concurrent change inserts plain text
 * into that empty leaf, shift the cut by one token to `[close text, ..., open
 * text]`. Both cuts produce the same token stream, and the shifted cut keeps
 * inserts inside either text leaf on their edge instead of inside the deletion.
 */
export const shiftMergedEmptyTextDeletion = (
  replacements: readonly TextReplacement[],
  otherReplacements: readonly TextReplacement[],
  document: DocumentIndex
): readonly TextReplacement[] | null => {
  if (replacements.length === 0 || otherReplacements.length === 0) return null;

  const inserts = new Set<number>();

  for (const { from, insert, to } of otherReplacements) {
    if (
      from === to &&
      insert.length > 0 &&
      insert.tokens.every((token) => token.kind === 'text')
    ) {
      inserts.add(from);
    }
  }
  if (inserts.size === 0) return null;

  const sameTextProps = (
    leftPath: readonly number[],
    rightPath: readonly number[]
  ) => {
    const left = document.node(leftPath);
    const right = document.node(rightPath);

    return (
      isTextNode(left) &&
      isTextNode(right) &&
      jsonEqual(nodeProps(left), nodeProps(right))
    );
  };
  const touched = (pos: number) =>
    otherReplacements.some(({ from, to }) => from <= pos && pos <= to);
  let moved = false;
  const shifted = replacements.map((replacement, index) => {
    const { from, insert, to } = replacement;

    if (insert.length > 0 || to - from < 2) return replacement;
    if (
      inserts.has(to - 1) &&
      from > 0 &&
      !touched(from - 1) &&
      (index === 0 || replacements[index - 1].to < from)
    ) {
      const right = document.nodeStartingAt(to - 2);
      const left = document.pointAt(from - 1, -1);

      if (
        right?.kind === 'text' &&
        right.to === to &&
        left &&
        document.nodeRange(left.path).to === from &&
        sameTextProps(left.path, right.path)
      ) {
        moved = true;
        return { from: from - 1, insert, to: to - 1 };
      }
    }
    if (
      inserts.has(from + 1) &&
      to < document.length &&
      !touched(to) &&
      (index + 1 === replacements.length || replacements[index + 1].from > to)
    ) {
      const left = document.nodeStartingAt(from);
      const right = document.nodeStartingAt(to);

      if (
        left?.kind === 'text' &&
        left.to === from + 2 &&
        right?.kind === 'text' &&
        sameTextProps(left.path, right.path)
      ) {
        moved = true;
        return { from: from + 1, insert, to: to + 1 };
      }
    }

    return replacement;
  });

  return moved ? shifted : null;
};

type PairInput = Readonly<{
  hasProperties: boolean;
  replacements: readonly TextReplacement[];
}>;

export const shiftMergedEmptyTextPair = (
  a: PairInput,
  b: PairInput,
  document: DocumentIndex
): Readonly<{
  a: readonly TextReplacement[] | null;
  b: readonly TextReplacement[] | null;
}> | null => {
  const shiftedA = a.hasProperties
    ? null
    : shiftMergedEmptyTextDeletion(a.replacements, b.replacements, document);
  const shiftedB = b.hasProperties
    ? null
    : shiftMergedEmptyTextDeletion(
        b.replacements,
        shiftedA ?? a.replacements,
        document
      );

  return shiftedA || shiftedB ? { a: shiftedA, b: shiftedB } : null;
};
