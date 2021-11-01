import { MentionNode, MentionNodeData } from '@udecode/plate-mention';
import { StyledElementProps } from '@udecode/plate-styled-components';

export interface MentionInputElementStyleProps
  extends MentionInputElementProps {
  selected?: boolean;
  focused?: boolean;
}

// renderElement props
export interface MentionInputElementProps
  extends Omit<StyledElementProps<MentionNode>, 'onClick'> {
  /**
   * Prefix rendered before mention
   */
  prefix?: string;
  onClick?: (mentionNode: MentionNode) => void;
  renderLabel?: (mentionable: MentionNodeData) => string;
}
