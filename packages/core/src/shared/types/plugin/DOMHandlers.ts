import type React from 'react';

import type { PlateEditor } from '../PlateEditor';
import type { PlatePlugin } from './PlatePlugin';

/** If true, the next handlers will be skipped. */
export type HandlerReturnType = boolean | void;

export type KeyboardEventHandler = (
  event: React.KeyboardEvent
) => HandlerReturnType;

export type DOMHandlerReturnType<EV = {}> = (event: EV) => HandlerReturnType;

export type DOMHandler<O = {}, T = {}, Q = {}, S = {}, EV = {}> = (
  editor: PlateEditor,
  plugin: PlatePlugin<O, T, Q, S>
) => DOMHandlerReturnType<EV>;

export interface DOMHandlers<O = {}, T = {}, Q = {}, S = {}> {
  // Media Events
  onAbort?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onAbortCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onAnimationEnd?: DOMHandler<O, T, Q, S, React.AnimationEvent>;
  onAnimationEndCapture?: DOMHandler<O, T, Q, S, React.AnimationEvent>;
  onAnimationIteration?: DOMHandler<O, T, Q, S, React.AnimationEvent>;
  onAnimationIterationCapture?: DOMHandler<O, T, Q, S, React.AnimationEvent>;

  // Animation Events
  onAnimationStart?: DOMHandler<O, T, Q, S, React.AnimationEvent>;
  onAnimationStartCapture?: DOMHandler<O, T, Q, S, React.AnimationEvent>;
  // React.MouseEvents
  onAuxClick?: DOMHandler<O, T, Q, S, React.MouseEvent>;
  onAuxClickCapture?: DOMHandler<O, T, Q, S, React.MouseEvent>;
  onBeforeInput?: DOMHandler<O, T, Q, S, React.FormEvent>;
  onBeforeInputCapture?: DOMHandler<O, T, Q, S, React.FormEvent>;

  onBlur?: DOMHandler<O, T, Q, S, React.FocusEvent>;
  onBlurCapture?: DOMHandler<O, T, Q, S, React.FocusEvent>;
  onCanPlay?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onCanPlayCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;

  onCanPlayThrough?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onCanPlayThroughCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onClick?: DOMHandler<O, T, Q, S, React.MouseEvent>;
  onClickCapture?: DOMHandler<O, T, Q, S, React.MouseEvent>;
  // Composition Events
  onCompositionEnd?: DOMHandler<O, T, Q, S, React.CompositionEvent>;
  onCompositionEndCapture?: DOMHandler<O, T, Q, S, React.CompositionEvent>;
  onCompositionStart?: DOMHandler<O, T, Q, S, React.CompositionEvent>;
  onCompositionStartCapture?: DOMHandler<O, T, Q, S, React.CompositionEvent>;
  onCompositionUpdate?: DOMHandler<O, T, Q, S, React.CompositionEvent>;
  onCompositionUpdateCapture?: DOMHandler<O, T, Q, S, React.CompositionEvent>;
  onContextMenu?: DOMHandler<O, T, Q, S, React.MouseEvent>;

  onContextMenuCapture?: DOMHandler<O, T, Q, S, React.MouseEvent>;
  // Clipboard Events
  onCopy?: DOMHandler<O, T, Q, S, React.ClipboardEvent>;

  onCopyCapture?: DOMHandler<O, T, Q, S, React.ClipboardEvent>;
  onCut?: DOMHandler<O, T, Q, S, React.ClipboardEvent>;
  onCutCapture?: DOMHandler<O, T, Q, S, React.ClipboardEvent>;
  // Form Events
  onDOMBeforeInput?: DOMHandler<O, T, Q, S, Event>;
  onDoubleClick?: DOMHandler<O, T, Q, S, React.MouseEvent>;
  onDoubleClickCapture?: DOMHandler<O, T, Q, S, React.MouseEvent>;

  onDrag?: DOMHandler<O, T, Q, S, React.DragEvent>;
  onDragCapture?: DOMHandler<O, T, Q, S, React.DragEvent>;
  onDragEnd?: DOMHandler<O, T, Q, S, React.DragEvent>;
  onDragEndCapture?: DOMHandler<O, T, Q, S, React.DragEvent>;
  onDragEnter?: DOMHandler<O, T, Q, S, React.DragEvent>;
  onDragEnterCapture?: DOMHandler<O, T, Q, S, React.DragEvent>;
  onDragExit?: DOMHandler<O, T, Q, S, React.DragEvent>;
  onDragExitCapture?: DOMHandler<O, T, Q, S, React.DragEvent>;
  onDragLeave?: DOMHandler<O, T, Q, S, React.DragEvent>;
  onDragLeaveCapture?: DOMHandler<O, T, Q, S, React.DragEvent>;
  onDragOver?: DOMHandler<O, T, Q, S, React.DragEvent>;
  onDragOverCapture?: DOMHandler<O, T, Q, S, React.DragEvent>;
  onDragStart?: DOMHandler<O, T, Q, S, React.DragEvent>;
  onDragStartCapture?: DOMHandler<O, T, Q, S, React.DragEvent>;
  onDrop?: DOMHandler<O, T, Q, S, React.DragEvent>;
  onDropCapture?: DOMHandler<O, T, Q, S, React.DragEvent>;
  onDurationChange?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onDurationChangeCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onEmptied?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onEmptiedCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onEncrypted?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onEncryptedCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onEnded?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onEndedCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  // Focus Events
  onFocus?: DOMHandler<O, T, Q, S, React.FocusEvent>;
  onFocusCapture?: DOMHandler<O, T, Q, S, React.FocusEvent>;
  onGotPointerCapture?: DOMHandler<O, T, Q, S, React.PointerEvent>;
  onGotPointerCaptureCapture?: DOMHandler<O, T, Q, S, React.PointerEvent>;
  onInput?: DOMHandler<O, T, Q, S, React.FormEvent>;
  onInputCapture?: DOMHandler<O, T, Q, S, React.FormEvent>;
  onInvalid?: DOMHandler<O, T, Q, S, React.FormEvent>;
  onInvalidCapture?: DOMHandler<O, T, Q, S, React.FormEvent>;
  // Keyboard Events
  onKeyDown?: DOMHandler<O, T, Q, S, React.KeyboardEvent>;
  onKeyDownCapture?: DOMHandler<O, T, Q, S, React.KeyboardEvent>;
  onKeyPress?: DOMHandler<O, T, Q, S, React.KeyboardEvent>;
  onKeyPressCapture?: DOMHandler<O, T, Q, S, React.KeyboardEvent>;
  onKeyUp?: DOMHandler<O, T, Q, S, React.KeyboardEvent>;
  onKeyUpCapture?: DOMHandler<O, T, Q, S, React.KeyboardEvent>;
  // Image Events
  onLoad?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onLoadCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onLoadStart?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onLoadStartCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onLoadedData?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onLoadedDataCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;

  onLoadedMetadata?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onLoadedMetadataCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onLostPointerCapture?: DOMHandler<O, T, Q, S, React.PointerEvent>;
  onLostPointerCaptureCapture?: DOMHandler<O, T, Q, S, React.PointerEvent>;
  onMouseDown?: DOMHandler<O, T, Q, S, React.MouseEvent>;
  onMouseDownCapture?: DOMHandler<O, T, Q, S, React.MouseEvent>;
  onMouseEnter?: DOMHandler<O, T, Q, S, React.MouseEvent>;
  onMouseLeave?: DOMHandler<O, T, Q, S, React.MouseEvent>;
  onMouseMove?: DOMHandler<O, T, Q, S, React.MouseEvent>;
  onMouseMoveCapture?: DOMHandler<O, T, Q, S, React.MouseEvent>;
  onMouseOut?: DOMHandler<O, T, Q, S, React.MouseEvent>;
  onMouseOutCapture?: DOMHandler<O, T, Q, S, React.MouseEvent>;
  onMouseOver?: DOMHandler<O, T, Q, S, React.MouseEvent>;
  onMouseOverCapture?: DOMHandler<O, T, Q, S, React.MouseEvent>;
  onMouseUp?: DOMHandler<O, T, Q, S, React.MouseEvent>;
  onMouseUpCapture?: DOMHandler<O, T, Q, S, React.MouseEvent>;
  onPaste?: DOMHandler<O, T, Q, S, React.ClipboardEvent>;
  onPasteCapture?: DOMHandler<O, T, Q, S, React.ClipboardEvent>;
  onPause?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onPauseCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onPlay?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onPlayCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onPlaying?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onPlayingCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onPointerCancel?: DOMHandler<O, T, Q, S, React.PointerEvent>;
  onPointerCancelCapture?: DOMHandler<O, T, Q, S, React.PointerEvent>;
  // Pointer Events
  onPointerDown?: DOMHandler<O, T, Q, S, React.PointerEvent>;
  onPointerDownCapture?: DOMHandler<O, T, Q, S, React.PointerEvent>;
  onPointerEnter?: DOMHandler<O, T, Q, S, React.PointerEvent>;
  onPointerLeave?: DOMHandler<O, T, Q, S, React.PointerEvent>;
  onPointerMove?: DOMHandler<O, T, Q, S, React.PointerEvent>;
  onPointerMoveCapture?: DOMHandler<O, T, Q, S, React.PointerEvent>;
  onPointerOut?: DOMHandler<O, T, Q, S, React.PointerEvent>;
  onPointerOutCapture?: DOMHandler<O, T, Q, S, React.PointerEvent>;
  onPointerOver?: DOMHandler<O, T, Q, S, React.PointerEvent>;
  onPointerOverCapture?: DOMHandler<O, T, Q, S, React.PointerEvent>;

  onPointerUp?: DOMHandler<O, T, Q, S, React.PointerEvent>;
  onPointerUpCapture?: DOMHandler<O, T, Q, S, React.PointerEvent>;

  onProgress?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onProgressCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onRateChange?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onRateChangeCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onReset?: DOMHandler<O, T, Q, S, React.FormEvent>;
  onResetCapture?: DOMHandler<O, T, Q, S, React.FormEvent>;
  // UI Events
  onScroll?: DOMHandler<O, T, Q, S, React.UIEvent>;
  onScrollCapture?: DOMHandler<O, T, Q, S, React.UIEvent>;

  onSeeked?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onSeekedCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onSeeking?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onSeekingCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  // Selection Events
  onSelect?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onSelectCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onStalled?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onStalledCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onSubmit?: DOMHandler<O, T, Q, S, React.FormEvent>;
  onSubmitCapture?: DOMHandler<O, T, Q, S, React.FormEvent>;
  onSuspend?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onSuspendCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onTimeUpdate?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onTimeUpdateCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  // Touch Events
  onTouchCancel?: DOMHandler<O, T, Q, S, React.TouchEvent>;
  onTouchCancelCapture?: DOMHandler<O, T, Q, S, React.TouchEvent>;
  onTouchEnd?: DOMHandler<O, T, Q, S, React.TouchEvent>;
  onTouchEndCapture?: DOMHandler<O, T, Q, S, React.TouchEvent>;

  onTouchMove?: DOMHandler<O, T, Q, S, React.TouchEvent>;
  onTouchMoveCapture?: DOMHandler<O, T, Q, S, React.TouchEvent>;

  onTouchStart?: DOMHandler<O, T, Q, S, React.TouchEvent>;
  onTouchStartCapture?: DOMHandler<O, T, Q, S, React.TouchEvent>;

  // Transition Events
  onTransitionEnd?: DOMHandler<O, T, Q, S, React.TransitionEvent>;
  onTransitionEndCapture?: DOMHandler<O, T, Q, S, React.TransitionEvent>;
  onVolumeChange?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onVolumeChangeCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onWaiting?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;
  onWaitingCapture?: DOMHandler<O, T, Q, S, React.SyntheticEvent>;

  // Wheel Events
  onWheel?: DOMHandler<O, T, Q, S, React.WheelEvent>;
  onWheelCapture?: DOMHandler<O, T, Q, S, React.WheelEvent>;
}
