import { createPrimitiveComponent } from '@udecode/react-utils';

import {
  useFloatingMediaEditButton,
  useFloatingMediaUrlInput,
  useFloatingMediaUrlInputState,
} from './useFloatingMedia';

export const FloatingMediaEditButton = createPrimitiveComponent('button')({
  propsHook: useFloatingMediaEditButton,
});

export const FloatingMediaUrlInput = createPrimitiveComponent('input')({
  propsHook: useFloatingMediaUrlInput,
  stateHook: useFloatingMediaUrlInputState,
});

export const FloatingMedia = {
  EditButton: FloatingMediaEditButton,
  UrlInput: FloatingMediaUrlInput,
};
