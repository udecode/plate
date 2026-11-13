import { defineUpdateAnnotation } from './transaction-values';

export type NativeGroupingInput = Readonly<{
  composition?: number;
  origin: number;
}>;

export const nativeGroupingInput = defineUpdateAnnotation<NativeGroupingInput>({
  combine: (_previous, next) => next,
  key: 'history.native-grouping-input',
});
