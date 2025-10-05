'use client';

import { ExcalidrawPlugin } from '@platejs/excalidraw/react';

import { ExcalidrawElement } from '@/registry/ui/excalidraw-node';

export const ExcalidrawKit = [
  ExcalidrawPlugin.withComponent(ExcalidrawElement),
];
