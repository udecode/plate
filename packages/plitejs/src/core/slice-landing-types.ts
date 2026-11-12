import type { ContentSlice } from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import type { NodeEntry } from '../interfaces/node';

/**
 * Where a paste or a block duplicate lands. `empty` is a collapsed caret in an
 * empty block that a whole-block paste may replace. `context` holds the lowest
 * block at a paste's start, the first selected block's start for a paste that
 * replaces selected blocks whole, or `null` when no block is found there.
 * `beside` is a block duplicate. `root` is the named root the slice lands in,
 * absent for the main document.
 */
export type SliceLandingTarget =
  | Readonly<{ block: NodeEntry<Element>; kind: 'empty'; root?: string }>
  | Readonly<{
      block: NodeEntry<Element> | null;
      kind: 'context';
      root?: string;
    }>
  /**
   * The slice holds closed copies of whole blocks, which land as the next
   * siblings of the last block copied, in `root`. `source` is the whole copy
   * and `slice` what survives the length limit, as for a paste. No target
   * block is fitted, so a middleware refreshes only what a copy must not share
   * with its source.
   */
  | Readonly<{ kind: 'beside'; root?: string }>;

export type SliceLandingInput = Readonly<{
  /**
   * `copy` for a paste, a node-selection replace, a copied text drop and a
   * block duplicate; `move` for a text drag that moves, where only properties
   * declared `landing: 'rebase'` or `'adopt'` may change.
   */
  intent: 'copy' | 'move';
  /** The command's slice as handlers left it, before the length limit. */
  source: ContentSlice;
  /** What survives the length limit, crediting the text the paste replaces. */
  slice: ContentSlice;
  target: SliceLandingTarget;
}>;

export type SliceLanding = Readonly<{
  /** What the paste fits as ordinary content, cut to the same length limit. */
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
