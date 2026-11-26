import { defineUpdateAnnotation } from './transaction-values';

export type NativeGroupingInput = Readonly<{
  composition?: number;
  origin: number;
}>;

export const nativeGroupingInput = defineUpdateAnnotation<NativeGroupingInput>({
  combine: (_previous, next) => next,
  key: 'history.native-grouping-input',
});

export type RecordedDeleteGroupingInput = Readonly<{
  blockPath: readonly number[];
  direction: 'backward' | 'forward';
  group: string;
  root: string;
}>;

export const recordedDeleteGroupingInput =
  defineUpdateAnnotation<RecordedDeleteGroupingInput | null>({
    combine: () => null,
    key: 'history.recorded-delete-grouping',
  });
