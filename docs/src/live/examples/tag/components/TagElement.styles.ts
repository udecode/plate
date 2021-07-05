import { createStyles } from '@udecode/slate-plugins-ui';
import tw from 'twin.macro';
import { TagElementStyleProps } from './TagElement.types';

export const getTagElementStyles = (props: TagElementStyleProps) => {
  const { focused, selected } = props;

  const selectedFocused = selected && focused;

  return createStyles(
    { prefixClassNames: 'TagElement', ...props },
    {
      root: [
        {
          // Insert css properties
          display: 'inline-block',
          lineHeight: '1.2',

          outline: selectedFocused ? 'rgb(0, 120, 212) auto 1px' : undefined,
        },
      ],
      link: [
        {
          userDrag: 'none',
          // textDecoration: selectedFocused ? 'underline' : 'none',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          color: 'rgb(0, 120, 212) !important',
        },
        tw`hover:underline`,
      ],
    }
  );
};
