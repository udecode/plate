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
}: PlaceholderProps) => {
  const focused = useFocused();
  const selected = useSelected();
  const canShowPlaceholder = useMemo(() => {
    const string = Node.string(element);
    return (focused && selected && !string) || false;
  }, [focused, selected, element]);
  const classNames = getClassNames(styles, {
    className,
  });
  return (
    <div className={classNames.root}>
      {canShowPlaceholder ? (
        <span className={classNames.placeholder}>{placeholder}</span>
      ) : null}
      {children}
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
