import React, { useMemo } from 'react';
import { createNodeHOC, createNodesHOC } from '@udecode/slate-plugins-common';
import { classNamesFunction, styled } from '@uifabric/utilities';
import { Node } from 'slate';
import { useFocused, useSelected } from 'slate-react';
import { getPlaceholderStyles } from './Placeholder.styles';
import {
  PlaceholderProps,
  PlaceholderStyleProps,
  PlaceholderStyleSet,
} from './Placeholder.types';

const getClassNames = classNamesFunction<
  PlaceholderStyleProps,
  PlaceholderStyleSet
>();

export const PlaceholderBase = ({
  children,
  element,
  className,
  styles,
  placeholder,
  hideOnBlur = true,
}: PlaceholderProps) => {
  const focused = useFocused();
  const selected = useSelected();

  const enabled = useMemo(() => {
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
      {enabled && (
        <span className={classNames.placeholder} contentEditable={false}>
          {placeholder}
        </span>
      )}
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

export const withPlaceholder = createNodeHOC(Placeholder);
export const withPlaceholders = createNodesHOC(Placeholder);
