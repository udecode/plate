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
import { PlateEditor } from '../PlateEditor';

/**
 * If true, the next handlers will be skipped.
 */
export type HandlerReturnType = boolean | void;

type ReturnType = HandlerReturnType;

export type DOMHandler<K extends keyof DOMHandlers, T> = NonNullable<
  DOMHandlers<T>[K]
>;

export type KeyboardHandler<T = {}> = DOMHandler<'onKeyDown', T>;

export interface DOMHandlers<T = {}> {
  // Clipboard Events
  onCopy?: (editor: PlateEditor<T>) => (event: ClipboardEvent) => ReturnType;
  onCopyCapture?: (
    editor: PlateEditor<T>
  ) => (event: ClipboardEvent) => ReturnType;
  onCut?: (editor: PlateEditor<T>) => (event: ClipboardEvent) => ReturnType;
  onCutCapture?: (
    editor: PlateEditor<T>
  ) => (event: ClipboardEvent) => ReturnType;
  onPaste?: (editor: PlateEditor<T>) => (event: ClipboardEvent) => ReturnType;
  onPasteCapture?: (
    editor: PlateEditor<T>
  ) => (event: ClipboardEvent) => ReturnType;

  // Composition Events
  onCompositionEnd?: (
    editor: PlateEditor<T>
  ) => (event: CompositionEvent) => ReturnType;
  onCompositionEndCapture?: (
    editor: PlateEditor<T>
  ) => (event: CompositionEvent) => ReturnType;
  onCompositionStart?: (
    editor: PlateEditor<T>
  ) => (event: CompositionEvent) => ReturnType;
  onCompositionStartCapture?: (
    editor: PlateEditor<T>
  ) => (event: CompositionEvent) => ReturnType;
  onCompositionUpdate?: (
    editor: PlateEditor<T>
  ) => (event: CompositionEvent) => ReturnType;
  onCompositionUpdateCapture?: (
    editor: PlateEditor<T>
  ) => (event: CompositionEvent) => ReturnType;

  // Focus Events
  onFocus?: (editor: PlateEditor<T>) => (event: FocusEvent) => ReturnType;
  onFocusCapture?: (
    editor: PlateEditor<T>
  ) => (event: FocusEvent) => ReturnType;
  onBlur?: (editor: PlateEditor<T>) => (event: FocusEvent) => ReturnType;
  onBlurCapture?: (editor: PlateEditor<T>) => (event: FocusEvent) => ReturnType;

  // Form Events
  onDOMBeforeInput?: (editor: PlateEditor<T>) => (event: Event) => ReturnType;
  onBeforeInput?: (editor: PlateEditor<T>) => (event: FormEvent) => ReturnType;
  onBeforeInputCapture?: (
    editor: PlateEditor<T>
  ) => (event: FormEvent) => ReturnType;
  onInput?: (editor: PlateEditor<T>) => (event: FormEvent) => ReturnType;
  onInputCapture?: (editor: PlateEditor<T>) => (event: FormEvent) => ReturnType;
  onReset?: (editor: PlateEditor<T>) => (event: FormEvent) => ReturnType;
  onResetCapture?: (editor: PlateEditor<T>) => (event: FormEvent) => ReturnType;
  onSubmit?: (editor: PlateEditor<T>) => (event: FormEvent) => ReturnType;
  onSubmitCapture?: (
    editor: PlateEditor<T>
  ) => (event: FormEvent) => ReturnType;
  onInvalid?: (editor: PlateEditor<T>) => (event: FormEvent) => ReturnType;
  onInvalidCapture?: (
    editor: PlateEditor<T>
  ) => (event: FormEvent) => ReturnType;

  // Image Events
  onLoad?: (editor: PlateEditor<T>) => (event: SyntheticEvent) => ReturnType;
  onLoadCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onError?: (editor: PlateEditor<T>) => (event: SyntheticEvent) => ReturnType;
  onErrorCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;

  // Keyboard Events
  onKeyDown?: (editor: PlateEditor<T>) => (event: KeyboardEvent) => ReturnType;
  onKeyDownCapture?: (
    editor: PlateEditor<T>
  ) => (event: KeyboardEvent) => ReturnType;
  onKeyPress?: (editor: PlateEditor<T>) => (event: KeyboardEvent) => ReturnType;
  onKeyPressCapture?: (
    editor: PlateEditor<T>
  ) => (event: KeyboardEvent) => ReturnType;
  onKeyUp?: (editor: PlateEditor<T>) => (event: KeyboardEvent) => ReturnType;
  onKeyUpCapture?: (
    editor: PlateEditor<T>
  ) => (event: KeyboardEvent) => ReturnType;

  // Media Events
  onAbort?: (editor: PlateEditor<T>) => (event: SyntheticEvent) => ReturnType;
  onAbortCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onCanPlay?: (editor: PlateEditor<T>) => (event: SyntheticEvent) => ReturnType;
  onCanPlayCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onCanPlayThrough?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onCanPlayThroughCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onDurationChange?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onDurationChangeCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onEmptied?: (editor: PlateEditor<T>) => (event: SyntheticEvent) => ReturnType;
  onEmptiedCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onEncrypted?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onEncryptedCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onEnded?: (editor: PlateEditor<T>) => (event: SyntheticEvent) => ReturnType;
  onEndedCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onLoadedData?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onLoadedDataCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onLoadedMetadata?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onLoadedMetadataCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onLoadStart?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onLoadStartCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onPause?: (editor: PlateEditor<T>) => (event: SyntheticEvent) => ReturnType;
  onPauseCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onPlay?: (editor: PlateEditor<T>) => (event: SyntheticEvent) => ReturnType;
  onPlayCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onPlaying?: (editor: PlateEditor<T>) => (event: SyntheticEvent) => ReturnType;
  onPlayingCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onProgress?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onProgressCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onRateChange?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onRateChangeCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onSeeked?: (editor: PlateEditor<T>) => (event: SyntheticEvent) => ReturnType;
  onSeekedCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onSeeking?: (editor: PlateEditor<T>) => (event: SyntheticEvent) => ReturnType;
  onSeekingCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onStalled?: (editor: PlateEditor<T>) => (event: SyntheticEvent) => ReturnType;
  onStalledCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onSuspend?: (editor: PlateEditor<T>) => (event: SyntheticEvent) => ReturnType;
  onSuspendCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onTimeUpdate?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onTimeUpdateCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onVolumeChange?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onVolumeChangeCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;
  onWaiting?: (editor: PlateEditor<T>) => (event: SyntheticEvent) => ReturnType;
  onWaitingCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;

  // MouseEvents
  onAuxClick?: (editor: PlateEditor<T>) => (event: MouseEvent) => ReturnType;
  onAuxClickCapture?: (
    editor: PlateEditor<T>
  ) => (event: MouseEvent) => ReturnType;
  onClick?: (editor: PlateEditor<T>) => (event: MouseEvent) => ReturnType;
  onClickCapture?: (
    editor: PlateEditor<T>
  ) => (event: MouseEvent) => ReturnType;
  onContextMenu?: (editor: PlateEditor<T>) => (event: MouseEvent) => ReturnType;
  onContextMenuCapture?: (
    editor: PlateEditor<T>
  ) => (event: MouseEvent) => ReturnType;
  onDoubleClick?: (editor: PlateEditor<T>) => (event: MouseEvent) => ReturnType;
  onDoubleClickCapture?: (
    editor: PlateEditor<T>
  ) => (event: MouseEvent) => ReturnType;
  onDrag?: (editor: PlateEditor<T>) => (event: DragEvent) => ReturnType;
  onDragCapture?: (editor: PlateEditor<T>) => (event: DragEvent) => ReturnType;
  onDragEnd?: (editor: PlateEditor<T>) => (event: DragEvent) => ReturnType;
  onDragEndCapture?: (
    editor: PlateEditor<T>
  ) => (event: DragEvent) => ReturnType;
  onDragEnter?: (editor: PlateEditor<T>) => (event: DragEvent) => ReturnType;
  onDragEnterCapture?: (
    editor: PlateEditor<T>
  ) => (event: DragEvent) => ReturnType;
  onDragExit?: (editor: PlateEditor<T>) => (event: DragEvent) => ReturnType;
  onDragExitCapture?: (
    editor: PlateEditor<T>
  ) => (event: DragEvent) => ReturnType;
  onDragLeave?: (editor: PlateEditor<T>) => (event: DragEvent) => ReturnType;
  onDragLeaveCapture?: (
    editor: PlateEditor<T>
  ) => (event: DragEvent) => ReturnType;
  onDragOver?: (editor: PlateEditor<T>) => (event: DragEvent) => ReturnType;
  onDragOverCapture?: (
    editor: PlateEditor<T>
  ) => (event: DragEvent) => ReturnType;
  onDragStart?: (editor: PlateEditor<T>) => (event: DragEvent) => ReturnType;
  onDragStartCapture?: (
    editor: PlateEditor<T>
  ) => (event: DragEvent) => ReturnType;
  onDrop?: (editor: PlateEditor<T>) => (event: DragEvent) => ReturnType;
  onDropCapture?: (editor: PlateEditor<T>) => (event: DragEvent) => ReturnType;
  onMouseDown?: (editor: PlateEditor<T>) => (event: MouseEvent) => ReturnType;
  onMouseDownCapture?: (
    editor: PlateEditor<T>
  ) => (event: MouseEvent) => ReturnType;
  onMouseEnter?: (editor: PlateEditor<T>) => (event: MouseEvent) => ReturnType;
  onMouseLeave?: (editor: PlateEditor<T>) => (event: MouseEvent) => ReturnType;
  onMouseMove?: (editor: PlateEditor<T>) => (event: MouseEvent) => ReturnType;
  onMouseMoveCapture?: (
    editor: PlateEditor<T>
  ) => (event: MouseEvent) => ReturnType;
  onMouseOut?: (editor: PlateEditor<T>) => (event: MouseEvent) => ReturnType;
  onMouseOutCapture?: (
    editor: PlateEditor<T>
  ) => (event: MouseEvent) => ReturnType;
  onMouseOver?: (editor: PlateEditor<T>) => (event: MouseEvent) => ReturnType;
  onMouseOverCapture?: (
    editor: PlateEditor<T>
  ) => (event: MouseEvent) => ReturnType;
  onMouseUp?: (editor: PlateEditor<T>) => (event: MouseEvent) => ReturnType;
  onMouseUpCapture?: (
    editor: PlateEditor<T>
  ) => (event: MouseEvent) => ReturnType;

  // Selection Events
  onSelect?: (editor: PlateEditor<T>) => (event: SyntheticEvent) => ReturnType;
  onSelectCapture?: (
    editor: PlateEditor<T>
  ) => (event: SyntheticEvent) => ReturnType;

  // Touch Events
  onTouchCancel?: (editor: PlateEditor<T>) => (event: TouchEvent) => ReturnType;
  onTouchCancelCapture?: (
    editor: PlateEditor<T>
  ) => (event: TouchEvent) => ReturnType;
  onTouchEnd?: (editor: PlateEditor<T>) => (event: TouchEvent) => ReturnType;
  onTouchEndCapture?: (
    editor: PlateEditor<T>
  ) => (event: TouchEvent) => ReturnType;
  onTouchMove?: (editor: PlateEditor<T>) => (event: TouchEvent) => ReturnType;
  onTouchMoveCapture?: (
    editor: PlateEditor<T>
  ) => (event: TouchEvent) => ReturnType;
  onTouchStart?: (editor: PlateEditor<T>) => (event: TouchEvent) => ReturnType;
  onTouchStartCapture?: (
    editor: PlateEditor<T>
  ) => (event: TouchEvent) => ReturnType;

  // Pointer Events
  onPointerDown?: (
    editor: PlateEditor<T>
  ) => (event: PointerEvent) => ReturnType;
  onPointerDownCapture?: (
    editor: PlateEditor<T>
  ) => (event: PointerEvent) => ReturnType;
  onPointerMove?: (
    editor: PlateEditor<T>
  ) => (event: PointerEvent) => ReturnType;
  onPointerMoveCapture?: (
    editor: PlateEditor<T>
  ) => (event: PointerEvent) => ReturnType;
  onPointerUp?: (editor: PlateEditor<T>) => (event: PointerEvent) => ReturnType;
  onPointerUpCapture?: (
    editor: PlateEditor<T>
  ) => (event: PointerEvent) => ReturnType;
  onPointerCancel?: (
    editor: PlateEditor<T>
  ) => (event: PointerEvent) => ReturnType;
  onPointerCancelCapture?: (
    editor: PlateEditor<T>
  ) => (event: PointerEvent) => ReturnType;
  onPointerEnter?: (
    editor: PlateEditor<T>
  ) => (event: PointerEvent) => ReturnType;
  onPointerEnterCapture?: (
    editor: PlateEditor<T>
  ) => (event: PointerEvent) => ReturnType;
  onPointerLeave?: (
    editor: PlateEditor<T>
  ) => (event: PointerEvent) => ReturnType;
  onPointerLeaveCapture?: (
    editor: PlateEditor<T>
  ) => (event: PointerEvent) => ReturnType;
  onPointerOver?: (
    editor: PlateEditor<T>
  ) => (event: PointerEvent) => ReturnType;
  onPointerOverCapture?: (
    editor: PlateEditor<T>
  ) => (event: PointerEvent) => ReturnType;
  onPointerOut?: (
    editor: PlateEditor<T>
  ) => (event: PointerEvent) => ReturnType;
  onPointerOutCapture?: (
    editor: PlateEditor<T>
  ) => (event: PointerEvent) => ReturnType;
  onGotPointerCapture?: (
    editor: PlateEditor<T>
  ) => (event: PointerEvent) => ReturnType;
  onGotPointerCaptureCapture?: (
    editor: PlateEditor<T>
  ) => (event: PointerEvent) => ReturnType;
  onLostPointerCapture?: (
    editor: PlateEditor<T>
  ) => (event: PointerEvent) => ReturnType;
  onLostPointerCaptureCapture?: (
    editor: PlateEditor<T>
  ) => (event: PointerEvent) => ReturnType;

  // UI Events
  onScroll?: (editor: PlateEditor<T>) => (event: UIEvent) => ReturnType;
  onScrollCapture?: (editor: PlateEditor<T>) => (event: UIEvent) => ReturnType;

  // Wheel Events
  onWheel?: (editor: PlateEditor<T>) => (event: WheelEvent) => ReturnType;
  onWheelCapture?: (
    editor: PlateEditor<T>
  ) => (event: WheelEvent) => ReturnType;

  // Animation Events
  onAnimationStart?: (
    editor: PlateEditor<T>
  ) => (event: AnimationEvent) => ReturnType;
  onAnimationStartCapture?: (
    editor: PlateEditor<T>
  ) => (event: AnimationEvent) => ReturnType;
  onAnimationEnd?: (
    editor: PlateEditor<T>
  ) => (event: AnimationEvent) => ReturnType;
  onAnimationEndCapture?: (
    editor: PlateEditor<T>
  ) => (event: AnimationEvent) => ReturnType;
  onAnimationIteration?: (
    editor: PlateEditor<T>
  ) => (event: AnimationEvent) => ReturnType;
  onAnimationIterationCapture?: (
    editor: PlateEditor<T>
  ) => (event: AnimationEvent) => ReturnType;

  // Transition Events
  onTransitionEnd?: (
    editor: PlateEditor<T>
  ) => (event: TransitionEvent) => ReturnType;
  onTransitionEndCapture?: (
    editor: PlateEditor<T>
  ) => (event: TransitionEvent) => ReturnType;
}
