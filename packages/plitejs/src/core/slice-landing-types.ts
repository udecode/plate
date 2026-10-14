import type { ContentSlice } from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import type { NodeEntry } from '../interfaces/node';

/**
 * Where a paste lands. `empty` is a collapsed caret in an empty block that a
 * whole-block paste may replace. `context` holds the lowest block at the
 * target's start, or `null` without a target. `root` is the named root the
 * paste lands in, absent for the main document.
 */
export type SliceLandingTarget =
  | Readonly<{ block: NodeEntry<Element>; kind: 'empty'; root?: string }>
  | Readonly<{
      block: NodeEntry<Element> | null;
      kind: 'context';
      root?: string;
    }>;

export type SliceLandingInput = Readonly<{
  /** The command's slice as handlers left it, before the length limit. */
  source: ContentSlice;
  /**
   * What survives the length limit at a caret or range, or the handed slice
   * over a node selection.
   */
  slice: ContentSlice;
  target: SliceLandingTarget;
}>;

export type SliceLanding = Readonly<{
  /** What the paste fits as ordinary content. */
  slice: ContentSlice;
  /**
   * Content that replaces an `empty` target whole. The editor checks it and
   * falls back to `slice` when it does not fit. A middleware that rewrites
   * `slice` rewrites or drops this too.
   */
  replaceEmpty?: Readonly<{
    /** Target properties the replacement's head never keeps. */
    omitTargetProperties?: readonly string[];
    slice: ContentSlice;
  }>;
}>;
