import type { CodeDrawingType, ViewMode } from './constants';

export type CodeDrawingData = {
  drawingType?: CodeDrawingType;
  drawingMode?: ViewMode;
  code?: string;
};
