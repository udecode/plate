import type { ContentSlice } from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import type { NodeEntry } from '../interfaces/node';

/**
 * Where a paste lands, after the caret is placed. `empty` is a collapsed caret
 * in an empty block that a whole-block paste may replace. `context` holds the
 * lowest block at the target's start, the first selected block's start for a
 * paste that replaces selected blocks whole, or `null` when no block is found
 * there. `root` is the named root the paste lands in, absent for the main
 * document.
 */
export type SliceLandingTarget =
  | Readonly<{ block: NodeEntry<Element>; kind: 'empty'; root?: string }>
  | Readonly<{
      block: NodeEntry<Element> | null;
      kind: 'context';
      root?: string;
    }>;

export type SliceLandingInput = Readonly<{
  /**
   * `copy` for a paste, a node-selection replace and a copied text drop;
   * `move` for a text drag that moves, where only properties declared
   * `landing: 'rebase'` or `'adopt'` may change.
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
