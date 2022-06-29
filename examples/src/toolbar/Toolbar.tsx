import React from 'react';
import {
  HeadingToolbar,
  ToolbarProps,
  withPlateEventProvider,
} from '@udecode/plate';

export const Toolbar = withPlateEventProvider((props: ToolbarProps) => (
  <HeadingToolbar {...props} />
));
