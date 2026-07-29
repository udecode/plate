import { createPrimitiveComponent } from '@udecode/react-utils';

import {
  useFloatingLinkNewTabInput,
  useFloatingLinkNewTabInputState,
  useFloatingLinkUrlInput,
  useFloatingLinkUrlInputState,
} from './useFloatingLink';

export const FloatingLinkNewTabInput = createPrimitiveComponent('input')({
  propsHook: useFloatingLinkNewTabInput,
  stateHook: useFloatingLinkNewTabInputState,
});

export const FloatingLinkUrlInput = createPrimitiveComponent('input')({
  propsHook: useFloatingLinkUrlInput,
  stateHook: useFloatingLinkUrlInputState,
});
