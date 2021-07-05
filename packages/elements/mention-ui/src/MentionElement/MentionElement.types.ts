import { MentionNode, MentionNodeData } from '@udecode/slate-plugins-mention';
import { StyledElementProps } from '@udecode/slate-plugins-ui';

export interface MentionElementStyleProps extends MentionElementProps {
  selected?: boolean;
  focused?: boolean;
}

// renderElement props
export interface MentionElementProps extends StyledElementProps<MentionNode> {
  /**
   * Prefix rendered before mention
   */
  prefix?: string;
  onClick?: (mentionNode: MentionNode) => void;
  renderLabel?: (mentionable: MentionNodeData) => string;
}
