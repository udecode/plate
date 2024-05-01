import type React from 'react';

import type { Value } from '@udecode/slate';

import type { PlateRenderElementProps } from '../PlateRenderElementProps';

export interface InjectComponentProps<V extends Value = Value>
  extends PlateRenderElementProps<V> {
  key: string;
}

export type InjectComponentReturnType<V extends Value = Value> =
  | React.FC<PlateRenderElementProps<V>>
  | undefined;

export type InjectComponent<V extends Value = Value> = (
  props: InjectComponentProps<V>
) => InjectComponentReturnType;
