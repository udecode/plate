import React from 'react';
import { BlockButton, BlockButtonProps } from '../components';

export const ListButton = (props: BlockButtonProps) => (
  <BlockButton command="format_list" {...props} />
);
