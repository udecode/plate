import type { NodeKey } from '../..';

/** Where a block drop would land in one view, with the line to paint. */
export type DropIndicator = Readonly<{
  axis: 'x' | 'y';
  edge: 'after' | 'before';
  key: NodeKey;
  /** Viewport rectangle of the edge: zero height on `y`, zero width on `x`. */
  line: Readonly<{ height: number; width: number; x: number; y: number }>;
}>;

const INDICATORS = new WeakMap<
  object,
  { listeners: Set<() => void>; value: DropIndicator | null }
>();
const PAINTED = new Set<object>();

const entryOf = (view: object) => {
  let entry = INDICATORS.get(view);

  if (!entry) {
    entry = { listeners: new Set(), value: null };
    INDICATORS.set(view, entry);
  }

  return entry;
};

const sameIndicator = (
  left: DropIndicator | null,
  right: DropIndicator | null
) =>
  left === right ||
  (!!left &&
    !!right &&
    left.key === right.key &&
    left.edge === right.edge &&
    left.axis === right.axis &&
    left.line.x === right.line.x &&
    left.line.y === right.line.y &&
    left.line.width === right.line.width &&
    left.line.height === right.line.height);

export const publishDropIndicator = (
  view: object,
  value: DropIndicator | null
) => {
  const entry = INDICATORS.get(view) ?? (value ? entryOf(view) : null);

  if (!entry || sameIndicator(entry.value, value)) return;

  entry.value = value;
  if (value) PAINTED.add(view);
  else PAINTED.delete(view);
  for (const listener of entry.listeners) listener();
};

export const clearDropIndicators = () => {
  for (const view of [...PAINTED]) publishDropIndicator(view, null);
};

export const readDropIndicator = (view: object) =>
  INDICATORS.get(view)?.value ?? null;

export const subscribeDropIndicator = (view: object, listener: () => void) => {
  const entry = entryOf(view);

  entry.listeners.add(listener);

  return () => {
    entry.listeners.delete(listener);
  };
};
