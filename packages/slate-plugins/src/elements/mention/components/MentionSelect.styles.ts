import { IStyle } from '@uifabric/styling';
import { MentionSelectStyles } from 'elements/mention/components/MentionSelect.types';

export const getStyles = (): MentionSelectStyles => {
  const mentionItem: IStyle = [
    {
      padding: '1px 3px',
      borderRadius: '3px',
      background: 'transparent',
    },
  ];

  const mentionItemSelected: IStyle = [
    ...mentionItem,
    {
      background: '#B4D5FF',
    },
  ];

  return {
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
  };
};
