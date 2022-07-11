import React from 'react';
import { RenderAfterEditableProps } from '@udecode/plate-core';
import { FloatingLink } from './components/FloatingLink';

export const RenderAfterEditableLink = (props: RenderAfterEditableProps) => (
  <FloatingLink.Root {...props}>hello</FloatingLink.Root>
);
