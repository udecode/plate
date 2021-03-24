import { MentionNode, MentionNodeData } from '@udecode/slate-plugins-mention';
import {
  ClassName,
  StyledElementProps,
} from '@udecode/slate-plugins-ui-fluent';

export interface MentionElementStyleProps extends ClassName {
  // Insert MentionElement style props below
  selected?: boolean;
  focused?: boolean;
}

// renderElement props
export interface MentionElementProps
  extends StyledElementProps<MentionNode, MentionElementStyleProps> {
  /**
   * Prefix rendered before mention
   */
  prefix?: string;
  onClick?: (mentionNode: MentionNode) => void;
  renderLabel?: (mentionable: MentionNodeData) => string;
}
