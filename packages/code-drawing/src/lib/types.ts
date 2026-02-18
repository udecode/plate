import type { CodeDrawingType, ViewMode } from './constants';

export interface CodeDrawingData {
  drawingType?: CodeDrawingType;
  drawingMode?: ViewMode;
  code?: string;
}
