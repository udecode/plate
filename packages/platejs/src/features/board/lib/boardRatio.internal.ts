import type { Editor, Element } from '../../../core';
import { BaseBoardImagePlugin } from './BaseBoardImagePlugin';
import type { BoardSize } from './boardShape.internal';

export const MIN_SHAPE_SIZE = 8;

export const keepsBoardRatio = (editor: Editor) => {
  const image = editor.plugin(BaseBoardImagePlugin);

  return ({ type }: Element) => image.installed && type === image.schema.type;
};

export const flooredSizeKeepingRatio = (
  size: BoardSize,
  side: keyof BoardSize,
  length: number
): BoardSize => {
  const floor = Math.min(1, MIN_SHAPE_SIZE / Math.min(size.height, size.width));

  if (length < size[side] * floor) {
    return { height: size.height * floor, width: size.width * floor };
  }

  return side === 'width'
    ? { height: (length / size.width) * size.height, width: length }
    : { height: length, width: (length / size.height) * size.width };
};
