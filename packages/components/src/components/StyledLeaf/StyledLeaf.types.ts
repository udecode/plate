import { RenderLeafProps } from 'slate-react';
import { StyledComponentProps } from '../StyledComponent/StyledComponent.types';

export interface StyledLeafProps
  extends Omit<StyledComponentProps, 'children'>,
    RenderLeafProps {}
