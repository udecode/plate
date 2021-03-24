import { RootStyleSet } from '@udecode/slate-plugins-ui-fluent';
import { MentionElementStyleProps } from './MentionElement.types';

export const getMentionElementStyles = ({
  className,
  focused,
  selected,
}: MentionElementStyleProps): RootStyleSet => ({
  root: [
    {
      // Insert css properties
      padding: '3px 3px 2px',
      margin: '0 1px',
      verticalAlign: 'baseline',
      display: 'inline-block',
      borderRadius: '4px',
      backgroundColor: '#eee',
      fontSize: '0.9em',
      boxShadow: selected && focused ? '0 0 0 2px #B4D5FF' : 'none',
    },
    className,
  ],
});
