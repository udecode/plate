import { Value } from '@udecode/plate-core';
import { StyledElementProps } from '@udecode/plate-styled-components';

export interface PlaceholderProps<V extends Value>
  extends StyledElementProps<V> {
  placeholder: string;
  hideOnBlur?: boolean;
}
