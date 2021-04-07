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
    root: [classNames.root, className],
    placeholder: [
      { position: 'absolute', pointerEvents: 'none', opacity: 0.3 },
    ],
  };
};
