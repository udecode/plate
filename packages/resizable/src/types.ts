export type ResizeDirection = 'top' | 'right' | 'bottom' | 'left';

export type ResizeLengthStatic = number;
export type ResizeLengthRelative = string;
export type ResizeLength = ResizeLengthStatic | ResizeLengthRelative;

export type ResizeEvent = {
  initialSize: ResizeLengthStatic;
  delta: ResizeLengthStatic;
  finished: boolean;
  direction: ResizeDirection;
};
