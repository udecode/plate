import { TagElementStyleProps, TagElementStyles } from '../types';

const classNames = {
  root: 'slate-TagElement',
  link: 'slate-TagElement-link',
};

export const getTagElementStyles = ({
  className,
  focused,
  selected,
}: TagElementStyleProps): TagElementStyles => {
  const selectedFocused = selected && focused;

  return {
    root: [
      classNames.root,
      {
        // Insert css properties
        display: 'inline-block',
        lineHeight: '1.2',

        outline: selectedFocused ? 'rgb(0, 120, 212) auto 1px' : undefined,
        selectors: {
          ':hover .slate-TagElement-link': {
            // color: selectedFocused ? '#40a9ff !important' : undefined,
            // textDecoration: selectedFocused ? 'underline' : undefined,
            // background: !selectedFocused
            //   ? 'rgba(148, 148, 148, 0.15)'
            //   : undefined,
            // boxShadow: !selectedFocused
            //   ? '0 0 0 3px rgba(148, 148, 148, 0.15)'
            //   : undefined,
          },
        },
      },
      className,
    ],
    link: [
      {
        userDrag: 'none',
        // textDecoration: selectedFocused ? 'underline' : 'none',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        color: 'rgb(0, 120, 212) !important',
      },
      'hover:underline',
      classNames.link,
    ],
  };
};
