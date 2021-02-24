import * as React from 'react';
import { classNamesFunction, styled } from '@uifabric/utilities';
import { getComponentNameStyles } from './ComponentName.styles';
import {
  ComponentNameProps,
  ComponentNameStyleProps,
  ComponentNameStyles,
} from './ComponentName.types';

const getClassNames = classNamesFunction<
  ComponentNameStyleProps,
  ComponentNameStyles
>();

export const ComponentNameBase = ({
  className,
  styles,
}: ComponentNameProps) => {
  const classNames = getClassNames(styles, {
    className,
  });

  return <div className={classNames.root}>Hello</div>;
};

export const ComponentName = styled<
  ComponentNameProps,
  ComponentNameStyleProps,
  ComponentNameStyles
>(ComponentNameBase, getComponentNameStyles, undefined, {
  scope: 'ComponentName',
});
