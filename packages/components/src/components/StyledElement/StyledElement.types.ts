import { NodeProps } from '@udecode/slate-plugins';
import { RenderElementProps } from 'slate-react';
import { StyledComponentProps } from '../StyledComponent/StyledComponent.types';

export interface StyledElementProps
  extends Omit<StyledComponentProps, 'children'>,
    NodeProps,
    RenderElementProps {}
