import React from 'react';
import { RenderLeaf, PlateRenderLeafProps } from '@udecode/plate-core';
import { PreviewLeaf } from './PreviewLeaf/PreviewLeaf';

export const getPreviewRenderLeaf = (): RenderLeaf => () => (
  props: PlateRenderLeafProps
) => <PreviewLeaf {...props} />;
