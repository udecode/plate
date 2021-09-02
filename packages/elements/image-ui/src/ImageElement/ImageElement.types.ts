import { ImageNodeData } from '@udecode/plate-image';
import { StyledElementProps } from '@udecode/plate-styled-components';
import { ResizableProps } from 're-resizable';
import { CSSProp } from 'styled-components';

export interface ImageElementStyleProps extends ImageElementProps {
  selected?: boolean;
  focused?: boolean;
}

export interface ImageElementStyles {
  figure: CSSProp;
  img: CSSProp;
  resizeWrapper: CSSProp;
  captionInput: CSSProp;
  handle: CSSProp;
  figureCaption: CSSProp;
}

export interface ImageElementProps
  extends StyledElementProps<ImageNodeData, ImageElementStyles> {
  disableCaption?: boolean;
  captionPlaceholder?: string;
  resizableProps?: ResizableProps;
}
