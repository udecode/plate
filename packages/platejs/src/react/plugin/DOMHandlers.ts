import type React from 'react';

import type {
  AnyBasePluginDefinition,
  HandlerReturnType,
  BasePluginDefinition,
} from '../../lib';
import type { PlatePluginContext } from './PlatePlugin';

export type DOMHandler<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
  EV = {},
> = (
  ctx: PlatePluginContext<C> & {
    event: EV;
  }
) => HandlerReturnType;

export type DOMHandlers<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = {
  // Media Events
  abort?: DOMHandler<C, React.SyntheticEvent>;
  abortCapture?: DOMHandler<C, React.SyntheticEvent>;
  animationEnd?: DOMHandler<C, React.AnimationEvent>;
  animationEndCapture?: DOMHandler<C, React.AnimationEvent>;
  animationIteration?: DOMHandler<C, React.AnimationEvent>;
  animationIterationCapture?: DOMHandler<C, React.AnimationEvent>;

  // Animation Events
  animationStart?: DOMHandler<C, React.AnimationEvent>;
  animationStartCapture?: DOMHandler<C, React.AnimationEvent>;
  // React.MouseEvents
  auxClick?: DOMHandler<C, React.MouseEvent>;
  auxClickCapture?: DOMHandler<C, React.MouseEvent>;
  beforeInput?: DOMHandler<C, React.FormEvent>;
  beforeInputCapture?: DOMHandler<C, React.FormEvent>;

  blur?: DOMHandler<C, React.FocusEvent>;
  blurCapture?: DOMHandler<C, React.FocusEvent>;
  canPlay?: DOMHandler<C, React.SyntheticEvent>;
  canPlayCapture?: DOMHandler<C, React.SyntheticEvent>;

  canPlayThrough?: DOMHandler<C, React.SyntheticEvent>;
  canPlayThroughCapture?: DOMHandler<C, React.SyntheticEvent>;
  click?: DOMHandler<C, React.MouseEvent>;
  clickCapture?: DOMHandler<C, React.MouseEvent>;
  // Composition Events
  compositionEnd?: DOMHandler<C, React.CompositionEvent>;
  compositionEndCapture?: DOMHandler<C, React.CompositionEvent>;
  compositionStart?: DOMHandler<C, React.CompositionEvent>;
  compositionStartCapture?: DOMHandler<C, React.CompositionEvent>;
  compositionUpdate?: DOMHandler<C, React.CompositionEvent>;
  compositionUpdateCapture?: DOMHandler<C, React.CompositionEvent>;
  contextMenu?: DOMHandler<C, React.MouseEvent>;

  contextMenuCapture?: DOMHandler<C, React.MouseEvent>;
  // Clipboard Events
  copy?: DOMHandler<C, React.ClipboardEvent>;

  copyCapture?: DOMHandler<C, React.ClipboardEvent>;
  cut?: DOMHandler<C, React.ClipboardEvent>;
  cutCapture?: DOMHandler<C, React.ClipboardEvent>;
  // Form Events
  domBeforeInput?: DOMHandler<C, Event>;
  doubleClick?: DOMHandler<C, React.MouseEvent>;
  doubleClickCapture?: DOMHandler<C, React.MouseEvent>;

  drag?: DOMHandler<C, React.DragEvent>;
  dragCapture?: DOMHandler<C, React.DragEvent>;
  dragEnd?: DOMHandler<C, React.DragEvent>;
  dragEndCapture?: DOMHandler<C, React.DragEvent>;
  dragEnter?: DOMHandler<C, React.DragEvent>;
  dragEnterCapture?: DOMHandler<C, React.DragEvent>;
  dragExit?: DOMHandler<C, React.DragEvent>;
  dragExitCapture?: DOMHandler<C, React.DragEvent>;
  dragLeave?: DOMHandler<C, React.DragEvent>;
  dragLeaveCapture?: DOMHandler<C, React.DragEvent>;
  dragOver?: DOMHandler<C, React.DragEvent>;
  dragOverCapture?: DOMHandler<C, React.DragEvent>;
  dragStart?: DOMHandler<C, React.DragEvent>;
  dragStartCapture?: DOMHandler<C, React.DragEvent>;
  drop?: DOMHandler<C, React.DragEvent>;
  dropCapture?: DOMHandler<C, React.DragEvent>;
  durationChange?: DOMHandler<C, React.SyntheticEvent>;
  durationChangeCapture?: DOMHandler<C, React.SyntheticEvent>;
  emptied?: DOMHandler<C, React.SyntheticEvent>;
  emptiedCapture?: DOMHandler<C, React.SyntheticEvent>;
  encrypted?: DOMHandler<C, React.SyntheticEvent>;
  encryptedCapture?: DOMHandler<C, React.SyntheticEvent>;
  ended?: DOMHandler<C, React.SyntheticEvent>;
  endedCapture?: DOMHandler<C, React.SyntheticEvent>;
  // Focus Events
  focus?: DOMHandler<C, React.FocusEvent>;
  focusCapture?: DOMHandler<C, React.FocusEvent>;
  gotPointerCapture?: DOMHandler<C, React.PointerEvent>;
  gotPointerCaptureCapture?: DOMHandler<C, React.PointerEvent>;
  input?: DOMHandler<C, React.FormEvent>;
  inputCapture?: DOMHandler<C, React.FormEvent>;
  invalid?: DOMHandler<C, React.FormEvent>;
  invalidCapture?: DOMHandler<C, React.FormEvent>;
  // Keyboard Events
  keyDown?: DOMHandler<C, React.KeyboardEvent>;
  keyDownCapture?: DOMHandler<C, React.KeyboardEvent>;
  keyPress?: DOMHandler<C, React.KeyboardEvent>;
  keyPressCapture?: DOMHandler<C, React.KeyboardEvent>;
  keyUp?: DOMHandler<C, React.KeyboardEvent>;
  keyUpCapture?: DOMHandler<C, React.KeyboardEvent>;
  // Image Events
  load?: DOMHandler<C, React.SyntheticEvent>;
  loadCapture?: DOMHandler<C, React.SyntheticEvent>;
  loadedData?: DOMHandler<C, React.SyntheticEvent>;
  loadedDataCapture?: DOMHandler<C, React.SyntheticEvent>;
  loadedMetadata?: DOMHandler<C, React.SyntheticEvent>;
  loadedMetadataCapture?: DOMHandler<C, React.SyntheticEvent>;

  loadStart?: DOMHandler<C, React.SyntheticEvent>;
  loadStartCapture?: DOMHandler<C, React.SyntheticEvent>;
  lostPointerCapture?: DOMHandler<C, React.PointerEvent>;
  lostPointerCaptureCapture?: DOMHandler<C, React.PointerEvent>;
  mouseDown?: DOMHandler<C, React.MouseEvent>;
  mouseDownCapture?: DOMHandler<C, React.MouseEvent>;
  mouseEnter?: DOMHandler<C, React.MouseEvent>;
  mouseLeave?: DOMHandler<C, React.MouseEvent>;
  mouseMove?: DOMHandler<C, React.MouseEvent>;
  mouseMoveCapture?: DOMHandler<C, React.MouseEvent>;
  mouseOut?: DOMHandler<C, React.MouseEvent>;
  mouseOutCapture?: DOMHandler<C, React.MouseEvent>;
  mouseOver?: DOMHandler<C, React.MouseEvent>;
  mouseOverCapture?: DOMHandler<C, React.MouseEvent>;
  mouseUp?: DOMHandler<C, React.MouseEvent>;
  mouseUpCapture?: DOMHandler<C, React.MouseEvent>;
  paste?: DOMHandler<C, React.ClipboardEvent>;
  pasteCapture?: DOMHandler<C, React.ClipboardEvent>;
  pause?: DOMHandler<C, React.SyntheticEvent>;
  pauseCapture?: DOMHandler<C, React.SyntheticEvent>;
  play?: DOMHandler<C, React.SyntheticEvent>;
  playCapture?: DOMHandler<C, React.SyntheticEvent>;
  playing?: DOMHandler<C, React.SyntheticEvent>;
  playingCapture?: DOMHandler<C, React.SyntheticEvent>;
  pointerCancel?: DOMHandler<C, React.PointerEvent>;
  pointerCancelCapture?: DOMHandler<C, React.PointerEvent>;
  // Pointer Events
  pointerDown?: DOMHandler<C, React.PointerEvent>;
  pointerDownCapture?: DOMHandler<C, React.PointerEvent>;
  pointerEnter?: DOMHandler<C, React.PointerEvent>;
  pointerLeave?: DOMHandler<C, React.PointerEvent>;
  pointerMove?: DOMHandler<C, React.PointerEvent>;
  pointerMoveCapture?: DOMHandler<C, React.PointerEvent>;
  pointerOut?: DOMHandler<C, React.PointerEvent>;
  pointerOutCapture?: DOMHandler<C, React.PointerEvent>;
  pointerOver?: DOMHandler<C, React.PointerEvent>;
  pointerOverCapture?: DOMHandler<C, React.PointerEvent>;

  pointerUp?: DOMHandler<C, React.PointerEvent>;
  pointerUpCapture?: DOMHandler<C, React.PointerEvent>;

  progress?: DOMHandler<C, React.SyntheticEvent>;
  progressCapture?: DOMHandler<C, React.SyntheticEvent>;
  rateChange?: DOMHandler<C, React.SyntheticEvent>;
  rateChangeCapture?: DOMHandler<C, React.SyntheticEvent>;
  reset?: DOMHandler<C, React.FormEvent>;
  resetCapture?: DOMHandler<C, React.FormEvent>;
  // UI Events
  scroll?: DOMHandler<C, React.UIEvent>;
  scrollCapture?: DOMHandler<C, React.UIEvent>;

  seeked?: DOMHandler<C, React.SyntheticEvent>;
  seekedCapture?: DOMHandler<C, React.SyntheticEvent>;
  seeking?: DOMHandler<C, React.SyntheticEvent>;
  seekingCapture?: DOMHandler<C, React.SyntheticEvent>;
  // Selection Events
  select?: DOMHandler<C, React.SyntheticEvent>;
  selectCapture?: DOMHandler<C, React.SyntheticEvent>;
  stalled?: DOMHandler<C, React.SyntheticEvent>;
  stalledCapture?: DOMHandler<C, React.SyntheticEvent>;
  submit?: DOMHandler<C, React.FormEvent>;
  submitCapture?: DOMHandler<C, React.FormEvent>;
  suspend?: DOMHandler<C, React.SyntheticEvent>;
  suspendCapture?: DOMHandler<C, React.SyntheticEvent>;
  timeUpdate?: DOMHandler<C, React.SyntheticEvent>;
  timeUpdateCapture?: DOMHandler<C, React.SyntheticEvent>;
  // Touch Events
  touchCancel?: DOMHandler<C, React.TouchEvent>;
  touchCancelCapture?: DOMHandler<C, React.TouchEvent>;
  touchEnd?: DOMHandler<C, React.TouchEvent>;
  touchEndCapture?: DOMHandler<C, React.TouchEvent>;

  touchMove?: DOMHandler<C, React.TouchEvent>;
  touchMoveCapture?: DOMHandler<C, React.TouchEvent>;

  touchStart?: DOMHandler<C, React.TouchEvent>;
  touchStartCapture?: DOMHandler<C, React.TouchEvent>;

  // Transition Events
  transitionEnd?: DOMHandler<C, React.TransitionEvent>;
  transitionEndCapture?: DOMHandler<C, React.TransitionEvent>;
  volumeChange?: DOMHandler<C, React.SyntheticEvent>;
  volumeChangeCapture?: DOMHandler<C, React.SyntheticEvent>;
  waiting?: DOMHandler<C, React.SyntheticEvent>;
  waitingCapture?: DOMHandler<C, React.SyntheticEvent>;

  // Wheel Events
  wheel?: DOMHandler<C, React.WheelEvent>;
  wheelCapture?: DOMHandler<C, React.WheelEvent>;
};

export type DOMHandlerProp = {
  [K in keyof DOMHandlers]-?: K extends 'domBeforeInput'
    ? 'onDOMBeforeInput'
    : `on${Capitalize<K>}`;
}[keyof DOMHandlers];
