'use client';

import React from 'react';

import { withRef } from '@udecode/cn';
import { PlateElement } from '@udecode/plate/react';

export const CodeLineElement = withRef<typeof PlateElement>((props, ref) => (
  <PlateElement ref={ref} {...props} />
));
