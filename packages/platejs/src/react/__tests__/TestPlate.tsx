import React from 'react';

import { EditorRoot, type EditorRootProps } from '../components/Plate';

export const TestPlate = (props: EditorRootProps<any>) => (
  <EditorRoot suppressInstanceWarning {...props} />
);
