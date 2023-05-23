import React, { forwardRef } from 'react';
import { PlateElement, PlateElementProps } from '@udecode/plate-tailwind';

const CodeLineElement = forwardRef<HTMLDivElement, PlateElementProps>(
  (props, ref) => <PlateElement ref={ref} {...props} />
);
CodeLineElement.displayName = 'CodeLineElement';

export { CodeLineElement };
