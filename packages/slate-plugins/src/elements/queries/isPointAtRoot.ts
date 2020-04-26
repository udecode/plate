import { Point } from 'slate';

export const isPointAtRoot = (point: Point) => point.path.length === 2;
