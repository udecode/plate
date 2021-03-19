import * as React from 'react';
import { RenderLeafProps } from 'slate-react';
import { RenderLeaf } from '../../../packages/core/src/types/SlatePlugin/RenderLeaf';
import { PreviewLeaf } from './PreviewLeaf/PreviewLeaf';

export const useRenderLeafPreview = (): RenderLeaf => () => (
  props: RenderLeafProps
) => <PreviewLeaf {...props} />;
