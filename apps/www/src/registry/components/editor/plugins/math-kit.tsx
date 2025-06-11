'use client';

import {
  EquationPlugin,
  InlineEquationPlugin,
} from '@udecode/plate-math/react';

import {
  EquationElement,
  InlineEquationElement,
} from '@/registry/ui/equation-node';

export const MathKit = [
  InlineEquationPlugin.withComponent(InlineEquationElement),
  EquationPlugin.withComponent(EquationElement),
];
