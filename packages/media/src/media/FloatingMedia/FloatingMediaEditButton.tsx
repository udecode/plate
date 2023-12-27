import React from 'react';
import { createPrimitiveComponent, useElement } from '@udecode/plate-common';

import { TMediaElement } from '../types';
import { floatingMediaActions } from './floatingMediaStore';

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
