'use client';
import React from 'react';

import { withRef } from '@udecode/plate-common/react';

import { PlateElement } from './plate-element';

export const CodeLineElement = withRef<typeof PlateElement>((props, ref) => (
  <PlateElement ref={ref} {...props} />
));
