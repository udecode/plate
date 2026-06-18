/** Hook for replacing values before Slate debug output is stringified. */
export type DebugValueScrubber = (key: string, value: unknown) => unknown;

let debugValueScrubber: DebugValueScrubber | undefined;

const defaultDebugValueScrubber = (key: string, value: unknown): unknown => {
  if (key === 'text' && typeof value === 'string') {
    return `[text length ${value.length}]`;
  }

  return value;
};

/** Override the debug value scrubber used by Slate diagnostic formatting. */
export const setDebugValueScrubber = (
  scrubber: DebugValueScrubber | null | undefined
) => {
  debugValueScrubber = scrubber ?? undefined;
};

export const formatDebugValue = (value: unknown): string => {
  try {
    const seen = new WeakSet<object>();
    const formatted = JSON.stringify(value, (_key, item) => {
      const scrubbed = debugValueScrubber
        ? debugValueScrubber(_key, item)
        : item;
      const next =
        scrubbed === item ? defaultDebugValueScrubber(_key, item) : scrubbed;

      if (typeof next !== 'object' || next === null) {
        return next;
      }

      if (seen.has(next)) {
        return '[Circular]';
      }

      seen.add(next);
      return next;
    });

    return formatted ?? String(value);
  } catch {
    try {
      return Object.prototype.toString.call(value);
    } catch {
      return '[Unformattable]';
    }
  }
};
