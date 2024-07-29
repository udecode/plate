import type { TElement } from '@udecode/slate';
import type { RenderElementProps } from 'slate-react';

export type TRenderElementProps = {
  element: TElement;
} & Omit<RenderElementProps, 'element'>;

export type RenderElementFn = (
  props: TRenderElementProps
) => React.ReactElement;
