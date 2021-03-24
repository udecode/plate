import { ImageNodeData } from '@udecode/slate-plugins-image';
import {
  ClassName,
  RootStyleSet,
  StyledElementProps,
} from '@udecode/slate-plugins-ui-fluent';
import { IStyle } from '@uifabric/styling';

export interface ImageElementStyleProps extends ClassName {
  selected?: boolean;
  focused?: boolean;
}

export interface ImageElementStyleSet extends RootStyleSet {
  img?: IStyle;
}

export interface ImageElementProps
  extends StyledElementProps<
    ImageNodeData,
    ImageElementStyleProps,
    ImageElementStyleSet
  > {}
