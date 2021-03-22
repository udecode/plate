import {
  ComponentNameStyleProps,
  ComponentNameStyles,
} from './ComponentName.types';

const classNames = {
  root: 'slate-ComponentName',
};

export const getComponentNameStyles = ({
  className,
}: ComponentNameStyleProps = {}): ComponentNameStyles => ({
  root: [classNames.root, {}, className],
});
