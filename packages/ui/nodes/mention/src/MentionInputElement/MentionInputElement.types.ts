import { Value } from '@udecode/plate-common';
import { TMentionElement } from '@udecode/plate-mention';
import { StyledElementProps } from '@udecode/plate-styled-components';

export interface MentionInputElementStyleProps<V extends Value>
  extends MentionInputElementProps<V> {
  selected?: boolean;
  focused?: boolean;
}

// renderElement props
export interface MentionInputElementProps<V extends Value>
  extends StyledElementProps<V, TMentionElement> {
  /**
   * Prefix rendered before mention
   */
  prefix?: string;
  onClick?: (mentionNode: any) => void;
  renderLabel?: (mentionable: TMentionElement) => string;
}
