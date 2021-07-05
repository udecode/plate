import { createStyles } from '@udecode/slate-plugins-ui';
import { MentionElementStyleProps } from './MentionElement.types';

export const getMentionElementStyles = (props: MentionElementStyleProps) =>
  createStyles(
    { prefixClassNames: 'MentionElement', ...props },
    {
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
          boxShadow:
            props.selected && props.focused ? '0 0 0 2px #B4D5FF' : 'none',
        },
      ],
    }
  );
