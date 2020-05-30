import { concatStyleSets } from '@uifabric/styling';
import { getComponentNameStyles } from './ComponentName.styles';
import {
  ComponentNameStyleProps,
  ComponentNameStyles,
} from './ComponentName.types';

const classNames = {
  root: 'slate-Composed',
};

export const getComposedStyles = ({
  className,
}: ComponentNameStyleProps = {}): ComponentNameStyles => {
  const styles: ComponentNameStyles = {
    root: [classNames.root, {}, className],
  };

  return concatStyleSets(getComponentNameStyles(), styles);
};
