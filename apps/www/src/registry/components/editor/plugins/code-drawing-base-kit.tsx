'use client';

import { toPlatePlugin } from 'platejs/react';

import { BaseCodeDrawingPlugin } from '@platejs/code-drawing';

import { CodeDrawingElement } from '@/registry/ui/code-drawing-node';

export const BaseCodeDrawingKit = [
  toPlatePlugin(BaseCodeDrawingPlugin).withComponent(CodeDrawingElement),
];
