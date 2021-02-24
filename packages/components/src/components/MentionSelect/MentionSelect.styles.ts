import { IStyle } from '@uifabric/styling';
import {
  MentionSelectStyleProps,
  MentionSelectStyles,
} from './MentionSelect.types';

const classNames = {
  root: 'slate-MentionSelect',
  mentionItem: 'slate-MentionSelect-mentionItem',
  mentionItemSelected: 'slate-MentionSelect-mentionItemSelected',
};

export const getMentionSelectStyles = ({
  className,
}: MentionSelectStyleProps = {}): MentionSelectStyles => {
  const mentionItem: IStyle = [
    classNames.mentionItem,
    {
      padding: '1px 3px',
      borderRadius: '3px',
      background: 'transparent',
      cursor: 'pointer',
    },
  ];

  const mentionItemSelected: IStyle = [
    classNames.mentionItemSelected,
    ...mentionItem,
    {
      background: '#B4D5FF',
    },
  ];

  return {
    root: [
      classNames.root,
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
      className,
    ],
    mentionItem,
    mentionItemSelected,
  };
};
