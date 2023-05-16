import { Value } from '@udecode/plate-common';
import { TMentionElement } from '@udecode/plate-mention';
import { PlateElementProps } from '@udecode/plate-styled-components';

export interface MentionElementStyleProps<V extends Value>
  extends MentionElementProps<V> {
  selected?: boolean;
  focused?: boolean;
}

// renderElement props
export interface MentionElementProps<V extends Value>
  extends PlateElementProps<V, TMentionElement> {
  /**
   * Prefix rendered before mention
   */
  prefix?: string;
  onClick?: (mentionNode: any) => void;
  renderLabel?: (mentionable: TMentionElement) => string;
}
