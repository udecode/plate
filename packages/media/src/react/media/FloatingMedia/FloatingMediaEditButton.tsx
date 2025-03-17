import React from 'react';

import { createPrimitiveComponent, useElement } from '@udecode/plate/react';

import type { TMediaElement } from '../../../lib/media/types';

import { FloatingMediaStore } from './FloatingMediaStore';

export const useFloatingMediaEditButton = () => {
  const element = useElement<TMediaElement>();

  return {
    props: {
      onClick: React.useCallback(() => {
        FloatingMediaStore.set('url', element.url);
        FloatingMediaStore.set('isEditing', true);
      }, [element.url]),
    },
  };
};

export const FloatingMediaEditButton = createPrimitiveComponent('button')({
  propsHook: useFloatingMediaEditButton,
});
