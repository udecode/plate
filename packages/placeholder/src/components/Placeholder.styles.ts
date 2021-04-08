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
    root: [classNames.root, className, { position: 'relative' }],
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
