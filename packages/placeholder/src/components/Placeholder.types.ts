import { StyledElementProps } from '@udecode/slate-plugins-styled-components';

export interface PlaceholderProps extends StyledElementProps {
  placeholder: string;
  hideOnBlur?: boolean;
}
