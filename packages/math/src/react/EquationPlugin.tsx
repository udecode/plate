import { toPlatePlugin } from '@platejs/core/react';

import { BaseEquationPlugin, BaseInlineEquationPlugin } from '../lib';

export const EquationPlugin = toPlatePlugin(BaseEquationPlugin);
export const InlineEquationPlugin = toPlatePlugin(BaseInlineEquationPlugin);
