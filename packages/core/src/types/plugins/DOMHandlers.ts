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
import { Value } from '../../slate/types/TEditor';
import { PlateEditor } from '../PlateEditor';
import { WithPlatePlugin } from './PlatePlugin';

/**
 * If true, the next handlers will be skipped.
 */
export type HandlerReturnType = boolean | void;

export type DOMHandler<V extends Value, T = {}, P = {}, E = {}> = (
  editor: PlateEditor<V, T>,
  plugin: WithPlatePlugin<V, T, P>
) => (event: E) => HandlerReturnType;

export interface DOMHandlers<V extends Value, T = {}, P = {}> {
  // Clipboard Events
  onCopy?: DOMHandler<V, T, P, ClipboardEvent>;
  onCopyCapture?: DOMHandler<V, T, P, ClipboardEvent>;
  onCut?: DOMHandler<V, T, P, ClipboardEvent>;
  onCutCapture?: DOMHandler<V, T, P, ClipboardEvent>;
  onPaste?: DOMHandler<V, T, P, ClipboardEvent>;
  onPasteCapture?: DOMHandler<V, T, P, ClipboardEvent>;

  // Composition Events
  onCompositionEnd?: DOMHandler<V, T, P, CompositionEvent>;
  onCompositionEndCapture?: DOMHandler<V, T, P, CompositionEvent>;
  onCompositionStart?: DOMHandler<V, T, P, CompositionEvent>;
  onCompositionStartCapture?: DOMHandler<V, T, P, CompositionEvent>;
  onCompositionUpdate?: DOMHandler<V, T, P, CompositionEvent>;
  onCompositionUpdateCapture?: DOMHandler<V, T, P, CompositionEvent>;

  // Focus Events
  onFocus?: DOMHandler<V, T, P, FocusEvent>;
  onFocusCapture?: DOMHandler<V, T, P, FocusEvent>;
  onBlur?: DOMHandler<V, T, P, FocusEvent>;
  onBlurCapture?: DOMHandler<V, T, P, FocusEvent>;

  // Form Events
  onDOMBeforeInput?: DOMHandler<V, T, P, Event>;
  onBeforeInput?: DOMHandler<V, T, P, FormEvent>;
  onBeforeInputCapture?: DOMHandler<V, T, P, FormEvent>;
  onInput?: DOMHandler<V, T, P, FormEvent>;
  onInputCapture?: DOMHandler<V, T, P, FormEvent>;
  onReset?: DOMHandler<V, T, P, FormEvent>;
  onResetCapture?: DOMHandler<V, T, P, FormEvent>;
  onSubmit?: DOMHandler<V, T, P, FormEvent>;
  onSubmitCapture?: DOMHandler<V, T, P, FormEvent>;
  onInvalid?: DOMHandler<V, T, P, FormEvent>;
  onInvalidCapture?: DOMHandler<V, T, P, FormEvent>;

  // Image Events
  onLoad?: DOMHandler<V, T, P, SyntheticEvent>;
  onLoadCapture?: DOMHandler<V, T, P, SyntheticEvent>;

  // Keyboard Events
  onKeyDown?: DOMHandler<V, T, P, KeyboardEvent>;
  onKeyDownCapture?: DOMHandler<V, T, P, KeyboardEvent>;
  onKeyPress?: DOMHandler<V, T, P, KeyboardEvent>;
  onKeyPressCapture?: DOMHandler<V, T, P, KeyboardEvent>;
  onKeyUp?: DOMHandler<V, T, P, KeyboardEvent>;
  onKeyUpCapture?: DOMHandler<V, T, P, KeyboardEvent>;

  // Media Events
  onAbort?: DOMHandler<V, T, P, SyntheticEvent>;
  onAbortCapture?: DOMHandler<V, T, P, SyntheticEvent>;
  onCanPlay?: DOMHandler<V, T, P, SyntheticEvent>;
  onCanPlayCapture?: DOMHandler<V, T, P, SyntheticEvent>;
  onCanPlayThrough?: DOMHandler<V, T, P, SyntheticEvent>;
  onCanPlayThroughCapture?: DOMHandler<V, T, P, SyntheticEvent>;
  onDurationChange?: DOMHandler<V, T, P, SyntheticEvent>;
  onDurationChangeCapture?: DOMHandler<V, T, P, SyntheticEvent>;
  onEmptied?: DOMHandler<V, T, P, SyntheticEvent>;
  onEmptiedCapture?: DOMHandler<V, T, P, SyntheticEvent>;
  onEncrypted?: DOMHandler<V, T, P, SyntheticEvent>;
  onEncryptedCapture?: DOMHandler<V, T, P, SyntheticEvent>;
  onEnded?: DOMHandler<V, T, P, SyntheticEvent>;
  onEndedCapture?: DOMHandler<V, T, P, SyntheticEvent>;
  onLoadedData?: DOMHandler<V, T, P, SyntheticEvent>;
  onLoadedDataCapture?: DOMHandler<V, T, P, SyntheticEvent>;
  onLoadedMetadata?: DOMHandler<V, T, P, SyntheticEvent>;
  onLoadedMetadataCapture?: DOMHandler<V, T, P, SyntheticEvent>;
  onLoadStart?: DOMHandler<V, T, P, SyntheticEvent>;
  onLoadStartCapture?: DOMHandler<V, T, P, SyntheticEvent>;
  onPause?: DOMHandler<V, T, P, SyntheticEvent>;
  onPauseCapture?: DOMHandler<V, T, P, SyntheticEvent>;
  onPlay?: DOMHandler<V, T, P, SyntheticEvent>;
  onPlayCapture?: DOMHandler<V, T, P, SyntheticEvent>;
  onPlaying?: DOMHandler<V, T, P, SyntheticEvent>;
  onPlayingCapture?: DOMHandler<V, T, P, SyntheticEvent>;
  onProgress?: DOMHandler<V, T, P, SyntheticEvent>;
  onProgressCapture?: DOMHandler<V, T, P, SyntheticEvent>;
  onRateChange?: DOMHandler<V, T, P, SyntheticEvent>;
  onRateChangeCapture?: DOMHandler<V, T, P, SyntheticEvent>;
  onSeeked?: DOMHandler<V, T, P, SyntheticEvent>;
  onSeekedCapture?: DOMHandler<V, T, P, SyntheticEvent>;
  onSeeking?: DOMHandler<V, T, P, SyntheticEvent>;
  onSeekingCapture?: DOMHandler<V, T, P, SyntheticEvent>;
  onStalled?: DOMHandler<V, T, P, SyntheticEvent>;
  onStalledCapture?: DOMHandler<V, T, P, SyntheticEvent>;
  onSuspend?: DOMHandler<V, T, P, SyntheticEvent>;
  onSuspendCapture?: DOMHandler<V, T, P, SyntheticEvent>;
  onTimeUpdate?: DOMHandler<V, T, P, SyntheticEvent>;
  onTimeUpdateCapture?: DOMHandler<V, T, P, SyntheticEvent>;
  onVolumeChange?: DOMHandler<V, T, P, SyntheticEvent>;
  onVolumeChangeCapture?: DOMHandler<V, T, P, SyntheticEvent>;
  onWaiting?: DOMHandler<V, T, P, SyntheticEvent>;
  onWaitingCapture?: DOMHandler<V, T, P, SyntheticEvent>;

  // MouseEvents
  onAuxClick?: DOMHandler<V, T, P, MouseEvent>;
  onAuxClickCapture?: DOMHandler<V, T, P, MouseEvent>;
  onClick?: DOMHandler<V, T, P, MouseEvent>;
  onClickCapture?: DOMHandler<V, T, P, MouseEvent>;
  onContextMenu?: DOMHandler<V, T, P, MouseEvent>;
  onContextMenuCapture?: DOMHandler<V, T, P, MouseEvent>;
  onDoubleClick?: DOMHandler<V, T, P, MouseEvent>;
  onDoubleClickCapture?: DOMHandler<V, T, P, MouseEvent>;
  onDrag?: DOMHandler<V, T, P, DragEvent>;
  onDragCapture?: DOMHandler<V, T, P, DragEvent>;
  onDragEnd?: DOMHandler<V, T, P, DragEvent>;
  onDragEndCapture?: DOMHandler<V, T, P, DragEvent>;
  onDragEnter?: DOMHandler<V, T, P, DragEvent>;
  onDragEnterCapture?: DOMHandler<V, T, P, DragEvent>;
  onDragExit?: DOMHandler<V, T, P, DragEvent>;
  onDragExitCapture?: DOMHandler<V, T, P, DragEvent>;
  onDragLeave?: DOMHandler<V, T, P, DragEvent>;
  onDragLeaveCapture?: DOMHandler<V, T, P, DragEvent>;
  onDragOver?: DOMHandler<V, T, P, DragEvent>;
  onDragOverCapture?: DOMHandler<V, T, P, DragEvent>;
  onDragStart?: DOMHandler<V, T, P, DragEvent>;
  onDragStartCapture?: DOMHandler<V, T, P, DragEvent>;
  onDrop?: DOMHandler<V, T, P, DragEvent>;
  onDropCapture?: DOMHandler<V, T, P, DragEvent>;
  onMouseDown?: DOMHandler<V, T, P, MouseEvent>;
  onMouseDownCapture?: DOMHandler<V, T, P, MouseEvent>;
  onMouseEnter?: DOMHandler<V, T, P, MouseEvent>;
  onMouseLeave?: DOMHandler<V, T, P, MouseEvent>;
  onMouseMove?: DOMHandler<V, T, P, MouseEvent>;
  onMouseMoveCapture?: DOMHandler<V, T, P, MouseEvent>;
  onMouseOut?: DOMHandler<V, T, P, MouseEvent>;
  onMouseOutCapture?: DOMHandler<V, T, P, MouseEvent>;
  onMouseOver?: DOMHandler<V, T, P, MouseEvent>;
  onMouseOverCapture?: DOMHandler<V, T, P, MouseEvent>;
  onMouseUp?: DOMHandler<V, T, P, MouseEvent>;
  onMouseUpCapture?: DOMHandler<V, T, P, MouseEvent>;

  // Selection Events
  onSelect?: DOMHandler<V, T, P, SyntheticEvent>;
  onSelectCapture?: DOMHandler<V, T, P, SyntheticEvent>;

  // Touch Events
  onTouchCancel?: DOMHandler<V, T, P, TouchEvent>;
  onTouchCancelCapture?: DOMHandler<V, T, P, TouchEvent>;
  onTouchEnd?: DOMHandler<V, T, P, TouchEvent>;
  onTouchEndCapture?: DOMHandler<V, T, P, TouchEvent>;
  onTouchMove?: DOMHandler<V, T, P, TouchEvent>;
  onTouchMoveCapture?: DOMHandler<V, T, P, TouchEvent>;
  onTouchStart?: DOMHandler<V, T, P, TouchEvent>;
  onTouchStartCapture?: DOMHandler<V, T, P, TouchEvent>;

  // Pointer Events
  onPointerDown?: DOMHandler<V, T, P, PointerEvent>;
  onPointerDownCapture?: DOMHandler<V, T, P, PointerEvent>;
  onPointerMove?: DOMHandler<V, T, P, PointerEvent>;
  onPointerMoveCapture?: DOMHandler<V, T, P, PointerEvent>;
  onPointerUp?: DOMHandler<V, T, P, PointerEvent>;
  onPointerUpCapture?: DOMHandler<V, T, P, PointerEvent>;
  onPointerCancel?: DOMHandler<V, T, P, PointerEvent>;
  onPointerCancelCapture?: DOMHandler<V, T, P, PointerEvent>;
  onPointerEnter?: DOMHandler<V, T, P, PointerEvent>;
  onPointerEnterCapture?: DOMHandler<V, T, P, PointerEvent>;
  onPointerLeave?: DOMHandler<V, T, P, PointerEvent>;
  onPointerLeaveCapture?: DOMHandler<V, T, P, PointerEvent>;
  onPointerOver?: DOMHandler<V, T, P, PointerEvent>;
  onPointerOverCapture?: DOMHandler<V, T, P, PointerEvent>;
  onPointerOut?: DOMHandler<V, T, P, PointerEvent>;
  onPointerOutCapture?: DOMHandler<V, T, P, PointerEvent>;
  onGotPointerCapture?: DOMHandler<V, T, P, PointerEvent>;
  onGotPointerCaptureCapture?: DOMHandler<V, T, P, PointerEvent>;
  onLostPointerCapture?: DOMHandler<V, T, P, PointerEvent>;
  onLostPointerCaptureCapture?: DOMHandler<V, T, P, PointerEvent>;

  // UI Events
  onScroll?: DOMHandler<V, T, P, UIEvent>;
  onScrollCapture?: DOMHandler<V, T, P, UIEvent>;

  // Wheel Events
  onWheel?: DOMHandler<V, T, P, WheelEvent>;
  onWheelCapture?: DOMHandler<V, T, P, WheelEvent>;

  // Animation Events
  onAnimationStart?: DOMHandler<V, T, P, AnimationEvent>;
  onAnimationStartCapture?: DOMHandler<V, T, P, AnimationEvent>;
  onAnimationEnd?: DOMHandler<V, T, P, AnimationEvent>;
  onAnimationEndCapture?: DOMHandler<V, T, P, AnimationEvent>;
  onAnimationIteration?: DOMHandler<V, T, P, AnimationEvent>;
  onAnimationIterationCapture?: DOMHandler<V, T, P, AnimationEvent>;

  // Transition Events
  onTransitionEnd?: DOMHandler<V, T, P, TransitionEvent>;
  onTransitionEndCapture?: DOMHandler<V, T, P, TransitionEvent>;
}
