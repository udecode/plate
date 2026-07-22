'use client';

import { MathRules } from '@platejs/math';
import { EquationPlugin, InlineEquationPlugin } from '@platejs/math/react';

import {
  EquationElement,
  InlineEquationElement,
} from '@/registry/ui/equation-node';

export const MathKit = [
  InlineEquationPlugin.configure({
    inputRules: [MathRules.markdown({ variant: '$' })],
    render: { node: InlineEquationElement },
  }),
  EquationPlugin.configure({
    inputRules: [MathRules.markdown({ on: 'break', variant: '$$' })],
    render: { node: EquationElement },
  }),
];
