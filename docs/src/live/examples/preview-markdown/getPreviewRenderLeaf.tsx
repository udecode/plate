import React from 'react';
import { RenderLeaf, SPRenderLeafProps } from '@udecode/plate-core';
import { PreviewLeaf } from './PreviewLeaf/PreviewLeaf';

export const getPreviewRenderLeaf = (): RenderLeaf => () => (
  props: SPRenderLeafProps
) => <PreviewLeaf {...props} />;
