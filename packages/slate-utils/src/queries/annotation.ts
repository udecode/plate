import type { UnknownObject } from '@udecode/utils';
import type { Range, RangeRef } from 'slate';

export type Annotation<T = {}> = {
  range: Range;
  rangeRef: RangeRef;
  text: string;
} & T &
  UnknownObject;

export type DecorationWithAnnotations = Range & {
  annotations: Annotation[];
};
