import {
  PlaceholderStyleProps,
  PlaceholderStyleSet,
} from './Placeholder.types';

const classNames = {
  root: 'slate-placeholder',
};

export const getPlaceholderStyles = ({
  className,
}: PlaceholderStyleProps): PlaceholderStyleSet => {
  return {
    placeholder: [
      classNames.root,
      className,
      {
        selectors: {
          '::before': {
            content: 'attr(placeholder)',
            display: 'block',
            position: 'absolute',
            opacity: 0.3,
          },
        },
      },
    ],
  };
};
