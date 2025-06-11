import React from 'react';

import type { TMediaElement } from 'platejs';

import { createPrimitiveComponent, useElement } from 'platejs/react';

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
