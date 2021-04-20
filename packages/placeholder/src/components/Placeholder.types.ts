import {
  ClassName,
  RootStyleSet,
  StyledElementProps,
} from '@udecode/slate-plugins-ui-fluent';
import { IStyle } from '@uifabric/styling';

export interface PlaceholderStyleProps extends ClassName {
  enabled: boolean;
}

export interface PlaceholderStyleSet extends RootStyleSet {
  placeholder: IStyle;
}

export interface PlaceholderProps
  extends StyledElementProps<{}, PlaceholderStyleProps, PlaceholderStyleSet> {
  placeholder: string;
  hideOnBlur?: boolean;
}
