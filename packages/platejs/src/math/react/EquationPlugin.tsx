import { toReactPlugin } from '../../react/core';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from '../lib';

export const EquationPlugin = toReactPlugin(BaseEquationPlugin);
export const InlineEquationPlugin = toReactPlugin(BaseInlineEquationPlugin);
