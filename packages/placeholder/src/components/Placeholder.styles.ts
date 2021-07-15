import { createStyles } from '@udecode/slate-plugins-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { PlaceholderProps } from './Placeholder.types';

export const getPlaceholderStyles = (props: PlaceholderProps) =>
  createStyles(
    { prefixClassNames: 'Placeholder', ...props },
    {
      root:
        props.enabled &&
        css`
          ::before {
            content: attr(placeholder);
            opacity: 0.3;
            ${tw`block absolute cursor-text`}
          }
        `,
    }
  );
