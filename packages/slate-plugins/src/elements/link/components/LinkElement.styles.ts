import { LinkElementStyleProps, LinkElementStyles } from './LinkElement.types';

const classNames = {
  root: 'slate-LinkElement',
};

export const getLinkElementStyles = ({
  className,
}: LinkElementStyleProps): LinkElementStyles => {
  return {
    root: [
      classNames.root,
      {
        // Insert css properties
        textDecoration: 'initial',
        color: '#0078d4',
        selectors: {
          ':hover, :visited:hover': {
            color: '#004578',
            textDecoration: 'underline',
          },
          ':visited': {
            color: '#0078d4',
          },
        },
      },
      className,
    ],
  };
};
