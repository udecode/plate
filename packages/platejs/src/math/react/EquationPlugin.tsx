import { toPlatePlugin } from '../../react/core';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from '../lib';

export const EquationPlugin = toPlatePlugin(BaseEquationPlugin);
export const InlineEquationPlugin = toPlatePlugin(BaseInlineEquationPlugin);
