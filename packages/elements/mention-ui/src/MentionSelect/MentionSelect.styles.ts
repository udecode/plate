import { createStyles } from '@udecode/slate-plugins-ui';
import { CSSProp } from 'styled-components';
import { MentionSelectProps } from './MentionSelect.types';

export const getMentionSelectStyles = (props: MentionSelectProps) => {
  const mentionItem: CSSProp = [
    {
      padding: '1px 3px',
      borderRadius: '3px',
      background: 'transparent',
      cursor: 'pointer',
    },
  ];

  const mentionItemSelected: CSSProp = [
    ...mentionItem,
    {
      background: '#B4D5FF',
    },
  ];

  return createStyles(
    { prefixClassNames: 'MentionSelect', ...props },
    {
      root: [
        {
          top: '-9999px',
          left: '-9999px',
          position: 'absolute',
          zIndex: 1,
          padding: '3px',
          background: 'white',
          borderRadius: '4px',
          boxShadow: '0 1px 5px rgba(0,0,0,.2)',
        },
      ],
      mentionItem,
      mentionItemSelected,
    }
  );
};
