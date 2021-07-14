import { ImageNodeData } from '@udecode/slate-plugins-image';
import { StyledElementProps } from '@udecode/slate-plugins-styled-components';
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
