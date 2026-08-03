import '@platejs/math/katex.css';

import { BaseEquationPlugin, BaseInlineEquationPlugin } from '@platejs/math';

import {
  EquationElementStatic,
  InlineEquationElementStatic,
} from '@/registry/ui/equation-node-static';

export const BaseMathKit = [
  BaseInlineEquationPlugin.configure({
    component: InlineEquationElementStatic,
  }),
  BaseEquationPlugin.configure({
    component: EquationElementStatic,
  }),
] as const;
