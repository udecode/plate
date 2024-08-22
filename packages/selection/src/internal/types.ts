import type { SelectionArea } from './SelectionArea';
import type { Intersection } from './utils';

/* eslint-disable @typescript-eslint/no-unused-vars */
export type DeepPartial<T> = T extends (infer U)[]
  ? T
  : T extends HTMLElement
    ? T
    : { [P in keyof T]?: DeepPartial<T[P]> };

export type Quantify<T> = T | T[];

export interface ScrollEvent extends MouseEvent {
  deltaX: number;
  deltaY: number;
}

export interface ChangedElements {
  added: Element[];
  removed: Element[];
}

export interface SelectionStore {
  changed: ChangedElements;
  selected: Element[];
  stored: Element[];
  touched: Element[];
}

export interface SelectionEvent {
  event: MouseEvent | TouchEvent | null;
  selection: SelectionArea;
  store: SelectionStore;
}

export type SelectionEvents = {
  beforedrag: (e: SelectionEvent) => boolean | void;
  beforestart: (e: SelectionEvent) => boolean | void;
  move: (e: SelectionEvent) => void;
  start: (e: SelectionEvent) => void;
  stop: (e: SelectionEvent) => void;
};

export type AreaLocation = {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

export interface Coordinates {
  x: number;
  y: number;
}

export type TapMode = 'native' | 'touch';

export type OverlapMode = 'drop' | 'invert' | 'keep';

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button#value
export type MouseButton =
  | 0 // Main
  | 1 // Auxiliary
  | 2 // Secondary
  | 3 // Fourth
  | 4; // Fifth

export type Modifier = 'alt' | 'ctrl' | 'shift';

export type Trigger = MouseButton | MouseButtonWithModifiers;

export type MouseButtonWithModifiers = {
  button: MouseButton;
  modifiers: Modifier[];
};

export interface Scrolling {
  manualSpeed: number;
  speedDivider: number;
  startScrollMargins: { x: number; y: number };
}

export interface SingleTap {
  allow: boolean;
  intersect: TapMode;
}

export interface Features {
  range: boolean;
  singleTap: SingleTap;
  touch: boolean;
}

export interface Behaviour {
  intersect: Intersection;
  overlap: OverlapMode;
  scrolling: Scrolling;
  startThreshold: Coordinates | number;
  triggers: Trigger[];
}

export interface SelectionOptions {
  behaviour: Behaviour;
  boundaries: Quantify<HTMLElement | string>;
  container: Quantify<HTMLElement | string>;

  document: Document;
  features: Features;

  selectables: Quantify<string>;
  selectionAreaClass: string;

  selectionContainerClass: string | undefined;
  startAreas: Quantify<HTMLElement | string>;
}

export type PartialSelectionOptions = {
  document?: Document;
} & DeepPartial<Omit<SelectionOptions, 'document'>>;
