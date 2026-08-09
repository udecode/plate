import { createPrimitiveComponent } from '@udecode/react-utils';

import type { MediaPlugin } from '../plugins';
import {
  useFloatingMediaEditButton,
  useFloatingMediaUrlInput,
  useFloatingMediaUrlInputState,
} from './useFloatingMedia';

export const FloatingMediaEditButton = createPrimitiveComponent('button')({
  propsHook: useFloatingMediaEditButton,
  stateHook: (options: { plugin: MediaPlugin }) => options,
});

export const FloatingMediaUrlInput = createPrimitiveComponent('input')({
  propsHook: useFloatingMediaUrlInput,
  stateHook: useFloatingMediaUrlInputState,
});

export const FloatingMedia = {
  EditButton: FloatingMediaEditButton,
  UrlInput: FloatingMediaUrlInput,
};
