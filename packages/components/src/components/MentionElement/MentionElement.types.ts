import { MentionNode, MentionNodeData } from '@udecode/slate-plugins';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { ElementProps, NodeStyleSet } from '../../types';

export interface MentionElementStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  // Insert MentionElement style props below
  selected?: boolean;
  focused?: boolean;
}

// renderElement props
export interface MentionElementProps extends ElementProps<MentionNode> {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<MentionElementStyleProps, NodeStyleSet>;

  as?: any;

  /**
   * Prefix rendered before mention
   */
  prefix?: string;
  onClick?: (mentionNode: MentionNode) => void;
  renderLabel?: (mentionable: MentionNodeData) => string;
}
