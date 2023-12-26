'use client';

import React from 'react';
import { PlateElement } from '@udecode/plate-common';

import { withRef } from '@/lib/utils';

export const CodeLineElement = withRef(PlateElement, (props) => (
  <PlateElement {...props} />
));
