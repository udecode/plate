import { createPrimitiveComponent } from '@udecode/react-utils';

import { useImage, usePreviewImage } from './useImage';

export const Image = createPrimitiveComponent('img')({
  propsHook: useImage,
});

export const PreviewImage = createPrimitiveComponent('img')({
  propsHook: usePreviewImage,
});
