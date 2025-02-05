import React from 'react';

import { createPrimitiveComponent, useElement } from '@udecode/plate/react';

import type { TMediaElement } from '../../../lib/media/types';

import { ImagePreviewStore } from '../../image';

export const useFloatingMediaEditButton = () => {
  const element = useElement<TMediaElement>();

  return {
    props: {
      onClick: React.useCallback(() => {
        ImagePreviewStore.set('currentPreview', {
          id: element.id,
          url: element.url,
        });
        ImagePreviewStore.set('isEditingScale', true);
      }, [element.id, element.url]),
    },
  };
};

export const FloatingMediaEditButton = createPrimitiveComponent('button')({
  propsHook: useFloatingMediaEditButton,
});
