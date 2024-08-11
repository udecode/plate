import type { TElement } from '@udecode/slate';
import type { TRenderElementProps } from '@udecode/slate-react';

import type { AnyEditorPlugin } from './PlatePlugin';
import type { PlateRenderNodeProps } from './PlateRenderNodeProps';

/** Element props passed by Plate */
export type PlateRenderElementProps<
  N extends TElement = TElement,
  P extends AnyEditorPlugin = AnyEditorPlugin,
> = PlateRenderNodeProps<P> & TRenderElementProps<N>;
