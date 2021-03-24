import {
  GetMentionSelectProps,
  MentionNodeData,
} from '@udecode/slate-plugins-mention';
import {
  ClassName,
  RootStyleSet,
  StyledProps,
} from '@udecode/slate-plugins-ui-fluent';
import { IStyle } from '@uifabric/styling';

export interface MentionSelectStyleSet extends RootStyleSet {
  mentionItem?: IStyle;
  mentionItemSelected?: IStyle;
}

export interface MentionSelectProps
  extends GetMentionSelectProps,
    StyledProps<ClassName, MentionSelectStyleSet> {
  renderLabel?: (mentionable: MentionNodeData) => string;
}
