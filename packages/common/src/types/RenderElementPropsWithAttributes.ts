import { RenderElementProps } from 'slate-react';
import { ElementWithAttributes } from './ElementWithAttributes';

export interface RenderElementPropsWithAttributes extends RenderElementProps {
  element: ElementWithAttributes;
}
