import { createStyles } from '@udecode/slate-plugins-ui';
import { css, CSSProp } from 'styled-components';
import tw from 'twin.macro';
import { MentionSelectProps } from './MentionSelect.types';

export const getMentionSelectStyles = (props: MentionSelectProps) => {
  const mentionItem: CSSProp = [
    tw`bg-transparent cursor-pointer`,
    css`
      padding: 1px 3px;
      border-radius: 3px;
    `,
  ];

  const mentionItemSelected: CSSProp = [
    ...mentionItem,
    tw`background[#B4D5FF]`,
  ];

  return createStyles(
    { prefixClassNames: 'MentionSelect', ...props },
    {
      root: [
        tw`absolute bg-white`,
        css`
          top: -9999px;
          left: -9999px;
          padding: 3px;
          border-radius: 4px;
          z-index: 1;
          box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
        `,
      ],
      mentionItem,
      mentionItemSelected,
    }
  );
};
