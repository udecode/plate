import { Value } from '@udecode/plate-common';
import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { MentionElementStyleProps } from './MentionElement.types';

export const getMentionElementStyles = <V extends Value>(
  props: MentionElementStyleProps<V>
) =>
  createStyles(
    { prefixClassNames: 'MentionElement', ...props },
    {
      root: [
        tw`my-0 mx-px align-baseline inline-block`,
        props.selected && props.focused && tw`boxShadow[0 0 0 2px #B4D5FF]`,
        css`
          padding: 3px 3px 2px;
          border-radius: 4px;
          background-color: #eee;
          font-size: 0.9em;
        `,
      ],
    }
  );
