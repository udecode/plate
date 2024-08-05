import type React from 'react';

import type { PlateRenderElementProps } from '../PlateRenderElementProps';

export interface InjectComponentProps<O = {}, A = {}, T = {}, S = {}>
  extends PlateRenderElementProps<O, A, T, S> {
  key: string;
}

export type InjectComponentReturnType<O = {}, A = {}, T = {}, S = {}> =
  | React.FC<PlateRenderElementProps<O, A, T, S>>
  | undefined;

export type InjectComponent<O = {}, A = {}, T = {}, S = {}> = (
  props: InjectComponentProps<O, A, T, S>
) => InjectComponentReturnType<O, A, T, S>;
