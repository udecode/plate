import { AnyObject } from '@udecode/plate-common';
import { StyledProps } from '../types/StyledProps';
import { createStyles } from './createStyles';

export const getStyledNodeStyles = (
  props: Pick<StyledProps, 'styles'> & AnyObject
) =>
  createStyles(props, {
    root: [{}],
  });
