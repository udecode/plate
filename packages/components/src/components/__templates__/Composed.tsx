import { styled } from '@uifabric/utilities';
import { ComponentNameBase } from './ComponentName';
import {
  ComponentNameProps,
  ComponentNameStyleProps,
  ComponentNameStyles,
} from './ComponentName.types';
import { getComposedStyles } from './Composed.styles';

export const Composed = styled<
  ComponentNameProps,
  ComponentNameStyleProps,
  ComponentNameStyles
>(ComponentNameBase, getComposedStyles, undefined, {
  scope: 'Composed',
});
