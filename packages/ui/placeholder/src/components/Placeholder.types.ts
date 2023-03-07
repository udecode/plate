import { Value } from '@udecode/plate-common';
import { StyledElementProps } from '@udecode/plate-styled-components';

export interface PlaceholderProps<V extends Value>
  extends StyledElementProps<V> {
  placeholder: string;
  hideOnBlur?: boolean;
}
