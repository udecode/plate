import * as React from 'react';
import { getRenderLeaf } from '../../common/utils/getRenderLeaf';
import {
  MARK_STRIKETHROUGH,
  StrikethroughRenderLeafOptions,
  StrikethroughRenderLeafProps,
} from './types';

const StrikethroughText = ({
  children,
  ...props
}: StrikethroughRenderLeafProps) => (
  <span style={{ textDecoration: 'line-through' }} {...props}>
    {children}
  </span>
);

export const renderLeafStrikethrough = ({
  typeStrikethrough = MARK_STRIKETHROUGH,
}: StrikethroughRenderLeafOptions = {}) =>
  getRenderLeaf({
    type: typeStrikethrough,
    component: StrikethroughText,
    className: typeStrikethrough,
    'data-slate-type': typeStrikethrough,
  });
