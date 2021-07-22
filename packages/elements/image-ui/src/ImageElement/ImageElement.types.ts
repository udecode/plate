import { ImageNodeData } from '@udecode/plate-image';
import { StyledElementProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export interface ImageElementStyleProps extends ImageElementProps {
  selected?: boolean;
  focused?: boolean;
}

export interface ImageElementStyles {
  img: CSSProp;
}

export interface ImageElementProps
  extends StyledElementProps<ImageNodeData, ImageElementStyles> {}
