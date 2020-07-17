import * as React from 'react';
import { RenderLeafProps } from 'slate-react';
import { PreviewLeaf } from './components/PreviewLeaf';

export const renderLeafPreview = () => (props: RenderLeafProps) => (
  <PreviewLeaf {...props} />
);
