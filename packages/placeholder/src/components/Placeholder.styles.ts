import {
  PlaceholderStyleProps,
  PlaceholderStyleSet,
} from './Placeholder.types';

const classNames = {
  root: 'slate-placeholder',
};

export const getPlaceholderStyles = ({
  className,
  enabled,
}: PlaceholderStyleProps): PlaceholderStyleSet => {
  return {
    root: [
      classNames.root,
      className,
      {
        position: 'relative',
        selectors: {
          '::before': {
            content: 'attr(placeholder)',
            display: 'block',
            position: 'absolute',
            opacity: enabled ? 0.3 : 0,
          },
        },
      },
    ],
    placeholder: [
      {
        position: 'absolute',
        pointerEvents: 'none',
        opacity: 0.3,
        top: 0,
        left: 0,
      },
    ],
  };
};
