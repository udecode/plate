import { BaseCodeDrawingPlugin } from '@platejs/code-drawing';

import { CodeDrawingElementStatic } from '@/registry/ui/code-drawing-node-static';

export const BaseCodeDrawingKit = [
  BaseCodeDrawingPlugin.configure({
    component: CodeDrawingElementStatic,
  }),
];
