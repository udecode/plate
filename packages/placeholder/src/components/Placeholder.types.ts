import { StyledElementProps } from '@udecode/plate-styled-components';

export interface PlaceholderProps extends StyledElementProps {
  placeholder: string;
  hideOnBlur?: boolean;
}
