import type React from 'react';

import type { EditorPluginContext } from './PlatePlugin';

/** If true, the next handlers will be skipped. */
export type HandlerReturnType = boolean | void;

export type DOMHandler<O = {}, A = {}, T = {}, S = {}, EV = {}> = (
  ctx: {
    event: EV;
  } & EditorPluginContext<O, A, T, S>
) => HandlerReturnType;

export interface DOMHandlers<O = {}, A = {}, T = {}, S = {}> {
  // Media Events
  onAbort?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onAbortCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onAnimationEnd?: DOMHandler<O, A, T, S, React.AnimationEvent>;
  onAnimationEndCapture?: DOMHandler<O, A, T, S, React.AnimationEvent>;
  onAnimationIteration?: DOMHandler<O, A, T, S, React.AnimationEvent>;
  onAnimationIterationCapture?: DOMHandler<O, A, T, S, React.AnimationEvent>;

  // Animation Events
  onAnimationStart?: DOMHandler<O, A, T, S, React.AnimationEvent>;
  onAnimationStartCapture?: DOMHandler<O, A, T, S, React.AnimationEvent>;
  // React.MouseEvents
  onAuxClick?: DOMHandler<O, A, T, S, React.MouseEvent>;
  onAuxClickCapture?: DOMHandler<O, A, T, S, React.MouseEvent>;
  onBeforeInput?: DOMHandler<O, A, T, S, React.FormEvent>;
  onBeforeInputCapture?: DOMHandler<O, A, T, S, React.FormEvent>;

  onBlur?: DOMHandler<O, A, T, S, React.FocusEvent>;
  onBlurCapture?: DOMHandler<O, A, T, S, React.FocusEvent>;
  onCanPlay?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onCanPlayCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;

  onCanPlayThrough?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onCanPlayThroughCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onClick?: DOMHandler<O, A, T, S, React.MouseEvent>;
  onClickCapture?: DOMHandler<O, A, T, S, React.MouseEvent>;
  // Composition Events
  onCompositionEnd?: DOMHandler<O, A, T, S, React.CompositionEvent>;
  onCompositionEndCapture?: DOMHandler<O, A, T, S, React.CompositionEvent>;
  onCompositionStart?: DOMHandler<O, A, T, S, React.CompositionEvent>;
  onCompositionStartCapture?: DOMHandler<O, A, T, S, React.CompositionEvent>;
  onCompositionUpdate?: DOMHandler<O, A, T, S, React.CompositionEvent>;
  onCompositionUpdateCapture?: DOMHandler<O, A, T, S, React.CompositionEvent>;
  onContextMenu?: DOMHandler<O, A, T, S, React.MouseEvent>;

  onContextMenuCapture?: DOMHandler<O, A, T, S, React.MouseEvent>;
  // Clipboard Events
  onCopy?: DOMHandler<O, A, T, S, React.ClipboardEvent>;

  onCopyCapture?: DOMHandler<O, A, T, S, React.ClipboardEvent>;
  onCut?: DOMHandler<O, A, T, S, React.ClipboardEvent>;
  onCutCapture?: DOMHandler<O, A, T, S, React.ClipboardEvent>;
  // Form Events
  onDOMBeforeInput?: DOMHandler<O, A, T, S, Event>;
  onDoubleClick?: DOMHandler<O, A, T, S, React.MouseEvent>;
  onDoubleClickCapture?: DOMHandler<O, A, T, S, React.MouseEvent>;

  onDrag?: DOMHandler<O, A, T, S, React.DragEvent>;
  onDragCapture?: DOMHandler<O, A, T, S, React.DragEvent>;
  onDragEnd?: DOMHandler<O, A, T, S, React.DragEvent>;
  onDragEndCapture?: DOMHandler<O, A, T, S, React.DragEvent>;
  onDragEnter?: DOMHandler<O, A, T, S, React.DragEvent>;
  onDragEnterCapture?: DOMHandler<O, A, T, S, React.DragEvent>;
  onDragExit?: DOMHandler<O, A, T, S, React.DragEvent>;
  onDragExitCapture?: DOMHandler<O, A, T, S, React.DragEvent>;
  onDragLeave?: DOMHandler<O, A, T, S, React.DragEvent>;
  onDragLeaveCapture?: DOMHandler<O, A, T, S, React.DragEvent>;
  onDragOver?: DOMHandler<O, A, T, S, React.DragEvent>;
  onDragOverCapture?: DOMHandler<O, A, T, S, React.DragEvent>;
  onDragStart?: DOMHandler<O, A, T, S, React.DragEvent>;
  onDragStartCapture?: DOMHandler<O, A, T, S, React.DragEvent>;
  onDrop?: DOMHandler<O, A, T, S, React.DragEvent>;
  onDropCapture?: DOMHandler<O, A, T, S, React.DragEvent>;
  onDurationChange?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onDurationChangeCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onEmptied?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onEmptiedCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onEncrypted?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onEncryptedCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onEnded?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onEndedCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  // Focus Events
  onFocus?: DOMHandler<O, A, T, S, React.FocusEvent>;
  onFocusCapture?: DOMHandler<O, A, T, S, React.FocusEvent>;
  onGotPointerCapture?: DOMHandler<O, A, T, S, React.PointerEvent>;
  onGotPointerCaptureCapture?: DOMHandler<O, A, T, S, React.PointerEvent>;
  onInput?: DOMHandler<O, A, T, S, React.FormEvent>;
  onInputCapture?: DOMHandler<O, A, T, S, React.FormEvent>;
  onInvalid?: DOMHandler<O, A, T, S, React.FormEvent>;
  onInvalidCapture?: DOMHandler<O, A, T, S, React.FormEvent>;
  // Keyboard Events
  onKeyDown?: DOMHandler<O, A, T, S, React.KeyboardEvent>;
  onKeyDownCapture?: DOMHandler<O, A, T, S, React.KeyboardEvent>;
  onKeyPress?: DOMHandler<O, A, T, S, React.KeyboardEvent>;
  onKeyPressCapture?: DOMHandler<O, A, T, S, React.KeyboardEvent>;
  onKeyUp?: DOMHandler<O, A, T, S, React.KeyboardEvent>;
  onKeyUpCapture?: DOMHandler<O, A, T, S, React.KeyboardEvent>;
  // Image Events
  onLoad?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onLoadCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onLoadStart?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onLoadStartCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onLoadedData?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onLoadedDataCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;

  onLoadedMetadata?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onLoadedMetadataCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onLostPointerCapture?: DOMHandler<O, A, T, S, React.PointerEvent>;
  onLostPointerCaptureCapture?: DOMHandler<O, A, T, S, React.PointerEvent>;
  onMouseDown?: DOMHandler<O, A, T, S, React.MouseEvent>;
  onMouseDownCapture?: DOMHandler<O, A, T, S, React.MouseEvent>;
  onMouseEnter?: DOMHandler<O, A, T, S, React.MouseEvent>;
  onMouseLeave?: DOMHandler<O, A, T, S, React.MouseEvent>;
  onMouseMove?: DOMHandler<O, A, T, S, React.MouseEvent>;
  onMouseMoveCapture?: DOMHandler<O, A, T, S, React.MouseEvent>;
  onMouseOut?: DOMHandler<O, A, T, S, React.MouseEvent>;
  onMouseOutCapture?: DOMHandler<O, A, T, S, React.MouseEvent>;
  onMouseOver?: DOMHandler<O, A, T, S, React.MouseEvent>;
  onMouseOverCapture?: DOMHandler<O, A, T, S, React.MouseEvent>;
  onMouseUp?: DOMHandler<O, A, T, S, React.MouseEvent>;
  onMouseUpCapture?: DOMHandler<O, A, T, S, React.MouseEvent>;
  onPaste?: DOMHandler<O, A, T, S, React.ClipboardEvent>;
  onPasteCapture?: DOMHandler<O, A, T, S, React.ClipboardEvent>;
  onPause?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onPauseCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onPlay?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onPlayCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onPlaying?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onPlayingCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onPointerCancel?: DOMHandler<O, A, T, S, React.PointerEvent>;
  onPointerCancelCapture?: DOMHandler<O, A, T, S, React.PointerEvent>;
  // Pointer Events
  onPointerDown?: DOMHandler<O, A, T, S, React.PointerEvent>;
  onPointerDownCapture?: DOMHandler<O, A, T, S, React.PointerEvent>;
  onPointerEnter?: DOMHandler<O, A, T, S, React.PointerEvent>;
  onPointerLeave?: DOMHandler<O, A, T, S, React.PointerEvent>;
  onPointerMove?: DOMHandler<O, A, T, S, React.PointerEvent>;
  onPointerMoveCapture?: DOMHandler<O, A, T, S, React.PointerEvent>;
  onPointerOut?: DOMHandler<O, A, T, S, React.PointerEvent>;
  onPointerOutCapture?: DOMHandler<O, A, T, S, React.PointerEvent>;
  onPointerOver?: DOMHandler<O, A, T, S, React.PointerEvent>;
  onPointerOverCapture?: DOMHandler<O, A, T, S, React.PointerEvent>;

  onPointerUp?: DOMHandler<O, A, T, S, React.PointerEvent>;
  onPointerUpCapture?: DOMHandler<O, A, T, S, React.PointerEvent>;

  onProgress?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onProgressCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onRateChange?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onRateChangeCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onReset?: DOMHandler<O, A, T, S, React.FormEvent>;
  onResetCapture?: DOMHandler<O, A, T, S, React.FormEvent>;
  // UI Events
  onScroll?: DOMHandler<O, A, T, S, React.UIEvent>;
  onScrollCapture?: DOMHandler<O, A, T, S, React.UIEvent>;

  onSeeked?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onSeekedCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onSeeking?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onSeekingCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  // Selection Events
  onSelect?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onSelectCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onStalled?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onStalledCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onSubmit?: DOMHandler<O, A, T, S, React.FormEvent>;
  onSubmitCapture?: DOMHandler<O, A, T, S, React.FormEvent>;
  onSuspend?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onSuspendCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onTimeUpdate?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onTimeUpdateCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  // Touch Events
  onTouchCancel?: DOMHandler<O, A, T, S, React.TouchEvent>;
  onTouchCancelCapture?: DOMHandler<O, A, T, S, React.TouchEvent>;
  onTouchEnd?: DOMHandler<O, A, T, S, React.TouchEvent>;
  onTouchEndCapture?: DOMHandler<O, A, T, S, React.TouchEvent>;

  onTouchMove?: DOMHandler<O, A, T, S, React.TouchEvent>;
  onTouchMoveCapture?: DOMHandler<O, A, T, S, React.TouchEvent>;

  onTouchStart?: DOMHandler<O, A, T, S, React.TouchEvent>;
  onTouchStartCapture?: DOMHandler<O, A, T, S, React.TouchEvent>;

  // Transition Events
  onTransitionEnd?: DOMHandler<O, A, T, S, React.TransitionEvent>;
  onTransitionEndCapture?: DOMHandler<O, A, T, S, React.TransitionEvent>;
  onVolumeChange?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onVolumeChangeCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onWaiting?: DOMHandler<O, A, T, S, React.SyntheticEvent>;
  onWaitingCapture?: DOMHandler<O, A, T, S, React.SyntheticEvent>;

  // Wheel Events
  onWheel?: DOMHandler<O, A, T, S, React.WheelEvent>;
  onWheelCapture?: DOMHandler<O, A, T, S, React.WheelEvent>;
}
