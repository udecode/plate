import type { TElement } from '@udecode/slate';

import type { PlateRenderNodeProps } from './PlateRenderNodeProps';
import type { AnyEditorPlugin } from './plugin';
import type { TRenderElementProps } from './slate-react/TRenderElementProps';

/** Element props passed by Plate */
export type PlateRenderElementProps<
  N extends TElement = TElement,
  P extends AnyEditorPlugin = AnyEditorPlugin,
> = PlateRenderNodeProps<P> & TRenderElementProps<N>;
