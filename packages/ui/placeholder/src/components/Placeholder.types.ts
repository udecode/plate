import { Value } from '@udecode/plate-common';
import { PlateElementProps } from '@udecode/plate-styled-components';

export interface PlaceholderProps<V extends Value>
  extends PlateElementProps<V> {
  placeholder: string;
  hideOnBlur?: boolean;
}
