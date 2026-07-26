'use client';

import { MathRules } from '@platejs/math';
import { EquationPlugin, InlineEquationPlugin } from '@platejs/math/react';

import {
  EquationElement,
  InlineEquationElement,
} from '@/registry/ui/equation-node';

export const MathKit = [
  InlineEquationPlugin.configure({
    component: InlineEquationElement,
    inputRules: [MathRules.markdown({ variant: '$' })],
  }),
  EquationPlugin.configure({
    component: EquationElement,
    inputRules: [MathRules.markdown({ on: 'break', variant: '$$' })],
  }),
];
