import { StyledElementProps } from '@udecode/slate-plugins-ui';

export interface PlaceholderProps extends StyledElementProps {
  placeholder: string;
  hideOnBlur?: boolean;
}
