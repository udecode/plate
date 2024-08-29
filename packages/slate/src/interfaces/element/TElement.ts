import type { UnknownObject } from '@udecode/utils';

import type { TEditor } from '../editor/TEditor';
import type { TDescendant } from '../node/TDescendant';
import type { TNode } from '../node/TNode';
import type { TextOf } from '../text/TText';

/**
 * `Element` objects are a type of node in a Slate document that contain other
 * element nodes or text nodes. They can be either "blocks" or "inlines"
 * depending on the Slate editor's configuration.
 */
export type TElement = {
  children: TDescendant[];
  type: string;
} & UnknownObject;

/** Element or text of an editor. */
export type ElementOrTextOf<E extends TEditor> = ElementOf<E> | TextOf<E>;

/**
 * `ElementEntry` objects refer to an `Element` and the `Path` where it can be
 * found inside a root node.
 */
// export type TElementEntry = [TElement, Path];

/** A utility type to get all the element nodes type from a root node. */
export type ElementOf<N extends TNode> = TEditor extends N
  ? TElement
  : TElement extends N
    ? TElement
    : N extends TEditor
      ?
          | ElementOf<N['children'][number]>
          | Extract<N['children'][number], TElement>
      : N extends TElement
        ?
            | ElementOf<N['children'][number]>
            | Extract<N['children'][number], TElement>
            | N
        : never;
