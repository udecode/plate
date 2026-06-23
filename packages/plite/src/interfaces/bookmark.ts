import type { Range } from './range';

export type BookmarkAffinity = 'backward' | 'forward' | 'inward';

/** A hidden, operation-rebased range anchor for local annotation-like state. */
export type Bookmark = {
  affinity: BookmarkAffinity;
  /** Resolve the current range, or null when the anchored content is gone. */
  resolve(): Range | null;
  /** Stop tracking and return the last resolved range. */
  unref(): Range | null;
};

/** Options for creating a bookmark. Defaults to inward affinity. */
export type BookmarkOptions = {
  affinity?: BookmarkAffinity;
};
