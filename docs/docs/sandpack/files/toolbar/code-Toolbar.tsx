export const toolbarCode = `import React from 'react';
import {
  HeadingToolbar,
  ToolbarProps,
  withPlateEventProvider,
} from '@udecode/plate';

export const Toolbar = withPlateEventProvider((props: ToolbarProps) => (
  <HeadingToolbar {...props} />
));
`;

export const toolbarFile = {
  '/toolbar/Toolbar.tsx': toolbarCode,
};
