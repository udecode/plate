import type { ClientRectObject } from '@floating-ui/core';
import type { VirtualElement } from '@floating-ui/react';

export const getDefaultBoundingClientRect = (): ClientRectObject => ({
  bottom: 9999,
  height: 0,
  left: -9999,
  right: 9999,
  top: -9999,
  width: 0,
  x: 0,
  y: 0,
});

export const createVirtualElement = (): VirtualElement => ({
  getBoundingClientRect: getDefaultBoundingClientRect,
});
