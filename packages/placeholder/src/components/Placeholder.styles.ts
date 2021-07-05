import { createStyles } from '@udecode/slate-plugins-ui';
import { PlaceholderProps } from './Placeholder.types';

export const getPlaceholderStyles = (props: PlaceholderProps) =>
  createStyles(
    { prefixClassNames: 'Placeholder', ...props },
    {
      root: {
        ...(props.enabled && {
          '::before': {
            content: 'attr(placeholder)',
            display: 'block',
            position: 'absolute',
            opacity: 0.3,
            cursor: 'text',
          },
        }),
      },
    }
  );
