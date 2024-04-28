import React from 'react';
import { Value } from '@udecode/slate';

import { PlateEditor } from '../PlateEditor';
import { PluginOptions, WithPlatePlugin } from './PlatePlugin';

/**
 * If true, the next handlers will be skipped.
 */
export type HandlerReturnType = boolean | void;

export type KeyboardEventHandler = (
  event: React.KeyboardEvent
) => HandlerReturnType;

export type DOMHandlerReturnType<EV = {}> = (event: EV) => HandlerReturnType;

export type DOMHandler<
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
  EV = {},
> = (editor: E, plugin: WithPlatePlugin<P, V, E>) => DOMHandlerReturnType<EV>;

export interface DOMHandlers<
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
> {
  // Clipboard Events
  onCopy?: DOMHandler<P, V, E, React.ClipboardEvent>;
  onCopyCapture?: DOMHandler<P, V, E, React.ClipboardEvent>;
  onCut?: DOMHandler<P, V, E, React.ClipboardEvent>;
  onCutCapture?: DOMHandler<P, V, E, React.ClipboardEvent>;
  onPaste?: DOMHandler<P, V, E, React.ClipboardEvent>;
  onPasteCapture?: DOMHandler<P, V, E, React.ClipboardEvent>;

  // Composition Events
  onCompositionEnd?: DOMHandler<P, V, E, React.CompositionEvent>;
  onCompositionEndCapture?: DOMHandler<P, V, E, React.CompositionEvent>;
  onCompositionStart?: DOMHandler<P, V, E, React.CompositionEvent>;
  onCompositionStartCapture?: DOMHandler<P, V, E, React.CompositionEvent>;
  onCompositionUpdate?: DOMHandler<P, V, E, React.CompositionEvent>;
  onCompositionUpdateCapture?: DOMHandler<P, V, E, React.CompositionEvent>;

  // Focus Events
  onFocus?: DOMHandler<P, V, E, React.FocusEvent>;
  onFocusCapture?: DOMHandler<P, V, E, React.FocusEvent>;
  onBlur?: DOMHandler<P, V, E, React.FocusEvent>;
  onBlurCapture?: DOMHandler<P, V, E, React.FocusEvent>;

  // Form Events
  onDOMBeforeInput?: DOMHandler<P, V, E, Event>;
  onBeforeInput?: DOMHandler<P, V, E, React.FormEvent>;
  onBeforeInputCapture?: DOMHandler<P, V, E, React.FormEvent>;
  onInput?: DOMHandler<P, V, E, React.FormEvent>;
  onInputCapture?: DOMHandler<P, V, E, React.FormEvent>;
  onReset?: DOMHandler<P, V, E, React.FormEvent>;
  onResetCapture?: DOMHandler<P, V, E, React.FormEvent>;
  onSubmit?: DOMHandler<P, V, E, React.FormEvent>;
  onSubmitCapture?: DOMHandler<P, V, E, React.FormEvent>;
  onInvalid?: DOMHandler<P, V, E, React.FormEvent>;
  onInvalidCapture?: DOMHandler<P, V, E, React.FormEvent>;

  // Image Events
  onLoad?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onLoadCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;

  // Keyboard Events
  onKeyDown?: DOMHandler<P, V, E, React.KeyboardEvent>;
  onKeyDownCapture?: DOMHandler<P, V, E, React.KeyboardEvent>;
  onKeyPress?: DOMHandler<P, V, E, React.KeyboardEvent>;
  onKeyPressCapture?: DOMHandler<P, V, E, React.KeyboardEvent>;
  onKeyUp?: DOMHandler<P, V, E, React.KeyboardEvent>;
  onKeyUpCapture?: DOMHandler<P, V, E, React.KeyboardEvent>;

  // Media Events
  onAbort?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onAbortCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onCanPlay?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onCanPlayCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onCanPlayThrough?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onCanPlayThroughCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onDurationChange?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onDurationChangeCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onEmptied?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onEmptiedCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onEncrypted?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onEncryptedCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onEnded?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onEndedCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onLoadedData?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onLoadedDataCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onLoadedMetadata?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onLoadedMetadataCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onLoadStart?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onLoadStartCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onPause?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onPauseCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onPlay?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onPlayCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onPlaying?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onPlayingCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onProgress?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onProgressCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onRateChange?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onRateChangeCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onSeeked?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onSeekedCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onSeeking?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onSeekingCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onStalled?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onStalledCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onSuspend?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onSuspendCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onTimeUpdate?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onTimeUpdateCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onVolumeChange?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onVolumeChangeCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onWaiting?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onWaitingCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;

  // React.MouseEvents
  onAuxClick?: DOMHandler<P, V, E, React.MouseEvent>;
  onAuxClickCapture?: DOMHandler<P, V, E, React.MouseEvent>;
  onClick?: DOMHandler<P, V, E, React.MouseEvent>;
  onClickCapture?: DOMHandler<P, V, E, React.MouseEvent>;
  onContextMenu?: DOMHandler<P, V, E, React.MouseEvent>;
  onContextMenuCapture?: DOMHandler<P, V, E, React.MouseEvent>;
  onDoubleClick?: DOMHandler<P, V, E, React.MouseEvent>;
  onDoubleClickCapture?: DOMHandler<P, V, E, React.MouseEvent>;
  onDrag?: DOMHandler<P, V, E, React.DragEvent>;
  onDragCapture?: DOMHandler<P, V, E, React.DragEvent>;
  onDragEnd?: DOMHandler<P, V, E, React.DragEvent>;
  onDragEndCapture?: DOMHandler<P, V, E, React.DragEvent>;
  onDragEnter?: DOMHandler<P, V, E, React.DragEvent>;
  onDragEnterCapture?: DOMHandler<P, V, E, React.DragEvent>;
  onDragExit?: DOMHandler<P, V, E, React.DragEvent>;
  onDragExitCapture?: DOMHandler<P, V, E, React.DragEvent>;
  onDragLeave?: DOMHandler<P, V, E, React.DragEvent>;
  onDragLeaveCapture?: DOMHandler<P, V, E, React.DragEvent>;
  onDragOver?: DOMHandler<P, V, E, React.DragEvent>;
  onDragOverCapture?: DOMHandler<P, V, E, React.DragEvent>;
  onDragStart?: DOMHandler<P, V, E, React.DragEvent>;
  onDragStartCapture?: DOMHandler<P, V, E, React.DragEvent>;
  onDrop?: DOMHandler<P, V, E, React.DragEvent>;
  onDropCapture?: DOMHandler<P, V, E, React.DragEvent>;
  onMouseDown?: DOMHandler<P, V, E, React.MouseEvent>;
  onMouseDownCapture?: DOMHandler<P, V, E, React.MouseEvent>;
  onMouseEnter?: DOMHandler<P, V, E, React.MouseEvent>;
  onMouseLeave?: DOMHandler<P, V, E, React.MouseEvent>;
  onMouseMove?: DOMHandler<P, V, E, React.MouseEvent>;
  onMouseMoveCapture?: DOMHandler<P, V, E, React.MouseEvent>;
  onMouseOut?: DOMHandler<P, V, E, React.MouseEvent>;
  onMouseOutCapture?: DOMHandler<P, V, E, React.MouseEvent>;
  onMouseOver?: DOMHandler<P, V, E, React.MouseEvent>;
  onMouseOverCapture?: DOMHandler<P, V, E, React.MouseEvent>;
  onMouseUp?: DOMHandler<P, V, E, React.MouseEvent>;
  onMouseUpCapture?: DOMHandler<P, V, E, React.MouseEvent>;

  // Selection Events
  onSelect?: DOMHandler<P, V, E, React.SyntheticEvent>;
  onSelectCapture?: DOMHandler<P, V, E, React.SyntheticEvent>;

  // Touch Events
  onTouchCancel?: DOMHandler<P, V, E, React.TouchEvent>;
  onTouchCancelCapture?: DOMHandler<P, V, E, React.TouchEvent>;
  onTouchEnd?: DOMHandler<P, V, E, React.TouchEvent>;
  onTouchEndCapture?: DOMHandler<P, V, E, React.TouchEvent>;
  onTouchMove?: DOMHandler<P, V, E, React.TouchEvent>;
  onTouchMoveCapture?: DOMHandler<P, V, E, React.TouchEvent>;
  onTouchStart?: DOMHandler<P, V, E, React.TouchEvent>;
  onTouchStartCapture?: DOMHandler<P, V, E, React.TouchEvent>;

  // Pointer Events
  onPointerDown?: DOMHandler<P, V, E, React.PointerEvent>;
  onPointerDownCapture?: DOMHandler<P, V, E, React.PointerEvent>;
  onPointerMove?: DOMHandler<P, V, E, React.PointerEvent>;
  onPointerMoveCapture?: DOMHandler<P, V, E, React.PointerEvent>;
  onPointerUp?: DOMHandler<P, V, E, React.PointerEvent>;
  onPointerUpCapture?: DOMHandler<P, V, E, React.PointerEvent>;
  onPointerCancel?: DOMHandler<P, V, E, React.PointerEvent>;
  onPointerCancelCapture?: DOMHandler<P, V, E, React.PointerEvent>;
  onPointerEnter?: DOMHandler<P, V, E, React.PointerEvent>;
  onPointerLeave?: DOMHandler<P, V, E, React.PointerEvent>;
  onPointerOver?: DOMHandler<P, V, E, React.PointerEvent>;
  onPointerOverCapture?: DOMHandler<P, V, E, React.PointerEvent>;
  onPointerOut?: DOMHandler<P, V, E, React.PointerEvent>;
  onPointerOutCapture?: DOMHandler<P, V, E, React.PointerEvent>;
  onGotPointerCapture?: DOMHandler<P, V, E, React.PointerEvent>;
  onGotPointerCaptureCapture?: DOMHandler<P, V, E, React.PointerEvent>;
  onLostPointerCapture?: DOMHandler<P, V, E, React.PointerEvent>;
  onLostPointerCaptureCapture?: DOMHandler<P, V, E, React.PointerEvent>;

  // UI Events
  onScroll?: DOMHandler<P, V, E, React.UIEvent>;
  onScrollCapture?: DOMHandler<P, V, E, React.UIEvent>;

  // Wheel Events
  onWheel?: DOMHandler<P, V, E, React.WheelEvent>;
  onWheelCapture?: DOMHandler<P, V, E, React.WheelEvent>;

  // Animation Events
  onAnimationStart?: DOMHandler<P, V, E, React.AnimationEvent>;
  onAnimationStartCapture?: DOMHandler<P, V, E, React.AnimationEvent>;
  onAnimationEnd?: DOMHandler<P, V, E, React.AnimationEvent>;
  onAnimationEndCapture?: DOMHandler<P, V, E, React.AnimationEvent>;
  onAnimationIteration?: DOMHandler<P, V, E, React.AnimationEvent>;
  onAnimationIterationCapture?: DOMHandler<P, V, E, React.AnimationEvent>;

  // Transition Events
  onTransitionEnd?: DOMHandler<P, V, E, React.TransitionEvent>;
  onTransitionEndCapture?: DOMHandler<P, V, E, React.TransitionEvent>;
}
