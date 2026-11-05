import { distance } from 'fastest-levenshtein';

export type QuotedSpanPoint = Readonly<{ offset: number; segment: number }>;

export type QuotedSpan = Readonly<{
  end: QuotedSpanPoint;
  start: QuotedSpanPoint;
}>;

const maxEditDistance = (length: number) =>
  length <= 2 ? 0 : length <= 5 ? 1 : length <= 10 ? 2 : length <= 20 ? 3 : 5;

const findFuzzyMatch = (text: string, quote: string) => {
  const maxDistance = maxEditDistance(quote.length);
  let best = { distance: Number.POSITIVE_INFINITY, end: -1, start: -1 };

  for (let index = 0; index <= text.length - quote.length; index++) {
    for (let delta = -maxDistance; delta <= maxDistance; delta++) {
      const length = quote.length + delta;

      if (length <= 0 || index + length > text.length) continue;

      const candidate = distance(text.slice(index, index + length), quote);

      if (candidate <= maxDistance && candidate < best.distance) {
        best = { distance: candidate, end: index + length, start: index };
      }
    }
  }

  return best.start === -1 ? null : best;
};

const findPrefixMatch = (text: string, quote: string) => {
  for (let length = quote.length - 1; length > 0; length--) {
    const start = text.indexOf(quote.slice(0, length));

    if (start !== -1) return { end: start + length, start };
  }

  return null;
};

export const findQuotedSpan = (
  segments: readonly string[],
  quote: string
): QuotedSpan | null => {
  const text = segments.join('');

  if (!text) return null;

  const exact = text.indexOf(quote);
  const match =
    exact === -1
      ? (findFuzzyMatch(text, quote) ?? findPrefixMatch(text, quote))
      : { end: exact + quote.length, start: exact };

  if (!match) return null;

  const starts: number[] = [];
  let length = 0;

  for (const segment of segments) {
    starts.push(length);
    length += segment.length;
  }

  const closingSegment = (offset: number) =>
    starts.findIndex(
      (start, index) => offset <= start + segments[index].length
    );
  const openingSegment = (offset: number) => {
    const opened = starts.indexOf(offset);

    return opened === -1 ? closingSegment(offset) : opened;
  };
  const pointIn = (segment: number, offset: number): QuotedSpanPoint => ({
    offset: offset - starts[segment],
    segment,
  });

  return {
    end: pointIn(closingSegment(match.end), match.end),
    start: pointIn(openingSegment(match.start), match.start),
  };
};
