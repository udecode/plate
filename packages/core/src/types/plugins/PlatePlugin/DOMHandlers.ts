import {
  AnimationEvent,
  ClipboardEvent,
  CompositionEvent,
  DragEvent,
  FocusEvent,
  FormEvent,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  SyntheticEvent,
  TouchEvent,
  TransitionEvent,
  UIEvent,
  WheelEvent,
} from 'react';
import { PlateEditor } from '../../PlateEditor';
import { WithPlatePlugin } from './PlatePlugin';

/**
 * If true, the next handlers will be skipped.
 */
export type HandlerReturnType = boolean | void;

export type DOMHandler<T = {}, P = {}, E = {}> = (
  editor: PlateEditor<T>,
  plugin: WithPlatePlugin<T, P>
) => (event: E) => HandlerReturnType;

export interface DOMHandlers<T = {}, P = {}> {
  // Clipboard Events
  onCopy?: DOMHandler<T, P, ClipboardEvent>;
  onCopyCapture?: DOMHandler<T, P, ClipboardEvent>;
  onCut?: DOMHandler<T, P, ClipboardEvent>;
  onCutCapture?: DOMHandler<T, P, ClipboardEvent>;
  onPaste?: DOMHandler<T, P, ClipboardEvent>;
  onPasteCapture?: DOMHandler<T, P, ClipboardEvent>;

  // Composition Events
  onCompositionEnd?: DOMHandler<T, P, CompositionEvent>;
  onCompositionEndCapture?: DOMHandler<T, P, CompositionEvent>;
  onCompositionStart?: DOMHandler<T, P, CompositionEvent>;
  onCompositionStartCapture?: DOMHandler<T, P, CompositionEvent>;
  onCompositionUpdate?: DOMHandler<T, P, CompositionEvent>;
  onCompositionUpdateCapture?: DOMHandler<T, P, CompositionEvent>;

  // Focus Events
  onFocus?: DOMHandler<T, P, FocusEvent>;
  onFocusCapture?: DOMHandler<T, P, FocusEvent>;
  onBlur?: DOMHandler<T, P, FocusEvent>;
  onBlurCapture?: DOMHandler<T, P, FocusEvent>;

  // Form Events
  onDOMBeforeInput?: DOMHandler<T, P, Event>;
  onBeforeInput?: DOMHandler<T, P, FormEvent>;
  onBeforeInputCapture?: DOMHandler<T, P, FormEvent>;
  onInput?: DOMHandler<T, P, FormEvent>;
  onInputCapture?: DOMHandler<T, P, FormEvent>;
  onReset?: DOMHandler<T, P, FormEvent>;
  onResetCapture?: DOMHandler<T, P, FormEvent>;
  onSubmit?: DOMHandler<T, P, FormEvent>;
  onSubmitCapture?: DOMHandler<T, P, FormEvent>;
  onInvalid?: DOMHandler<T, P, FormEvent>;
  onInvalidCapture?: DOMHandler<T, P, FormEvent>;

  // Image Events
  onLoad?: DOMHandler<T, P, SyntheticEvent>;
  onLoadCapture?: DOMHandler<T, P, SyntheticEvent>;

  // Keyboard Events
  onKeyDown?: DOMHandler<T, P, KeyboardEvent>;
  onKeyDownCapture?: DOMHandler<T, P, KeyboardEvent>;
  onKeyPress?: DOMHandler<T, P, KeyboardEvent>;
  onKeyPressCapture?: DOMHandler<T, P, KeyboardEvent>;
  onKeyUp?: DOMHandler<T, P, KeyboardEvent>;
  onKeyUpCapture?: DOMHandler<T, P, KeyboardEvent>;

  // Media Events
  onAbort?: DOMHandler<T, P, SyntheticEvent>;
  onAbortCapture?: DOMHandler<T, P, SyntheticEvent>;
  onCanPlay?: DOMHandler<T, P, SyntheticEvent>;
  onCanPlayCapture?: DOMHandler<T, P, SyntheticEvent>;
  onCanPlayThrough?: DOMHandler<T, P, SyntheticEvent>;
  onCanPlayThroughCapture?: DOMHandler<T, P, SyntheticEvent>;
  onDurationChange?: DOMHandler<T, P, SyntheticEvent>;
  onDurationChangeCapture?: DOMHandler<T, P, SyntheticEvent>;
  onEmptied?: DOMHandler<T, P, SyntheticEvent>;
  onEmptiedCapture?: DOMHandler<T, P, SyntheticEvent>;
  onEncrypted?: DOMHandler<T, P, SyntheticEvent>;
  onEncryptedCapture?: DOMHandler<T, P, SyntheticEvent>;
  onEnded?: DOMHandler<T, P, SyntheticEvent>;
  onEndedCapture?: DOMHandler<T, P, SyntheticEvent>;
  onLoadedData?: DOMHandler<T, P, SyntheticEvent>;
  onLoadedDataCapture?: DOMHandler<T, P, SyntheticEvent>;
  onLoadedMetadata?: DOMHandler<T, P, SyntheticEvent>;
  onLoadedMetadataCapture?: DOMHandler<T, P, SyntheticEvent>;
  onLoadStart?: DOMHandler<T, P, SyntheticEvent>;
  onLoadStartCapture?: DOMHandler<T, P, SyntheticEvent>;
  onPause?: DOMHandler<T, P, SyntheticEvent>;
  onPauseCapture?: DOMHandler<T, P, SyntheticEvent>;
  onPlay?: DOMHandler<T, P, SyntheticEvent>;
  onPlayCapture?: DOMHandler<T, P, SyntheticEvent>;
  onPlaying?: DOMHandler<T, P, SyntheticEvent>;
  onPlayingCapture?: DOMHandler<T, P, SyntheticEvent>;
  onProgress?: DOMHandler<T, P, SyntheticEvent>;
  onProgressCapture?: DOMHandler<T, P, SyntheticEvent>;
  onRateChange?: DOMHandler<T, P, SyntheticEvent>;
  onRateChangeCapture?: DOMHandler<T, P, SyntheticEvent>;
  onSeeked?: DOMHandler<T, P, SyntheticEvent>;
  onSeekedCapture?: DOMHandler<T, P, SyntheticEvent>;
  onSeeking?: DOMHandler<T, P, SyntheticEvent>;
  onSeekingCapture?: DOMHandler<T, P, SyntheticEvent>;
  onStalled?: DOMHandler<T, P, SyntheticEvent>;
  onStalledCapture?: DOMHandler<T, P, SyntheticEvent>;
  onSuspend?: DOMHandler<T, P, SyntheticEvent>;
  onSuspendCapture?: DOMHandler<T, P, SyntheticEvent>;
  onTimeUpdate?: DOMHandler<T, P, SyntheticEvent>;
  onTimeUpdateCapture?: DOMHandler<T, P, SyntheticEvent>;
  onVolumeChange?: DOMHandler<T, P, SyntheticEvent>;
  onVolumeChangeCapture?: DOMHandler<T, P, SyntheticEvent>;
  onWaiting?: DOMHandler<T, P, SyntheticEvent>;
  onWaitingCapture?: DOMHandler<T, P, SyntheticEvent>;

  // MouseEvents
  onAuxClick?: DOMHandler<T, P, MouseEvent>;
  onAuxClickCapture?: DOMHandler<T, P, MouseEvent>;
  onClick?: DOMHandler<T, P, MouseEvent>;
  onClickCapture?: DOMHandler<T, P, MouseEvent>;
  onContextMenu?: DOMHandler<T, P, MouseEvent>;
  onContextMenuCapture?: DOMHandler<T, P, MouseEvent>;
  onDoubleClick?: DOMHandler<T, P, MouseEvent>;
  onDoubleClickCapture?: DOMHandler<T, P, MouseEvent>;
  onDrag?: DOMHandler<T, P, DragEvent>;
  onDragCapture?: DOMHandler<T, P, DragEvent>;
  onDragEnd?: DOMHandler<T, P, DragEvent>;
  onDragEndCapture?: DOMHandler<T, P, DragEvent>;
  onDragEnter?: DOMHandler<T, P, DragEvent>;
  onDragEnterCapture?: DOMHandler<T, P, DragEvent>;
  onDragExit?: DOMHandler<T, P, DragEvent>;
  onDragExitCapture?: DOMHandler<T, P, DragEvent>;
  onDragLeave?: DOMHandler<T, P, DragEvent>;
  onDragLeaveCapture?: DOMHandler<T, P, DragEvent>;
  onDragOver?: DOMHandler<T, P, DragEvent>;
  onDragOverCapture?: DOMHandler<T, P, DragEvent>;
  onDragStart?: DOMHandler<T, P, DragEvent>;
  onDragStartCapture?: DOMHandler<T, P, DragEvent>;
  onDrop?: DOMHandler<T, P, DragEvent>;
  onDropCapture?: DOMHandler<T, P, DragEvent>;
  onMouseDown?: DOMHandler<T, P, MouseEvent>;
  onMouseDownCapture?: DOMHandler<T, P, MouseEvent>;
  onMouseEnter?: DOMHandler<T, P, MouseEvent>;
  onMouseLeave?: DOMHandler<T, P, MouseEvent>;
  onMouseMove?: DOMHandler<T, P, MouseEvent>;
  onMouseMoveCapture?: DOMHandler<T, P, MouseEvent>;
  onMouseOut?: DOMHandler<T, P, MouseEvent>;
  onMouseOutCapture?: DOMHandler<T, P, MouseEvent>;
  onMouseOver?: DOMHandler<T, P, MouseEvent>;
  onMouseOverCapture?: DOMHandler<T, P, MouseEvent>;
  onMouseUp?: DOMHandler<T, P, MouseEvent>;
  onMouseUpCapture?: DOMHandler<T, P, MouseEvent>;

  // Selection Events
  onSelect?: DOMHandler<T, P, SyntheticEvent>;
  onSelectCapture?: DOMHandler<T, P, SyntheticEvent>;

  // Touch Events
  onTouchCancel?: DOMHandler<T, P, TouchEvent>;
  onTouchCancelCapture?: DOMHandler<T, P, TouchEvent>;
  onTouchEnd?: DOMHandler<T, P, TouchEvent>;
  onTouchEndCapture?: DOMHandler<T, P, TouchEvent>;
  onTouchMove?: DOMHandler<T, P, TouchEvent>;
  onTouchMoveCapture?: DOMHandler<T, P, TouchEvent>;
  onTouchStart?: DOMHandler<T, P, TouchEvent>;
  onTouchStartCapture?: DOMHandler<T, P, TouchEvent>;

  // Pointer Events
  onPointerDown?: DOMHandler<T, P, PointerEvent>;
  onPointerDownCapture?: DOMHandler<T, P, PointerEvent>;
  onPointerMove?: DOMHandler<T, P, PointerEvent>;
  onPointerMoveCapture?: DOMHandler<T, P, PointerEvent>;
  onPointerUp?: DOMHandler<T, P, PointerEvent>;
  onPointerUpCapture?: DOMHandler<T, P, PointerEvent>;
  onPointerCancel?: DOMHandler<T, P, PointerEvent>;
  onPointerCancelCapture?: DOMHandler<T, P, PointerEvent>;
  onPointerEnter?: DOMHandler<T, P, PointerEvent>;
  onPointerEnterCapture?: DOMHandler<T, P, PointerEvent>;
  onPointerLeave?: DOMHandler<T, P, PointerEvent>;
  onPointerLeaveCapture?: DOMHandler<T, P, PointerEvent>;
  onPointerOver?: DOMHandler<T, P, PointerEvent>;
  onPointerOverCapture?: DOMHandler<T, P, PointerEvent>;
  onPointerOut?: DOMHandler<T, P, PointerEvent>;
  onPointerOutCapture?: DOMHandler<T, P, PointerEvent>;
  onGotPointerCapture?: DOMHandler<T, P, PointerEvent>;
  onGotPointerCaptureCapture?: DOMHandler<T, P, PointerEvent>;
  onLostPointerCapture?: DOMHandler<T, P, PointerEvent>;
  onLostPointerCaptureCapture?: DOMHandler<T, P, PointerEvent>;

  // UI Events
  onScroll?: DOMHandler<T, P, UIEvent>;
  onScrollCapture?: DOMHandler<T, P, UIEvent>;

  // Wheel Events
  onWheel?: DOMHandler<T, P, WheelEvent>;
  onWheelCapture?: DOMHandler<T, P, WheelEvent>;

  // Animation Events
  onAnimationStart?: DOMHandler<T, P, AnimationEvent>;
  onAnimationStartCapture?: DOMHandler<T, P, AnimationEvent>;
  onAnimationEnd?: DOMHandler<T, P, AnimationEvent>;
  onAnimationEndCapture?: DOMHandler<T, P, AnimationEvent>;
  onAnimationIteration?: DOMHandler<T, P, AnimationEvent>;
  onAnimationIterationCapture?: DOMHandler<T, P, AnimationEvent>;

  // Transition Events
  onTransitionEnd?: DOMHandler<T, P, TransitionEvent>;
  onTransitionEndCapture?: DOMHandler<T, P, TransitionEvent>;
}
