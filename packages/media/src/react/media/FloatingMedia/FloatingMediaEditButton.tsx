import React from 'react';

import {
  createPrimitiveComponent,
  useElement,
} from '@udecode/plate-common/react';

import type { TMediaElement } from '../../../lib/media/types';

import { floatingMediaActions } from './FloatingMediaStore';

export const useFloatingMediaEditButton = () => {
  const element = useElement<TMediaElement>();

  return {
    props: {
      onClick: React.useCallback(() => {
        floatingMediaActions.url(element.url);
        floatingMediaActions.isEditing(true);
      }, [element.url]),
    },
  };
};

export const FloatingMediaEditButton = createPrimitiveComponent('button')({
  propsHook: useFloatingMediaEditButton,
});
