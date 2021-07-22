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
import { SPEditor } from '../SPEditor';

/**
 * If true, the next handlers will be skipped.
 */
export type HandlerReturnType = boolean | void;

type ReturnType = HandlerReturnType;

export type DOMHandler<
  K extends keyof DOMHandlers,
  T extends SPEditor = SPEditor
> = NonNullable<DOMHandlers<T>[K]>;

export type KeyboardHandler<T extends SPEditor = SPEditor> = DOMHandler<
  'onKeyDown',
  T
>;

export interface DOMHandlers<T extends SPEditor = SPEditor> {
  // Clipboard Events
  onCopy?: (editor: T) => (event: ClipboardEvent) => ReturnType;
  onCopyCapture?: (editor: T) => (event: ClipboardEvent) => ReturnType;
  onCut?: (editor: T) => (event: ClipboardEvent) => ReturnType;
  onCutCapture?: (editor: T) => (event: ClipboardEvent) => ReturnType;
  onPaste?: (editor: T) => (event: ClipboardEvent) => ReturnType;
  onPasteCapture?: (editor: T) => (event: ClipboardEvent) => ReturnType;

  // Composition Events
  onCompositionEnd?: (editor: T) => (event: CompositionEvent) => ReturnType;
  onCompositionEndCapture?: (
    editor: T
  ) => (event: CompositionEvent) => ReturnType;
  onCompositionStart?: (editor: T) => (event: CompositionEvent) => ReturnType;
  onCompositionStartCapture?: (
    editor: T
  ) => (event: CompositionEvent) => ReturnType;
  onCompositionUpdate?: (editor: T) => (event: CompositionEvent) => ReturnType;
  onCompositionUpdateCapture?: (
    editor: T
  ) => (event: CompositionEvent) => ReturnType;

  // Focus Events
  onFocus?: (editor: T) => (event: FocusEvent) => ReturnType;
  onFocusCapture?: (editor: T) => (event: FocusEvent) => ReturnType;
  onBlur?: (editor: T) => (event: FocusEvent) => ReturnType;
  onBlurCapture?: (editor: T) => (event: FocusEvent) => ReturnType;

  // Form Events
  onDOMBeforeInput?: (editor: T) => (event: Event) => ReturnType;
  onBeforeInput?: (editor: T) => (event: FormEvent) => ReturnType;
  onBeforeInputCapture?: (editor: T) => (event: FormEvent) => ReturnType;
  onInput?: (editor: T) => (event: FormEvent) => ReturnType;
  onInputCapture?: (editor: T) => (event: FormEvent) => ReturnType;
  onReset?: (editor: T) => (event: FormEvent) => ReturnType;
  onResetCapture?: (editor: T) => (event: FormEvent) => ReturnType;
  onSubmit?: (editor: T) => (event: FormEvent) => ReturnType;
  onSubmitCapture?: (editor: T) => (event: FormEvent) => ReturnType;
  onInvalid?: (editor: T) => (event: FormEvent) => ReturnType;
  onInvalidCapture?: (editor: T) => (event: FormEvent) => ReturnType;

  // Image Events
  onLoad?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onLoadCapture?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onError?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onErrorCapture?: (editor: T) => (event: SyntheticEvent) => ReturnType;

  // Keyboard Events
  onKeyDown?: (editor: T) => (event: KeyboardEvent) => ReturnType;
  onKeyDownCapture?: (editor: T) => (event: KeyboardEvent) => ReturnType;
  onKeyPress?: (editor: T) => (event: KeyboardEvent) => ReturnType;
  onKeyPressCapture?: (editor: T) => (event: KeyboardEvent) => ReturnType;
  onKeyUp?: (editor: T) => (event: KeyboardEvent) => ReturnType;
  onKeyUpCapture?: (editor: T) => (event: KeyboardEvent) => ReturnType;

  // Media Events
  onAbort?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onAbortCapture?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onCanPlay?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onCanPlayCapture?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onCanPlayThrough?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onCanPlayThroughCapture?: (
    editor: T
  ) => (event: SyntheticEvent) => ReturnType;
  onDurationChange?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onDurationChangeCapture?: (
    editor: T
  ) => (event: SyntheticEvent) => ReturnType;
  onEmptied?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onEmptiedCapture?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onEncrypted?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onEncryptedCapture?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onEnded?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onEndedCapture?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onLoadedData?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onLoadedDataCapture?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onLoadedMetadata?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onLoadedMetadataCapture?: (
    editor: T
  ) => (event: SyntheticEvent) => ReturnType;
  onLoadStart?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onLoadStartCapture?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onPause?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onPauseCapture?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onPlay?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onPlayCapture?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onPlaying?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onPlayingCapture?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onProgress?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onProgressCapture?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onRateChange?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onRateChangeCapture?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onSeeked?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onSeekedCapture?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onSeeking?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onSeekingCapture?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onStalled?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onStalledCapture?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onSuspend?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onSuspendCapture?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onTimeUpdate?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onTimeUpdateCapture?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onVolumeChange?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onVolumeChangeCapture?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onWaiting?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onWaitingCapture?: (editor: T) => (event: SyntheticEvent) => ReturnType;

  // MouseEvents
  onAuxClick?: (editor: T) => (event: MouseEvent) => ReturnType;
  onAuxClickCapture?: (editor: T) => (event: MouseEvent) => ReturnType;
  onClick?: (editor: T) => (event: MouseEvent) => ReturnType;
  onClickCapture?: (editor: T) => (event: MouseEvent) => ReturnType;
  onContextMenu?: (editor: T) => (event: MouseEvent) => ReturnType;
  onContextMenuCapture?: (editor: T) => (event: MouseEvent) => ReturnType;
  onDoubleClick?: (editor: T) => (event: MouseEvent) => ReturnType;
  onDoubleClickCapture?: (editor: T) => (event: MouseEvent) => ReturnType;
  onDrag?: (editor: T) => (event: DragEvent) => ReturnType;
  onDragCapture?: (editor: T) => (event: DragEvent) => ReturnType;
  onDragEnd?: (editor: T) => (event: DragEvent) => ReturnType;
  onDragEndCapture?: (editor: T) => (event: DragEvent) => ReturnType;
  onDragEnter?: (editor: T) => (event: DragEvent) => ReturnType;
  onDragEnterCapture?: (editor: T) => (event: DragEvent) => ReturnType;
  onDragExit?: (editor: T) => (event: DragEvent) => ReturnType;
  onDragExitCapture?: (editor: T) => (event: DragEvent) => ReturnType;
  onDragLeave?: (editor: T) => (event: DragEvent) => ReturnType;
  onDragLeaveCapture?: (editor: T) => (event: DragEvent) => ReturnType;
  onDragOver?: (editor: T) => (event: DragEvent) => ReturnType;
  onDragOverCapture?: (editor: T) => (event: DragEvent) => ReturnType;
  onDragStart?: (editor: T) => (event: DragEvent) => ReturnType;
  onDragStartCapture?: (editor: T) => (event: DragEvent) => ReturnType;
  onDrop?: (editor: T) => (event: DragEvent) => ReturnType;
  onDropCapture?: (editor: T) => (event: DragEvent) => ReturnType;
  onMouseDown?: (editor: T) => (event: MouseEvent) => ReturnType;
  onMouseDownCapture?: (editor: T) => (event: MouseEvent) => ReturnType;
  onMouseEnter?: (editor: T) => (event: MouseEvent) => ReturnType;
  onMouseLeave?: (editor: T) => (event: MouseEvent) => ReturnType;
  onMouseMove?: (editor: T) => (event: MouseEvent) => ReturnType;
  onMouseMoveCapture?: (editor: T) => (event: MouseEvent) => ReturnType;
  onMouseOut?: (editor: T) => (event: MouseEvent) => ReturnType;
  onMouseOutCapture?: (editor: T) => (event: MouseEvent) => ReturnType;
  onMouseOver?: (editor: T) => (event: MouseEvent) => ReturnType;
  onMouseOverCapture?: (editor: T) => (event: MouseEvent) => ReturnType;
  onMouseUp?: (editor: T) => (event: MouseEvent) => ReturnType;
  onMouseUpCapture?: (editor: T) => (event: MouseEvent) => ReturnType;

  // Selection Events
  onSelect?: (editor: T) => (event: SyntheticEvent) => ReturnType;
  onSelectCapture?: (editor: T) => (event: SyntheticEvent) => ReturnType;

  // Touch Events
  onTouchCancel?: (editor: T) => (event: TouchEvent) => ReturnType;
  onTouchCancelCapture?: (editor: T) => (event: TouchEvent) => ReturnType;
  onTouchEnd?: (editor: T) => (event: TouchEvent) => ReturnType;
  onTouchEndCapture?: (editor: T) => (event: TouchEvent) => ReturnType;
  onTouchMove?: (editor: T) => (event: TouchEvent) => ReturnType;
  onTouchMoveCapture?: (editor: T) => (event: TouchEvent) => ReturnType;
  onTouchStart?: (editor: T) => (event: TouchEvent) => ReturnType;
  onTouchStartCapture?: (editor: T) => (event: TouchEvent) => ReturnType;

  // Pointer Events
  onPointerDown?: (editor: T) => (event: PointerEvent) => ReturnType;
  onPointerDownCapture?: (editor: T) => (event: PointerEvent) => ReturnType;
  onPointerMove?: (editor: T) => (event: PointerEvent) => ReturnType;
  onPointerMoveCapture?: (editor: T) => (event: PointerEvent) => ReturnType;
  onPointerUp?: (editor: T) => (event: PointerEvent) => ReturnType;
  onPointerUpCapture?: (editor: T) => (event: PointerEvent) => ReturnType;
  onPointerCancel?: (editor: T) => (event: PointerEvent) => ReturnType;
  onPointerCancelCapture?: (editor: T) => (event: PointerEvent) => ReturnType;
  onPointerEnter?: (editor: T) => (event: PointerEvent) => ReturnType;
  onPointerEnterCapture?: (editor: T) => (event: PointerEvent) => ReturnType;
  onPointerLeave?: (editor: T) => (event: PointerEvent) => ReturnType;
  onPointerLeaveCapture?: (editor: T) => (event: PointerEvent) => ReturnType;
  onPointerOver?: (editor: T) => (event: PointerEvent) => ReturnType;
  onPointerOverCapture?: (editor: T) => (event: PointerEvent) => ReturnType;
  onPointerOut?: (editor: T) => (event: PointerEvent) => ReturnType;
  onPointerOutCapture?: (editor: T) => (event: PointerEvent) => ReturnType;
  onGotPointerCapture?: (editor: T) => (event: PointerEvent) => ReturnType;
  onGotPointerCaptureCapture?: (
    editor: T
  ) => (event: PointerEvent) => ReturnType;
  onLostPointerCapture?: (editor: T) => (event: PointerEvent) => ReturnType;
  onLostPointerCaptureCapture?: (
    editor: T
  ) => (event: PointerEvent) => ReturnType;

  // UI Events
  onScroll?: (editor: T) => (event: UIEvent) => ReturnType;
  onScrollCapture?: (editor: T) => (event: UIEvent) => ReturnType;

  // Wheel Events
  onWheel?: (editor: T) => (event: WheelEvent) => ReturnType;
  onWheelCapture?: (editor: T) => (event: WheelEvent) => ReturnType;

  // Animation Events
  onAnimationStart?: (editor: T) => (event: AnimationEvent) => ReturnType;
  onAnimationStartCapture?: (
    editor: T
  ) => (event: AnimationEvent) => ReturnType;
  onAnimationEnd?: (editor: T) => (event: AnimationEvent) => ReturnType;
  onAnimationEndCapture?: (editor: T) => (event: AnimationEvent) => ReturnType;
  onAnimationIteration?: (editor: T) => (event: AnimationEvent) => ReturnType;
  onAnimationIterationCapture?: (
    editor: T
  ) => (event: AnimationEvent) => ReturnType;

  // Transition Events
  onTransitionEnd?: (editor: T) => (event: TransitionEvent) => ReturnType;
  onTransitionEndCapture?: (
    editor: T
  ) => (event: TransitionEvent) => ReturnType;
}
