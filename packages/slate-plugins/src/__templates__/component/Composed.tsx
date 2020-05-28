import { ComponentNameBase } from '__templates__/component/ComponentName';
import {
  ComponentNameProps,
  ComponentNameStyleProps,
  ComponentNameStyles,
} from '__templates__/component/ComponentName.types';
import { styled } from '@uifabric/utilities';
import { getComposedStyles } from './Composed.styles';

export const Composed = styled<
  ComponentNameProps,
  ComponentNameStyleProps,
  ComponentNameStyles
>(ComponentNameBase, getComposedStyles, undefined, {
  scope: 'Composed',
});
