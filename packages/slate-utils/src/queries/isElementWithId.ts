import {
  type TEditor,
  type TElement,
  isBlock,
  isElement,
} from '@udecode/slate';

/** Check if a value is an element with an id. */
export const isElementWithId = <N extends TElement>(
  value: any
): value is N & { id: string } => isElement(value) && !!(value as any).id;

/** Check if a value is a block with an id. */
export const isBlockWithId = <N extends TElement>(
  editor: TEditor,
  value: any
): value is N & { id: string } => isBlock(editor, value) && !!(value as any).id;
