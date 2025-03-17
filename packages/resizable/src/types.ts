export type ResizeDirection = 'bottom' | 'left' | 'right' | 'top';

export type ResizeEvent = {
  delta: ResizeLengthStatic;
  direction: ResizeDirection;
  finished: boolean;
  initialSize: ResizeLengthStatic;
};

export type ResizeLength = ResizeLengthRelative | ResizeLengthStatic;

export type ResizeLengthRelative = string;

export type ResizeLengthStatic = number;
