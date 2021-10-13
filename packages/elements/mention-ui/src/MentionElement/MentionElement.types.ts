import { MentionNode, MentionNodeData } from '@udecode/plate-mention';
import { StyledElementProps } from '@udecode/plate-styled-components';

export interface MentionElementStyleProps extends MentionElementProps {
  selected?: boolean;
  focused?: boolean;
}

// renderElement props
export interface MentionElementProps
  extends Omit<StyledElementProps<MentionNode>, 'onClick'> {
  /**
   * Prefix rendered before mention
   */
  prefix?: string;
  onClick?: (mentionNode: MentionNode) => void;
  renderLabel?: (mentionable: MentionNodeData) => string;
}
