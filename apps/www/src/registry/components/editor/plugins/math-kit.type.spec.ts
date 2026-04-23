/* biome-ignore-all lint: compile-time type regression file */

import { MathRules } from '@platejs/math';
import { EquationPlugin, InlineEquationPlugin } from '@platejs/math/react';

void MathRules.markdown({ variant: '$' });
void MathRules.markdown({ on: 'break', variant: '$$' });

void InlineEquationPlugin.configure({
  inputRules: [MathRules.markdown({ variant: '$' })],
});

void EquationPlugin.configure({
  inputRules: [MathRules.markdown({ on: 'break', variant: '$$' })],
});

// @ts-expect-error - block math requires explicit `on`
MathRules.markdown({ variant: '$$' });

// @ts-expect-error - inline math does not accept `on`
MathRules.markdown({ on: 'break', variant: '$' });

// @ts-expect-error - only `$` and `$$` are valid math markdown variants
MathRules.markdown({ variant: '$$$' });
