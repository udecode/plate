import type {
  Location as SlateLocation,
  Range as SlateRange,
  Selection as SlateSelection,
  Span as SlateSpan,
} from 'slate';

export type LeafEdge = 'end' | 'start';

export type MaximizeMode = RangeMode | 'all';

export type MoveUnit = 'character' | 'line' | 'offset' | 'word';

export type RangeDirection = TextDirection | 'inward' | 'outward';

export type RangeMode = 'highest' | 'lowest';

export type SelectionEdge = 'anchor' | 'end' | 'focus' | 'start';

export type SelectionMode = 'all' | 'highest' | 'lowest';

export type TextDirection = 'backward' | 'forward';

export type TextUnit = 'block' | 'character' | 'line' | 'word';

export type TextUnitAdjustment = TextUnit | 'offset';

export type TLocation = SlateLocation;

export type TRange = SlateRange;

export type TSelection = SlateSelection;

export type TSpan = SlateSpan;
