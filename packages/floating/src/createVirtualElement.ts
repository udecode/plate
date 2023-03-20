import { ClientRectObject } from '@floating-ui/core';
import { VirtualElement } from '@floating-ui/react';

export const getDefaultBoundingClientRect = (): ClientRectObject => ({
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  top: -9999,
  left: -9999,
  right: 9999,
  bottom: 9999,
});

export const createVirtualElement = (): VirtualElement => ({
  getBoundingClientRect: getDefaultBoundingClientRect,
});
