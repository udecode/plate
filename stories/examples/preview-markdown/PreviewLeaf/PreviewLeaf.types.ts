import { ClassName, StyledLeafProps } from '@udecode/slate-plugins';

export interface PreviewLeafProps
  extends StyledLeafProps<{}, PreviewLeafStyleProps> {}

export interface PreviewLeafStyleProps extends ClassName {
  bold?: boolean;
  italic?: boolean;
  title?: boolean;
  list?: boolean;
  hr?: boolean;
  blockquote?: boolean;
  code?: boolean;
}
