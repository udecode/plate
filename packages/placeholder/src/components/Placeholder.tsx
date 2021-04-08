import * as React from 'react';
import { classNamesFunction, styled } from '@uifabric/utilities';
import { Node } from 'slate';
import { useFocused, useSelected } from 'slate-react';
import { getPlaceholderStyles } from './Placeholder.styles';
import {
  PlaceholderProps,
  PlaceholderStyleProps,
  PlaceholderStyleSet,
} from './Placeholder.types';

const { useMemo } = React;

const getClassNames = classNamesFunction<
  PlaceholderStyleProps,
  PlaceholderStyleSet
>();

export const PlaceholderBase = ({
  children,
  placeholder,
  styles,
  className,
  element,
  hideOnBlur,
}: PlaceholderProps) => {
  const focused = useFocused();
  const selected = useSelected();
  const canShowPlaceholder = useMemo(() => {
    const string = Node.string(element);
    return (
      (!hideOnBlur && !string) || (hideOnBlur && focused && selected && !string)
    );
  }, [element, hideOnBlur, focused, selected]);
  const classNames = getClassNames(styles, {
    className,
  });
  return (
    <div className={classNames.root}>
      {children}
      {canShowPlaceholder ? (
        <span className={classNames.placeholder} contentEditable={false}>
          {placeholder}
        </span>
      ) : null}
    </div>
  );
};

export const Placeholder = styled<
  PlaceholderProps,
  PlaceholderStyleProps,
  PlaceholderStyleSet
>(PlaceholderBase, getPlaceholderStyles, undefined, {
  scope: 'Placeholder',
});
