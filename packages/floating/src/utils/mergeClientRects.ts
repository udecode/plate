import { makeClientRect } from './makeClientRect';

export const mergeClientRects = (clientRects: DOMRect[]): DOMRect => {
  if (clientRects.length === 0) {
    throw new Error('clientRects should not be empty');
  }

  return makeClientRect({
    top: Math.min(...clientRects.map((rect) => rect.top)),
    bottom: Math.max(...clientRects.map((rect) => rect.bottom)),
    left: Math.min(...clientRects.map((rect) => rect.left)),
    right: Math.max(...clientRects.map((rect) => rect.right)),
  });
};
