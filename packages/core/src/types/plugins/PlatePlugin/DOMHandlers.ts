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
import { PlatePlugin } from './PlatePlugin';

/**
 * If true, the next handlers will be skipped.
 */
export type HandlerReturnType = boolean | void;

type ReturnType = HandlerReturnType;

export type DOMHandler<K extends keyof DOMHandlers, T, P> = NonNullable<
  DOMHandlers<T, P>[K]
>;

export interface DOMHandlers<T = {}, P = {}> {
  // Clipboard Events
  onCopy?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: ClipboardEvent) => ReturnType;
  onCopyCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: ClipboardEvent) => ReturnType;
  onCut?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: ClipboardEvent) => ReturnType;
  onCutCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: ClipboardEvent) => ReturnType;
  onPaste?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: ClipboardEvent) => ReturnType;
  onPasteCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: ClipboardEvent) => ReturnType;

  // Composition Events
  onCompositionEnd?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: CompositionEvent) => ReturnType;
  onCompositionEndCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: CompositionEvent) => ReturnType;
  onCompositionStart?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: CompositionEvent) => ReturnType;
  onCompositionStartCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: CompositionEvent) => ReturnType;
  onCompositionUpdate?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: CompositionEvent) => ReturnType;
  onCompositionUpdateCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: CompositionEvent) => ReturnType;

  // Focus Events
  onFocus?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: FocusEvent) => ReturnType;
  onFocusCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: FocusEvent) => ReturnType;
  onBlur?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: FocusEvent) => ReturnType;
  onBlurCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: FocusEvent) => ReturnType;

  // Form Events
  onDOMBeforeInput?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: Event) => ReturnType;
  onBeforeInput?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: FormEvent) => ReturnType;
  onBeforeInputCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: FormEvent) => ReturnType;
  onInput?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: FormEvent) => ReturnType;
  onInputCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: FormEvent) => ReturnType;
  onReset?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: FormEvent) => ReturnType;
  onResetCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: FormEvent) => ReturnType;
  onSubmit?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: FormEvent) => ReturnType;
  onSubmitCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: FormEvent) => ReturnType;
  onInvalid?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: FormEvent) => ReturnType;
  onInvalidCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: FormEvent) => ReturnType;

  // Image Events
  onLoad?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onLoadCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;

  // Keyboard Events
  onKeyDown?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: KeyboardEvent) => ReturnType;
  onKeyDownCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: KeyboardEvent) => ReturnType;
  onKeyPress?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: KeyboardEvent) => ReturnType;
  onKeyPressCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: KeyboardEvent) => ReturnType;
  onKeyUp?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: KeyboardEvent) => ReturnType;
  onKeyUpCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: KeyboardEvent) => ReturnType;

  // Media Events
  onAbort?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onAbortCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onCanPlay?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onCanPlayCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onCanPlayThrough?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onCanPlayThroughCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onDurationChange?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onDurationChangeCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onEmptied?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onEmptiedCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onEncrypted?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onEncryptedCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onEnded?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onEndedCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onLoadedData?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onLoadedDataCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onLoadedMetadata?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onLoadedMetadataCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onLoadStart?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onLoadStartCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onPause?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onPauseCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onPlay?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onPlayCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onPlaying?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onPlayingCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onProgress?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onProgressCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onRateChange?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onRateChangeCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onSeeked?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onSeekedCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onSeeking?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onSeekingCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onStalled?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onStalledCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onSuspend?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onSuspendCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onTimeUpdate?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onTimeUpdateCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onVolumeChange?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onVolumeChangeCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onWaiting?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onWaitingCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;

  // MouseEvents
  onAuxClick?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: MouseEvent) => ReturnType;
  onAuxClickCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: MouseEvent) => ReturnType;
  onClick?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: MouseEvent) => ReturnType;
  onClickCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: MouseEvent) => ReturnType;
  onContextMenu?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: MouseEvent) => ReturnType;
  onContextMenuCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: MouseEvent) => ReturnType;
  onDoubleClick?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: MouseEvent) => ReturnType;
  onDoubleClickCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: MouseEvent) => ReturnType;
  onDrag?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: DragEvent) => ReturnType;
  onDragCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: DragEvent) => ReturnType;
  onDragEnd?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: DragEvent) => ReturnType;
  onDragEndCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: DragEvent) => ReturnType;
  onDragEnter?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: DragEvent) => ReturnType;
  onDragEnterCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: DragEvent) => ReturnType;
  onDragExit?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: DragEvent) => ReturnType;
  onDragExitCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: DragEvent) => ReturnType;
  onDragLeave?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: DragEvent) => ReturnType;
  onDragLeaveCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: DragEvent) => ReturnType;
  onDragOver?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: DragEvent) => ReturnType;
  onDragOverCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: DragEvent) => ReturnType;
  onDragStart?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: DragEvent) => ReturnType;
  onDragStartCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: DragEvent) => ReturnType;
  onDrop?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: DragEvent) => ReturnType;
  onDropCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: DragEvent) => ReturnType;
  onMouseDown?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: MouseEvent) => ReturnType;
  onMouseDownCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: MouseEvent) => ReturnType;
  onMouseEnter?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: MouseEvent) => ReturnType;
  onMouseLeave?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: MouseEvent) => ReturnType;
  onMouseMove?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: MouseEvent) => ReturnType;
  onMouseMoveCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: MouseEvent) => ReturnType;
  onMouseOut?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: MouseEvent) => ReturnType;
  onMouseOutCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: MouseEvent) => ReturnType;
  onMouseOver?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: MouseEvent) => ReturnType;
  onMouseOverCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: MouseEvent) => ReturnType;
  onMouseUp?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: MouseEvent) => ReturnType;
  onMouseUpCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: MouseEvent) => ReturnType;

  // Selection Events
  onSelect?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;
  onSelectCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: SyntheticEvent) => ReturnType;

  // Touch Events
  onTouchCancel?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: TouchEvent) => ReturnType;
  onTouchCancelCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: TouchEvent) => ReturnType;
  onTouchEnd?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: TouchEvent) => ReturnType;
  onTouchEndCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: TouchEvent) => ReturnType;
  onTouchMove?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: TouchEvent) => ReturnType;
  onTouchMoveCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: TouchEvent) => ReturnType;
  onTouchStart?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: TouchEvent) => ReturnType;
  onTouchStartCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: TouchEvent) => ReturnType;

  // Pointer Events
  onPointerDown?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: PointerEvent) => ReturnType;
  onPointerDownCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: PointerEvent) => ReturnType;
  onPointerMove?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: PointerEvent) => ReturnType;
  onPointerMoveCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: PointerEvent) => ReturnType;
  onPointerUp?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: PointerEvent) => ReturnType;
  onPointerUpCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: PointerEvent) => ReturnType;
  onPointerCancel?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: PointerEvent) => ReturnType;
  onPointerCancelCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: PointerEvent) => ReturnType;
  onPointerEnter?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: PointerEvent) => ReturnType;
  onPointerEnterCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: PointerEvent) => ReturnType;
  onPointerLeave?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: PointerEvent) => ReturnType;
  onPointerLeaveCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: PointerEvent) => ReturnType;
  onPointerOver?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: PointerEvent) => ReturnType;
  onPointerOverCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: PointerEvent) => ReturnType;
  onPointerOut?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: PointerEvent) => ReturnType;
  onPointerOutCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: PointerEvent) => ReturnType;
  onGotPointerCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: PointerEvent) => ReturnType;
  onGotPointerCaptureCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: PointerEvent) => ReturnType;
  onLostPointerCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: PointerEvent) => ReturnType;
  onLostPointerCaptureCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: PointerEvent) => ReturnType;

  // UI Events
  onScroll?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: UIEvent) => ReturnType;
  onScrollCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: UIEvent) => ReturnType;

  // Wheel Events
  onWheel?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: WheelEvent) => ReturnType;
  onWheelCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: WheelEvent) => ReturnType;

  // Animation Events
  onAnimationStart?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: AnimationEvent) => ReturnType;
  onAnimationStartCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: AnimationEvent) => ReturnType;
  onAnimationEnd?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: AnimationEvent) => ReturnType;
  onAnimationEndCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: AnimationEvent) => ReturnType;
  onAnimationIteration?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: AnimationEvent) => ReturnType;
  onAnimationIterationCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: AnimationEvent) => ReturnType;

  // Transition Events
  onTransitionEnd?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: TransitionEvent) => ReturnType;
  onTransitionEndCapture?: (
    editor: PlateEditor<T>,
    plugin: PlatePlugin<T, P>
  ) => (event: TransitionEvent) => ReturnType;
}
