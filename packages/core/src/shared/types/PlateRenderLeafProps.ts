import type { TText } from '@udecode/slate';
import type { TRenderLeafProps } from '@udecode/slate-react';

import type { PlateRenderNodeProps } from './PlateRenderNodeProps';
import type { AnyEditorPlugin } from './plugin';

/** Leaf props passed by Plate */
export type PlateRenderLeafProps<
  N extends TText = TText,
  P extends AnyEditorPlugin = AnyEditorPlugin,
> = PlateRenderNodeProps<P> & TRenderLeafProps<N>;
