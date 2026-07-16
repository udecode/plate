import React from 'react';

import type { TMediaElement } from '@platejs/utils';

import { useElement } from '@platejs/core/react';
import { createPrimitiveComponent } from '@udecode/react-utils';

import { FloatingMediaStore } from './FloatingMediaStore';

export const useFloatingMediaEditButton = () => {
  const element = useElement<TMediaElement>();

  return {
    props: {
      onClick: React.useCallback(() => {
        FloatingMediaStore.set('url', element.sourceUrl ?? element.url);
        FloatingMediaStore.set('isEditing', true);
      }, [element.sourceUrl, element.url]),
    },
  };
};

export const FloatingMediaEditButton = createPrimitiveComponent('button')({
  propsHook: useFloatingMediaEditButton,
});
