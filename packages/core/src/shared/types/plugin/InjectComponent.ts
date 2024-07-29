import type React from 'react';

import type { PlateRenderElementProps } from '../PlateRenderElementProps';

export interface InjectComponentProps extends PlateRenderElementProps {
  key: string;
}

export type InjectComponentReturnType =
  | React.FC<PlateRenderElementProps>
  | undefined;

export type InjectComponent = (
  props: InjectComponentProps
) => InjectComponentReturnType;
