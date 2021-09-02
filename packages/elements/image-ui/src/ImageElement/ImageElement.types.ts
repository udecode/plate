import { ImageNodeData } from '@udecode/plate-image';
import { StyledElementProps } from '@udecode/plate-styled-components';
import { ResizableProps } from 're-resizable';
import { CSSProp } from 'styled-components';

export interface ImageElementStyleProps extends ImageElementProps {
  selected?: boolean;
  focused?: boolean;
}

export interface ImageElementStyles {
  resizable: CSSProp;
  figure: CSSProp;
  img: CSSProp;
  figcaption: CSSProp;
  caption: CSSProp;
  handle: CSSProp;
  handleLeft: CSSProp;
  handleRight: CSSProp;
}

export interface ImageElementProps
  extends StyledElementProps<ImageNodeData, ImageElementStyles> {
  resizableProps?: ResizableProps;
  align?: 'left' | 'center' | 'right';
  caption?: {
    disabled?: boolean;
    align?: 'left' | 'center' | 'right';
    placeholder?: string;
  };
}
