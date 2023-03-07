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
import { Value } from '@udecode/slate';
import { PlateEditor } from '../PlateEditor';
import { PluginOptions, WithPlatePlugin } from './PlatePlugin';

/**
 * If true, the next handlers will be skipped.
 */
export type HandlerReturnType = boolean | void;

export type DOMHandlerReturnType<EV = {}> = (event: EV) => HandlerReturnType;

export type DOMHandler<
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
  EV = {}
> = (editor: E, plugin: WithPlatePlugin<P, V, E>) => DOMHandlerReturnType<EV>;

export interface DOMHandlers<
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> {
  // Clipboard Events
  onCopy?: DOMHandler<P, V, E, ClipboardEvent>;
  onCopyCapture?: DOMHandler<P, V, E, ClipboardEvent>;
  onCut?: DOMHandler<P, V, E, ClipboardEvent>;
  onCutCapture?: DOMHandler<P, V, E, ClipboardEvent>;
  onPaste?: DOMHandler<P, V, E, ClipboardEvent>;
  onPasteCapture?: DOMHandler<P, V, E, ClipboardEvent>;

  // Composition Events
  onCompositionEnd?: DOMHandler<P, V, E, CompositionEvent>;
  onCompositionEndCapture?: DOMHandler<P, V, E, CompositionEvent>;
  onCompositionStart?: DOMHandler<P, V, E, CompositionEvent>;
  onCompositionStartCapture?: DOMHandler<P, V, E, CompositionEvent>;
  onCompositionUpdate?: DOMHandler<P, V, E, CompositionEvent>;
  onCompositionUpdateCapture?: DOMHandler<P, V, E, CompositionEvent>;

  // Focus Events
  onFocus?: DOMHandler<P, V, E, FocusEvent>;
  onFocusCapture?: DOMHandler<P, V, E, FocusEvent>;
  onBlur?: DOMHandler<P, V, E, FocusEvent>;
  onBlurCapture?: DOMHandler<P, V, E, FocusEvent>;

  // Form Events
  onDOMBeforeInput?: DOMHandler<P, V, E, Event>;
  onBeforeInput?: DOMHandler<P, V, E, FormEvent>;
  onBeforeInputCapture?: DOMHandler<P, V, E, FormEvent>;
  onInput?: DOMHandler<P, V, E, FormEvent>;
  onInputCapture?: DOMHandler<P, V, E, FormEvent>;
  onReset?: DOMHandler<P, V, E, FormEvent>;
  onResetCapture?: DOMHandler<P, V, E, FormEvent>;
  onSubmit?: DOMHandler<P, V, E, FormEvent>;
  onSubmitCapture?: DOMHandler<P, V, E, FormEvent>;
  onInvalid?: DOMHandler<P, V, E, FormEvent>;
  onInvalidCapture?: DOMHandler<P, V, E, FormEvent>;

  // Image Events
  onLoad?: DOMHandler<P, V, E, SyntheticEvent>;
  onLoadCapture?: DOMHandler<P, V, E, SyntheticEvent>;

  // Keyboard Events
  onKeyDown?: DOMHandler<P, V, E, KeyboardEvent>;
  onKeyDownCapture?: DOMHandler<P, V, E, KeyboardEvent>;
  onKeyPress?: DOMHandler<P, V, E, KeyboardEvent>;
  onKeyPressCapture?: DOMHandler<P, V, E, KeyboardEvent>;
  onKeyUp?: DOMHandler<P, V, E, KeyboardEvent>;
  onKeyUpCapture?: DOMHandler<P, V, E, KeyboardEvent>;

  // Media Events
  onAbort?: DOMHandler<P, V, E, SyntheticEvent>;
  onAbortCapture?: DOMHandler<P, V, E, SyntheticEvent>;
  onCanPlay?: DOMHandler<P, V, E, SyntheticEvent>;
  onCanPlayCapture?: DOMHandler<P, V, E, SyntheticEvent>;
  onCanPlayThrough?: DOMHandler<P, V, E, SyntheticEvent>;
  onCanPlayThroughCapture?: DOMHandler<P, V, E, SyntheticEvent>;
  onDurationChange?: DOMHandler<P, V, E, SyntheticEvent>;
  onDurationChangeCapture?: DOMHandler<P, V, E, SyntheticEvent>;
  onEmptied?: DOMHandler<P, V, E, SyntheticEvent>;
  onEmptiedCapture?: DOMHandler<P, V, E, SyntheticEvent>;
  onEncrypted?: DOMHandler<P, V, E, SyntheticEvent>;
  onEncryptedCapture?: DOMHandler<P, V, E, SyntheticEvent>;
  onEnded?: DOMHandler<P, V, E, SyntheticEvent>;
  onEndedCapture?: DOMHandler<P, V, E, SyntheticEvent>;
  onLoadedData?: DOMHandler<P, V, E, SyntheticEvent>;
  onLoadedDataCapture?: DOMHandler<P, V, E, SyntheticEvent>;
  onLoadedMetadata?: DOMHandler<P, V, E, SyntheticEvent>;
  onLoadedMetadataCapture?: DOMHandler<P, V, E, SyntheticEvent>;
  onLoadStart?: DOMHandler<P, V, E, SyntheticEvent>;
  onLoadStartCapture?: DOMHandler<P, V, E, SyntheticEvent>;
  onPause?: DOMHandler<P, V, E, SyntheticEvent>;
  onPauseCapture?: DOMHandler<P, V, E, SyntheticEvent>;
  onPlay?: DOMHandler<P, V, E, SyntheticEvent>;
  onPlayCapture?: DOMHandler<P, V, E, SyntheticEvent>;
  onPlaying?: DOMHandler<P, V, E, SyntheticEvent>;
  onPlayingCapture?: DOMHandler<P, V, E, SyntheticEvent>;
  onProgress?: DOMHandler<P, V, E, SyntheticEvent>;
  onProgressCapture?: DOMHandler<P, V, E, SyntheticEvent>;
  onRateChange?: DOMHandler<P, V, E, SyntheticEvent>;
  onRateChangeCapture?: DOMHandler<P, V, E, SyntheticEvent>;
  onSeeked?: DOMHandler<P, V, E, SyntheticEvent>;
  onSeekedCapture?: DOMHandler<P, V, E, SyntheticEvent>;
  onSeeking?: DOMHandler<P, V, E, SyntheticEvent>;
  onSeekingCapture?: DOMHandler<P, V, E, SyntheticEvent>;
  onStalled?: DOMHandler<P, V, E, SyntheticEvent>;
  onStalledCapture?: DOMHandler<P, V, E, SyntheticEvent>;
  onSuspend?: DOMHandler<P, V, E, SyntheticEvent>;
  onSuspendCapture?: DOMHandler<P, V, E, SyntheticEvent>;
  onTimeUpdate?: DOMHandler<P, V, E, SyntheticEvent>;
  onTimeUpdateCapture?: DOMHandler<P, V, E, SyntheticEvent>;
  onVolumeChange?: DOMHandler<P, V, E, SyntheticEvent>;
  onVolumeChangeCapture?: DOMHandler<P, V, E, SyntheticEvent>;
  onWaiting?: DOMHandler<P, V, E, SyntheticEvent>;
  onWaitingCapture?: DOMHandler<P, V, E, SyntheticEvent>;

  // MouseEvents
  onAuxClick?: DOMHandler<P, V, E, MouseEvent>;
  onAuxClickCapture?: DOMHandler<P, V, E, MouseEvent>;
  onClick?: DOMHandler<P, V, E, MouseEvent>;
  onClickCapture?: DOMHandler<P, V, E, MouseEvent>;
  onContextMenu?: DOMHandler<P, V, E, MouseEvent>;
  onContextMenuCapture?: DOMHandler<P, V, E, MouseEvent>;
  onDoubleClick?: DOMHandler<P, V, E, MouseEvent>;
  onDoubleClickCapture?: DOMHandler<P, V, E, MouseEvent>;
  onDrag?: DOMHandler<P, V, E, DragEvent>;
  onDragCapture?: DOMHandler<P, V, E, DragEvent>;
  onDragEnd?: DOMHandler<P, V, E, DragEvent>;
  onDragEndCapture?: DOMHandler<P, V, E, DragEvent>;
  onDragEnter?: DOMHandler<P, V, E, DragEvent>;
  onDragEnterCapture?: DOMHandler<P, V, E, DragEvent>;
  onDragExit?: DOMHandler<P, V, E, DragEvent>;
  onDragExitCapture?: DOMHandler<P, V, E, DragEvent>;
  onDragLeave?: DOMHandler<P, V, E, DragEvent>;
  onDragLeaveCapture?: DOMHandler<P, V, E, DragEvent>;
  onDragOver?: DOMHandler<P, V, E, DragEvent>;
  onDragOverCapture?: DOMHandler<P, V, E, DragEvent>;
  onDragStart?: DOMHandler<P, V, E, DragEvent>;
  onDragStartCapture?: DOMHandler<P, V, E, DragEvent>;
  onDrop?: DOMHandler<P, V, E, DragEvent>;
  onDropCapture?: DOMHandler<P, V, E, DragEvent>;
  onMouseDown?: DOMHandler<P, V, E, MouseEvent>;
  onMouseDownCapture?: DOMHandler<P, V, E, MouseEvent>;
  onMouseEnter?: DOMHandler<P, V, E, MouseEvent>;
  onMouseLeave?: DOMHandler<P, V, E, MouseEvent>;
  onMouseMove?: DOMHandler<P, V, E, MouseEvent>;
  onMouseMoveCapture?: DOMHandler<P, V, E, MouseEvent>;
  onMouseOut?: DOMHandler<P, V, E, MouseEvent>;
  onMouseOutCapture?: DOMHandler<P, V, E, MouseEvent>;
  onMouseOver?: DOMHandler<P, V, E, MouseEvent>;
  onMouseOverCapture?: DOMHandler<P, V, E, MouseEvent>;
  onMouseUp?: DOMHandler<P, V, E, MouseEvent>;
  onMouseUpCapture?: DOMHandler<P, V, E, MouseEvent>;

  // Selection Events
  onSelect?: DOMHandler<P, V, E, SyntheticEvent>;
  onSelectCapture?: DOMHandler<P, V, E, SyntheticEvent>;

  // Touch Events
  onTouchCancel?: DOMHandler<P, V, E, TouchEvent>;
  onTouchCancelCapture?: DOMHandler<P, V, E, TouchEvent>;
  onTouchEnd?: DOMHandler<P, V, E, TouchEvent>;
  onTouchEndCapture?: DOMHandler<P, V, E, TouchEvent>;
  onTouchMove?: DOMHandler<P, V, E, TouchEvent>;
  onTouchMoveCapture?: DOMHandler<P, V, E, TouchEvent>;
  onTouchStart?: DOMHandler<P, V, E, TouchEvent>;
  onTouchStartCapture?: DOMHandler<P, V, E, TouchEvent>;

  // Pointer Events
  onPointerDown?: DOMHandler<P, V, E, PointerEvent>;
  onPointerDownCapture?: DOMHandler<P, V, E, PointerEvent>;
  onPointerMove?: DOMHandler<P, V, E, PointerEvent>;
  onPointerMoveCapture?: DOMHandler<P, V, E, PointerEvent>;
  onPointerUp?: DOMHandler<P, V, E, PointerEvent>;
  onPointerUpCapture?: DOMHandler<P, V, E, PointerEvent>;
  onPointerCancel?: DOMHandler<P, V, E, PointerEvent>;
  onPointerCancelCapture?: DOMHandler<P, V, E, PointerEvent>;
  onPointerEnter?: DOMHandler<P, V, E, PointerEvent>;
  onPointerEnterCapture?: DOMHandler<P, V, E, PointerEvent>;
  onPointerLeave?: DOMHandler<P, V, E, PointerEvent>;
  onPointerLeaveCapture?: DOMHandler<P, V, E, PointerEvent>;
  onPointerOver?: DOMHandler<P, V, E, PointerEvent>;
  onPointerOverCapture?: DOMHandler<P, V, E, PointerEvent>;
  onPointerOut?: DOMHandler<P, V, E, PointerEvent>;
  onPointerOutCapture?: DOMHandler<P, V, E, PointerEvent>;
  onGotPointerCapture?: DOMHandler<P, V, E, PointerEvent>;
  onGotPointerCaptureCapture?: DOMHandler<P, V, E, PointerEvent>;
  onLostPointerCapture?: DOMHandler<P, V, E, PointerEvent>;
  onLostPointerCaptureCapture?: DOMHandler<P, V, E, PointerEvent>;

  // UI Events
  onScroll?: DOMHandler<P, V, E, UIEvent>;
  onScrollCapture?: DOMHandler<P, V, E, UIEvent>;

  // Wheel Events
  onWheel?: DOMHandler<P, V, E, WheelEvent>;
  onWheelCapture?: DOMHandler<P, V, E, WheelEvent>;

  // Animation Events
  onAnimationStart?: DOMHandler<P, V, E, AnimationEvent>;
  onAnimationStartCapture?: DOMHandler<P, V, E, AnimationEvent>;
  onAnimationEnd?: DOMHandler<P, V, E, AnimationEvent>;
  onAnimationEndCapture?: DOMHandler<P, V, E, AnimationEvent>;
  onAnimationIteration?: DOMHandler<P, V, E, AnimationEvent>;
  onAnimationIterationCapture?: DOMHandler<P, V, E, AnimationEvent>;

  // Transition Events
  onTransitionEnd?: DOMHandler<P, V, E, TransitionEvent>;
  onTransitionEndCapture?: DOMHandler<P, V, E, TransitionEvent>;
}
