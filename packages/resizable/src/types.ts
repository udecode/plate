export type ResizeDirection = 'bottom' | 'left' | 'right' | 'top';

export type ResizeLengthStatic = number;

export type ResizeLengthRelative = string;

export type ResizeLength = ResizeLengthRelative | ResizeLengthStatic;

export type ResizeEvent = {
  delta: ResizeLengthStatic;
  direction: ResizeDirection;
  finished: boolean;
  initialSize: ResizeLengthStatic;
};
