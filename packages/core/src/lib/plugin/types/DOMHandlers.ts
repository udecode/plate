import type React from 'react';

import type {
  AnyPluginConfig,
  EditorPluginContext,
  PluginConfig,
} from './PlatePlugin';

/** If true, the next handlers will be skipped. */
export type HandlerReturnType = boolean | void;

export type DOMHandler<C extends AnyPluginConfig = PluginConfig, EV = {}> = (
  ctx: {
    event: EV;
  } & EditorPluginContext<C>
) => HandlerReturnType;

export interface DOMHandlers<C extends AnyPluginConfig = PluginConfig> {
  // Media Events
  onAbort?: DOMHandler<C, React.SyntheticEvent>;
  onAbortCapture?: DOMHandler<C, React.SyntheticEvent>;
  onAnimationEnd?: DOMHandler<C, React.AnimationEvent>;
  onAnimationEndCapture?: DOMHandler<C, React.AnimationEvent>;
  onAnimationIteration?: DOMHandler<C, React.AnimationEvent>;
  onAnimationIterationCapture?: DOMHandler<C, React.AnimationEvent>;

  // Animation Events
  onAnimationStart?: DOMHandler<C, React.AnimationEvent>;
  onAnimationStartCapture?: DOMHandler<C, React.AnimationEvent>;
  // React.MouseEvents
  onAuxClick?: DOMHandler<C, React.MouseEvent>;
  onAuxClickCapture?: DOMHandler<C, React.MouseEvent>;
  onBeforeInput?: DOMHandler<C, React.FormEvent>;
  onBeforeInputCapture?: DOMHandler<C, React.FormEvent>;

  onBlur?: DOMHandler<C, React.FocusEvent>;
  onBlurCapture?: DOMHandler<C, React.FocusEvent>;
  onCanPlay?: DOMHandler<C, React.SyntheticEvent>;
  onCanPlayCapture?: DOMHandler<C, React.SyntheticEvent>;

  onCanPlayThrough?: DOMHandler<C, React.SyntheticEvent>;
  onCanPlayThroughCapture?: DOMHandler<C, React.SyntheticEvent>;
  onClick?: DOMHandler<C, React.MouseEvent>;
  onClickCapture?: DOMHandler<C, React.MouseEvent>;
  // Composition Events
  onCompositionEnd?: DOMHandler<C, React.CompositionEvent>;
  onCompositionEndCapture?: DOMHandler<C, React.CompositionEvent>;
  onCompositionStart?: DOMHandler<C, React.CompositionEvent>;
  onCompositionStartCapture?: DOMHandler<C, React.CompositionEvent>;
  onCompositionUpdate?: DOMHandler<C, React.CompositionEvent>;
  onCompositionUpdateCapture?: DOMHandler<C, React.CompositionEvent>;
  onContextMenu?: DOMHandler<C, React.MouseEvent>;

  onContextMenuCapture?: DOMHandler<C, React.MouseEvent>;
  // Clipboard Events
  onCopy?: DOMHandler<C, React.ClipboardEvent>;

  onCopyCapture?: DOMHandler<C, React.ClipboardEvent>;
  onCut?: DOMHandler<C, React.ClipboardEvent>;
  onCutCapture?: DOMHandler<C, React.ClipboardEvent>;
  // Form Events
  onDOMBeforeInput?: DOMHandler<C, Event>;
  onDoubleClick?: DOMHandler<C, React.MouseEvent>;
  onDoubleClickCapture?: DOMHandler<C, React.MouseEvent>;

  onDrag?: DOMHandler<C, React.DragEvent>;
  onDragCapture?: DOMHandler<C, React.DragEvent>;
  onDragEnd?: DOMHandler<C, React.DragEvent>;
  onDragEndCapture?: DOMHandler<C, React.DragEvent>;
  onDragEnter?: DOMHandler<C, React.DragEvent>;
  onDragEnterCapture?: DOMHandler<C, React.DragEvent>;
  onDragExit?: DOMHandler<C, React.DragEvent>;
  onDragExitCapture?: DOMHandler<C, React.DragEvent>;
  onDragLeave?: DOMHandler<C, React.DragEvent>;
  onDragLeaveCapture?: DOMHandler<C, React.DragEvent>;
  onDragOver?: DOMHandler<C, React.DragEvent>;
  onDragOverCapture?: DOMHandler<C, React.DragEvent>;
  onDragStart?: DOMHandler<C, React.DragEvent>;
  onDragStartCapture?: DOMHandler<C, React.DragEvent>;
  onDrop?: DOMHandler<C, React.DragEvent>;
  onDropCapture?: DOMHandler<C, React.DragEvent>;
  onDurationChange?: DOMHandler<C, React.SyntheticEvent>;
  onDurationChangeCapture?: DOMHandler<C, React.SyntheticEvent>;
  onEmptied?: DOMHandler<C, React.SyntheticEvent>;
  onEmptiedCapture?: DOMHandler<C, React.SyntheticEvent>;
  onEncrypted?: DOMHandler<C, React.SyntheticEvent>;
  onEncryptedCapture?: DOMHandler<C, React.SyntheticEvent>;
  onEnded?: DOMHandler<C, React.SyntheticEvent>;
  onEndedCapture?: DOMHandler<C, React.SyntheticEvent>;
  // Focus Events
  onFocus?: DOMHandler<C, React.FocusEvent>;
  onFocusCapture?: DOMHandler<C, React.FocusEvent>;
  onGotPointerCapture?: DOMHandler<C, React.PointerEvent>;
  onGotPointerCaptureCapture?: DOMHandler<C, React.PointerEvent>;
  onInput?: DOMHandler<C, React.FormEvent>;
  onInputCapture?: DOMHandler<C, React.FormEvent>;
  onInvalid?: DOMHandler<C, React.FormEvent>;
  onInvalidCapture?: DOMHandler<C, React.FormEvent>;
  // Keyboard Events
  onKeyDown?: DOMHandler<C, React.KeyboardEvent>;
  onKeyDownCapture?: DOMHandler<C, React.KeyboardEvent>;
  onKeyPress?: DOMHandler<C, React.KeyboardEvent>;
  onKeyPressCapture?: DOMHandler<C, React.KeyboardEvent>;
  onKeyUp?: DOMHandler<C, React.KeyboardEvent>;
  onKeyUpCapture?: DOMHandler<C, React.KeyboardEvent>;
  // Image Events
  onLoad?: DOMHandler<C, React.SyntheticEvent>;
  onLoadCapture?: DOMHandler<C, React.SyntheticEvent>;
  onLoadStart?: DOMHandler<C, React.SyntheticEvent>;
  onLoadStartCapture?: DOMHandler<C, React.SyntheticEvent>;
  onLoadedData?: DOMHandler<C, React.SyntheticEvent>;
  onLoadedDataCapture?: DOMHandler<C, React.SyntheticEvent>;

  onLoadedMetadata?: DOMHandler<C, React.SyntheticEvent>;
  onLoadedMetadataCapture?: DOMHandler<C, React.SyntheticEvent>;
  onLostPointerCapture?: DOMHandler<C, React.PointerEvent>;
  onLostPointerCaptureCapture?: DOMHandler<C, React.PointerEvent>;
  onMouseDown?: DOMHandler<C, React.MouseEvent>;
  onMouseDownCapture?: DOMHandler<C, React.MouseEvent>;
  onMouseEnter?: DOMHandler<C, React.MouseEvent>;
  onMouseLeave?: DOMHandler<C, React.MouseEvent>;
  onMouseMove?: DOMHandler<C, React.MouseEvent>;
  onMouseMoveCapture?: DOMHandler<C, React.MouseEvent>;
  onMouseOut?: DOMHandler<C, React.MouseEvent>;
  onMouseOutCapture?: DOMHandler<C, React.MouseEvent>;
  onMouseOver?: DOMHandler<C, React.MouseEvent>;
  onMouseOverCapture?: DOMHandler<C, React.MouseEvent>;
  onMouseUp?: DOMHandler<C, React.MouseEvent>;
  onMouseUpCapture?: DOMHandler<C, React.MouseEvent>;
  onPaste?: DOMHandler<C, React.ClipboardEvent>;
  onPasteCapture?: DOMHandler<C, React.ClipboardEvent>;
  onPause?: DOMHandler<C, React.SyntheticEvent>;
  onPauseCapture?: DOMHandler<C, React.SyntheticEvent>;
  onPlay?: DOMHandler<C, React.SyntheticEvent>;
  onPlayCapture?: DOMHandler<C, React.SyntheticEvent>;
  onPlaying?: DOMHandler<C, React.SyntheticEvent>;
  onPlayingCapture?: DOMHandler<C, React.SyntheticEvent>;
  onPointerCancel?: DOMHandler<C, React.PointerEvent>;
  onPointerCancelCapture?: DOMHandler<C, React.PointerEvent>;
  // Pointer Events
  onPointerDown?: DOMHandler<C, React.PointerEvent>;
  onPointerDownCapture?: DOMHandler<C, React.PointerEvent>;
  onPointerEnter?: DOMHandler<C, React.PointerEvent>;
  onPointerLeave?: DOMHandler<C, React.PointerEvent>;
  onPointerMove?: DOMHandler<C, React.PointerEvent>;
  onPointerMoveCapture?: DOMHandler<C, React.PointerEvent>;
  onPointerOut?: DOMHandler<C, React.PointerEvent>;
  onPointerOutCapture?: DOMHandler<C, React.PointerEvent>;
  onPointerOver?: DOMHandler<C, React.PointerEvent>;
  onPointerOverCapture?: DOMHandler<C, React.PointerEvent>;

  onPointerUp?: DOMHandler<C, React.PointerEvent>;
  onPointerUpCapture?: DOMHandler<C, React.PointerEvent>;

  onProgress?: DOMHandler<C, React.SyntheticEvent>;
  onProgressCapture?: DOMHandler<C, React.SyntheticEvent>;
  onRateChange?: DOMHandler<C, React.SyntheticEvent>;
  onRateChangeCapture?: DOMHandler<C, React.SyntheticEvent>;
  onReset?: DOMHandler<C, React.FormEvent>;
  onResetCapture?: DOMHandler<C, React.FormEvent>;
  // UI Events
  onScroll?: DOMHandler<C, React.UIEvent>;
  onScrollCapture?: DOMHandler<C, React.UIEvent>;

  onSeeked?: DOMHandler<C, React.SyntheticEvent>;
  onSeekedCapture?: DOMHandler<C, React.SyntheticEvent>;
  onSeeking?: DOMHandler<C, React.SyntheticEvent>;
  onSeekingCapture?: DOMHandler<C, React.SyntheticEvent>;
  // Selection Events
  onSelect?: DOMHandler<C, React.SyntheticEvent>;
  onSelectCapture?: DOMHandler<C, React.SyntheticEvent>;
  onStalled?: DOMHandler<C, React.SyntheticEvent>;
  onStalledCapture?: DOMHandler<C, React.SyntheticEvent>;
  onSubmit?: DOMHandler<C, React.FormEvent>;
  onSubmitCapture?: DOMHandler<C, React.FormEvent>;
  onSuspend?: DOMHandler<C, React.SyntheticEvent>;
  onSuspendCapture?: DOMHandler<C, React.SyntheticEvent>;
  onTimeUpdate?: DOMHandler<C, React.SyntheticEvent>;
  onTimeUpdateCapture?: DOMHandler<C, React.SyntheticEvent>;
  // Touch Events
  onTouchCancel?: DOMHandler<C, React.TouchEvent>;
  onTouchCancelCapture?: DOMHandler<C, React.TouchEvent>;
  onTouchEnd?: DOMHandler<C, React.TouchEvent>;
  onTouchEndCapture?: DOMHandler<C, React.TouchEvent>;

  onTouchMove?: DOMHandler<C, React.TouchEvent>;
  onTouchMoveCapture?: DOMHandler<C, React.TouchEvent>;

  onTouchStart?: DOMHandler<C, React.TouchEvent>;
  onTouchStartCapture?: DOMHandler<C, React.TouchEvent>;

  // Transition Events
  onTransitionEnd?: DOMHandler<C, React.TransitionEvent>;
  onTransitionEndCapture?: DOMHandler<C, React.TransitionEvent>;
  onVolumeChange?: DOMHandler<C, React.SyntheticEvent>;
  onVolumeChangeCapture?: DOMHandler<C, React.SyntheticEvent>;
  onWaiting?: DOMHandler<C, React.SyntheticEvent>;
  onWaitingCapture?: DOMHandler<C, React.SyntheticEvent>;

  // Wheel Events
  onWheel?: DOMHandler<C, React.WheelEvent>;
  onWheelCapture?: DOMHandler<C, React.WheelEvent>;
}
